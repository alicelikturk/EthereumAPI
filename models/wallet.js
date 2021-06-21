const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    network: { type: String },
    name: { type: String },
    address: { type: String },
    privateKey: { type: String }
});

module.exports = mongoose.model('Wallet', walletSchema);


