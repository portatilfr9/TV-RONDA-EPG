import { useState, useEffect } from 'react';
import { UserPreferences } from '../types/epg';

const STORAGE_KEY = 'epg_user_prefs';

export function useUserPreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { favorites: [], alerts: [] };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
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

  return { prefs, toggleFavorite, toggleAlert };
}
