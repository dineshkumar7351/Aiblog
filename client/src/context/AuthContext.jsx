import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useUser as useClerkUser, useSession } from '@clerk/clerk-react';
import { authAPI, setTokenGetter, setClerkUserGetter } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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
  };

  const value = {
    user,
    loading: !isLoaded || dbUserLoading,
    isAuthenticated: !!isSignedIn,
    register,
    login,
    logout,
    updateUser,
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
