const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()

// So all we've done is we've created the server
// outside of the Express library, we're creating it ourself
// and configuring it to use our Express app.
// Then we are starting it up using server.listen.
// Now, with this in place,
// it's gonna be really easy to set up Socket.IO.


const server = http.createServer(app)

// Attach socket.io (or another WebSocket implementation) to the same server
// so HTTP and WebSocket traffic share the same port and TCP socket.

// This is why we did the refactoring above:
// Socket.IO expects it to be called with the raw HTTP server instance, not the Express app.
// we needed access to the server instance in order to attach Socket.IO to it.

//  When express creates that behind the scenes, we don't have access to it to pass it in right here.
const io = socketio(server)

// READ NOTES.TXT first few lines for more info.

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


// server (emit) -> client (receive) - countUpdated
// client (emit) -> server (receive) - increment

// Fires when Socket.IO server receives a new connection ( basically run some code when a new client connects to our server)
io.on('connection', (socket) => {
  console.log('New WebSocket connection')

  // socket.emit('message', generateMessage('Welcome!'))
 // socket.broadcast.emit emits an event to every single connection except for the one that triggered the event.
  // socket.broadcast.emit('message', generateMessage('A new user has joined!'))

  socket.on('join', ({ username, room }) => {

    console.log(username, room)
    // socket.join is used to join a specific room. So when a client emits the join event, we can use socket.join to join that client to a specific room. Then we can use io.to.emit to emit an event to every single connection that is currently in that room.
    // socket.join can only be used on the server, it cannot be used on the client.
    socket.join(room)

    // socket.emit, io.emit, socket.broadcast.emit
    // io.to.emit, socket.broadcast.to.emit

    socket.emit('message', generateMessage('Welcome!'))
    socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))


  })

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }
    // We want to broadcast this message to every single connection that is currently connected to our server.
    io.emit('message', generateMessage(message))
    // This is the acknowledgement callback function that we are calling in the client. So when the client emits the sendMessage event, it can pass in a callback function as the third argument and this function will be called when the server acknowledges that it has received the message.
    callback()
  })

  // socket.on is used to listen for an event. So in this case, we are listening for the disconnect event, which is built into Socket.IO and it fires when a client disconnects from our server.
  socket.on('disconnect', () => {
    io.emit('message', generateMessage('A user has left!'))
  })

  socket.on('sendLocation', (coords, callback) => {
    io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
  })



//   socket.emit('countUpdated',count)

//   socket.on('increment', () => {
//       count++
//     // socket.emit('countUpdated', count)
//     // We want to emit the countUpdated event to every single connection, not just the one that triggered the increment event.

//       // So instead of using socket.emit, we can use io.emit to emit an event to every single connection that is currently connected to our server.
//       io.emit('countUpdated', count)
//     })
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})