import { useState, useEffect } from 'react';
import { UserPreferences } from '../types/epg';

const STORAGE_KEY = 'epg_user_prefs';

export function useUserPreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { favorites: [], alerts: [], theme: 'dark' };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    if (prefs.theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [prefs]);

  const toggleFavorite = (channelId: string) => {
    setPrefs(prev => ({
      ...prev,
      favorites: prev.favorites.includes(channelId)
        ? prev.favorites.filter(id => id !== channelId)
        : [...prev.favorites, channelId]
    }));
  };

  const toggleAlert = (programId: string) => {
    setPrefs(prev => ({
      ...prev,
      alerts: prev.alerts.includes(programId)
        ? prev.alerts.filter(id => id !== programId)
        : [...prev.alerts, programId]
    }));
  };

  const toggleTheme = () => {
    setPrefs(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  const setFavoriteTeam = (team: string) => {
    setPrefs(prev => ({
      ...prev,
      favoriteTeam: team
    }));
  };

  return { prefs, toggleFavorite, toggleAlert, toggleTheme, setFavoriteTeam };
}
