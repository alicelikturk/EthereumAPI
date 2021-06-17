const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const Web3 = require('web3');
const colors = require('colors');


const urlMainnetHttp = "https://mainnet.infura.io/v3/190136ff7d0443d78170f57777111881";
const urlMainnetWss = "wss://mainnet.infura.io/ws/v3/190136ff7d0443d78170f57777111881";
const urlRopstenHttp = "https://ropsten.infura.io/v3/190136ff7d0443d78170f57777111881";
const urlRopstenWSS = "wss://ropsten.infura.io/ws/v3/190136ff7d0443d78170f57777111881";
const web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(urlMainnetWss));


var subscription = web3.eth.subscribe('pendingTransactions');

exports.SubscribePendingTransactions = (req, res, next) => {
    subscription.subscribe(async(error, result) => {
        if (!error) {
            const txMessage = 'Transaction: ' + result;
            console.log(txMessage.cyan);
            const transaction = await web3.eth.getTransaction(result);
            if(transaction!=null){
                const tx = new Transaction({
                    _id: new mongoose.Types.ObjectId(),
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
        message: 'Successfully subscribed'
    });
};
exports.UnsubscribePendingTransactions = (req, res, next) => {

    subscription.unsubscribe(function (error, success) {
        if (success) {
            console.log('Successfully unsubscribed!');
        }
    });
    res.status(200).json({
        message: 'Successfully unsubscribed'
    });
};
