import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { AuthResponse, UserProfile, SupportedLanguage } from '../types';

interface AuthContextType {
  user: AuthResponse | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    organisationName: string;
    city: string;
    preferredLanguage: SupportedLanguage;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(() => api.getStoredUser());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const p = await api.auth.me();
      setProfile(p);
    } catch (err) {
      console.warn('Failed to fetch profile', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const stored = api.getStoredUser();
      if (stored) {
        setUser(stored);
        await fetchProfile();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      api.setAuth(res);
      setUser(res);
      await fetchProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    organisationName: string;
    city: string;
    preferredLanguage: SupportedLanguage;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(data);
      api.setAuth(res);
      setUser(res);
      await fetchProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    } finally {
      api.clearAuth();
      setUser(null);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        login,
        register,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
