const mongoose = require("mongoose");
const Web3 = require('web3');
const Wallet = require("../models/wallet");

var web3;
const web3Model = require('../models/webThreeModel');
web3Model.SetClient()
    .then((url) => {
        web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(url));
    });


exports.List = (req, res, next) => {
    Wallet.find()
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                wallets: docs.map(doc => {
                    return {
                        wallet: doc,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:7079/wallets/' + doc._id
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

exports.Create = (req, res, next) => {
    const isLocalNode = false;
    if (isLocalNode) {
        // 
    } else {
        Wallet.find({ name: req.body.name })
            .exec()
            .then(wallet => {
                if (wallet.length >= 1) {
                    return res.status(409).json({
                        message: 'Wallet name exist'
                    });
                } else {
                    let _wallet = web3.eth.accounts.wallet.create(1, '');
                    console.log({
                        address: _wallet[0].address,
                        privateKey: _wallet[0].privateKey
                    });

                    const wallet = new Wallet({
                        _id: new mongoose.Types.ObjectId(),
                        name: req.body.name,
                        notifyUrl: req.body.notifyUrl,
                        network: req.body.network,
                        address: _wallet[0].address,
                        privateKey: _wallet[0].privateKey
                    });
                    wallet
                        .save()
                        .then(result => {
                            console.log(result);
                            res.status(201).json({
                                message: 'Wallet created',
                                wallet: {
                                    name: wallet.name,
                                    notifyUrl: wallet.notifyUrl,
                                    address: wallet.address,
                                    network: wallet.network
                                }
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                }
            })
    }

};

exports.Get = (req, res, next) => {
    Wallet.findById(req.params.walletId)
        .exec()
        .then(wallet => {
            if (!wallet) {
                return res.status(404).json({
                    message: 'Wallet not found'
                });
            }
            res.status(200).json({
                wallet: wallet,
                request: {
                    type: 'GET',
                    url: 'http://localhost:7079/wallets'
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

exports.GetBalance = (req, res, next) => {
    Wallet.findById(req.params.walletId)
        .exec()
        .then(wallet => {
            if (!wallet) {
                return res.status(404).json({
                    message: 'Wallet not found'
                });
            }
            web3.eth.getBalance(wallet.address, (error, result) => {
                const balance = web3.utils.fromWei(result, 'ether');
                res.status(200).json({
                    wallet: {
                        _Id: wallet._id,
                        name: wallet.name,
                        notifyUrl: wallet.notifyUrl,
                        network: wallet.network,
                        address: wallet.address,
                        balance: balance
                    },
                    request: {
                        type: 'GET',
                        url: 'http://localhost:7079/wallets'
                    }
                });
            });

        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

exports.Delete = (req, res, next) => {
    Wallet.deleteOne({ _id: req.params.walletId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Wallet deleted'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.Update = (req, res, next) => {
    const id = req.params.walletId;
    const updateOps = {};
    for (const key of Object.keys(req.body)) {
        updateOps[key] = req.body[key];
    }
    Wallet.updateOne({ _id: id }, {
            $set: updateOps
        })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Wallet updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:7079/wallets/'
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