// Now, we are connecting to the server using socket.io
// and we are getting back a socket object that represents the connection between the client and the server.
// We can use this socket object to send and receive data from the server.
const socket = io()
const qs = Qs


// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = qs.parse(location.search, { ignoreQueryPrefix: true })


// socket.on('countUpdated', (count) => {
//   console.log('The count has been updated!', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('Clicked')
//   socket.emit('increment')
// })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    // console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    // console.log(url)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    // We are using insertAdjacentHTML to add the new message to the end of the messages container. So we are passing in 'beforeend' as the first argument to insertAdjacentHTML, which means that we want to insert the new message before the end of the messages container.
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    // We want to update the sidebar with the new list of users in the room and the name of the room. So we are rendering the sidebar template with the new data and then we are setting the innerHTML of the sidebar element to the rendered HTML.
    document.querySelector('#sidebar').innerHTML = html

})

socket.on('countUpdated', (count) => {
  console.log('The count has been updated!', count)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
  // used to prevent the default behavior of the form submission, which is when browser refreshes the full page.
  e.preventDefault()

  // disable the form button to prevent multiple submissions until the server acknowledges that it has received the message and then we can re-enable the button in the acknowledgement callback function.
  $messageFormButton.setAttribute('disabled', 'disabled')

  const message = e.target.elements.message.value
  socket.emit('sendMessage', message, (error) => {

    // enable the form button again after the server acknowledges that it has received the message.
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()

    // If there is an error, we want to log it to the console and return from this function. Otherwise, we want to log a success message to the console.
    if (error) {
      return console.log(error)
    }

    // This is the acknowledgement callback function that we are passing in as the third argument to socket.emit. So this function will be called when the server acknowledges that it has received the message.

    console.log('Message delivered!')
  })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    // disable the send location button to prevent multiple clicks until the server acknowledges that it has received the location data and then we can re-enable the button in the acknowledgement callback function.
    $sendLocationButton.setAttribute('disabled', 'disabled')

    // getCurrentPosition is a method that is available on the navigator.geolocation object and it takes a callback function as an argument.
    // This callback function will be called with the position object that contains the latitude and longitude of the user's current location.
    // We can then emit this location data to the server using socket.emit

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            // enable the send location button again after the server acknowledges that it has received the location data.
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location delivered!')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})