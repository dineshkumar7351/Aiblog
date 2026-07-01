<<<<<<< HEAD
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useUser as useClerkUser, useSession } from '@clerk/clerk-react';
import { authAPI, setTokenGetter, setClerkUserGetter } from '../services/api';
=======
/**
 * Authentication Context
 * Manages user authentication state across the app
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
>>>>>>> 5bf6ab570f0a17d0204b2dda4629df6c3cb3b4c2

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
<<<<<<< HEAD
  // Clerk hooks (require ClerkProvider above this provider)
  const clerkAuth = useClerkAuth();
  const clerkUser = useClerkUser();
  const { session } = useSession();

  const [dbUser, setDbUser] = useState(null);
  const [dbUserLoading, setDbUserLoading] = useState(false);

  const isLoaded = clerkAuth?.isLoaded ?? true;
  const isSignedIn = clerkAuth?.isSignedIn ?? false;

  // Fetch DB profile details
  useEffect(() => {
    const fetchDbUser = async () => {
      if (isSignedIn && session) {
        setDbUserLoading(true);
        try {
          const response = await authAPI.getMe();
          if (response.data?.success) {
            setDbUser(response.data.data.user);
          }
        } catch (err) {
          console.error('Error fetching database user profile:', err);
        } finally {
          setDbUserLoading(false);
        }
      } else {
        setDbUser(null);
      }
    };
    fetchDbUser();
  }, [isSignedIn, session]);

  const user = clerkUser?.user && dbUser
    ? {
        id: clerkUser.user.id,
        name: dbUser.name || clerkUser.user.fullName || `${clerkUser.user.firstName || ''} ${clerkUser.user.lastName || ''}`.trim(),
        email: clerkUser.user.primaryEmailAddress?.emailAddress || clerkUser.user.emailAddresses?.[0]?.emailAddress || '',
        bio: dbUser.bio || '',
        phone: dbUser.phone || '',
        location: dbUser.location || '',
        website: dbUser.website || '',
        settings: dbUser.settings || {},
        image: dbUser.image || clerkUser.user.imageUrl || null
      }
    : clerkUser?.user
    ? {
        id: clerkUser.user.id,
        name: clerkUser.user.fullName || `${clerkUser.user.firstName || ''} ${clerkUser.user.lastName || ''}`.trim(),
        email: clerkUser.user.primaryEmailAddress?.emailAddress || clerkUser.user.emailAddresses?.[0]?.emailAddress || ''
      }
    : null;

  // Set up token getter for API requests
  useEffect(() => {
    if (session) {
      setTokenGetter(() => session.getToken());
    }
  }, [session]);

  // Set up Clerk user getter for API requests
  useEffect(() => {
    if (clerkUser?.user) {
      setClerkUserGetter(() => clerkUser.user);
    }
  }, [clerkUser]);

  // Adapter methods to keep existing app API shape
  const login = async () => {
    throw new Error('Client-side login: use Clerk sign-in UI (visit /login)');
  };

  const register = async () => {
    throw new Error('Client-side register: use Clerk sign-up UI (visit /register)');
  };

  const logout = async () => {
    if (clerkAuth?.signOut) {
      await clerkAuth.signOut();
    } else {
      // fallback: clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateUser = async (userData) => {
    try {
      const response = await authAPI.updateMe(userData);
      if (response.data?.success) {
        setDbUser(response.data.data.user);
        return response.data.data.user;
      }
    } catch (err) {
      console.error('Error updating user profile:', err);
      throw err;
    }
=======
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Verify token is still valid
          const response = await authAPI.getMe();
          setUser(response.data.data.user);
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Register user
  const register = async (name, email, password) => {
    const response = await authAPI.register({ name, email, password });
    const { user: userData, token } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return response.data;
  };

  // Login user
  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { user: userData, token } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return response.data;
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
>>>>>>> 5bf6ab570f0a17d0204b2dda4629df6c3cb3b4c2
  };

  const value = {
    user,
<<<<<<< HEAD
    loading: !isLoaded || dbUserLoading,
    isAuthenticated: !!isSignedIn,
    register,
    login,
    logout,
    updateUser,
=======
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateUser
>>>>>>> 5bf6ab570f0a17d0204b2dda4629df6c3cb3b4c2
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
