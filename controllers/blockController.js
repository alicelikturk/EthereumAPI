const Web3 = require('web3');
const mongoose = require("mongoose");
const Block = require("../models/block");
const colors = require('colors');

var subscription;
const web3Model = require('../models/webTreeModel');
web3Model.SetClient()
    .then((url) => {
        const web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(url));
        subscription = web3.eth.subscribe('newBlockHeaders');
    });
    

exports.SubscribeNewBlockHeaders = (req, res, next) => {
    subscription.subscribe((error, result) => {
        if (!error) {
            const blockMessage = 'Block: ' + result.number + ' ' + result.hash;
            console.log(blockMessage.bgGreen);
            const block = new Block({
                _id: new mongoose.Types.ObjectId(),
                number: result.number,
                hash: result.hash,
                timestamp: result.timestamp
            });
            block.save()
                .then(_result => {
                    //console.log(result.hash);
                    //console.log('Block saved');
                })
                .catch(err => {
                    console.log(err);
                });
            return;
        }
    });
    res.status(200).json({
        message: 'Blocks successfully subscribed'
    });
};
exports.UnsubscribeNewBlockHeaders = (req, res, next) => {
    subscription.unsubscribe(function (error, success) {
        if (success) {
            console.log('Blocks successfully unsubscribed!');
        }
    });
    res.status(200).json({
        message: 'Blocks successfully unsubscribed'
    });
};
