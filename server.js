'use strict'

const fs = require('fs')
const https = require('https')
const path = require('path')
const util = require('util')
const WebSocket = require('ws') // https://github.com/websockets/ws

// When this WebSocket server is running, use the command below to
// inspect the full certificate chain:
// openssl s_client -showcerts -host localhost -port 8080 </dev/null
const server = https.createServer({
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'fullchain.pem')),
    key: fs.readFileSync(path.join(__dirname, 'cert', 'privkey.pem'))
})
const wss = new WebSocket.Server({ server })

wss.on('error', (err) => {
    console.log(`[server] ${err}`)
})

wss.on('listening', () => {
    let address = wss.address()
    address = util.inspect(address, { depth: null })
    console.log(`[server] listening on ${address} at ${new Date()}`)
})

wss.on('connection', (ws, req) => {
    ws.on('message', (message) => {
        if (message.toLowerCase() === 'bye') {
            ws.send('bye')
        }
        else {
            const nums = message.split(' ')
            const sum = nums.reduce((sum, num) => sum + Number(num), 0)
            ws.send(sum.toString())
        }
    })

    const address = `${req.connection.remoteAddress}:${req.connection.remotePort}`
    console.log(`[server] connection from ${address}`)
    ws.send(`hello, you are ${address}`) // send greeting to client
})

server.listen(8080)
