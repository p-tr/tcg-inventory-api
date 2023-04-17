const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cp = require('cookie-parser')

const { helloApp } = require('@@root/hello')
const { api } = require('@@api')

const { 
    disableXPoweredByHeader 
} = require('@@lib')

const {
    NODE_ENV
} = process.env

const testing = (NODE_ENV == 'test')

const app = express()

module.exports = app;

disableXPoweredByHeader([
    helloApp,
    api,
    app
])

app.use([
    helmet(),
    cp()
])

if(!testing) {
    app.use(morgan('tiny'))
}

app.use('/hello', helloApp)
app.use('/api', api)

app.get('/', (req, res) => {
    res.send('En construction...')
})
