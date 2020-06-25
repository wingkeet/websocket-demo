'use strict'

const readline = require('readline')
const WebSocket = require('ws') // https://github.com/websockets/ws

const ws = new WebSocket('wss://nuc2:8080', { rejectUnauthorized: false })
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
rl.on('SIGINT', () => {
    console.log()
    quit()
})
let start

function prompt() {
    rl.question('> ', (answer) => {
        ws.send(answer)
        start = Date.now()
    })
}

// https://github.com/websockets/ws/blob/master/doc/ws.md#websocketclosecode-reason
// https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Properties
function quit() {
    ws.close(1000, 'done')
    rl.close()
}

ws.on('error', (err) => {
    console.log(`[client] ${err}`)
    quit()
})

ws.on('open', () => {
    console.log(`[client] connected to ${ws.url}`)
})

ws.on('message', (data) => {
    const elapsed = Date.now() - start
    console.log(`[client] received '${data}'`)
    data === 'bye' ? quit() : prompt()
})

ws.on('close', (code, reason) => {
    console.log(`[client] close ${code} ${reason}`)
    quit()
})
