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
  socket.emit('sendMessage', message, (error) => {

    // If there is an error, we want to log it to the console and return from this function. Otherwise, we want to log a success message to the console.
    if (error) {
      return console.log('Error:', error)
    }

    // This is the acknowledgement callback function that we are passing in as the third argument to socket.emit. So this function will be called when the server acknowledges that it has received the message.

    console.log('Message delivered!')
  })
})

document.querySelector('#send-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    // getCurrentPosition is a method that is available on the navigator.geolocation object and it takes a callback function as an argument.
    // This callback function will be called with the position object that contains the latitude and longitude of the user's current location.
    // We can then emit this location data to the server using socket.emit

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            if (error) {
                return console.log('Error:', error)
            }
            console.log('Location delivered!')
        })
    })
})