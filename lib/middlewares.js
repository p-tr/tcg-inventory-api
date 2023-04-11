const { 
    NotAcceptableError, 
    UnsupportedMediaTypeError 
} = require("@@lib/errors")

module.exports = {
    accepts(...types) {
        return function(req, res, next) {
            try {
                if(!req.accepts(...types)) {
                    throw new NotAcceptableError()
                }

                next()
            } catch(err) {
                next(err)
            }
        }
    },

    mediaType(...types) {
        return function(req, res, next) {
            try {
                if(req.get('Content-Type') && !req.is(...types)) {
                    throw new UnsupportedMediaTypeError()
                }

                next()
            } catch(err) {
                next(err)
            }
        }
    }
}