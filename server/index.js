const http = require('http')
const {WebSocketServer} = require('ws')

const uuidv4 = require('uuid').v4
const url = require('url')

const server = http.createServer()
const wsServer = new WebSocketServer({server})
const port = 8000

const connections = {}
const users = {}

const broadcast = () => {
    Object.keys(connections).forEach(userId => {
        const connection = connections[userId]
        const message = JSON.stringify(users)
        connection.send(message)
    })
}

const handleMessage = (bytes, userId) => {
    const message = JSON.parse(bytes.toString())
    const user = users[userId]
    user.state = message
    
    broadcast()
}

const handleClose = userId => {
    delete connections[userId]
    delete users[userId]

    broadcast()
}

wsServer.on("connection", (connection, request) => {
    const { username } = url.parse(request.url, true).query
    const userId = uuidv4() 

    connections[userId] = connection
 
    users[userId] = {
        username,
        state: {}
    }
    connection.on("message", message => handleMessage(message, userId))
    connection.on("close", () => handleClose(userId))
})

server.listen(port, () => {
    console.log(`Websocket server is running on port ${port}`)
})