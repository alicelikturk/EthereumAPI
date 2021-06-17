const mongoose = require("mongoose");
const Block = require("../models/block");
const Web3 = require('web3');
const colors = require('colors');


const urlMainnetHttp = "https://mainnet.infura.io/v3/190136ff7d0443d78170f57777111881";
const urlMainnetWss = "wss://mainnet.infura.io/ws/v3/190136ff7d0443d78170f57777111881";
const urlRopstenHttp = "https://ropsten.infura.io/v3/190136ff7d0443d78170f57777111881";
const urlRopstenWSS= "wss://ropsten.infura.io/ws/v3/190136ff7d0443d78170f57777111881";
const web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(urlMainnetWss));


var subscription = web3.eth.subscribe('newBlockHeaders');

exports.SubscribeNewBlockHeaders = (req, res, next) => {
    subscription.subscribe((error, result) => {
        if (!error) {
            const blockMessage ='Block: '+result.number+' '+result.hash;
            console.log(blockMessage.magenta);
            const block = new Block({
                _id:new mongoose.Types.ObjectId(),
                number: result.number,
                hash: result.hash,
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
        message:'Successfully subscribed'
    });
};
exports.UnsubscribeNewBlockHeaders = (req, res, next) => {
    
    subscription.unsubscribe(function(error, success){
        if (success) {
            console.log('Successfully unsubscribed!');
        }
    });
    res.status(200).json({
        message:'Successfully unsubscribed'
    });
};
