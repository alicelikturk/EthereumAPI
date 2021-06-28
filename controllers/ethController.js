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
    const amount = req.body.amount;
    const toAddress = req.body.address;
    Wallet.findById(walletId)
        .then(wallet => {
            if (!wallet) {
                return res.status(404).json({
                    message: "Wallet not found",
                    id: id
                });
            }
            web3.eth.getBalance(wallet.address, (errBalance, balance) => {
                console.log('Wallet Balance: ' + balance + ' wei');
                web3.eth.getGasPrice().then((gasPrice) => {
                    console.log('Gas Price: ' + gasPrice + ' wei');
                    const txFee = gasPrice * 21000;
                    console.log('Tx Fee: ' + txFee + ' wei');
                    let value = parseFloat(web3.utils.toWei(amount.toString(), 'ether'));
                    console.log('value: ' + value + ' wei');
                    value = value - txFee;
                    if (balance >= txFee + value) {
                        const txObject = {
                            to: toAddress,
                            value: value, // in wei
                            //gasPrice: web3.utils.toWei('200', 'gwei'), //default: web3.eth.getGasPrice()
                            gas: 21000
                        };
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
                                    txHash: txHash
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

exports.MoveTo = (req, res, next) => {
    var abiERC20 = require('../abiERC20.json');
    const newContract = new web3.eth.Contract(abiERC20, "0x455252ad19fee2d26b1a91a9b20d8b0aa112d245");
    console.log(newContract._jsonInterface)
    const eventInterface = newContract._jsonInterface.find(x => x.name === 'Transfer' && x.type === 'event');

        const from_param = eventInterface.inputs[0].name;
        const to_param = eventInterface.inputs[1].name;
        const value_param = eventInterface.inputs[2].name;

        const options = {
            filter: {
                _from: '',
                _to: '',
                _value: ''
            },
            fromBlock: 'latest'
        };
        console.log('0x455252ad19fee2d26b1a91a9b20d8b0aa112d245' + ' listening...');
        newContract.events.Transfer(options, (error, result) => {
            console.log('\x1b[31m%s\x1b[0m', 'Token Triggered');
            console.log(result);
        });

    res.status(200).json({
        result: "test"
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