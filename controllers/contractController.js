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
const web3Model = require('../models/web3Model');
web3Model.SetClient(true)
    .then((url) => {
        web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(url));
        SubscribeToTokenTransfer();
    });


exports.List = (req, res, next) => {
    Contract.find()
        .select('standart symbol name contractAddress assetMoveLimit')
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
    let _abi = require('../abiERC20.json');
    if (req.body.abi) {
        _abi = req.body.abi;
    }
    Contract.findOne({
        $or:
            [
                { symbol: req.body.symbol },
                { name: req.body.name },
                { contractAddress: req.body.contractAddress }
            ]
    })
        .exec()
        .then(existContract => {
            if (existContract) {
                return res.status(409).json({
                    message: 'Contract exist',
                    contractInfo: {
                        symbol: req.body.symbol,
                        name: req.body.name,
                        contractAddress: req.body.contractAddress,
                    }
                });
            } else {
                const contract = new Contract({
                    _id: new mongoose.Types.ObjectId(),
                    standart: req.body.standart,
                    symbol: req.body.symbol,
                    name: req.body.name,
                    assetMoveLimit: req.body.assetMoveLimit,
                    contractAddress: req.body.contractAddress,
                    isActive: true,
                    abi: JSON.stringify(_abi)
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
            }
        });
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
                        assetMoveLimit: 'Number',
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

exports.GetBalance = (req, res, next) => {
    const symbol = req.params.symbol;
    const address = req.params.address;
    Contract.findOne({ symbol: symbol })
        .exec()
        .then(contract => {
            if (!contract) {
                return res.status(404).json({
                    message: "Contract not found"
                });
            }
            const newContract = new web3.eth.Contract(JSON.parse(contract.abi), contract.contractAddress);
            newContract.methods.balanceOf(address).call()
                .then((tokenBalance) => {
                    const _tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
                    return res.status(200).json({
                        account: {
                            address: address,
                            asset: contract.symbol,
                            balance: _tokenBalance
                        }
                    });
                });
        });
};

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
                    console.log("send to contract wallet");
                    console.log(wallet);
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
                                            web3.eth.getTransactionCount(wallet.address, "pending").then((txCount) => {
                                                console.log(colors.bgRed(txCount));
                                                const txObject = {
                                                    nonce: txCount,
                                                    to: contract[0].contractAddress,
                                                    data: data,
                                                    gas: 100000
                                                };
                                                console.log(colors.bgRed(txObject));
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

function SubscribeToTokenTransfer() {
    Contract.find()
        .exec()
        .then(docs => {
            if (docs.length < 1) {
                // return res.status(200).json({
                //     result: false,
                //     message: 'Token Contract not found'
                // });
                console.log(colors.red('Token Contract not found'));
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
                console.log(doc.symbol + ' token subscribed');
                newContract.events.Transfer(options, (error, result) => {
                    try {
                        console.log(doc.symbol + ' triggered');
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
                                        //console.log(account);
                                        const valueEther = web3.utils.fromWei(value, 'ether');

                                        console.log(colors.green('Deposit: ' + doc.symbol + ' , ' + transactionHash + ' , ' + toAddress + ' , ' + valueEther + ' ' + doc.symbol));

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
                                                        'Content-Type': 'application/json',
                                                        'x-api-key': 'aB8ccABtup85AoKtl96aY904IU889paso'
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
                                                        confirmTokenTransaction(transactionHash, _gVar, postData, account, doc);
                                                    })
                                                    .catch(err => {
                                                        confirmTokenTransaction(transactionHash, null, postData, account, doc);
                                                    });

                                            })
                                            .catch(err => {
                                                console.log(err);
                                            });
                                    }
                                })
                                .catch(err => {
                                    // return res.status(500).json({
                                    //     result: false,
                                    //     error: err
                                    // });
                                    console.log(err);
                                });
                            //return;
                        }
                    } catch (exception) {
                        console.log(colors.bgRed.white('Critical error on token transfer trigger'));
                        //console.log(exception);
                    }
                });
            });

            // return res.status(200).json({
            //     result: true,
            //     message: 'Contract Transfer successfully subscribed'
            // });
        })
        .catch(err => {
            console.log(err);
            // return res.status(500).json({
            //     result: false,
            //     error: err
            // });
        });

}
exports.SubscribeToTokenTransfer = (req, res, next) => {
    SubscribeToTokenTransfer();
    return res.status(200).json({
        result: true,
        message: 'Contract Transfer successfully subscribed'
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

function confirmTokenTransaction(txHash, gVar, postedData, account, contract) {
    const confirmationCount = gVar ? gVar.confirmationCount : 13;
    const url = account.wallet.notifyUrl;
    var lastConfirmationCount = 0;
    var intervalId = setInterval(async () => {
        const txConfirmation = await getConfirmations(txHash);
        //console.log(colors.bgBlack.white('Confirmation (tx: ' + txHash + ') : ' + txConfirmation.confirmation));

        if (txConfirmation.confirmation >= confirmationCount) {
            console.log(colors.green('Confirmed (' + txConfirmation.confirmation + '): ' + postedData.asset + ' , ' + txHash + ' , ' + postedData.to + ' , ' + postedData.value + ' ' + postedData.asset));

            postedData.confirmation = txConfirmation.confirmation;

            request({
                uri: url,
                method: "POST",
                body: JSON.stringify(postedData),
                rejectUnauthorized: false,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'aB8ccABtup85AoKtl96aY904IU889paso'
                }
            }, function (error, response, body) {
                console.log(colors.cyan('Deposit token confirmation notification request \t' +
                    '{' + url + ', ' + postedData.value + ' ' + postedData.asset + ', ' + txHash + '}' + ' sent'));
                if (error) {
                    console.log(colors.magenta('Deposit token confirmation notification error \t' +
                        JSON.stringify(error)));
                } else {
                    console.log(colors.white('Deposit token confirmation notification response \t' +
                        JSON.stringify(response.body)));
                }
            });
            //Automatically moving eth from account to wallet address
            const autoMoving = gVar ? gVar.autoMoving : false;
            if (autoMoving)
                MoveToken(account, contract);

            clearInterval(intervalId);

        } else {
            if (lastConfirmationCount != txConfirmation.confirmation) {
                console.log(colors.green('Confirming (' + txConfirmation.confirmation + '): ' + postedData.asset + ' , ' + txHash + ' , ' + postedData.to + ' , ' + postedData.value + ' ' + postedData.asset));

                postedData.confirmation = txConfirmation.confirmation;

                request({
                    uri: url,
                    method: "POST",
                    body: JSON.stringify(postedData),
                    rejectUnauthorized: false,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'aB8ccABtup85AoKtl96aY904IU889paso'
                    }
                }, function (error, response, body) {
                    console.log(colors.cyan('Deposit token confirmation notification request \t' +
                        '{' + url + ', ' + postedData.value + ' ' + postedData.asset + ', ' + txHash + '}' + ' sent'));
                    if (error) {
                        console.log(colors.magenta('Deposit token confirmation notification error \t' +
                            JSON.stringify(error)));
                    } else {
                        console.log(colors.white('Deposit token confirmation notification response \t' +
                            JSON.stringify(response.body)));
                    }
                });

            } else {

            }
        }
        lastConfirmationCount = txConfirmation.confirmation;
    }, 5 * 1000)
}

function MoveToken(account, contract) {
    const accountAddress = account.address;
    const accountPrivateKey = account.privateKey;
    const walletAddress = account.wallet.address;
    //console.log('contract.assetMoveLimit: ' + contract.assetMoveLimit);
    const assetMoveLimit = parseFloat(web3.utils.toWei(contract.assetMoveLimit.toString(), 'ether'));

    const newContract = new web3.eth.Contract(JSON.parse(contract.abi), contract.contractAddress);
    newContract.methods.balanceOf(accountAddress).call()
        .then((tokenBalance) => {
            if (tokenBalance >= assetMoveLimit) {
                web3.eth.getBalance(accountAddress, (errBalance, etherBalance) => {
                    web3.eth.getGasPrice().then((gasPrice) => {
                        const gas = 150000;
                        const txFee = web3.utils.toBN(gasPrice).mul(web3.utils.toBN(gas.toString()));
                        //console.log(etherBalance + ' >=' + txFee);
                        if (etherBalance >= txFee.toNumber()) {
                            const valueToken = web3.utils.fromWei(tokenBalance.toString(), 'ether');
                            console.log(colors.magenta('Token moving directly from ' + accountAddress + ' to ' + walletAddress + ' , ' + valueToken + ' ' + contract.symbol));
                            SendToken(web3,
                                newContract,
                                contract.contractAddress,
                                contract.symbol,
                                walletAddress,
                                tokenBalance,
                                accountPrivateKey,
                                accountAddress,
                                account);
                        } else {
                            // Send some ether for FEE >>>
                            // gas fee transfer to move the deposited token to the main wallet
                            console.log(colors.magenta('Ether sending to: ' + accountAddress + ' , ' + txFee + ' wei' + ' to move token'));
                            Wallet.findById(account.wallet)
                                .then(wallet => {
                                    if (!wallet) {
                                        console.log(colors.red('error: Wallet not found. on {gas fee transfer to move the deposited token to the main wallet}'));
                                    }
                                    web3.eth.getBalance(wallet.address, (errBalance, walletEtherBalance) => {
                                        if (walletEtherBalance >= txFee) {
                                            web3.eth.getTransactionCount(wallet.address, "pending").then((txCount) => {
                                                const txObject = {
                                                    nonce: txCount,
                                                    to: accountAddress,
                                                    value: txFee,
                                                    gas: 21000
                                                };
                                                try {
                                                    web3.eth.accounts.signTransaction(txObject, wallet.privateKey).then((result, error) => {
                                                        web3.eth.sendSignedTransaction(result.rawTransaction, (err, hash) => {
                                                            console.log(colors.red('MOVE TOKEN'));
                                                            if (err) {
                                                                console.log(colors.red('error: Ether moved to account to transfer token: ' + accountAddress + ' , ' + txFee + ' eth' + ' , ' + hash));
                                                                //console.log(err);
                                                            } else {
                                                                console.log(colors.blue('Ether moved to account to transfer token: ' + accountAddress + ' , ' + txFee + ' eth' + ' , ' + hash));
                                                            }
                                                        })
                                                            // .on('transactionHash', function (hash) {
                                                            //     console.log(colors.blue('Ether moved to account to transfer token: ' + accountAddress + ' , ' + txFee + ' eth' + ' , ' + hash));
                                                            // })
                                                            .on('confirmation', async function (confNumber, receipt, latestBlockHash) {
                                                                // console.log('confirmation :' + (confNumber === 1));
                                                                console.log("MOVE TOKEN confirmation : " + confNumber);
                                                                //console.log(confNumber);
                                                                // console.log(receipt);
                                                                // console.log(latestBlockHash);
                                                                if (confNumber === 3) {
                                                                    // ether is ready. move the token
                                                                    SendToken(web3,
                                                                        newContract,
                                                                        contract.contractAddress,
                                                                        contract.symbol,
                                                                        walletAddress,
                                                                        tokenBalance,
                                                                        accountPrivateKey,
                                                                        accountAddress,
                                                                        account);
                                                                }
                                                            });
                                                    });
                                                } catch (moveTokenSignTransactionError) {
                                                    console.log(colors.red('moveTokenSignTransactionError'));
                                                    console.log(moveTokenSignTransactionError);
                                                }
                                            });
                                        } else {
                                            console.log(colors.red('error: Insufficient funds for gas * price + value. on {gas fee transfer to move the deposited token to the main wallet}'));
                                            console.log(colors.red("walletEtherBalance: "+walletEtherBalance));
                                        }
                                    });
                                });
                        }
                    });
                });
            }
        });


}

function SendToken(web3, newContract, contractAddress, symbol, walletAddress, tokenBalance, accountPrivateKey, accountAddress, account) {
    var data = newContract.methods.transfer(walletAddress, tokenBalance).encodeABI();
    web3.eth.getTransactionCount(accountAddress, "pending").then((txCount) => {
        const txObject = {
            nonce: txCount,
            to: contractAddress,
            data: data,
            gas: 100000
        };
        web3.eth.accounts.signTransaction(txObject, accountPrivateKey).then((result, error) => {
            web3.eth.sendSignedTransaction(result.rawTransaction, (err, txHash) => {
                console.log(colors.red('MOVE TOKEN'));
                if (err) {
                    console.log(colors.red('error: MoveToken sendSignedTransaction error'));
                    web3.eth.getGasPrice().then((gasPrice) => {
                        const gas = 100000;
                        const reqTxFee = web3.utils.toBN(gasPrice).mul(web3.utils.toBN(gas.toString()));
                        console.log("gas  : " + web3.utils.fromWei("100000", 'ether'));
                        console.log("gasPrice  : " + web3.utils.fromWei(gasPrice.toString(), 'ether'));
                        console.log("reqTxFee  : " + web3.utils.fromWei(reqTxFee.toString(), 'ether'));
                    });
                    console.log(err);
                } else {
                    const valueToken = web3.utils.fromWei(tokenBalance.toString(), 'ether');
                    console.log(colors.blue('Token moved to: ' + walletAddress + ' , ' + valueToken + ' ' + symbol + ' , ' + txHash));
                }
            })
                .on('confirmation', async function (confNumber, receipt, latestBlockHash) {
                    console.log("Send TOKEN confirmation : " + confNumber);
                    if (confNumber === 3) {
                        MoveRemainingEth(account);
                    }
                });
        });
    });
}


function MoveRemainingEth(account) {
    console.log("MoveRemainingEth");
    const accountAddress = account.address;
    const accountPrivateKey = account.privateKey;
    const walletAddress = account.wallet.address;
    web3.eth.getBalance(accountAddress, (errBalance, balance) => {
        web3.eth.getGasPrice().then((gasPrice) => {
            const gas = 21000;
            const txFee = web3.utils.toBN(gasPrice).mul(web3.utils.toBN(gas.toString()));
            if (balance > txFee.toNumber()) {
                const transferValue = web3.utils.toBN(balance).sub(txFee);
                web3.eth.getTransactionCount(accountAddress, "pending").then((txCount) => {
                    const txObject = {
                        nonce: txCount.toString(),
                        to: walletAddress,
                        value: transferValue.toString(), // in wei
                        //gasPrice: web3.utils.toWei('200', 'gwei'), //default: web3.eth.getGasPrice()
                        gas: gas.toString()
                    };
                    try {
                        web3.eth.accounts.signTransaction(txObject, accountPrivateKey).then((result, error) => {
                            if (error) {
                                console.log(colors.yellow('error: MoveRemainingEth signTransaction error'));
                                //console.log(err);
                            }
                            web3.eth.sendSignedTransaction(result.rawTransaction, (err, txHash) => {
                                if (err) {
                                    console.log(colors.red('error: MoveRemainingEth sendSignedTransaction error'));
                                    console.log(err);
                                    console.log("balance  : " + web3.utils.fromWei(balance.toString(), 'ether'));
                                    console.log("gasPrice  : " + web3.utils.fromWei(gasPrice.toString(), 'ether'));
                                    console.log("txFee  : " + web3.utils.fromWei(txFee.toString(), 'ether'));
                                    console.log("transferValue   : " + web3.utils.fromWei(transferValue.toString(), 'ether'));
                                }
                                else {
                                    const valueEther = web3.utils.fromWei(transferValue.toString(), 'ether');
                                    console.log(colors.blue('Ether moved to: ' + walletAddress + ' , ' + valueEther + ' Ether' + ' , ' + txHash));
                                }
                            });
                        });
                    } catch (errorTry) {
                        console.log(colors.bgRed.white('MoveRemainingEth exception'));
                        console.log(errorTry);
                    }

                });
            }
        });
    });
}
