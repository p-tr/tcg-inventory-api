const { Schema } = require('mongoose')

const { roles } = require('@@security/roles')

const userSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    role: {
        type: String,
        enum: roles,
        default: roles[0],
    },
    password: String
})

module.exports = { userSchema }
