// errors.js
// Classes d'erreur pour l'application

// Pour rappel, Javascript possède une classe Error qui représente une erreur
//  exemple : err = new Error("Message")
//  champs =>
//      .message    message de l'erreur
//      .name       nom de l'erreur
//  méthodes =>
//      .toString() transforme l'erreur en string

// APIError : classe de base des erreurs d'API
class APIError extends Error {
    constructor(code = 500, message) {
        super(message)

        this.code = code
        this.name = "APIError"
    }

    toString() {
        return `[APIError] ${code} - ${message}`
    }

    toJSON() {
        let obj = {
            code: this.code,
            name: this.name,
            message: this.message
        }

        if('metadata' in this) {
            obj.metadata = this.metadata
        } else {
            obj.metadata = null
        }

        // Peut se réécrire en : obj.metadata = ('metadata' in this) ? this.metadata : null
    
        return obj
    }
}

// Codes HTTP

// Erreur 400
class BadRequestError extends APIError {
    constructor(message) {
        super(400, message)
        this.name = "BadRequestError"
    }
}


// Erreur 401
class UnauthorizedError extends APIError {
    constructor(message) {
        super(401, message)
        this.name = "UnauthorizedError"
    }
}

// Erreur 403
class ForbiddenError extends APIError {
    constructor(message) {
        super(403, message)
        this.name = "ForbiddenError"
    }
}

// Erreur 404
class NotFoundError extends APIError {
    constructor(message) {
        super(404, message)
        this.name = "NotFoundError"
    }
}

// Erreur 405
class MethodNotAllowedError extends APIError {
    constructor(message) {
        super(405, message)
        this.name = "MethodNotAllowedError"
    }
}

// Erreur 406
class NotAcceptableError extends APIError {
    constructor(message = "E_NOT_ACCEPTABLE") {
        super(406, message)
        this.name = "NotAcceptableError"
    }
}

// Erreur 415
class UnsupportedMediaTypeError extends APIError {
    constructor(message = "E_UNSUPPORTED_MEDIA_TYPE") {
        super(415, message)
        this.name = "UnsupportedMediaTypeError"
    }
}

// Erreur 422
class UnprocessableEntityError extends APIError {
    constructor(message) {
        super(422, message)
        this.name = "UnprocessableEntityError"
    }
}


// Buisness Error
class LoginFailedError extends UnauthorizedError {
    constructor() {
        super("E_LOGIN_FAILED")
    }
}

class AccountNotFoundError extends UnauthorizedError {
    constructor() {
        super("E_ACCOUNT_NOT_FOUND")
    }
}

class InvalidTokenError extends UnauthorizedError {
    constructor(originalError) {
        super("E_INVALID_TOKEN")
        this.metadata = { originalError }
    }
}

class AuthorizationFailedError extends ForbiddenError {
    constructor() {
        super("E_AUTHORIZATION_FAILED")
    }
}

class ValidationError extends UnprocessableEntityError {
    constructor(errors) {
        super("E_VALIDATION_ERROR")
        this.metadata = { errors }
    }
}

module.exports = {
    APIError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    MethodNotAllowedError,
    NotAcceptableError,
    UnsupportedMediaTypeError,
    UnprocessableEntityError,
    LoginFailedError,
    AccountNotFoundError,
    InvalidTokenError,
    AuthorizationFailedError,
    ValidationError
}
