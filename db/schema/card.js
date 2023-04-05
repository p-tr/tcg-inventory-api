const mongoose = require('mongoose')
const { Schema } = mongoose

const cardSchema = new Schema({
    extension: mongoose.Schema.Types.ObjectId,
    name: String,
    type: String,
    oracle: String,
})

module.exports = { cardSchema }
