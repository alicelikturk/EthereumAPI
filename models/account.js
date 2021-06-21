const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', require: true },
    address: { type: String },
    privateKey: { type: String }
});

module.exports = mongoose.model('Account', accountSchema);


