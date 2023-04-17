const { createHash } = require('crypto')

const { TooManyRequestsError } = require('@@lib/errors')

/*
function getUserIP(req) {
    // méthode "from scratch" :
    //  je récupère l'ip du client à partir de l'en-tête X-Forwarded-For en cas de reverse-proxy
    //  Si pas de reverse-proxy, je récupère l'IP client à partir du socket de connexion TCP
    //const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress

    // Si on est sous ExpressJS, les choses sont plus simples...
    return req.ip
}
*/

function getContextID(req) {
    const id = req.session?.user?._id || req.ip
    const hash = createHash('sha1')
    hash.update(id)
    return hash.digest('hex')
}

class TokenBucket {
    constructor({ limit, period }) {
        this.counter = 0
        this.timer = null
        this.limit = limit
        this.period = period

        if(this.limit > 0) {
            this.counter = this.limit
            const self = this
            const ms = period * 1000 / limit
            this.timer = setInterval(() => {
                console.log('[bucket] counter++')
                if(self.counter < self.limit) {
                    self.counter ++
                }
            }, ms)
        }
    }

    handleRequest() {
        if(this.limit) {
            if(this.counter > 0) {
                console.log('counter --')
                this.counter --;
            } else {
                throw new TooManyRequestsError()
            }

            /*
                Timer de fenêtre de refill complet
            if(!this.timer) {
                const ms = this.period * 1000
                const self = this
                this.timer = setTimeout(() => {
                    self.counter = self.limit
                    self.timer = null
                }, ms)
            }
            */
        }
    }
}

const context = {}

function getTokenBucket(req, { limit, period }) {
    const key = getContextID(req)

    if(!(key in context)) {
        context[key] = new TokenBucket({ limit, period })
    }

    return context[key]
}

module.exports = {
    tokenBucket(options = { limit: 0, period: 60 }) {
        return function(req, res, next) {
            const bucket = getTokenBucket(req, options)
            
            try {
                bucket.handleRequest()
                next()
            } catch(err) {
                next(err)
            }
        }
    }
}
