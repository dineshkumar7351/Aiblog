import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'

const clerkPub = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

const clerkAppearance = {
  layout: {
    socialButtonsVariant: 'blockButton',
  },
  variables: {
    colorPrimary: '#6366f1',
    colorBackground: '#ffffff',
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorInputBackground: '#ffffff',
    colorInputText: '#0f172a',
    borderRadius: '0.875rem',
  },
  elements: {
    card: 'bg-white shadow-xl border border-slate-200 rounded-2xl',
    headerTitle: 'text-slate-900 font-bold text-2xl',
    headerSubtitle: 'text-slate-600',
    socialButtonsBlockButton: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-medium rounded-xl',
    formButtonPrimary: 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white shadow-md font-semibold rounded-xl py-3',
    formFieldLabel: 'text-slate-700 font-medium',
    formFieldInput: 'bg-white border border-slate-300 text-slate-900 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
    footerActionLink: 'text-primary-600 hover:text-primary-700 font-semibold',
    dividerLine: 'bg-slate-200',
    dividerText: 'text-slate-500 text-xs uppercase font-medium',
    badge: 'hidden',
    socialButtonsBlockButtonBadge: 'hidden',
    lastUsedBadge: 'hidden',
    identityPreviewBadge: 'hidden',
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ClerkProvider publishableKey={clerkPub} appearance={clerkAppearance}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ClerkProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
