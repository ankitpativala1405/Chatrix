import express from 'express'
import Message from '../models/Message.js'
import Conversation from '../models/Conversation.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// Get messages between two users
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.userId

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .sort({ createdAt: 1 })

    res.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { text, receiver, type = 'text', fileUrl } = req.body
    const sender = req.userId

    const message = new Message({
      text,
      sender,
      receiver,
      type,
      fileUrl
    })

    await message.save()

    // Update or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] }
    })

    if (!conversation) {
      conversation = new Conversation({
        participants: [sender, receiver],
        lastMessage: message._id,
        lastMessageAt: new Date()
      })
    } else {
      conversation.lastMessage = message._id
      conversation.lastMessageAt = new Date()
    }

    await conversation.save()

    // Populate message before sending response
    await message.populate('sender', 'name avatar')
    await message.populate('receiver', 'name avatar')

    res.status(201).json(message)
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Mark messages as read
router.put('/read/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.userId

    await Message.updateMany(
      { sender: userId, receiver: currentUserId, read: false },
      { read: true, readAt: new Date() }
    )

    res.json({ message: 'Messages marked as read' })
  } catch (error) {
    console.error('Mark messages read error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get conversations for current user
router.get('/conversations/list', auth, async (req, res) => {
  try {
    const currentUserId = req.userId

    const conversations = await Conversation.find({
      participants: currentUserId
    })
    .populate('participants', 'name avatar isOnline lastSeen')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 })

    res.json(conversations)
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router