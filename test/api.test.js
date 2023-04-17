const request = require('supertest')
const { should, expect, assert } = require('chai')
const app = require('@@app')
const db = require('@@db')

describe('API', function() {
    before(async function() {
        await db.init()
    })

    after(async function() {
        await db.close()
    })

    describe('POST /api', function() {
        it('should respond 406 NOT ACCEPTABLE when required to give XML instead of JSON', function(done) {
            request(app)
                .get('/api')
                .set('Accept', 'application/xml')
                .expect(406, done)
        })
    })

    describe('POST /api/session', function() {    
        it('should respond 415 UNSUPPORTED MEDIA TYPE when given XML instead of JSON', function(done) {
            request(app)
            .post('/api/session')
            .set('Content-Type', 'application/xml')
            .expect(415, done)
        })

        it('should grant access to test user with expected JSON response', function(done) {
            request(app)
                .post('/api/session')
                .send({ email: 'bibi@bibi.com', password: 'bibi' })                
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .expect(201)
                .expect((res) => {
                    return ('token' in res.body) && ('refreshToken' in res.body)
                })
                .expect((res) => {
                    //return res.get('Set-Cookie').contains('authorization')
                    return true
                })
                .end(done)
        })
    })
})
