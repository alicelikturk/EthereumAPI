const Web3 = require('web3');
const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const Account = require("../models/account");
const Wallet = require("../models/wallet");
const GlobalVariable = require("../models/globalVariable");
const colors = require('colors');
const request = require("request");

var web3;
var subscription;

const web3Model = require('../models/webThreeModel');
web3Model.SetClient()
    .then((url) => {
        web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(url));
        subscription = web3.eth.subscribe('pendingTransactions');

    });

exports.SubscribePendingTransactions = async (req, res, next) => {
    subscription.subscribe(async (error, result) => {
        if (!error) {
            try {
                // Infura istek limitini dolduruyor
                const transaction = await web3.eth.getTransaction(result);
                if (transaction != null) {
                    // to - String: Address of the receiver. null if it’s a contract creation transaction.
                    if (transaction.to == null) {
                        // console.log(colors.bgGreen.black('Contract Creation' +
                        //     '\ntx to : ' + transaction.to +
                        //     '\ntx hash: ' + result));
                        return;
                    }

                    Account.findOne({ address: transaction.to })
                        .populate('wallet')
                        .exec()
                        .then(account => {
                            if (!account) {

                            } else {
                                const valueEther = web3.utils.fromWei(transaction.value, 'ether');

                                console.log(colors.gray('Deposit: ' + 'eth' + ' , ' + transaction.hash + ' , ' + transaction.to + ' , ' + valueEther + ' Ether'));

                                const tx = new Transaction({
                                    _id: new mongoose.Types.ObjectId(),
                                    date: new Date().getTime(),
                                    hash: transaction.hash,
                                    isContract: false
                                });
                                tx.save()
                                    .then(_result => {
                                        // console.log(colors.bgCyan.black('Deposit' +
                                        //     '\ttx saved: ' + transaction.hash +
                                        //     '\tto address: ' + transaction.to +
                                        //     '\tvalue: ' + transaction.value + ' wei'));
                                        var postData = {
                                            txHash: transaction.hash,
                                            to: transaction.to,
                                            value: valueEther,
                                            from: transaction.from,
                                            confirmation: 0,
                                            asset: "eth"
                                        }
                                        request({
                                            uri: account.wallet.notifyUrl,
                                            method: "POST",
                                            body: JSON.stringify(postData),
                                            rejectUnauthorized: false,
                                            headers: {
                                                'Content-Type': 'application/json'
                                            }
                                        }, function (error, response, body) {
                                            console.log(colors.cyan('Deposit ether notification request \t' +
                                                '{' + account.wallet.notifyUrl + '}' + ' sent'));
                                            if (error) {
                                                console.log(colors.magenta('Deposit ether notification error \t' +
                                                    JSON.stringify(error)));
                                            } else {
                                                console.log(colors.white('Deposit ether notification response \t' +
                                                    JSON.stringify(response.body)));
                                            }
                                        });

                                        GlobalVariable.findOne()
                                            .exec()
                                            .then(_gVar => {
                                                confirmEtherTransaction(result, _gVar, 'eth', account);
                                            })
                                            .catch(err => {
                                                confirmEtherTransaction(result, null, 'eth', account);
                                            });

                                    })
                                    .catch(err => {
                                        console.log(err);
                                    });
                            }
                        })
                        .catch(err => {
                            return res.status(500).json({
                                result: false,
                                error: err
                            });
                        });
                    return;
                }
            } catch (exception) {
                console.log(colors.bgRed.white('Critical error'));
                console.log(exception);
            }

        }
    });
    console.log('eth subscribed');
    return res.status(200).json({
        result: true,
        message: 'Transactions successfully subscribed'
    });
};

exports.UnsubscribePendingTransactions = (req, res, next) => {

    subscription.unsubscribe(function (error, success) {
        if (success) {
            console.log('Transactions successfully unsubscribed!');
        }
    });
    res.status(200).json({
        message: 'Transactions successfully unsubscribed'
    });
};

async function getConfirmations(txHash) {
    const tx = await web3.eth.getTransaction(txHash);
    if (tx != null) {
        if (tx.blockNumber != null) {
            const currentBlock = await web3.eth.getBlockNumber();
            return {
                tx: tx,
                confirmation: currentBlock - tx.blockNumber + 1
            }
        } else {
            return {
                tx: null,
                confirmation: 0
            }
        }
    } else {
        return {
            tx: null,
            confirmation: 0
        }
    }
}

async function confirmEtherTransaction(txHash, gVar, asset, account) {
    const confirmationCount = gVar ? gVar.confirmationCount : 3;
    const url = account.wallet.notifyUrl;

    var intervalId = setInterval(async () => {
        const txConfirmation = await getConfirmations(txHash);
        //console.log(colors.bgBlack.white('Confirmation (tx: ' + txHash + ') : ' + txConfirmation.confirmation));

        if (txConfirmation.confirmation >= confirmationCount) {
            const valueEther = web3.utils.fromWei(txConfirmation.tx.value, 'ether')

            console.log(colors.gray('Confirmation (' + txConfirmation.confirmation + '): ' + asset + ' , ' + txConfirmation.tx.hash + ' , ' + txConfirmation.tx.to + ' , ' + valueEther + ' Ether'));

            var postData = {
                txHash: txConfirmation.tx.hash,
                to: txConfirmation.tx.to,
                value: valueEther,
                from: txConfirmation.tx.from,
                confirmation: txConfirmation.confirmation,
                asset: asset
            }
            request({
                uri: url,
                method: "POST",
                body: JSON.stringify(postData),
                rejectUnauthorized: false,
                headers: {
                    'Content-Type': 'application/json'
                }
            }, function (error, response, body) {
                console.log(colors.cyan('Deposit ether confirmation notification request \t' +
                    '{' + url + ', ' + valueEther + ' eth, ' + txConfirmation.tx.hash + '}' + ' sent'));
                if (error) {
                    console.log(colors.magenta('Deposit ether confirmation notification error \t' +
                        JSON.stringify(error)));
                } else {
                    console.log(colors.white('Deposit ether confirmation notification response \t' +
                        JSON.stringify(response.body)));
                }
            });
            // Automatically moving eth from account to wallet address
            const autoMoving = gVar ? gVar.autoMoving : false;
            if (autoMoving)
                MoveEth(account);

            clearInterval(intervalId);

        }
    }, 5 * 1000)
}

async function MoveEth(account) {
    const accountAddress = account.address;
    const accountPrivateKey = account.privateKey;
    const walletAddress = account.wallet.address;
    web3.eth.getBalance(accountAddress, (errBalance, balance) => {
        web3.eth.getGasPrice().then((gasPrice) => {
            const txFee = gasPrice * 21000;
            if (balance > txFee) {
                const transferValue = balance - txFee;
                const txObject = {
                    to: walletAddress,
                    value: transferValue, // in wei
                    //gasPrice: web3.utils.toWei('200', 'gwei'), //default: web3.eth.getGasPrice()
                    gas: 21000
                };
                web3.eth.accounts.signTransaction(txObject, accountPrivateKey).then((result, error) => {
                    web3.eth.sendSignedTransaction(result.rawTransaction, (err, txHash) => {
                        if (err) {
                            console.log(colors.red('error: MoveEth sendSignedTransaction error'));
                            console.log(err);
                        }
                        else {
                            const valueEther = web3.utils.fromWei(transferValue.toString(), 'ether');
                            console.log(colors.blue('Ether moved to: ' + walletAddress + ' , ' + valueEther + ' Ether' + ' , ' + txHash));
                        }
                    });
                });
            }
        });
    });
}