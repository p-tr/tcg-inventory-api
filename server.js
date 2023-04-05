require('dotenv').config()
require('module-alias/register')

const os = require('os')
const cluster = require('cluster')

const nr_cpus = os.cpus().length;

let {
    HTTP_PORT = 3000,
    HTTP_ADDRESS = "127.0.0.1",
} = process.env

// Les variables d'environnement sont interprétées comme des String,
// donc ça casse les c**** et du coup, nous sommes dans l'obligation
// de faire ça :

if(HTTP_PORT instanceof String) {
    HTTP_PORT = Number(HTTP_PORT)
}

// Voilà voilà, JS c'est bien mais... y'a des limites.

//console.log(cluster)
//console.log(nr_cpus)

if(cluster.isMaster) {
    for(i = 0; i < nr_cpus; i++) {
        console.log(`Master - Spawning worker n° ${i}`)
        const worker = cluster.fork()
        worker.on('exit', (code, signal) => {
            console.log(`Worker ${worker.pid} killed by signal ${signal}`)

            const message = code ?
                `Worker ${worker.pid} exited with error - code ${code}` :
                `Worker ${worker.pid} exited with success`
            
            (code ? console.error : console.log)(message)
        })
    }
} else {
    console.log(`Worker ${process.pid} has started...`)

    const db = require('@@db')
    db.init().then((models) => {
        const app = require('@@app')

        const server = app.listen(HTTP_PORT, HTTP_ADDRESS, () => {
            const { port, address } = server.address()
            console.log(`Worker ${process.pid} HTTP server listening on ${address}:${port}`)
        })
    })
}
