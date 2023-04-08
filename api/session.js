const express = require('express')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')

const { useModels } = require('@@db')
const { authorize } = require('@@lib/session')
const { 
    AccountNotFoundError,
    LoginFailedError
} = require('@@lib/errors')

const { ajv } = require('@@lib/validators')

const { SECRET, SESSION_COOKIE } = process.env

const sessionApi = express()

module.exports = { sessionApi }

const validateLoginRequest = ajv.createValidator({
    type: "object",
    properties: {
        email: {
            type: "string",
            format: "email"
        },
        password: {
            type: "string"
        }
    },
    required: [ "email", "password" ],
    additionalProperties: false
})

sessionApi.post('/', [ validateLoginRequest ], async (req, res, next) => {
    const { User } = useModels()
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })
    
        if(user) {
            const ok = await argon2.verify(user.password, password)
            const expiresIn = "1d"

            if(ok) {
                // génération du JWT ici
                const token = jwt.sign({ sub: email }, SECRET, { expiresIn })

                // puis renvoi du JWT
                // Le JWT doit être transmis à la fois dans le corps de 
                // la réponse et dans un cookie
                res.status(201)
                    .cookie(SESSION_COOKIE, token, { httpOnly: true, sameSite: true })
                    .json({ token })
            } else {
                throw new LoginFailedError()
            }
        } else {
            throw new AccountNotFoundError()
        }
    } catch(err) {
        debugger
        next(err)
    }
})

sessionApi.get('/', authorize(), async (req, res, next) => {
    const { _id, email } = req.session.user
    res.status(200).json({ user: { _id, email }})
})

sessionApi.delete('/', authorize(), (req, res) => {
    res.clearCookie(SESSION_COOKIE).status(204).end()
})
