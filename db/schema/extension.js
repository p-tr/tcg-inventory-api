const { Schema } = require('mongoose')

const extensionSchema = new Schema({
    name: String,
    license: String
})

module.exports = { extensionSchema }
