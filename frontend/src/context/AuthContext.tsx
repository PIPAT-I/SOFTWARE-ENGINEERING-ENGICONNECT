import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getAuthToken, getUserFromToken, setAuthToken, logout as authLogout } from '@/utils/auth';
import { getMyProfile } from '@/services/profileService';
import type { User } from '@/interfaces/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, tokenType?: string) => void;
  logout: () => void;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await getMyProfile();
      if (response?.data && !response?.error) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        const tokenData = getUserFromToken();
        
        // ดึงข้อมูล profile ถ้ามี token
        if (tokenData) {
          await fetchUserProfile();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [fetchUserProfile]);

  const login = useCallback(async (token: string, tokenType: string = "Bearer") => {
    setAuthToken(token, tokenType);
    const tokenData = getUserFromToken();
    
    // ดึงข้อมูล profile หลัง login
    if (tokenData) {
      await fetchUserProfile();
    }
  }, [fetchUserProfile]);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchUserProfile();
  }, [fetchUserProfile]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!getAuthToken(), // ใช้ token แทน user
    login,
    logout,
    loading,
    refreshProfile
  }), [user, loading, login, logout, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
