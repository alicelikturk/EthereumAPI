const mongoose = require("mongoose");
const GlobalVariable = require("../models/globalVariable");

exports.List = (req, res, next) => {
    GlobalVariable.findOne()
        .exec()
        .then(gVar => {
            const response = {
                globalVariable: {
                    _id:gVar._id,
                    confirmationCount:gVar.confirmationCount,
                    autoMoving:gVar.autoMoving
                }
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

exports.Update = (req, res, next) => {
    const updateOps = {};
    for (const key of Object.keys(req.body)) {
        updateOps[key] = req.body[key];
    }
    GlobalVariable.updateOne({
        $set: updateOps
    })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Global variable updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:7079/globalVariables/'
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