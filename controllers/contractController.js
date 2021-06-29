const Web3 = require('web3');
const mongoose = require("mongoose");
const Contract = require("../models/contract");
const Account = require("../models/account");
const Wallet = require("../models/wallet");
const Transaction = require("../models/transaction");
const GlobalVariable = require("../models/globalVariable");
const colors = require('colors');
const request = require("request");

var web3;
const web3Model = require('../models/webThreeModel');
web3Model.SetClient()
    .then((url) => {
        web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(url));
    });


exports.List = (req, res, next) => {
    Contract.find()
        .select('standart symbol name contractAddress')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                contracts: docs.map(doc => {
                    return {
                        contract: doc,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:7079/contracts/' + doc._id
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
    if (!req.body.contractAddress) {
        return res.status(404).json({
            message: 'contractAddress is required'
        });
    }
    if (!req.body.name) {
        return res.status(404).json({
            message: 'name is required'
        });
    }
    if (!req.body.abi) {
        return res.status(404).json({
            message: 'abi is required'
        });
    }
    const contract = new Contract({
        _id: new mongoose.Types.ObjectId(),
        standart: req.body.standart,
        symbol: req.body.symbol,
        name: req.body.name,
        contractAddress: req.body.contractAddress,
        isActive: true,
        abi: JSON.stringify(req.body.abi)
    });
    contract.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Contract stored',
                createdContract: {
                    contract: result,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:7079/contracts/' + result._id
                    }
                }
            });
        })
};

exports.Get = (req, res, next) => {
    Contract.findById(req.params.contractId)
        .exec()
        .then(contract => {
            if (!contract) {
                return res.status(404).json({
                    message: 'Contract not found'
                });
            }
            res.status(200).json({
                contract: contract,
                request: {
                    type: 'GET',
                    url: 'http://localhost:7079/contracts'
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
    Contract.deleteOne({ _id: req.params.contractId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Contract deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:7079/contracts',
                    data: {
                        standart: 'String',
                        symbol: 'String',
                        name: 'String',
                        contractAddress: 'String',
                        abi: 'JSON'
                    }
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

exports.Update = (req, res, next) => {
    const updateOps = {};
    for (const key of Object.keys(req.body)) {
        console.log(key);
        if (key == 'abi')
            updateOps[key] = JSON.stringify(req.body[key]);
        else
            updateOps[key] = req.body[key];
    }
    if (!updateOps["contractAddress"]) {
        return res.status(404).json({
            message: 'contractAddress is required'
        });
    }
    Contract.updateOne({ contractAddress: updateOps["contractAddress"] }, {
        $set: updateOps
    })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Contract updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:7079/contracts/'
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

exports.SubscribeToTokenTransfer = (req, res, next) => {
    Contract.find()
        .exec()
        .then(docs => {
            if (docs.length < 1) {
                return res.status(200).json({
                    result: false,
                    message: 'Token Contract not found'
                });
            }
            docs.forEach(doc => {
                const newContract = new web3.eth.Contract(JSON.parse(doc.abi), doc.contractAddress);
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
                    fromBlock: 'latest' //'pending' 
                };
                console.log(doc.symbol + ' subscribed');
                newContract.events.Transfer(options, (error, result) => {
                    if (!error) {
                        const contractAddress = result.address;
                        const transactionHash = result.transactionHash;
                        const fromAddress = result.returnValues[from_param];
                        const toAddress = result.returnValues[to_param];
                        const value = result.returnValues[value_param];

                        Account.findOne({ address: toAddress })
                            .populate('wallet')
                            .exec()
                            .then(account => {
                                if (!account) {

                                } else {
                                    const valueEther = web3.utils.fromWei(value, 'ether');

                                    console.log(colors.gray('Deposit: ' + doc.symbol + ' , ' + transactionHash + ' , ' + toAddress + ' , ' + valueEther + ' Ether'));

                                    const tx = new Transaction({
                                        _id: new mongoose.Types.ObjectId(),
                                        date: new Date().getTime(),
                                        hash: transactionHash,
                                        isContract: true,
                                        contractAddress: contractAddress
                                    });
                                    tx.save()
                                        .then(_result => {
                                            // console.log(colors.bgCyan.black('Deposit Token' +
                                            //     '\ttx saved: ' + transactionHash +
                                            //     '\tto address: ' + toAddress +
                                            //     '\tvalue: ' + value + ' wei'));
                                            var postData = {
                                                txHash: transactionHash,
                                                to: toAddress,
                                                value: valueEther,
                                                from: fromAddress,
                                                confirmation: 0,
                                                asset: doc.symbol
                                            }
                                            request({
                                                uri: account.wallet.notifyUrl,
                                                method: "POST",
                                                body: JSON.stringify(postData),
                                                rejectUnauthorized: false,
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                }
                                            }, function (error, response, body) {
                                                console.log(colors.cyan('Deposit token notification request \t' +
                                                    '{' + account.wallet.notifyUrl + '}' + ' sent'));
                                                if (error) {
                                                    console.log(colors.magenta('Deposit token notification error \t' +
                                                        JSON.stringify(error)));
                                                } else {
                                                    console.log(colors.white('Deposit token notification response \t' +
                                                        JSON.stringify(response.body)));
                                                }
                                            });

                                            GlobalVariable.findOne()
                                                .exec()
                                                .then(_gVar => {
                                                    confirmEtherTransaction(transactionHash, _gVar, postData, account);
                                                })
                                                .catch(err => {
                                                    confirmEtherTransaction(transactionHash, null, postData, account);
                                                });

                                        })
                                        .catch(err => {
                                            console.log(err);
                                        });
                                }
                            })
                            .catch(err => {
                                return res.status(500).json({
                                    result: false,
                                    error: err
                                });
                            });
                        return;
                    }

                });
            });

            return res.status(200).json({
                result: true,
                message: 'Contract Transfer successfully subscribed'
            });
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({
                result: false,
                error: err
            });
        });

};

async function getConfirmations(txHash) {
    const tx = await web3.eth.getTransaction(txHash);
    if (tx != null) {
        if (tx.blockNumber != null) {
            const currentBlock = await web3.eth.getBlockNumber();
            return {
                tx: tx,
                confirmation: currentBlock - tx.blockNumber + 1
            }
        } else {
            return {
                tx: null,
                confirmation: 0
            }
        }
    } else {
        return {
            tx: null,
            confirmation: 0
        }
    }
}

async function confirmEtherTransaction(txHash, gVar, postedData, account) {
    const confirmationCount = gVar ? gVar.confirmationCount : 3;
    const url = account.wallet.notifyUrl;

    var intervalId = setInterval(async () => {
        const txConfirmation = await getConfirmations(txHash);
        //console.log(colors.bgBlack.white('Confirmation (tx: ' + txHash + ') : ' + txConfirmation.confirmation));

        if (txConfirmation.confirmation >= confirmationCount) {
            console.log(colors.gray('Confirmation (' + txConfirmation.confirmation + '): ' + postedData.asset + ' , ' + txHash + ' , ' + postedData.to + ' , ' + postedData.value + ' Ether'));

            postedData.confirmation = txConfirmation.confirmation;

            request({
                uri: url,
                method: "POST",
                body: JSON.stringify(postedData),
                rejectUnauthorized: false,
                headers: {
                    'Content-Type': 'application/json'
                }
            }, function (error, response, body) {
                console.log(colors.cyan('Deposit token confirmation notification request \t' +
                    '{' + url + '}' + ' sent'));
                if (error) {
                    console.log(colors.magenta('Deposit token confirmation notification error \t' +
                        JSON.stringify(error)));
                } else {
                    console.log(colors.white('Deposit token confirmation notification response \t' +
                        JSON.stringify(response.body)));
                }
            });
            // Automatically moving eth from account to wallet address
            // const autoMoving = gVar ? gVar.autoMoving : false;
            // if (autoMoving)
            //     MoveEth(account);

            clearInterval(intervalId);

        }
    }, 5 * 1000)
}

async function MoveToken(account, contract, assetMoveLimit) {
    const accountAddress = account.address;
    const accountPrivateKey = account.privateKey;
    const walletAddress = account.wallet.address;
    //let assetMoveLimit = parseFloat(web3.utils.toWei(amount.toString(), 'ether'));

    const newContract = new web3.eth.Contract(JSON.parse(contract.abi), contract.contractAddress);
    newContract.methods.balanceOf(accountAddress).call()
        .then((tokenBalance) => {
            if (tokenBalance >= assetMoveLimit) {
                web3.eth.getBalance(accountAddress, (errBalance, etherBalance) => {
                    web3.eth.getGasPrice().then((gasPrice) => {
                        const txFee = gasPrice * 100000;
                        if (etherBalance >= txFee) {
                            var data = newContract.methods.transfer(walletAddress, tokenBalance).encodeABI();

                            const txObject = {
                                to: contract[0].contractAddress,
                                data: data,
                                gas: 100000
                            };
                            web3.eth.accounts.signTransaction(txObject, accountPrivateKey).then((result, error) => {
                                web3.eth.sendSignedTransaction(result.rawTransaction, (err, txHash) => {
                                    if (err) {
                                        console.log(colors.red('error: MoveToken sendSignedTransaction error'));
                                        console.log(err);
                                    }else {
                                        const valueToken = web3.utils.fromWei(tokenBalance.toString(), 'ether');
                                        console.log(colors.blue('Token moved to: ' + walletAddress + ' , ' + valueToken + ' '+contract.symbol + ' , ' + txHash));
                                    }
                                });
                            });
                        } else {
                            // Send some ether for FEE >>>
                        }
                    });
                });
            }
        });


}


// Token Transfer
exports.SendToContract = (req, res, next) => {
    const walletId = req.body.walletId;
    const contractAddress = req.body.contractAddress;
    const amount = req.body.amount;
    const toAddress = req.body.address;
    Contract.find({ contractAddress: contractAddress })
        .exec()
        .then(contract => {
            if (!contract) {
                return res.status(404).json({
                    txHash: null,
                    message: 'Contract not found'
                });
            }
            Wallet.findById(walletId)
                .then(wallet => {
                    if (!wallet) {
                        return res.status(404).json({
                            txHash: null,
                            message: "Wallet not found"
                        });
                    }
                    const newContract = new web3.eth.Contract(JSON.parse(contract[0].abi), contract[0].contractAddress);
                    newContract.methods.balanceOf(wallet.address).call()
                        .then((tokenBalance) => {
                            //console.log('Wallet ' + contract[0].symbol + ' balance: ' + tokenBalance + ' wei');
                            let value = parseFloat(web3.utils.toWei(amount.toString(), 'ether'));
                            //console.log('value: '+value);
                            if (tokenBalance >= value) {
                                web3.eth.getBalance(wallet.address, (errBalance, etherBalance) => {
                                    //console.log('Wallet ether balance: ' +etherBalance + ' wei');
                                    web3.eth.getGasPrice().then((gasPrice) => {
                                        const txFee = gasPrice * 100000;
                                        //console.log('txFee: '+txFee);
                                        if (etherBalance >= txFee) {
                                            //console.log('amount: '+amount);
                                            //console.log('amount wei: '+web3.utils.toWei(amount.toString(), 'ether'));
                                            var data = newContract.methods.transfer(toAddress, web3.utils.toWei(amount.toString(), 'ether')).encodeABI();
                                            //console.log('data');
                                            //console.log(data);
                                            const txObject = {
                                                to: contract[0].contractAddress,
                                                data: data,
                                                gas: 100000
                                            };
                                            web3.eth.accounts.signTransaction(txObject, wallet.privateKey).then((result, error) => {
                                                web3.eth.sendSignedTransaction(result.rawTransaction, (err, txHash) => {
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(404).json({
                                                            txHash: null,
                                                            error: "Token SendTo sendSignedTransaction error"
                                                        });
                                                    }
                                                    return res.status(200).json({
                                                        txHash: txHash
                                                    });
                                                });
                                            });
                                        } else {
                                            console.log("Insufficient funds for gas * price (wallet has not enough ether for transaction fee)");
                                            return res.status(404).json({
                                                txHash: null,
                                                error: "Insufficient funds for gas * price (wallet has not enough ether for transaction fee)"
                                            });
                                        }
                                    });
                                });
                            } else {
                                console.log("Insufficient funds for value (wallet has not enough token)");
                                return res.status(404).json({
                                    txHash: null,
                                    error: "Insufficient funds for value (wallet has not enough token)"
                                });
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