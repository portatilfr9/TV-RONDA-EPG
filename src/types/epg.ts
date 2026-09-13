export interface Channel {
  id: string;
  name: string;
  logo: string;
  category: 'TDT' | 'Movistar+' | 'Deportes' | 'Cine' | 'Autonómicos' | 'Otros';
  number?: number;
}

export interface Program {
  id: string;
  channelId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  category?: string;
  image?: string;
  isLive?: boolean;
  metadata?: {
    director?: string;
    cast?: string;
    year?: string;
    genre?: string;
  };
}

export interface UserPreferences {
  favorites: string[]; // channel ids
  alerts: string[]; // program ids
  theme?: 'dark' | 'light';
  favoriteTeam?: string;
}
