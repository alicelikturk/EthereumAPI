const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String },
    notifyUrl: { type: String },
    network: { type: String },
    address: { type: String },
    privateKey: { type: String }
});

module.exports = mongoose.model('Wallet', walletSchema);


