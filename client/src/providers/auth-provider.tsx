import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Define the shape of the auth context
type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: number;
    username: string;
    email: string;
    initialBalance: string;
    overdraftLimit: string;
    notificationsEnabled: boolean;
  } | null;
  firebaseUser: any; // Firebase user object
  refreshAuth: () => Promise<void>;
};

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  firebaseUser: null,
  refreshAuth: async () => {}
});

// Hook to use the auth context
export const useAuthContext = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  // Function to refresh auth state from our backend
  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      const data = await getCurrentUser();
      
      if (data && data.isAuthenticated) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing auth state:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for Firebase auth state changes (simplified)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setFirebaseUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, firebaseUser, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
