import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { userProfilesApi } from '../services/api/userProfiles';

interface UserProfile {
  name: string;
  lastName: string;
  email: string;
  role: string;
  photo: string;
}

interface SettingsContextType {
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  currency: string;
  setCurrency: (c: string) => void;
  measureSystem: string;
  setMeasureSystem: (m: string) => void;
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  saveSettings: () => Promise<void>;
  saveUserPhoto: (base64: string) => Promise<boolean>;
  currencySymbol: string;
  weightUnit: string;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('printpulse_theme') as 'dark' | 'light') || 'dark';
  });
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('printpulse_currency') || 'BRL (R$) - Real Brasileiro';
  });
  const [measureSystem, setMeasureSystem] = useState(() => {
    return localStorage.getItem('printpulse_measure') || 'Métrico (mm, kg, °C)';
  });
  const [user, setUser] = useState<UserProfile>(() => {
    const savedUser = localStorage.getItem('printpulse_user');
    return savedUser ? JSON.parse(savedUser) : {
      name: 'Usuário',
      lastName: '',
      email: '',
      role: 'Operador',
      photo: ''
    };
  });

  useEffect(() => {
    if (authUser) {
      const emailName = authUser.email?.split('@')[0] || 'Usuário';
      const displayName = emailName.split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
      const [firstName, ...rest] = displayName.split(' ');
      
      const defaultPhoto = `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailName}`;
      
      setUser(prev => ({
        ...prev,
        name: firstName,
        lastName: rest.join(' '),
        email: authUser.email || '',
        photo: prev.photo || defaultPhoto
      }));
      
      userProfilesApi.getProfile().then(profile => {
        if (profile?.photo_url) {
          setUser(prev => ({ ...prev, photo: profile.photo_url || defaultPhoto }));
        } else {
          setUser(prev => ({ ...prev, photo: defaultPhoto }));
        }
        setIsLoading(false);
      }).catch(() => {
        setUser(prev => ({ ...prev, photo: defaultPhoto }));
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [authUser]);

  const currencySymbol = currency.includes('BRL') ? 'R$' : currency.includes('USD') ? '$' : '€';
  const weightUnit = measureSystem.includes('Métrico') ? 'g' : 'oz';

  const saveSettings = async () => {
    localStorage.setItem('printpulse_theme', theme);
    localStorage.setItem('printpulse_currency', currency);
    localStorage.setItem('printpulse_measure', measureSystem);
    localStorage.setItem('printpulse_user', JSON.stringify(user));
  };

  const saveUserPhoto = async (base64: string): Promise<boolean> => {
    const success = await userProfilesApi.savePhoto(base64);
    if (success) {
      setUser(prev => ({ ...prev, photo: base64 }));
      localStorage.setItem('printpulse_user', JSON.stringify({ ...user, photo: base64 }));
    }
    return success;
  };

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  const value = {
    theme, setTheme,
    currency, setCurrency,
    measureSystem, setMeasureSystem,
    user, setUser,
    saveSettings,
    saveUserPhoto,
    currencySymbol,
    weightUnit,
    isLoading
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
