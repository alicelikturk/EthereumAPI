const mongoose = require('mongoose');

const globalVariableSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    confirmationCount: { type: Number, default: 3 },
    autoMoving: { type: Boolean, default: false } // Automatically moving eth from account to wallet address
});

module.exports = mongoose.model('GlobalVariable', globalVariableSchema);