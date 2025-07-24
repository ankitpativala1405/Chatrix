import express from 'express'
import User from '../models/User.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// Get all users (for contacts)
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query
    const currentUserId = req.userId

    let query = { _id: { $ne: currentUserId } }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const users = await User.find(query)
      .select('name email avatar isOnline lastSeen')
      .limit(50)

    res.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email avatar isOnline lastSeen')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Add contact
router.post('/contacts/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.userId

    if (userId === currentUserId) {
      return res.status(400).json({ message: 'Cannot add yourself as contact' })
    }

    const user = await User.findById(currentUserId)
    const contact = await User.findById(userId)

    if (!contact) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.contacts.includes(userId)) {
      return res.status(400).json({ message: 'Contact already added' })
    }

    user.contacts.push(userId)
    await user.save()

    // Also add current user to contact's contacts (mutual)
    if (!contact.contacts.includes(currentUserId)) {
      contact.contacts.push(currentUserId)
      await contact.save()
    }

    res.json({ message: 'Contact added successfully' })
  } catch (error) {
    console.error('Add contact error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user's contacts
router.get('/contacts/list', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('contacts', 'name email avatar isOnline lastSeen')

    res.json(user.contacts)
  } catch (error) {
    console.error('Get contacts error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router