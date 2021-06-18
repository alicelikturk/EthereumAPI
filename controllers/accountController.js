const Web3 = require('web3');
const colors = require('colors');

var web3;
const web3Model = require('../models/webTreeModel');
web3Model.SetClient()
    .then((url) => {
        web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(url));
    });

exports.List = (req, res, next) => {
    web3.eth.getAccounts((err, res) => {
        console.log(err);
        console.log(res);
        res.forEach(element => {
            console.log(element);
            // web3.eth.getBalance(element, (error, balance) => {
            //     console.log(element + ' : ' + web3.utils.fromWei(balance, 'ether'));
            // });
        });
        res.status(200).json({
            count: res.length,
            accounts: res,
        });
    });
};
