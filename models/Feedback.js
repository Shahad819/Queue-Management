const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    token: {type: mongoose.Schema.Types.ObjectId, ref: 'Token', required: true},

    rating: {type: Number, required: true, min:1, max:5},
    comment: {type: String}
}, {timestamps: true})

module.exports = mongoose.model('Feedback', feedbackSchema)