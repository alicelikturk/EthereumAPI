const mongoose = require('mongoose');

const globalVariableSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    confirmationCount: { type: Number }
});

module.exports = mongoose.model('GlobalVariable', globalVariableSchema);