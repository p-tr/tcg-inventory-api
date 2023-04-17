const express = require('express')
const cors = require('cors')

const { usersApi } = require('@@api/users')
const { sessionApi } = require('@@api/session')

const { session } = require('@@lib/session')

const { APIError } = require('@@lib/errors')

const { accepts, mediaType } = require('@@lib/middlewares')
const { tokenBucket } = require('@@lib/rate-limiting')

const api = express()

module.exports = { api }

// permet la récupération de l'adresse IP du client
api.enable('trust proxy')

api.use([
    cors(),
    express.json(),
    accepts('json'),
    mediaType('json'),
    session(),
    tokenBucket({ limit: 5, period: 60 })
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
