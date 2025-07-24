import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Ensure unique conversations between participants
conversationSchema.index({ participants: 1 }, { unique: true })

export default mongoose.model('Conversation', conversationSchema)