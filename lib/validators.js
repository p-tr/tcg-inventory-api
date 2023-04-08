const Ajv = require('ajv')
const { ValidationError } = require('@@lib/errors')

const ajv = new Ajv()
require('ajv-formats')(ajv)

module.exports = {
    ajv: {
        createValidator(jsonSchema) {
            const validator = ajv.compile(jsonSchema)
    
            return function(req, res, next) {
                try {
                    const valid = validator(req.body)
                    
                    if(!valid) {
                        throw new ValidationError(validator.errors)
                    }
    
                    next()
                } catch(err) {
                    next(err)
                }
            }
        }
    }
}
