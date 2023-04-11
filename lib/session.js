const jwt = require('jsonwebtoken')

const { useModels } = require('@@db')
const { getLevel } = require('@@security/roles')
const { 
    LoginFailedError, 
    AccountNotFoundError,
    InvalidTokenError,
    AccessDeniedError
} = require('@@lib/errors')

const { JWT_SECRET, SESSION_COOKIE, REFRESH_COOKIE } = process.env

class Session {
    constructor() {
        this.user = null
        this.error = null
        this.req = null
        this.cookies = {
           authorization : null,
           refresh : null 
        }
        this.headers = {
            authorization: null
        }
    }

    handleAuthorizationHeader() {
        let token = null
        let header = this.req.get('Authorization')

        if(header) {
            let splitted = header.split(' ')
            let word = splitted[0]
            token = ([ "Bearer", "JWT" ].indexOf(word) > -1) ? splitted[1] : null
        }

        this.headers.authorization = token
    }

    handleCookies() {
        if(SESSION_COOKIE in this.req.cookies) {
            this.cookies.authorization = this.req.cookies[SESSION_COOKIE]
        }

        if(REFRESH_COOKIE in this.req.cookies) {
            this.cookies.refresh = this.req.cookies[REFRESH_COOKIE]
        }
    }

    handleRequest(req) {
        this.req = req

        // traitement de la requête ici
        // données extraites :
        //      cookie d'autorisation (session)
        //      cookie de refresh token (refresh)
        //      en-tête authorization

        this.handleAuthorizationHeader()
        this.handleCookies()
        this.authenticate()
    }

    getToken() {
        return this.headers.authorization || this.cookies.authorization || this.cookies.refresh
    }

    // const { token } = session; exécute ce code
    get token() {
        return this.getToken()
    }

    getRefreshToken() {
        return this.headers.authorization || this.cookies.refresh
    }

    get refreshToken() {
        return this.getRefreshToken()
    }

    async authenticate(options = { refresh: true }) {
        // récupération du token en fonction du contexte
        const token = options.refresh ? this.getRefreshToken() : this.getToken()

        if(token) {
            const { User } = useModels()
            let user = null
            let email = null

            try {
                const decoded = jwt.verify(token, JWT_SECRET)
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
                    this.error = new InvalidTokenError(err)
                } else {
                    this.error = err
                }
            }

            this.user = user
        }
    }
}

module.exports = {
    session(options = { refresh : false }) {
        return async function(req, res, next) {
            // instanciation du descripteur de session
            req.session = new Session()
            
            // gestion de la requête (extraction cookies et headers)
            req.session.handleRequest(req)

            // authentification de l'utilisateur dans la requête
            await req.session.authenticate(options)

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