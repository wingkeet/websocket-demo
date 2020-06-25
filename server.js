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
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'selfsigned.crt')),
    key: fs.readFileSync(path.join(__dirname, 'cert', 'selfsigned.key'))
})
const wss = new WebSocket.Server({ server })

wss.on('error', (err) => {
    console.log(`[server] ${err}`)
})

wss.on('listening', () => {
    let address = wss.address()
    address = util.inspect(address, { depth: null })
    console.log(`[server] Listening on ${address}`)
})

wss.on('connection', (ws, req) => {
    ws.on('message', async (message) => {
        console.log(`[server] received '${message}'`)

        if (message === 'bye') {
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
    ws.send('hello') // send 'hello' to client
})

server.listen(8080)
