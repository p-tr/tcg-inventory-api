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
        const { code, name, message } = this
        const metadata = ('metadata' in this) ? this.metadata : null

        return { metadata, code, name, message }
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

class ConflictError extends APIError {
    constructor(message = "E_CONFLICT") {
        super(409, message)
        this.name = "ConflictError"
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

// Erreur 429
class TooManyRequestsError extends APIError {
    constructor(message = "E_TOO_MANY_REQUESTS") {
        super(429, message)
        this.name = "TooManyRequestsError"
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

class AccessDeniedError extends ForbiddenError {
    constructor() {
        super("E_ACCESS_DENIED")
    }
}

class ProtectionError extends ForbiddenError {
    constructor() {
        super("E_PROT")
    }
}

class XSRFTokenError extends ForbiddenError {
    constructor() {
        super("E_XSRF_TOKEN")
    }
}

class ValidationError extends UnprocessableEntityError {
    constructor(errors) {
        super("E_VALIDATION_ERROR")
        this.metadata = { errors }
    }
}

class UniqueConstraintViolationError extends ConflictError {
    constructor(error) {
        super("E_UNIQUE")
        this.metadata = { error }
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
    ConflictError,
    UnsupportedMediaTypeError,
    UnprocessableEntityError,
    TooManyRequestsError,
    LoginFailedError,
    AccountNotFoundError,
    InvalidTokenError,
    AccessDeniedError,
    ProtectionError,
    XSRFTokenError,
    ValidationError,
    UniqueConstraintViolationError
}
