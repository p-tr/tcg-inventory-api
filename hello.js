const express = require('express')

const { capitalize } = require('./lib')

const helloApp = express()

module.exports = { helloApp }

helloApp.get('/', (req, res) => {
    res.send("Hello World !")
})

helloApp.get('/:name', (req, res) => {
    const { name } = req.params
    res.send(`Hello ${capitalize(name)} !`)
})