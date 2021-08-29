const launch = require('./utils/launchLog')
const Trading = require('./trading')

const WebSocket = require('ws')

const port = 9090

const ws = new WebSocket.Server({ port }, () => {
  launch.log(`WS is running on ${port}`)
});


ws.on('connection', (socket, req) => {
  console.log(req.url)

  switch (req.url) {
    case '/trading':
      Trading.updateHistory(socket)
      break
  }

  ws.clients.forEach(client => {
    client.send('new client has just connected', client.id)
  });

  socket.on('message', message => {
    console.log(message)
  })
});


const emit = payload => {
  ws.clients.forEach(client => {
    client.send(payload)
  });
}


module.exports = {
  emit
}