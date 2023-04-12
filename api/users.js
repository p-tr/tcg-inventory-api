const express = require('express')
const argon2 = require('argon2')

const usersApi = express()

const { useModels } = require('@@db')
const { UniqueConstraintViolationError } = require('@@lib/errors')
const { authorize } = require('@@lib/session')

module.exports = { usersApi }

usersApi.post('/', authorize({ role: 'admin' }), async (req, res, next) => {
    const { User } = useModels()

    let status = 201 // 201 CREATED

    try {
        const { body: { email, password, role } } = req

        const hash = await argon2.hash(password);
        const user = await User.create({ email, password: hash, role })

        res.status(status).json({ 
            _id: user._id, email, role: user.role 
        })
    } catch(error) {
        if(error.name == "MongoServerError") {
            if(error.code == 11000) {
                err = new UniqueConstraintViolationError(error)
            }
        } else {
            err = error
        }

        next(err)
    }
})

