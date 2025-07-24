import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import ContactList from '../components/ContactList'
import VideoCall from '../components/VideoCall'
import { useSocket } from '../contexts/SocketContext'

const Chat = () => {
  const [activeContact, setActiveContact] = useState(null)
  const [contacts, setContacts] = useState([])
  const [messages, setMessages] = useState([])
  const [showContacts, setShowContacts] = useState(false)
  const [inCall, setInCall] = useState(false)
  const [callData, setCallData] = useState(null)
  const { socket } = useSocket()

  useEffect(() => {
    if (socket) {
      socket.on('message-received', (message) => {
        setMessages(prev => [...prev, message])
      })

      socket.on('incoming-call', (data) => {
        setCallData(data)
        setInCall(true)
      })

      socket.on('call-ended', () => {
        setInCall(false)
        setCallData(null)
      })

      return () => {
        socket.off('message-received')
        socket.off('incoming-call')
        socket.off('call-ended')
      }
    }
  }, [socket])

  const handleContactSelect = (contact) => {
    setActiveContact(contact)
    setShowContacts(false)
    // Fetch messages for this contact
    fetchMessages(contact._id)
  }

  const fetchMessages = async (contactId) => {
    try {
      // Fetch messages from API
      const response = await fetch(`/api/messages/${contactId}`)
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const startCall = (type) => {
    if (activeContact && socket) {
      const callData = {
        type,
        to: activeContact._id,
        from: socket.id
      }
      socket.emit('start-call', callData)
      setInCall(true)
      setCallData(callData)
    }
  }

  const endCall = () => {
    if (socket) {
      socket.emit('end-call')
    }
    setInCall(false)
    setCallData(null)
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        onContactsClick={() => setShowContacts(true)}
      />

      {/* Contact List */}
      <ContactList
        show={showContacts}
        contacts={contacts}
        onContactSelect={handleContactSelect}
        onClose={() => setShowContacts(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeContact ? (
          <ChatWindow
            contact={activeContact}
            messages={messages}
            onStartCall={startCall}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-32 h-32 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to ChatApp</h2>
              <p className="text-gray-600 mb-6">Select a contact to start messaging</p>
              <button
                onClick={() => setShowContacts(true)}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Browse Contacts
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Video Call Component */}
      {inCall && (
        <VideoCall
          callData={callData}
          onEndCall={endCall}
        />
      )}
    </div>
  )
}

export default Chat