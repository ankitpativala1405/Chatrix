import React from 'react'
import { motion } from 'framer-motion'
import { Check, CheckCheck } from 'lucide-react'

const MessageBubble = ({ message, isOwn, contact }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isOwn && (
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {contact.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <div
          className={`px-4 py-2 rounded-2xl relative ${
            isOwn
              ? 'message-sent text-white rounded-br-md'
              : 'message-received text-gray-800 rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
          <div className={`flex items-center justify-end mt-1 space-x-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
            <span className="text-xs">{formatTime(message.timestamp)}</span>
            {isOwn && (
              <div className="flex">
                {message.read ? (
                  <CheckCheck className="w-3 h-3" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBubble