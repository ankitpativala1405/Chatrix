import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Users, Settings, Phone, Video, LogOut, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'

const Sidebar = ({ onContactsClick }) => {
  const { user, logout } = useAuth()
  const { onlineUsers } = useSocket()

  const menuItems = [
    { icon: MessageCircle, label: 'Chats', active: true },
    { icon: Users, label: 'Contacts', onClick: onContactsClick },
    { icon: Phone, label: 'Calls' },
    { icon: Settings, label: 'Settings' }
  ]

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{user?.name}</h2>
              <p className="text-sm text-green-500 flex items-center">
                Online
              </p>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={item.onClick}
              className={`flex-1 flex items-center justify-center p-2 rounded-md transition-all duration-200 ${
                item.active
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Online Users */}
      <div className="flex-1 overflow-y-auto px-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Online ({onlineUsers.length})
        </h3>
        <div className="space-y-2">
          {onlineUsers.map((user, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-all duration-200"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">Online</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Sidebar