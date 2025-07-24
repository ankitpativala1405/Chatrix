import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Phone, Video, MoreVertical, Paperclip, Smile, Mic, MicOff } from 'lucide-react'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'
import MessageBubble from './MessageBubble'

const ChatWindow = ({ contact, messages, onStartCall }) => {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef(null)
  const { socket } = useSocket()
  const { user } = useAuth()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  console.log('ChatWindow rendered with contact:', contact)
  console.log('Messages:', messages)
  console.log('User:', user)

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() && socket) {
      const newMessage = {
        text: message,
        sender: user._id,
        receiver: contact._id,
        timestamp: new Date(),
        type: 'text'
      }

      socket.emit('send-message', newMessage)
      setMessage('')
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Implement voice recording logic here
  }

  const mockMessages = [
    {
      _id: '1',
      text: 'Hey! How are you doing?',
      sender: contact._id,
      receiver: user._id,
      timestamp: new Date(Date.now() - 300000),
      type: 'text'
    },
    {
      _id: '2',
      text: 'I\'m doing great! Just working on some new projects. How about you?',
      sender: user._id,
      receiver: contact._id,
      timestamp: new Date(Date.now() - 240000),
      type: 'text'
    },
    {
      _id: '3',
      text: 'That sounds awesome! I\'d love to hear more about your projects.',
      sender: contact._id,
      receiver: user._id,
      timestamp: new Date(Date.now() - 180000),
      type: 'text'
    },
    {
      _id: '4',
      text: 'Sure! Let\'s schedule a call to discuss it in detail.',
      sender: user._id,
      receiver: contact._id,
      timestamp: new Date(Date.now() - 120000),
      type: 'text'
    }
  ]

  const displayMessages = messages.length > 0 ? messages : mockMessages

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {contact.name.charAt(0).toUpperCase()}
                </span>
              </div>
              {contact.online && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{contact.name}</h3>
              <p className="text-sm text-gray-500">
                {contact.online ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onStartCall('voice')}
              className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all duration-200"
            >
              <Phone className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onStartCall('video')}
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <Video className="w-5 h-5" />
            </motion.button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {displayMessages.map((msg, index) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwn={msg.sender === user._id}
            contact={contact}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full pl-4 pr-12 py-3 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3 rounded-full transition-all duration-200 ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!message.trim()}
            className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow