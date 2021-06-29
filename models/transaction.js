const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    date: { type: String },
    hash: { type: String },
    isContract: { type: Boolean },
    contractAddress: { type: String },
    blockNumber: { type: Number },
    blockHash: { type: String },
    transactionIndex: { type: Number },
    from: { type: String },
    to: { type: String },
    value: { type: String },
    gas: { type: Number },
    gasPrice: { type: String }
});

module.exports = mongoose.model('Transaction', transactionSchema);