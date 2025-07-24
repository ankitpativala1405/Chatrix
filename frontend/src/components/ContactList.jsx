import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, UserPlus, Phone, Video } from 'lucide-react'
import axios from 'axios'

const ContactList = ({ show, contacts, onContactSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredContacts, setFilteredContacts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchTerm) {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredContacts(filtered)
    } else {
      setFilteredContacts(contacts)
    }
  }, [searchTerm, contacts])

  // const mockContacts = [
  //   { _id: '1', name: 'Alice Johnson', email: 'alice@example.com', avatar: null, online: true },
  //   { _id: '2', name: 'Bob Smith', email: 'bob@example.com', avatar: null, online: false },
  //   { _id: '3', name: 'Carol Williams', email: 'carol@example.com', avatar: null, online: true },
  //   { _id: '4', name: 'David Brown', email: 'david@example.com', avatar: null, online: false },
  //   { _id: '5', name: 'Eva Davis', email: 'eva@example.com', avatar: null, online: true },
  // ]

  const mockContacts = [
  { _id: '662c6ffcb0c3e2b68f8d1b2d', name: 'Alice Johnson', email: 'alice@example.com', avatar: null, online: true },
  { _id: '662c6ffcb0c3e2b68f8d1b2e', name: 'Bob Smith', email: 'bob@example.com', avatar: null, online: false },
  { _id: '662c6ffcb0c3e2b68f8d1b2f', name: 'Carol Williams', email: 'carol@example.com', avatar: null, online: true },
  { _id: '662c6ffcb0c3e2b68f8d1b30', name: 'David Brown', email: 'david@example.com', avatar: null, online: false },
  { _id: '662c6ffcb0c3e2b68f8d1b31', name: 'Eva Davis', email: 'eva@example.com', avatar: null, online: true },
];


  const displayContacts = filteredContacts.length > 0 ? filteredContacts : mockContacts

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Contacts</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="p-4 space-y-2">
                {displayContacts.map((contact, index) => (
                  <motion.div
                    key={contact._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-all duration-200 group"
                    onClick={() => onContactSelect(contact)}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {contact.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{contact.name}</h3>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                      <p className="text-xs text-gray-400">
                        {contact.online ? 'Online' : 'Offline'}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle voice call
                        }}
                        className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all duration-200"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle video call
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Add Contact Button */}
            <div className="p-4 border-t border-gray-200">
              <button className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                <UserPlus className="w-5 h-5" />
                <span>Add New Contact</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ContactList