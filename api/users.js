const express = require('express')
const argon2 = require('argon2')

const usersApi = express()

const { models } = require('@@db')

const { authorize } = require('@@lib/session')

module.exports = { usersApi }

usersApi.post('/', authorize({ role: 'guest' }), async (req, res, next) => {
    const { User } = models()

    let status = 201 // 201 CREATED

    try {
        const { body: { email, password, role } } = req

        const hash = await argon2.hash(password);
        const user = await User.create({ email, password: hash, role })

        res.status(status).json({ 
            _id: user._id, email, role: user.role 
        })
    } catch(error) {
        // l'erreur est-elle liée à un duplicate error ? Si oui
        // le statut HTTP sera 409 CONFLICT
        if(error.code == 11000 && error.name == "MongoServerError") {
            error.httpStatus = 409
        } else {
            error.httpStatus = 503
        }

        next(error)
    }
})

