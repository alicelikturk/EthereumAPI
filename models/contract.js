const mongoose = require('mongoose');

const contractSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    standart: { type: String },
    symbol: { type: String },
    name: { type: String },
    contractAddress: { type: String },
    abi: { type: String },
    isActive: { type: Boolean, default: true } 
});

module.exports = mongoose.model('ContractVariable', contractSchema);