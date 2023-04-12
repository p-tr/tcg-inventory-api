const express = require('express')
const argon2 = require('argon2')

const usersApi = express()

const { useModels } = require('@@db')
const { 
    UniqueConstraintViolationError,
    ProtectionError,
    NotFoundError
} = require('@@lib/errors')

const { authorize } = require('@@lib/session')
const { getLevel, roles } = require('@@db/security/roles')

const { ajv } = require('@@lib/validators')

module.exports = { usersApi }

const validateCreateOrUpdateRequest = ajv.createValidator({
    type: "object",
    properties: {
        email: {
            type: "string",
            format: "email"
        },
    
        role: {
            enum: roles
        },

        password: {
            type: "string"
        }
    }
})

const createUserMiddlewares = [
    authorize({ role: 'admin' }),
    validateCreateOrUpdateRequest
]

const updateUserMiddlewares = [
    userAccessControl,
    validateCreateOrUpdateRequest
]

const getUserMiddlewares = [ 
    userAccessControl 
]

const deleteUserMiddlewares = [ 
    authorize({ role: 'admin' })
]

const getUsersMiddlewares = [
    authorize({ role: 'admin' })
]

// ExpressJS permet d'auto-bind les valeurs d'un paramètre avec une donnée
// correspondante en BDD
usersApi.param('id', async (req, res, next, _id) => {
    const { User } = useModels()
    try {
        req.user = await User.findOne({ _id })
        if(!req.user) {
            throw new NotFoundError()
        }

        next()
    } catch(err) {
        next(err)
    }
})

function userAccessControl(req, res, next) {
    // req.user contient l'utilisateur cible
    // req.session.user contient l'utilisateur courant
    try {
        const ok = (req.session.user.role == "admin") || req.session.user._id.equals(req.user._id)

        if(! ok) {
            throw new ProtectionError()
        }

        next()
    } catch(err) {
        next(err)
    }
}

usersApi.post('/', createUserMiddlewares, async (req, res, next) => {
    const { User } = useModels()

    let status = 201 // 201 CREATED

    try {
        const { body: { email, password, role } } = req

        // On s'assure de ne pouvoir créer d'utilisateur avec un niveau d'accréditation 
        // supérieur à celui de l'utilisateur courant.
        const level = getLevel(req.session.user.role)
        if(level < getLevel(role)) {
            throw new ProtectionError()
        }

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

usersApi.get('/:id', getUserMiddlewares, (req, res, next) => {
    const { _id, email, role } = req.user
    res.json({ _id, email, role })
})

usersApi.put('/:id', updateUserMiddlewares, async (req, res, next) => {
    try {
        const { email, role, password } = req.body

        const hash = await argon2.hash(password);
        
        const level = getLevel(req.session.user.role)
        if(level < getLevel(role)) {
            throw new ProtectionError()
        }

        req.user.email = email
        req.user.password = hash

        await req.user.save()

        res.status(204).end()
    } catch(err) {
        next(err)
    }
})

usersApi.delete('/:id', deleteUserMiddlewares, async (req, res, next) => {
    try {
        const { User } = useModels()
        const { _id } = req.user
        await User.deleteOne({ _id })
        res.status(204).end()
    } catch(err) {
        next(err)
    }
})

usersApi.get('/', getUsersMiddlewares, async (req, res, next) => {
    try {
        const { User } = useModels()
        const users = await User.find()
        res.json(users.map((user) => {
            const { _id, email, role } = user;
            return { _id, email, role }
        }))
    } catch(err) {
        next(err)
    }
})
