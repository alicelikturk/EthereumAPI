const Web3 = require('web3');
var Tx = require('ethereumjs-tx').Transaction;
const mongoose = require("mongoose");
const Account = require("../models/account");
const Wallet = require("../models/wallet");
const colors = require('colors');

var web3;
const web3Model = require('../models/webTreeModel');
web3Model.SetClient()
    .then((url) => {
        web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(url));
    });


exports.IsAddress = (req, res, next) => {
    const address = req.params.address;
    var isaddress = web3.utils.isAddress(address);
    res.status(200).json({
        result: isaddress,
        address: address
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

exports.SendTo = (req, res, next) => {
    const walletId = req.body.walletId;
    Wallet.findById(walletId)
        .then(wallet => {
            if (!wallet) {
                return res.status(404).json({
                    message: "Wallet not found",
                    id: id
                });
            }
            const amount = req.body.amount;
            const toAddress = req.body.address;
            const txObject = {
                to: toAddress,
                value: web3.utils.toWei(amount.toString(), 'ether'), // in wei
                //gasPrice: web3.utils.toWei('200', 'gwei'), //default: web3.eth.getGasPrice()
                gas: 21000
            };
            web3.eth.accounts.signTransaction(txObject, wallet.privateKey).then((result, error) => {
                web3.eth.sendSignedTransaction(result.rawTransaction, (err, txHash) => {
                    if (err) {
                        return res.status(404).json({
                            txHash: null,
                            error: "sendSignedTransaction error"
                        });
                    }
                    return res.status(200).json({
                        txHash: txHash
                    });
                });
            });

        });
};

exports.MoveTo = (req, res, next) => {
    const walletId = req.params.walletId;
    Account.find({ wallet: walletId })
        .exec()
        .then(docs => {
            docs.forEach(doc => {
                web3.eth.accounts.wallet.add(doc.privateKey);
            });
            console.log(web3.eth.accounts.wallet);
            const amount = req.body.amount;
            const toAddress = req.body.address;
            const txObject = {
                from: 0,
                to: toAddress,
                value: web3.utils.toWei(amount.toString(), 'ether'), // in wei
                //gasPrice: web3.utils.toWei('200', 'gwei'), //default: web3.eth.getGasPrice()
                gas: 21000
            };
            console.log(txObject);
            web3.eth.sendTransaction(txObject, (_err, _res) => {
                if (_err)
                    console.log(_err);
                res.status(200).json({
                    result: _res
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(200).json({
                result: err
            });
        });

};

exports.WalletAccounts = (req, res, next) => {
    const walletId = req.params.walletId;
    let wallet = web3.eth.accounts.wallet;
    console.log("wallet".yellow);
    console.log(wallet);
    res.status(200).json({
        wallet: wallet
    });
};