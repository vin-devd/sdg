const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    country: { type: String, required: true },
    channelId: { type: String, required: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
});

module.exports = new mongoose.model("adahn", fileSchema)