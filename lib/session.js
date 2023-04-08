const jwt = require('jsonwebtoken')

const { useModels } = require('@@db')
const { getLevel } = require('@@security/roles')
const { 
    LoginFailedError, 
    AccountNotFoundError,
    InvalidTokenError,
    AccessDeniedError
} = require('@@lib/errors')

const { SECRET, SESSION_COOKIE } = process.env

function get_token(req) {
    let token = null

    if(SESSION_COOKIE in req.cookies) {
        token = req.cookies[SESSION_COOKIE]
    }

    if(!token) {
        let header = req.get('Authorization')
        if(header) {
            let splitted = header.split(' ')
            let word = splitted[0]
            token = ([ "Bearer", "JWT" ].indexOf(word) > -1) ? splitted[1] : null
        }
    }

    return token
}

module.exports = {
    session() {
        return async function(req, res, next) {
            req.session = { user: null, error: null }
            // req.session = new Session()
            const token = get_token(req)
            if(token) {
                const { User } = useModels()
                let errors = []
                let user = null
                let email = null

                try {
                    const decoded = jwt.verify(token, SECRET)
                    if(decoded) {
                        email = decoded.sub
                        user = await User.findOne({ email })
                        if(!user) {
                            throw new AccountNotFoundError()
                        }
                    }
                } catch(err) {
                    const tokenErrors = [ "TokenExpiredError", "JsonWebTokenError", "NotBeforeError" ]
                    if(tokenErrors.indexOf(err.name) > -1) {
                        req.session.error = new InvalidTokenError(err)
                    } else {
                        req.session.error = err
                    }
                }

                req.session.user = user
            }

            next()
        }
    },

    authorize(options = { role : null }) {
        return function(req, res, next) {
            const { role } = options
            const { user, errors } = req.session
            const { User } = useModels()
            try {
                if(user instanceof User) {
                    if(role) {
                        const [ ul, rl ] = [ user.role, role ].map(getLevel)
                        if(ul < rl) {
                            throw new AccessDeniedError()
                        }
                    }
    
                    next()
                } else {
                    throw new LoginFailedError()
                }
            } catch(err) {
                next(err)
            }
        }
    }
}