const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: String,
    username: String,
    points: { type: Number, default: 0 },
    lastQuizDate: { type: Date, default: Date.now },
    nextQuizDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);