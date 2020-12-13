const Contract = require('../models/TradeGuard')

var io = null

var users = []

const joinContract = user => {
  users.push(user)
  return user
}

const userIsJoined = id => {
  return users.findIndex(u => u.id == id) != -1
}

const leaveContract = id => {
  const index = users.findIndex(u => u.id == id)

  if (index != -1) {
    users = users.splice(index, 1)
    return users
  } else {
    return users
  }
}

const contractPaid = id => {
  message = {
    text: 'The product was purchased!',
    at: +new Date(),
    side: 'system',
    icon: 'check'
  }

  io.to(id).emit('message', message)
}

const defineIO = value => {
  io = value

  io.on('connection', socket => {
    socket.on('join-contract', ({ email, contract }) => {
      Contract.findById(contract._id, (err, doc) => {
        if (doc) {
          socket.emit('connected')

          if (userIsJoined(socket.id)) {
            // to avoid extra connections
            return
          } else {
            const user = joinContract({
              id: socket.id,
              contract_id: doc._id,
              email,
            })

            socket.join(user.contract_id) // join contract chat
          }

          socket.on('message', message => {
            message = {
              text: message,
              at: +new Date(),
              side: doc.manager == email ? 'seller' : 'buyer',
            }

            io.to(doc._id).emit('message', message)

            Contract.findById(contract._id, (err, doc) => {
              if (doc) {
                doc.messages.push(message)
                doc.save(null)
              } else {
                socket.emit('disconnected')
              }
            })
          })
        } else {
          leaveContract(user.id)
          socket.emit('disconnected')
        }

        socket.on('disconnect', () => {
          leaveContract(socket.id)
        })
      })
    })
  })
}

module.exports = {
  defineIO,
  contractPaid
}
