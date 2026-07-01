import React from 'react'
import ReactDOM from 'react-dom/client'
<<<<<<< HEAD
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'

const clerkPub = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPub}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ClerkProvider>
=======
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
>>>>>>> 5bf6ab570f0a17d0204b2dda4629df6c3cb3b4c2
  </React.StrictMode>,
)
