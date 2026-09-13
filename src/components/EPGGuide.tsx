import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format, addHours, startOfHour, differenceInMinutes, isWithinInterval, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Filter, Star, Bell, Info, ChevronLeft, ChevronRight, X, Loader2, Tv, Calendar, Share2, Sun, Moon, Play, Film, Trophy, Tv2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CHANNELS } from '../data/channels';
import { generateEPG } from '../utils/epg-generator';
import { Channel, Program } from '../types/epg';
import { useUserPreferences } from '../hooks/useUserPreferences';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const HOUR_WIDTH = 300; // pixels per hour
const MINUTE_WIDTH = HOUR_WIDTH / 60;

interface ChannelRowProps {
  key?: string | number;
  channel: Channel;
  epgData: Program[];
  selectedDate: Date;
  currentTime: Date;
  prefs: any;
  toggleFavorite: (id: string) => void;
  toggleAlert: (id: string) => void;
  setSelectedProgram: (p: Program) => void;
}

function ChannelRow({ 
  channel, 
  epgData, 
  selectedDate, 
  currentTime, 
  prefs, 
  toggleFavorite, 
  toggleAlert, 
  setSelectedProgram 
}: ChannelRowProps) {
  return (
    <div key={channel.id} className={cn("flex border-b group h-20", prefs.theme === 'light' ? 'border-slate-200' : 'border-slate-800/50')}>
      {/* Channel Sticky Cell */}
      <div className={cn("sticky left-0 z-20 w-48 md:w-64 backdrop-blur-sm border-r flex items-center px-4 gap-4 transition-colors", prefs.theme === 'light' ? 'bg-white/95 border-slate-200 group-hover:bg-slate-50' : 'bg-slate-900/95 border-slate-800 group-hover:bg-slate-800')}>
        <div className="flex flex-col items-center justify-center min-w-[2.5rem]">
           <span className="text-[10px] font-bold text-slate-500 mb-1">{channel.number}</span>
           <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(channel.id);
            }}
            className={cn(
              "transition-colors",
              prefs.favorites.includes(channel.id) ? "text-yellow-400" : "text-slate-600 hover:text-slate-400"
            )}
           >
             <Star className="w-4 h-4 fill-current" />
           </button>
        </div>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center flex-shrink-0 shadow-sm">
            <img src={channel.logo} alt={channel.name} className="max-w-full max-h-full object-contain" />
          </div>
          <span className="font-bold text-sm truncate">{channel.name}</span>
        </div>
      </div>

      {/* Program Grid */}
      <div className="flex relative h-full">
        {epgData
          .filter(p => p.channelId === channel.id)
          .map((program) => {
            const start = startOfHour(selectedDate);
            const offset = differenceInMinutes(program.startTime, start) * MINUTE_WIDTH;
            const width = differenceInMinutes(program.endTime, program.startTime) * MINUTE_WIDTH;
            const isActive = isWithinInterval(currentTime, { start: program.startTime, end: program.endTime });

            return (
              <button
                key={program.id}
                onClick={() => setSelectedProgram(program)}
                className={cn(
                  "absolute top-1 bottom-1 flex flex-col justify-center px-3 py-1.5 rounded-lg border text-left transition-all overflow-hidden group/item",
                  isActive 
                    ? "bg-rose-600/20 border-rose-500/50 ring-1 ring-rose-500/30" 
                    : (prefs.theme === 'light' ? "bg-white border-slate-200 shadow-sm hover:border-slate-300" : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600")
                )}
                style={{ left: offset, width: width - 4 }}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5 w-full">
                  
                  <span className={cn(
                    "text-[10px] md:text-xs font-semibold whitespace-nowrap tabular-nums",
                    isActive ? (prefs.theme === 'light' ? "text-rose-600" : "text-rose-400") : "text-slate-500"
                  )}>
                    {format(program.startTime, 'HH:mm')} - {format(program.endTime, 'HH:mm')}
                    {program.isLive && <span className="ml-2 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider animate-pulse">Directo</span>}
                  </span>

                  {prefs.alerts.includes(program.id) && (
                    <Bell className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
                  )}
                </div>
                <h3 className="font-bold text-sm truncate w-full group-hover/item:text-rose-500 transition-colors flex-shrink-0">
                  {program.title}
                </h3>
                {width > 150 && (
                  <p className="text-[10px] text-slate-500 truncate w-full mt-0.5 flex-shrink-0">
                    {program.description}
                  </p>
                )}

                {isActive && (
                  <div className="absolute bottom-0 left-0 h-1 bg-rose-600" style={{ width: `${Math.max(0, Math.min(100, (currentTime.getTime() - program.startTime.getTime()) / (program.endTime.getTime() - program.startTime.getTime()) * 100))}%` }} />
                )}

              </button>
            );
          })}
      </div>
    </div>
  );
}

export default function EPGGuide() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<'Ayer'|'Hoy'|'Mañana'>('Hoy');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [epgData, setEpgData] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { prefs, toggleFavorite, toggleAlert, toggleTheme, setFavoriteTeam } = useUserPreferences();

  const handleToggleAlert = async (program: Program) => {
    if (!prefs.alerts.includes(program.id)) {
      if ('Notification' in window && Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Alerta programada', {
          body: `Te avisaremos cuando empiece: ${program.title}`,
          icon: '/favicon.ico'
        });
      }
    }
    toggleAlert(program.id);
  };


  // Parse URL hash for deep linking
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#program-')) {
      const progId = hash.replace('#program-', '');
      const found = epgData.find(p => p.id === progId);
      if (found) setSelectedProgram(found);
    }
  }, [epgData]);


  // Auto-alert for favorite team
  useEffect(() => {
    if (prefs.favoriteTeam && epgData.length > 0) {
      const teamMatches = epgData.filter(p => 
        p.category === 'Deportes' && 
        (p.title.includes(prefs.favoriteTeam!) || p.description.includes(prefs.favoriteTeam!))
      );
      
      teamMatches.forEach(match => {
        if (!prefs.alerts.includes(match.id)) {
          // Add to alerts silently to avoid spamming notification permission on load
          toggleAlert(match.id);
        }
      });
    }
  }, [epgData, prefs.favoriteTeam]);

  
  useEffect(() => {
    async function fetchEPG() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/epg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            date: format(selectedDate, 'yyyy-MM-dd'),
            channels: CHANNELS
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const processedData = data.map((p: any) => ({
            ...p,
            startTime: parseISO(p.startTime),
            endTime: parseISO(p.endTime)
          }));
          setEpgData(processedData);
        } else {
          // Fallback to local generator
          setEpgData(generateEPG(CHANNELS, selectedDate));
        }
      } catch (error) {
        console.error("Fetch EPG error:", error);
        setEpgData(generateEPG(CHANNELS, selectedDate));
      } finally {
        setIsLoading(false);
      }
    }

    fetchEPG();
  }, [selectedDate]);
  
  const categories = ['Todos', 'TDT', 'Movistar+', 'Deportes', 'Cine'];
  
  const { favoriteChannels, regularChannels } = useMemo(() => {
    let filtered = CHANNELS.filter(c => 
      (activeCategory === 'Todos' || c.category === activeCategory) &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    ).sort((a, b) => (a.number || 999) - (b.number || 999));
    
    return {
      favoriteChannels: filtered.filter(c => prefs.favorites.includes(c.id)),
      regularChannels: filtered.filter(c => !prefs.favorites.includes(c.id))
    };
  }, [activeCategory, searchQuery, prefs.favorites]);

  const timelineHours = useMemo(() => {
    const hours = [];
    const start = startOfHour(selectedDate);
    for (let i = 0; i < 24; i++) {
      hours.push(addHours(start, i));
    }
    return hours;
  }, [selectedDate]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentIndicatorPos = useMemo(() => {
    const start = startOfHour(selectedDate);
    const diff = differenceInMinutes(currentTime, start);
    return diff * MINUTE_WIDTH;
  }, [currentTime, selectedDate]);

  const scrollToNow = () => {
    if (containerRef.current) {
      const stickyWidth = containerRef.current.querySelector('.sticky')?.clientWidth || 0;
      containerRef.current.scrollTo({
        left: currentIndicatorPos - 100 + stickyWidth,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Initial scroll to now
    setTimeout(scrollToNow, 500);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
          >
            <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
            <p className="text-sm font-medium text-slate-400 animate-pulse">Obteniendo programación real...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={cn("flex flex-col gap-4 p-4 md:px-8 border-b backdrop-blur-md sticky top-0 z-50", prefs.theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-slate-900/50 border-slate-800')}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-700 rounded-xl flex items-center justify-center shadow-lg shadow-rose-900/20">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">TV Ronda EPG</h1>
              <p className="text-xs text-rose-400 font-medium uppercase tracking-wider">Guía Oficial</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-full border border-slate-700/50">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                  activeCategory === cat 
                    ? "bg-rose-600 text-white shadow-md" 
                    : (prefs.theme === 'light' ? "text-slate-600 hover:text-slate-900 bg-slate-100" : "text-slate-400 hover:text-slate-200 bg-slate-800/50")
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar canal o programa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">

          
          <select
            value={prefs.favoriteTeam || ''}
            onChange={(e) => setFavoriteTeam(e.target.value)}
            className={cn("text-xs md:text-sm rounded-xl px-2 md:px-3 py-1.5 focus:outline-none transition-colors border font-bold cursor-pointer", prefs.theme === 'light' ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50")}
          >
            <option value="">Tu equipo</option>
            <option value="Real Madrid">Real Madrid</option>
            <option value="Barcelona">FC Barcelona</option>
            <option value="Atlético de Madrid">Atlético de Madrid</option>
            <option value="Girona">Girona FC</option>
            <option value="Athletic">Athletic Club</option>
            <option value="Real Sociedad">Real Sociedad</option>
            <option value="Real Betis">Real Betis</option>
            <option value="Villarreal">Villarreal CF</option>
            <option value="Valencia">Valencia CF</option>
            <option value="Alavés">Deportivo Alavés</option>
            <option value="Osasuna">CA Osasuna</option>
            <option value="Getafe">Getafe CF</option>
            <option value="Celta">Celta de Vigo</option>
            <option value="Sevilla">Sevilla FC</option>
            <option value="Mallorca">RCD Mallorca</option>
            <option value="Las Palmas">UD Las Palmas</option>
            <option value="Rayo Vallecano">Rayo Vallecano</option>
            <option value="Valladolid">Real Valladolid</option>
            <option value="Leganés">CD Leganés</option>
            <option value="Espanyol">RCD Espanyol</option>
          </select>

          <button onClick={toggleTheme} className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-rose-400 transition-colors">
            {prefs.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>


          <div className={cn("flex p-1 rounded-xl", prefs.theme === 'light' ? "bg-slate-200" : "bg-slate-800/50")}>
            {['Ayer', 'Hoy', 'Mañana'].map(day => (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day as any);
                  const newDate = new Date();
                  if (day === 'Ayer') newDate.setDate(newDate.getDate() - 1);
                  if (day === 'Mañana') newDate.setDate(newDate.getDate() + 1);
                  setSelectedDate(newDate);
                }}
                className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all", selectedDay === day ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200")}
              >
                {day}
              </button>
            ))}
          </div>

            <button
              onClick={scrollToNow}
              className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-900/20 transition-all active:scale-95"
            >
              AHORA
            </button>
            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2">
               <button 
                onClick={() => setSelectedDate(prev => addDays(prev, -1))}
                className="p-1 hover:bg-slate-700 rounded-md transition-colors"
               >
                 <ChevronLeft className="w-4 h-4" />
               </button>
               <span className="text-sm font-bold min-w-[120px] text-center">
                 {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
               </span>
               <button 
                onClick={() => setSelectedDate(prev => addDays(prev, 1))}
                className="p-1 hover:bg-slate-700 rounded-md transition-colors"
               >
                 <ChevronRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main EPG Container */}
      <div className="relative flex-1 overflow-auto scrollbar-hide select-none" ref={containerRef}>
        {/* Sticky Header Row (Time) */}
        <div className={cn("sticky top-0 z-40 flex border-b", prefs.theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800')}>
          <div className={cn("sticky left-0 z-50 w-48 md:w-64 flex-shrink-0 border-r flex items-center px-6 font-bold text-xs uppercase tracking-widest text-slate-500", prefs.theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800')}>
            Canal
          </div>
          <div className="flex">
            {timelineHours.map((hour, i) => (
              <div 
                key={i} 
                className={cn("flex-shrink-0 border-r px-4 py-3 text-sm font-semibold text-slate-400", prefs.theme === 'light' ? 'border-slate-200' : 'border-slate-800/50')}
                style={{ width: HOUR_WIDTH }}
              >
                {format(hour, 'HH:00')}
              </div>
            ))}
          </div>
        </div>

        {/* EPG Body */}
        <div className="relative">
          {/* Current Time Indicator */}
          {currentIndicatorPos >= 0 && (
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              style={{ left: currentIndicatorPos + (containerRef.current?.querySelector('.sticky')?.clientWidth || 0) }}
            >
              <div className="absolute -top-1 -left-[3px] w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-500/20" />
            </div>
          )}

          {/* Favorites Section */}
          {favoriteChannels.length > 0 && (
            <>
              <div className={cn("sticky left-0 z-30 backdrop-blur-md px-6 py-2 border-b text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] flex items-center gap-2", prefs.theme === 'light' ? 'bg-white/90 border-slate-200' : 'bg-slate-900/90 border-slate-800')}>
                <Star className="w-3 h-3 fill-current" /> Mis Favoritos
              </div>
              {favoriteChannels.map((channel) => (
                <ChannelRow 
                  key={channel.id} 
                  channel={channel} 
                  epgData={epgData} 
                  selectedDate={selectedDate}
                  currentTime={currentTime}
                  prefs={prefs}
                  toggleFavorite={toggleFavorite}
                  toggleAlert={toggleAlert}
                  setSelectedProgram={setSelectedProgram}
                />
              ))}
            </>
          )}

          {/* Regular Channels Section */}
          {regularChannels.length > 0 && (
            <>
              <div className={cn("sticky left-0 z-30 backdrop-blur-md px-6 py-2 border-b text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]", prefs.theme === 'light' ? 'bg-white/90 border-slate-200' : 'bg-slate-900/90 border-slate-800')}>
                {favoriteChannels.length > 0 ? 'Otros Canales' : 'Canales'}
              </div>
              {regularChannels.map((channel) => (
                <ChannelRow 
                  key={channel.id} 
                  channel={channel} 
                  epgData={epgData} 
                  selectedDate={selectedDate}
                  currentTime={currentTime}
                  prefs={prefs}
                  toggleFavorite={toggleFavorite}
                  toggleAlert={toggleAlert}
                  setSelectedProgram={setSelectedProgram}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Program Details Modal */}
      <AnimatePresence>
        {selectedProgram && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProgram(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn("relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden", prefs.theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800')}
            >
              <div className="h-48 bg-slate-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <button 
                  onClick={() => setSelectedProgram(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-6 left-8 flex items-end gap-4">
                  <div className="w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg">
                    <img 
                      src={CHANNELS.find(c => c.id === selectedProgram.channelId)?.logo} 
                      alt="Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="pb-1">
                    <p className="text-rose-400 font-bold text-sm tracking-wide mb-1">
                      {selectedProgram.category} • {format(selectedProgram.startTime, 'HH:mm')}
                    </p>
                    <h2 className={cn("text-2xl font-bold leading-tight", prefs.theme === 'light' ? 'text-slate-900' : 'text-white')}>{selectedProgram.title}</h2>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className={cn("flex items-center gap-6 mb-8 py-4 border-y", prefs.theme === 'light' ? 'border-slate-200' : 'border-slate-800/50')}>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Inicio</p>
                    <p className="text-lg font-bold">{format(selectedProgram.startTime, 'HH:mm')}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-800" />
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Fin</p>
                    <p className="text-lg font-bold">{format(selectedProgram.endTime, 'HH:mm')}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-800" />
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Duración</p>
                    <p className="text-lg font-bold">{differenceInMinutes(selectedProgram.endTime, selectedProgram.startTime)} min</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="font-bold text-slate-300 flex items-center gap-2">
                    <Info className="w-4 h-4 text-rose-500" /> Sinopsis
                  </h3>
                  <p className={cn("leading-relaxed text-sm", prefs.theme === 'light' ? 'text-slate-600' : 'text-slate-400')}>
                    {selectedProgram.description}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      toggleAlert(selectedProgram.id);
                      setSelectedProgram(null);
                    }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95",
                      prefs.alerts.includes(selectedProgram.id)
                        ? "${prefs.theme === 'light' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' : 'bg-slate-800 text-yellow-400 border border-yellow-400/20'}"
                        : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20"
                    )}
                  >
                    <Bell className={cn("w-5 h-5", prefs.alerts.includes(selectedProgram.id) && "fill-current")} />
                    {prefs.alerts.includes(selectedProgram.id) ? 'Alerta Configurada' : 'Recordarme'}
                  </button>
                  <button 
                    onClick={() => toggleFavorite(selectedProgram.channelId)}
                    className={cn(
                      "w-16 flex items-center justify-center rounded-2xl border transition-all active:scale-95",
                      prefs.favorites.includes(selectedProgram.channelId)
                        ? "bg-yellow-400/10 border-yellow-400/50 text-yellow-400"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <Star className={cn("w-6 h-6", prefs.favorites.includes(selectedProgram.channelId) && "fill-current")} />
                  </button>
                
                    <button
                      onClick={() => {
                        window.location.hash = `program-${selectedProgram.id}`;
                        navigator.clipboard.writeText(window.location.href);
                        alert('Enlace copiado al portapapeles');
                      }}
                      className={cn("flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all", prefs.theme === 'light' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')}
                    >
                      <Share2 className="w-5 h-5" /> Compartir
                    </button>

                  </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
