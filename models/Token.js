const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    queue: {type: mongoose.Schema.Types.ObjectId, ref: 'Queue', required: true},

    token_number: {type: Number, required: true},
    status: {
        type: String,
        enum: ['waiting', 'serving', 'done', 'cancelled', 'skipped'],
        default: 'waiting'
    },
    estimated_time: {type: Number},
    called_time: {type: Date},
    completed_time: {type: Date},
    
},{timestamps: true});

module.exports = mongoose.model('Token', tokenSchema);
