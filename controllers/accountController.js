const Web3 = require('web3');
const mongoose = require("mongoose");
const Account = require("../models/account");
const Wallet = require("../models/wallet");
const Contract = require("../models/contract");
const colors = require('colors');

var web3;
const web3Model = require('../models/web3Model');
web3Model.SetClient(true)
    .then((url) => {
        web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(url));
    });

exports.List = (req, res, next) => {
    Account.find()
        .select('wallet address privateKey _id')
        .populate('wallet', 'name notifyUrl network')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                accounts: docs.map(doc => {
                    return {
                        _id: doc._id,
                        address: doc.address,
                        privateKey: doc.privateKey,
                        wallet: doc.wallet,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:7079/accounts/' + doc._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.Add = (req, res, next) => {
    const name = req.body.wallet;
    Wallet.findOne({ name: name })
        .then(wallet => {
            if (!wallet) {
                return res.status(404).json({
                    message: "Wallet not found",
                    name: name
                });
            }
            let _account = web3.eth.accounts.create('');
            const account = new Account({
                _id: new mongoose.Types.ObjectId(),
                address: _account.address,
                privateKey: _account.privateKey,
                wallet: wallet._id
            });
            account.save()
                .then(result => {
                    res.status(201).json({
                        message: 'Account stored',
                        createdAccount: {
                            _id: result._id,
                            address: result.address,
                            privateKey: result.privateKey,
                            wallet: result.wallet,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:7079/accounts/' + result._id
                            }
                        }
                    });
                })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
};

exports.Get = (req, res, next) => {
    Account.findById(req.params.accountId)
        .populate('wallet', 'name network notifyUrl')
        .exec()
        .then(account => {
            console.log(account);
            if (!account) {
                return res.status(404).json({
                    message: 'Account not found'
                });
            }
            res.status(200).json({
                account: account,
                request: {
                    type: 'GET',
                    url: 'http://localhost:7079/accounts'
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

exports.Delete = (req, res, next) => {
    Account.deleteOne({ _id: req.params.accountId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Account deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:7079/accounts',
                    data: { walletId: 'ID' }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};