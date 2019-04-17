const express = require('express')

const app = express()
app.use(express.static('public'))
app.use("/output", express.static('/workspace/output'))
app.set('port', (process.env.PORT || 3000))

const listener = app.listen(process.env.PORT, function() {
  console.log('App is listening on port ' + listener.address().port)
})

const io = require('socket.io')(listener)
const uploadController = require('./controllers/uploadController')
const socketController = require('./controllers/socketController')

io.sockets.on('connection', socket => {
  
  console.log('client connected', {id: socket.id, time:socket.handshake.time, useragent:socket.handshake.headers['user-agent']})

  uploadController(app)

  socketController(socket)
  
})