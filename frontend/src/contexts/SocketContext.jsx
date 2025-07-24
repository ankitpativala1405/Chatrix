// import React, { createContext, useContext, useEffect, useState } from 'react'
// import io from 'socket.io-client'
// import { useAuth } from './AuthContext'

// const SocketContext = createContext()

// export const useSocket = () => {
//   const context = useContext(SocketContext)
//   if (!context) {
//     throw new Error('useSocket must be used within a SocketProvider')
//   }
//   return context
// }

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null)
//   const [onlineUsers, setOnlineUsers] = useState([])
//   const { user } = useAuth()

//   useEffect(() => {
//     if (user) {
//       const newSocket = io('http://localhost:5000', {
//         auth: {
//           token: localStorage.getItem('token')
//         }
//       })

//       newSocket.on('connect', () => {
//         console.log('Connected to server')
//       })

//       newSocket.on('online-users', (users) => {
//         setOnlineUsers(users)
//       })

//       setSocket(newSocket)

//       return () => {
//         newSocket.close()
//       }
//     }
//   }, [user])

//   const value = {
//     socket,
//     onlineUsers
//   }

//   return (
//     <SocketContext.Provider value={value}>
//       {children}
//     </SocketContext.Provider>
//   )
// }


import React, { createContext, useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'
import { useAuth } from './AuthContext'

// Create the context
const SocketContext = createContext()

// Custom hook to use the context
export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

// The Provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    // ✅ Only connect if user and token exist
    if (user?.token) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: user.token // ✅ Use the token from your AuthContext
        }
      })

      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id)
      })

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected')
      })

      newSocket.on('online-users', (users) => {
        setOnlineUsers(users)
      })

      setSocket(newSocket)

      // ✅ Clean up connection on unmount
      return () => {
        newSocket.disconnect()
        setSocket(null)
      }
    }
  }, [user])

  const value = {
    socket,
    onlineUsers
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
