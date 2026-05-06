const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
    service: {type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true},
    current_token: {type: Number, default: 0}
}, {timestamps: true})

module.exports = mongoose.model('Queue', queueSchema);