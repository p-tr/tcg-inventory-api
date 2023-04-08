//
const { DATABASE_URL } = process.env

const mongoose = require('mongoose');
const { cardSchema } = require('@@schema/card');
const { extensionSchema } = require('@@schema/extension');
const { userSchema } = require('@@schema/user')

const { model, connect } = mongoose

let _db = null
let Extension, Card, User

async function init() {
    if(!_db) {
        _db = await connect(DATABASE_URL)
    }

    Extension = model('Extension', extensionSchema)
    Card = model('Card', cardSchema)
    User = model('User', userSchema)

    return { Extension, Card, User }
}

function useuseModels() {
    return { Extension, Card, User }
}

module.exports = { init, useModels }

