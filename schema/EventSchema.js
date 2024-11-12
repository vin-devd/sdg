const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    lastEventTime: { type: Date, default: null },
    participants: [{
        userId: String,
        points: Number,
        username: String
    }]
});

module.exports = mongoose.model('Event', EventSchema); 