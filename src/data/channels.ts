import { Channel } from '../types/epg';

export const CHANNELS: Channel[] = [
  // TDT Principales
  { id: 'la1', name: 'La 1', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/La_1_2026.svg', category: 'TDT', number: 1 },
  { id: 'la2', name: 'La 2', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/71/La_2_2008.svg', category: 'TDT', number: 2 },
  { id: 'antena3', name: 'Antena 3', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Antena_3_2017.svg', category: 'TDT', number: 3 },
  { id: 'cuatro', name: 'Cuatro', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Cuatro_2005.svg', category: 'TDT', number: 4 },
  { id: 'telecinco', name: 'Telecinco', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Telecinco_2012_Large.svg', category: 'TDT', number: 5 },
  { id: 'lasexta', name: 'laSexta', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/La_Sexta_logo_2016.svg', category: 'TDT', number: 6 },
  
  // TDT Secundarios
  { id: 'neox', name: 'Neox', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Neox.svg', category: 'TDT', number: 7 },
  { id: 'nova', name: 'Nova', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Nova.svg', category: 'TDT', number: 8 },
  { id: 'mega', name: 'Mega', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Mega_logo.svg', category: 'TDT', number: 9 },
  { id: 'fdf', name: 'FDF', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Factor%C3%ADa_de_Ficci%C3%B3n.svg', category: 'TDT', number: 10 },
  { id: 'energy', name: 'Energy', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Energy_2012.svg', category: 'TDT', number: 11 },
  { id: 'divinity', name: 'Divinity', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Divinity_logo.svg', category: 'TDT', number: 12 },
  { id: 'bemad', name: 'Be Mad', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Be_Mad_logo.svg', category: 'TDT', number: 13 },
  { id: 'dmax', name: 'DMAX', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/DMAX_logo.svg', category: 'TDT', number: 14 },
  { id: 'ten', name: 'TEN', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/TEN_logo.svg', category: 'TDT', number: 15 },
  { id: 'trece', name: 'Trece', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Trece_2017.svg', category: 'TDT', number: 16 },
  { id: 'dkiss', name: 'DKISS', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/DKISS_2016.svg', category: 'TDT', number: 17 },
  { id: 'clan', name: 'Clan', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Clan_2008.svg', category: 'TDT', number: 18 },
  { id: 'teledeporte', name: 'Teledeporte', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Teledeporte_2008.svg', category: 'Deportes', number: 19 },
  { id: '24h', name: '24h', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/24h_2026.svg', category: 'TDT', number: 20 },
  { id: 'golplay', name: 'Gol Play', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Gol_Play.svg', category: 'Deportes', number: 21 },
  
  // Autonómicos
  { id: 'canalsur', name: 'Canal Sur', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/CanalSur.svg', category: 'Autonómicos', number: 22 },
  { id: 'tv3', name: 'TV3', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/40/TV3_logo.svg', category: 'Autonómicos', number: 23 },
  { id: 'telemadrid', name: 'Telemadrid', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Telemadrid_logo.svg', category: 'Autonómicos', number: 24 },
  { id: 'etb1', name: 'ETB 1', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/ETB_1_logo.svg', category: 'Autonómicos', number: 25 },
  { id: 'tvg', name: 'TVG', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Televisi%C3%B3n_de_Galicia_logo.svg', category: 'Autonómicos', number: 26 },

  // Movistar+ / Deportes
  { id: 'mplus', name: 'M+ Vamos', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Vamos_logo.svg', category: 'Deportes', number: 50 },
  { id: 'mplus-deportes', name: 'M+ Deportes', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Movistar_Deportes.svg', category: 'Deportes', number: 53 },
  { id: 'mplus-laliga', name: 'M+ LaLiga TV', logo: 'https://res.cloudinary.com/dsmmaylh0/image/upload/v1789260701/movista_laliga_lohhng.png', category: 'Deportes', number: 52 },
  { id: 'mplus-liga-campeones', name: 'M+ Liga de Campeones', logo: 'https://res.cloudinary.com/dsmmaylh0/image/upload/v1789260698/Liga_de_Campeones_por_Movistar_Plus__2022_logo_lqkz2k.webp', category: 'Deportes', number: 56 },
  { id: 'dazn1', name: 'DAZN 1', logo: 'https://res.cloudinary.com/dsmmaylh0/image/upload/v1789260693/imagen_2026-09-13_025132272_rx6wrg.png', category: 'Deportes', number: 70 },
  { id: 'dazn2', name: 'DAZN 2', logo: 'https://res.cloudinary.com/dsmmaylh0/image/upload/v1789260693/imagen_2026-09-13_025132272_rx6wrg.png', category: 'Deportes', number: 71 },
  { id: 'mplus-cine', name: 'M+ Cine', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Movistar_Estrenos.svg', category: 'Cine', number: 30 },
  { id: 'mplus-series', name: 'M+ Series', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Movistar_Series.svg', category: 'Movistar+', number: 11 },
  { id: 'fox', name: 'FOX', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/FOX_logo.svg', category: 'Movistar+', number: 13 },
  { id: 'axn', name: 'AXN', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/AXN_logo.svg', category: 'Movistar+', number: 14 },
];
