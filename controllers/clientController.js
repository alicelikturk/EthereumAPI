const mongoose = require("mongoose");
const Client = require("../models/client");

exports.List = (req, res, next) => {
    Client.find()
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                clients: docs.map(doc => {
                    return {
                        client: doc,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:7079/clients/' + doc._id
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
    const client = new Client({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        isActive: true,
        mainnetHttp: req.body.mainnetHttp,
        ropstenHttp: req.body.ropstenHttp,
        mainnetWss: req.body.mainnetWss,
        ropstenWss: req.body.ropstenWss,
        mainnetIpc: req.body.mainnetIpc,
        ropstenIpc: req.body.ropstenIpc
    });
    client.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Client stored',
                createdClient: {
                    client: result,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:7079/clients/' + result._id
                    }
                }
            });
        })
};

exports.Get = (req, res, next) => {
    Client.findById(req.params.clientId)
        .exec()
        .then(client => {
            if (!client) {
                return res.status(404).json({
                    message: 'Client not found'
                });
            }
            res.status(200).json({
                client: client,
                request: {
                    type: 'GET',
                    url: 'http://localhost:7079/clients'
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
    Client.deleteOne({ _id: req.params.clientId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Client deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:7079/clients',
                    data: {
                        name: 'String',
                        mainnetHttp: 'String',
                        ropstenHttp: 'String',
                        mainnetWss: 'String',
                        ropstenWss: 'String',
                        mainnetIpc: 'String',
                        ropstenIpc: 'String',
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
        updateOps[key] = req.body[key];
    }
    if (!updateOps["name"]) {
        return res.status(404).json({
            message: 'name is required'
        });
    }
    Client.updateMany({ isActive: true }, {
            isActive: false
        })
        .exec()
        .then(result => {
            console.log("others deactived");
        });

    Client.updateOne({ name: updateOps["name"] }, {
            $set: updateOps
        })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Client updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:7079/clients/'
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