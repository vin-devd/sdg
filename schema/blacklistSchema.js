const mongoose = require('mongoose')

const blacklistSchema= new mongoose.Schema({
    id: { type: String, required: true },
    adminId: { type: String, required: true },
    reason: { type: String, required: false}

});

module.exports = new mongoose.model("blacklist", blacklistSchema)