const express = require('express')
const cors = require('cors')

const { usersApi } = require('@@api/users')
const { sessionApi } = require('@@api/session')

const { session } = require('@@lib/session')

const { APIError } = require('@@lib/errors')

const { accepts, mediaType } = require('@@lib/middlewares')

const api = express()

module.exports = { api }

api.use([
    cors(),
    express.json(),
    accepts('json'),
    mediaType('json'),
    session(),
])

api.use('/users', usersApi)
api.use('/session', sessionApi)

api.get('/', (req, res) => {
    res.json({
        version: 1,
        description: "TCG Inventory API"
    })
})

api.use((error, req, res, next) => {
    let status, data

    if(error instanceof APIError) {
        status = error.code
        data = error.toJSON()
    } else {
        status = 500
        data = error
    }

    res.status(status).json(data)
})
