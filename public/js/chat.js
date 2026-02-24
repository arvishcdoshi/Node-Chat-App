// Now, we are connecting to the server using socket.io
// and we are getting back a socket object that represents the connection between the client and the server.
// We can use this socket object to send and receive data from the server.
const socket = io()

// socket.on('countUpdated', (count) => {
//   console.log('The count has been updated!', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('Clicked')
//   socket.emit('increment')
// })

socket.on('message', (message) => {
  console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
  // used to prevent the default behavior of the form submission, which is when browser refreshes the full page.
  e.preventDefault()
  const message = e.target.elements.message.value
  socket.emit('sendMessage', message)
})