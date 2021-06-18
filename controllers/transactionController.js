const Web3 = require('web3');
const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const colors = require('colors');

var subscription;
const web3Model = require('../models/webTreeModel');
web3Model.SetClient()
    .then((url) => {
        const web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(url));
        subscription = web3.eth.subscribe('pendingTransactions');
    });

exports.SubscribePendingTransactions = (req, res, next) => {
    subscription.subscribe(async(error, result) => {
        if (!error) {
            const txMessage = 'Transaction: ' + result;
            console.log(txMessage.gray);
            const transaction = '';
            // Infura istek limitini dolduruyor
            //const transaction = await web3.eth.getTransaction(result);
            if(transaction!=null){
                // const tx = new Transaction({
                //     _id: new mongoose.Types.ObjectId(),
                //     hash: transaction.hash,
                //     blockNumber: transaction.blockNumber,
                //     blockHash: transaction.blockHash,
                //     transactionIndex: transaction.transactionIndex,
                //     from: transaction.from,
                //     to: transaction.to,
                //     value: transaction.value,
                //     gas: transaction.gas,
                //     gasPrice: transaction.gasPrice
                // });
                const tx = new Transaction({
                    _id: new mongoose.Types.ObjectId(),
                    hash: result
                });
                tx.save()
                    .then(_result => {
                        //console.log(result.hash);
                        //console.log('Tx saved');
                    })
                    .catch(err => {
                        console.log(err);
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
