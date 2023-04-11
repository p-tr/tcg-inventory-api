const crypto = require('crypto')

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

const { 
    JWT_SECRET, 
    SESSION_COOKIE,
    REFRESH_COOKIE,
    AUTHORIZATION_TOKEN_EXPIRATION = "30m",
    REFRESH_TOKEN_EXPIRATION = "12h"
} = process.env

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

            if(ok) {
                // génération du JWT ici
                const xsrf = crypto.randomUUID()

                const token = jwt.sign({ sub: email, xsrf }, JWT_SECRET, { 
                    expiresIn: AUTHORIZATION_TOKEN_EXPIRATION 
                })
                
                const refreshToken = jwt.sign({ sub: email, refresh: true }, JWT_SECRET, {
                    expiresIn: REFRESH_TOKEN_EXPIRATION
                })

                // puis renvoi du JWT
                // Le JWT doit être transmis à la fois dans le corps de 
                // la réponse et dans un cookie
                res.status(201)
                    .cookie(SESSION_COOKIE, token, { httpOnly: true, sameSite: true })
                    .cookie(REFRESH_COOKIE, refreshToken, { httpOnly: true, sameSite: true })
                    .json({ token, refreshToken, xsrf })
            } else {
                throw new LoginFailedError()
            }
        } else {
            throw new AccountNotFoundError()
        }
    } catch(err) {
        next(err)
    }
})

sessionApi.put('/', async(req, res, next) => {
    try {
        if(!req.session.user) {
            // authentification sur la base du refresh token uniquement si l'authentification
            // "tacite" du middleware session() a échoué.
            await req.session.authenticate({ refresh: true })
        }
    
        if(!req.session.user) {
            // On lève l'exception InvalidTokenError ou autre si jamais à ce point la session
            // n'est pas authentifiée.
            throw req.session.error
        }

        const { email } = req.session.user
        const xsrf = crypto.randomUUID()

        // refresh de la session ici
        const token = jwt.sign({ sub: email, xsrf }, JWT_SECRET, {
            expiresIn: AUTHORIZATION_TOKEN_EXPIRATION
        })

        const refreshToken = jwt.sign({ sub: email, refresh: true }, JWT_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRATION
        })

        res.status(200)
            .cookie(SESSION_COOKIE, token, { httpOnly: true, sameSite: true })
            .cookie(REFRESH_COOKIE, refreshToken, { httpOnly: true, sameSite: true })
            .json({ token, refreshToken, xsrf })

    } catch(err) {
        next(err)
    }
})

sessionApi.get('/', authorize(), async (req, res, next) => {
    const xsrf = req.session.xsrf
    const { _id, email } = req.session.user
    res.status(200).json({ user: { _id, email }, xsrf })
})

sessionApi.delete('/', authorize(), (req, res) => {
    res.clearCookie(SESSION_COOKIE).clearCookie(REFRESH_COOKIE).status(204).end()
})
