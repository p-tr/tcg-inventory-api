const Ajv = require('ajv')
const { ValidationError } = require('@@lib/errors')

const ajv = new Ajv()
require('ajv-formats')(ajv)

module.exports = {
    ajv: {
        createValidator(jsonSchema) {
            const validate = ajv.compile(jsonSchema)
    
            return function(req, res, next) {
                try {
                    const isValid = validate(req.body)
                    
                    if(!isValid) {
                        throw new ValidationError(validate.errors)
                    }
    
                    next()
                } catch(err) {
                    next(err)
                }
            }
        }
    }
}
