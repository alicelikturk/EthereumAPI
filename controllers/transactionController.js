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

const web3Model = require('../models/web3Model');
const wallet = require('../models/wallet');
web3Model.SetClient(true)
    .then((url) => {
        web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(url));
        SubscribePendingTransactions();
    });

function SubscribePendingTransactions() {
    subscription = web3.eth.subscribe('pendingTransactions', async(error, result) => {
        //console.log(result);
        try {
            if (!error) {
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
                                //console.log(result);
                            } else {
                                //console.log(colors.green(result));
                                const valueEther = web3.utils.fromWei(transaction.value, 'ether');

                                console.log(colors.green('Deposit: ' + 'eth' + ' , ' + transaction.hash + ' , ' + transaction.to + ' , ' + valueEther + ' Ether'));

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

                                        // 
                                        // It does not notify if the deposit is coming from the wallet address 
                                        // The remaining of the ether sent for token transfer must be transferred again to the main wallet 
                                        //
                                        const isAvailableToNotify = account.wallet.address !== transaction.from;
                                        if (isAvailableToNotify) {
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
                                                    'Content-Type': 'application/json',
                                                    'x-api-key': 'aB8ccABtup85AoKtl96aY904IU889paso'
                                                }
                                            }, function(error, response, body) {
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
                                        } else {
                                            console.log(colors.bgBlue.white('Ether deposit sent from main wallet. That\'s why the notification wasn\'t sent'));
                                        }


                                        GlobalVariable.findOne()
                                            .exec()
                                            .then(_gVar => {
                                                confirmEtherTransaction(result, _gVar, 'eth', account, isAvailableToNotify);
                                            })
                                            .catch(err => {
                                                confirmEtherTransaction(result, null, 'eth', account, isAvailableToNotify);
                                            });

                                    })
                                    .catch(err => {
                                        console.log(err);
                                    });


                            }
                        })
                        .catch(err => {
                            console.log(err);
                        });
                    //return;
                }
            }
        } catch (exception) {
            //console.log(colors.bgRed.white('Critical error on eth subscription'));
            //console.log(exception);
        }

    });
    console.log('eth subscribed');
};

exports.SubscribePendingTransactions = (req, res, next) => {
    SubscribePendingTransactions();
    console.log('eth subscribed');
    return res.status(200).json({
        result: true,
        message: 'Transactions successfully subscribed'
    });
};
exports.UnsubscribePendingTransactions = (req, res, next) => {
    subscription.unsubscribe(function(error, success) {
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

function confirmEtherTransaction(txHash, gVar, asset, account, isAvailableToNotify) {

    //recommended min number of confirmation : 13
    // eğer token transferi için gerekli ether gönderildi ise kalan etheri toplamak için 13 doğrulama bekleyecek.
    // bu sayede token transferi tamamlanmış olacak
    const confirmationCount = gVar ? gVar.confirmationCount : 13;
    const url = account.wallet.notifyUrl;
    var lastConfirmationCount = 0;
    var intervalId = setInterval(async() => {
        const txConfirmation = await getConfirmations(txHash);
        //console.log(colors.bgBlack.white('gVar.confirmationCount : ' + gVar.confirmationCount));
        //console.log(colors.bgBlack.white('Confirmation (tx: ' + txHash + ') : ' + txConfirmation.confirmation));
        if (txConfirmation.confirmation >= confirmationCount) {
            // ether deposit gerçekleşirse bildirim gönderilecek
            // token transferi için ana cüzdandan ether gönderildi ise
            // bildirim gönderilmeyecek
            if (isAvailableToNotify === true) {
                const valueEther = web3.utils.fromWei(txConfirmation.tx.value, 'ether')

                console.log(colors.green('Confirmed (' + txConfirmation.confirmation + '): ' + asset + ' , ' + txConfirmation.tx.hash + ' , ' + txConfirmation.tx.to + ' , ' + valueEther + ' Ether'));

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
                        'Content-Type': 'application/json',
                        'x-api-key': 'aB8ccABtup85AoKtl96aY904IU889paso'
                    }
                }, function(error, response, body) {
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
            }

            clearInterval(intervalId);

        } else {
            if (lastConfirmationCount != txConfirmation.confirmation) {
                if (isAvailableToNotify === true) {
                    const valueEther = web3.utils.fromWei(txConfirmation.tx.value, 'ether')

                    console.log(colors.green('Confirming (' + txConfirmation.confirmation + '): ' + asset + ' , ' + txConfirmation.tx.hash + ' , ' + txConfirmation.tx.to + ' , ' + valueEther + ' Ether'));

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
                            'Content-Type': 'application/json',
                            'x-api-key': 'aB8ccABtup85AoKtl96aY904IU889paso'
                        }
                    }, function(error, response, body) {
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
                }
            } else {

            }
        }
        lastConfirmationCount = txConfirmation.confirmation;
    }, 5 * 1000)
}

function MoveEth(account) {
    console.log("MoveEth");
    const accountAddress = account.address;
    const accountPrivateKey = account.privateKey;
    const walletAddress = account.wallet.address;
    web3.eth.getBalance(accountAddress, (errBalance, balance) => {
        web3.eth.getGasPrice().then((gasPrice) => {
            const gas = 21000;
            const txFee = web3.utils.toBN(gasPrice).mul(web3.utils.toBN(gas.toString()));
            if (balance > txFee.toNumber()) {
                const transferValue = web3.utils.toBN(balance).sub(txFee);
                // console.log("transferValue");
                // console.log(colors.bgGreen.white(transferValue.toString()));
                // console.log(colors.red("balance  : " + balance));
                // console.log(colors.red("txFee  : " + txFee));
                // console.log(colors.red("transferValue   : " + transferValue));
                web3.eth.getTransactionCount(accountAddress, "pending").then((txCount) => {
                    const txObject = {
                        nonce: txCount.toString(),
                        to: walletAddress,
                        value: transferValue.toString(), // in wei
                        //gasPrice: web3.utils.toWei('200', 'gwei'), //default: web3.eth.getGasPrice()
                        gas: gas.toString()
                    };
                    // console.log(colors.cyan("balance  : " + web3.utils.fromWei(balance.toString(), 'ether')));
                    // console.log(colors.cyan("txFee  : " + web3.utils.fromWei(txFee.toString(), 'ether')));
                    // console.log(colors.cyan("transferValue   : " + web3.utils.fromWei(transferValue.toString(), 'ether')));
                    try {
                        web3.eth.accounts.signTransaction(txObject, accountPrivateKey).then((result, error) => {
                            if (error) {
                                console.log(colors.yellow('error: MoveEth signTransaction error'));
                                //console.log(err);
                            }
                            web3.eth.sendSignedTransaction(result.rawTransaction, (err, txHash) => {
                                if (err) {
                                    console.log(colors.red('error: MoveEth sendSignedTransaction error'));
                                    console.log(err);
                                    console.log("balance  : " + balance + " wei" + web3.utils.fromWei(balance.toString(), 'ether'));
                                    console.log("gasPrice  : " + gasPrice + " wei" + web3.utils.fromWei(gasPrice.toString(), 'ether'));
                                    console.log("txFee  : " + txFee + " wei" + web3.utils.fromWei(txFee.toString(), 'ether'));
                                    console.log("transferValue   : " + transferValue + " wei" + web3.utils.fromWei(transferValue.toString(), 'ether'));
                                } else {
                                    const valueEther = web3.utils.fromWei(transferValue.toString(), 'ether');
                                    console.log(colors.blue('Ether moved to: ' + walletAddress + ' , ' + valueEther + ' Ether' + ' , ' + txHash));
                                }
                            });
                        });
                    } catch (errorTry) {
                        console.log(colors.bgRed.white('MoveEth exception'));
                        console.log(errorTry);
                    }

                });
            }
        });
    });
}