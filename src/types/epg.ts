export interface Channel {
  id: string;
  name: string;
  logo: string;
  category: 'TDT' | 'Movistar+' | 'Deportes' | 'Cine' | 'Otros';
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
}

export interface UserPreferences {
  favorites: string[]; // channel ids
  alerts: string[]; // program ids
}
