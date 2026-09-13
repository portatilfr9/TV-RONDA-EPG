import { addMinutes, startOfDay, setHours, setMinutes, addDays } from 'date-fns';
import { Channel, Program } from '../types/epg';

const PROGRAM_TITLES: Record<string, string[]> = {
  'TDT': ['Informativos', 'El Hormiguero', 'First Dates', 'Masterchef', 'Cine', 'Documental', 'Series', 'Late Night'],
  'Deportes': ['La Liga Live', 'DAZN Boxeo', 'F1 Highlights', 'Tenis ATP', 'NBA Action', 'Informativo Deportes', 'Ciclismo'],
  'Cine': ['Cine de Estreno', 'Clásicos Hollywood', 'Cine Español', 'Acción 24h', 'Drama Night'],
  'Movistar+': ['Late Motiv', 'La Resistencia', 'Series Originales', 'Documentales M+', 'Programación Especial'],
};

export function generateEPG(channels: Channel[], date: Date): Program[] {
  const programs: Program[] = [];
  const dayStart = startOfDay(date);

  channels.forEach((channel) => {
    let currentTime = dayStart;
    const dayEnd = addDays(dayStart, 1);

    while (currentTime < dayEnd) {
      const durationMinutes = [30, 60, 90, 120][Math.floor(Math.random() * 4)];
      const endTime = addMinutes(currentTime, durationMinutes);
      
      const titles = PROGRAM_TITLES[channel.category] || PROGRAM_TITLES['TDT'];
      const title = titles[Math.floor(Math.random() * titles.length)];

      programs.push({
        id: `${channel.id}-${currentTime.getTime()}`,
        channelId: channel.id,
        title: `${title} - ${channel.name}`,
        description: `Esta es una descripción detallada para el programa ${title}. Disfruta de la mejor programación en ${channel.name}.`,
        startTime: currentTime,
        endTime: endTime > dayEnd ? dayEnd : endTime,
        category: channel.category,
      });

      currentTime = endTime;
    }
  });

  return programs;
}
