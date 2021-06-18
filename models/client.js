const mongoose = require('mongoose');

const clientSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String },
    isActive: { type: Boolean },
    mainnetHttp: { type: String },
    ropstenHttp: { type: String },
    mainnetWss: { type: String },
    ropstenWss: { type: String },
    mainnetIpc: { type: String },
    ropstenIpc: { type: String }
});

module.exports = mongoose.model('Client', clientSchema);


