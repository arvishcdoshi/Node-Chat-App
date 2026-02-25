const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

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

  socket.emit('message', 'Welcome!')

 // socket.broadcast.emit emits an event to every single connection except for the one that triggered the event.
  socket.broadcast.emit('message', 'A new user has joined!')

  socket.on('sendMessage', (message) => {
    // We want to broadcast this message to every single connection that is currently connected to our server.
    io.emit('message', message)
  })

  // socket.on is used to listen for an event. So in this case, we are listening for the disconnect event, which is built into Socket.IO and it fires when a client disconnects from our server.
  socket.on('disconnect', () => {
    io.emit('message', 'A user has left!')
  })

  socket.on('sendLocation', (coords) => {
    io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
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