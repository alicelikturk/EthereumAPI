const Web3 = require('web3');
var Tx = require('ethereumjs-tx').Transaction;
const mongoose = require("mongoose");
const Account = require("../models/account");
const Wallet = require("../models/wallet");
const colors = require('colors');
const fs = require('fs')

var web3;
const web3Model = require('../models/web3Model');
web3Model.SetClient(true)
    .then((url) => {
        web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(url));
    });


exports.IsAddress = (req, res, next) => {
    const address = req.params.address;
    var isaddress = web3.utils.isAddress(address);
    return res.status(200).json({
        result: isaddress,
        address: address
    });
};

exports.GetChain = (req, res, next) => {
    web3.eth.net.getNetworkType()
        .then(chain => {
            return res.status(200).json({
                result: chain
            });
        });
};

exports.GetProvider = (req, res, next) => {
    const currentProvider = web3.currentProvider;
    res.status(200).json({
        provider: {
            url: currentProvider.url
        }
    });
};

exports.GetTransaction = (req, res, next) => {
    const txHash = req.params.txHash;
    console.log("txHash: " + txHash);
    web3.eth.getTransaction(txHash).then((tx) => {
        web3.eth.getBlockNumber().then((currentBlock) => {
            // tx.value>0?'eth':tx.to ::: value>0 ?"eth":"contract address"
            const transaction = {
                asset: tx.value > 0 ? 'eth' : tx.to,
                confirmations: tx.blockNumber != null ? currentBlock - tx.blockNumber + 1 : 0,
                txBlock: tx.blockNumber != null ? tx.blockNumber : -1,
                currentBlock: currentBlock,
                txId: tx.hash,
                from: tx.from,
                to: tx.to,
                amount: web3.utils.fromWei(tx.value, 'ether')
            };
            console.log(transaction);
            res.status(200).json({
                tx: transaction
            });
        });
    });


};

exports.GetBalance = (req, res, next) => {
    web3.eth.getBalance(req.params.address, (error, result) => {
        if (!error) {
            const _balance = web3.utils.fromWei(result, 'ether');
            res.status(200).json({
                account: {
                    address: req.params.address,
                    balance: _balance
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:7079/accounts/'
                }
            });
        } else {
            res.status(404).json({
                error: {
                    message: 'Balance: ' + result
                }
            });
        }
    });

};

exports.SendTo = (req, res, next) => {
    console.log(req.body);
    const walletId = req.body.walletId;
    const amount = req.body.amount;
    const toAddress = req.body.address;
    Wallet.findById(walletId)
        .then(wallet => {
            if (!wallet) {
                return res.status(404).json({
                    txHash: null,
                    message: "Wallet not found"
                });
            }
            web3.eth.getBalance(wallet.address, (errBalance, balance) => {
                if (errBalance) {
                    console.log('SendTo errBalance: ' + errBalance);
                    return res.status(404).json({
                        txHash: null,
                        error: "SendTo getBalance error"
                    });
                }
                else
                    console.log('Wallet Balance: ' + web3.utils.fromWei(balance.toString(), 'ether') + ' eth');
                web3.eth.getGasPrice().then((gasPrice) => {
                    console.log('Gas Price: ' + web3.utils.fromWei(gasPrice.toString(), 'ether') + ' eth');
                    const txFee = gasPrice * 21000;
                    console.log('Tx Fee: ' + web3.utils.fromWei(txFee.toString(), 'ether') + ' eth');
                    let value = parseFloat(web3.utils.toWei(amount.toString(), 'ether'));
                    console.log('value: ' + web3.utils.fromWei(value.toString(), 'ether') + ' eth');
                    if (balance >= txFee + value) {
                        web3.eth.getTransactionCount(wallet.address, "pending").then((txCount) => {
                            console.log(colors.bgBlue(txCount));
                            const txObject = {
                                nonce: txCount,
                                to: toAddress,
                                value: value, // in wei
                                //gasPrice: web3.utils.toWei('200', 'gwei'), //default: web3.eth.getGasPrice()
                                gas: 21000
                            };
                            console.log(colors.bgBlue(txObject));
                            web3.eth.accounts.signTransaction(txObject, wallet.privateKey).then((result, error) => {
                                web3.eth.sendSignedTransaction(result.rawTransaction, (err, txHash) => {
                                    if (err) {
                                        console.log(err);
                                        return res.status(404).json({
                                            txHash: null,
                                            error: "SendTo sendSignedTransaction error"
                                        });
                                    }
                                    return res.status(200).json({
                                        txHash: txHash,
                                        fee: txFee
                                    });
                                });
                            });
                        });
                    } else {
                        console.log("Insufficient funds for gas * price + value");
                        return res.status(404).json({
                            txHash: null,
                            error: "Insufficient funds for gas * price + value"
                        });
                    }
                });
            });
        });
};

// Test Function
exports.MoveTo = (req, res, next) => {
    // web3.eth.getTransactionCount("0x2A7957DCE7b025fA708206042B9C7DF8125C272d","latest").then((txCount) => {
    //     console.log(colors.green("latest"));
    //     console.log(txCount);
    // });
    // web3.eth.getTransactionCount("0x2A7957DCE7b025fA708206042B9C7DF8125C272d","pending").then((txCount) => {
    //     console.log(colors.red("pending"));
    //     console.log(txCount);
    // });
    web3.eth.getBalance("0x2A7957DCE7b025fA708206042B9C7DF8125C272d", (errBalance, balance) => {
        web3.eth.getGasPrice().then((gasPrice) => {
            const gas = 150000;
            const txFee = web3.utils.toBN(gasPrice).mul(web3.utils.toBN(gas.toString()));
            console.log(balance);
            console.log(web3.utils.toBN(balance).toString());
            console.log(web3.utils.toBN(balance).toNumber());
            console.log(txFee.toNumber());
            console.log(balance > txFee.toNumber());
        });
    });
    res.status(200).json({
        result: "txCount"
    });

};

function readFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, function (err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function (filename) {
            fs.readFile(dirname + filename, 'utf-8', function (err, content) {
                if (err) {
                    onError(err);
                    return;
                }
                onFileContent(filename, content);
            });
        });
    });
}

// Test Function
exports.Test = (req, res, next) => {
    web3.eth.isSyncing()
        .then(console.log);
    res.status(200).json({
        result: 'Test'
    });
};
