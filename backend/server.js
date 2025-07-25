import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// Import routes
import authRoutes from './routes/auth.js'
import messageRoutes from './routes/messages.js'
import userRoutes from './routes/users.js'
import DbConnect from './config/DbConnect.js'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(cors())
app.use(express.json())



// Routes
app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/users', userRoutes)

// Socket.io middleware for authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    socket.userId = decoded.userId
    next()
  } catch (err) {
    next(new Error('Authentication error'))
  }
})

// Store online users
const onlineUsers = new Map()

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`)

  // Add user to online users
  onlineUsers.set(socket.userId, {
    socketId: socket.id,
    userId: socket.userId
  })

  // Broadcast updated online users list
  io.emit('online-users', Array.from(onlineUsers.values()))

  // Handle joining rooms (for private messaging)
  socket.on('join-room', (roomId) => {
    socket.join(roomId)
  })

  // Handle sending messages
  // socket.on('send-message', async (messageData) => {
  //   try {
  //     // Save message to database
  //     const Message = (await import('./models/Message.js')).default
  //     // const message = new Message({
  //     //   text: messageData.text,
  //     //   sender: messageData.sender,
  //     //   receiver: messageData.receiver,
  //     //   timestamp: new Date(),
  //     //   type: messageData.type || 'text'
  //     // })

  //     const message = new Message({
  //       text: messageData.text,
  //       sender: new mongoose.Types.ObjectId(messageData.sender),
  //       receiver: new mongoose.Types.ObjectId(messageData.receiver),
  //       timestamp: new Date(),
  //       type: messageData.type || 'text'
  //     })

  //     await message.save()

  //     // Send message to receiver if online
  //     const receiverSocket = onlineUsers.get(messageData.receiver)
  //     if (receiverSocket) {
  //       io.to(receiverSocket.socketId).emit('message-received', message)
  //     }

  //     // Send confirmation to sender
  //     socket.emit('message-sent', message)
  //   } catch (error) {
  //     console.error('Error sending message:', error)
  //     socket.emit('message-error', { error: 'Failed to send message' })
  //   }
  // })


// ...

socket.on('send-message', async (messageData) => {
  try {


     if (
      !mongoose.Types.ObjectId.isValid(messageData.sender) ||
      !mongoose.Types.ObjectId.isValid(messageData.receiver)
    ) {
      throw new Error('Invalid sender or receiver ID')
    }

    
    const Message = (await import('./models/Message.js')).default

    // ✅ Validate and cast to ObjectId
    const senderId = new mongoose.Types.ObjectId(messageData.sender)
    const receiverId = new mongoose.Types.ObjectId(messageData.receiver)

    const message = new Message({
      text: messageData.text,
      sender: senderId,
      receiver: receiverId,
      timestamp: new Date(),
      type: messageData.type || 'text'
    })

    await message.save()

    // Send to receiver if online
    const receiverSocket = onlineUsers.get(messageData.receiver)
    if (receiverSocket) {
      io.to(receiverSocket.socketId).emit('message-received', message)
    }

    // Confirm to sender
    socket.emit('message-sent', message)

  } catch (error) {
    console.error('Error sending message:', error)
    socket.emit('message-error', { error: 'Failed to send message' })
  }
})


  // Handle voice/video calls
  socket.on('start-call', (callData) => {
    const receiverSocket = onlineUsers.get(callData.to)
    if (receiverSocket) {
      io.to(receiverSocket.socketId).emit('incoming-call', {
        ...callData,
        from: socket.userId
      })
    }
  })

  socket.on('accept-call', (callData) => {
    const callerSocket = onlineUsers.get(callData.from)
    if (callerSocket) {
      io.to(callerSocket.socketId).emit('call-accepted', callData)
    }
  })

  socket.on('reject-call', (callData) => {
    const callerSocket = onlineUsers.get(callData.from)
    if (callerSocket) {
      io.to(callerSocket.socketId).emit('call-rejected', callData)
    }
  })

  socket.on('end-call', () => {
    socket.broadcast.emit('call-ended')
  })

  // WebRTC signaling
  socket.on('webrtc-offer', (data) => {
    const receiverSocket = onlineUsers.get(data.to)
    if (receiverSocket) {
      io.to(receiverSocket.socketId).emit('webrtc-offer', {
        ...data,
        from: socket.userId
      })
    }
  })

  socket.on('webrtc-answer', (data) => {
    const callerSocket = onlineUsers.get(data.to)
    if (callerSocket) {
      io.to(callerSocket.socketId).emit('webrtc-answer', data)
    }
  })

  socket.on('webrtc-ice-candidate', (data) => {
    const targetSocket = onlineUsers.get(data.to)
    if (targetSocket) {
      io.to(targetSocket.socketId).emit('webrtc-ice-candidate', {
        ...data,
        from: socket.userId
      })
    }
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`)
    onlineUsers.delete(socket.userId)
    io.emit('online-users', Array.from(onlineUsers.values()))
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  DbConnect().catch(err => {
    console.error('Database connection error:', err)
  })
})
