const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cp = require('cookie-parser')

const { helloApp } = require('@@root/hello')
const { api } = require('@@api')

const { 
    disableXPoweredByHeader 
} = require('@@lib')

const app = express()

module.exports = app;

disableXPoweredByHeader([
    helloApp,
    api,
    app
])

app.use([
    helmet(),
    morgan('tiny'),
    cp()
])

app.use('/hello', helloApp)
app.use('/api', api)

app.get('/', (req, res) => {
    res.send('En construction...')
})
