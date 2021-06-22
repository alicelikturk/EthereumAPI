const Web3 = require('web3');
const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const Account = require("../models/account");
const GlobalVariable = require("../models/globalVariable");
const colors = require('colors');
const request = require("request");

var gVar;
var web3;
var subscription;

const web3Model = require('../models/webTreeModel');
web3Model.SetClient()
    .then((url) => {
        web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(url));
        subscription = web3.eth.subscribe('pendingTransactions');

    });

exports.SubscribePendingTransactions = async (req, res, next) => {
    subscription.subscribe(async (error, result) => {
        if (!error) {
            // Infura istek limitini dolduruyor
            const transaction = await web3.eth.getTransaction(result);
            if (transaction != null) {
                console.log(colors.gray('tx hash: ' + result));
                // to - String: Address of the receiver. null if it’s a contract creation transaction.
                if (transaction.to == null) {
                    console.log(colors.bgGreen.black('Contract Creation' +
                        '\ntx to : ' + transaction.to +
                        '\ntx hash: ' + result));
                    return;
                }
                Account.findOne({ address: transaction.to })
                    .populate('wallet')
                    .exec()
                    .then(account => {
                        if (!account) {

                        } else {
                            const tx = new Transaction({
                                _id: new mongoose.Types.ObjectId(),
                                date: new Date().getTime(),
                                hash: transaction.hash,
                                blockNumber: transaction.blockNumber,
                                blockHash: transaction.blockHash,
                                transactionIndex: transaction.transactionIndex,
                                from: transaction.from,
                                to: transaction.to,
                                value: transaction.value,
                                gas: transaction.gas,
                                gasPrice: transaction.gasPrice
                            });
                            tx.save()
                                .then(_result => {
                                    console.log(colors.bgCyan.black('Deposit' +
                                        '\ttx saved: ' + transaction.hash +
                                        '\tto address: ' + transaction.to +
                                        '\tvalue: ' + transaction.value + ' wei'));
                                    var postData = {
                                        "txHash": transaction.hash,
                                        "to": transaction.to,
                                        "value": transaction.value,
                                        "from": transaction.from,
                                        "confirmation": 0,
                                        "asset": "eth"
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
                                        if (error) {
                                            console.log(colors.bgWhite.black('Deposit Notify ERROR' +
                                                '\terror: ' + error));
                                        } else {
                                            console.log(colors.bgWhite.black('Deposit Notify RESPONSE' +
                                                '\trequest url: ' + account.wallet.notifyUrl +
                                                '\tresponse: ' + response.body));
                                        }
                                    });

                                    GlobalVariable.findOne()
                                        .exec()
                                        .then(_gVar => {
                                            confirmEtherTransaction(result, _gVar.confirmationCount, 'eth', account.wallet.notifyUrl);
                                        })
                                        .catch(err => {
                                            confirmEtherTransaction(result, 3, 'eth', account.wallet.notifyUrl);
                                        });

                                })
                                .catch(err => {
                                    console.log(err);
                                });
                        }
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
                return;
            }
        }
    });

    res.status(200).json({
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

async function confirmEtherTransaction(txHash, confirmationCount, asset, url) {
    var intervalId = setInterval(async () => {
        const txConfirmation = await getConfirmations(txHash);
        console.log(colors.bgBlack.white(txConfirmation.confirmation));
        console.log(colors.bgBlack.white(confirmationCount));
        if (txConfirmation.confirmation >= confirmationCount) {
            var postData = {
                "txHash": txConfirmation.tx.hash,
                "to": txConfirmation.tx.to,
                "value": txConfirmation.tx.value,
                "from": txConfirmation.tx.from,
                "confirmation": txConfirmation.confirmation,
                "asset": asset
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
                if (error) {
                    console.log(colors.bgWhite.black('Deposit Confirmation Notify ERROR' +
                        '\terror: ' + error));
                } else {
                    console.log(colors.bgWhite.black('Deposit Confirmation Notify RESPONSE' +
                        '\trequest url: ' + url +
                        '\tresponse: ' + response.body));
                }
            });
            clearInterval(intervalId);

        }
    }, 5 * 1000)
}