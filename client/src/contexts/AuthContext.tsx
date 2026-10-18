import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email?: string;
  fullName?: string;
  name?: string;
  type: 'doctor' | 'organization' | 'oauth';
  specialty?: string;
  organization?: any;
  createdAt?: string;
  provider?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  handleOAuthCallback: (token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  handleOAuthCallback: async () => false,
  logout: async () => {},
  isAuthenticated: false,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in (token exists)
    const checkAuthState = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Get current user data using the /me endpoint
          const userData = await authAPI.getCurrentUser();
          
          if (userData) {
            setUser({
              ...userData,
              name: userData.fullName || userData.name, // Add name for backward compatibility
              fullName: userData.fullName || userData.name // Ensure fullName exists
            });
          } else {
            localStorage.removeItem('token');
          }
        } catch (error: any) {
          // If it's a 401 error, remove the invalid token
          if (error.message.includes('401') || error.message.includes('unauthorized')) {
            localStorage.removeItem('token');
          }
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuthState();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userData = await authAPI.login(email, password);
      if (userData) {
        const userWithName = {
          ...userData,
          name: userData.fullName || userData.name // Add name for backward compatibility
        };
        setUser(userWithName);
        
        // Redirect based on user type
        setTimeout(() => {
          if (userData.type === 'organization') {
            window.location.href = '/organization/dashboard';
          } else if (userData.type === 'doctor') {
            window.location.href = '/doctor/dashboard';
          } else if (userData.type === 'oauth') {
            window.location.href = '/complete-profile';
          }
        }, 100);
        
        return true;
      }
      return false;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
      });
      return false;
    }
  };

  const handleOAuthCallback = async (token: string): Promise<boolean> => {
    try {
      // Store the token
      localStorage.setItem('token', token);
      
      // Get current user data using the /me endpoint
      const userData = await authAPI.getCurrentUser();
      
      if (userData) {
        const userWithName = {
          ...userData,
          name: userData.fullName || userData.name,
          fullName: userData.fullName || userData.name
        };
        setUser(userWithName);
        
        // Redirect based on user type
        setTimeout(() => {
          if (userData.type === 'organization') {
            window.location.href = '/organization/dashboard';
          } else if (userData.type === 'doctor') {
            window.location.href = '/doctor/dashboard';
          } else if (userData.type === 'oauth') {
            window.location.href = '/complete-profile';
          }
        }, 100);
        
        return true;
      }
      
      localStorage.removeItem('token');
      return false;
    } catch (error: any) {
      localStorage.removeItem('token');
      toast({
        variant: 'destructive',
        title: 'OAuth login failed',
        description: error.message || 'Failed to process OAuth token',
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Logout error occurred
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        handleOAuthCallback,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
