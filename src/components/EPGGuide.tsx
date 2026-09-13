import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format, addHours, startOfHour, differenceInMinutes, isWithinInterval, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Filter, Star, Bell, Info, ChevronLeft, ChevronRight, X, Loader2, Tv } from 'lucide-react';
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
    <div key={channel.id} className="flex border-b border-slate-800/50 group h-20">
      {/* Channel Sticky Cell */}
      <div className="sticky left-0 z-20 w-48 md:w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 flex items-center px-4 gap-4 transition-colors group-hover:bg-slate-800">
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
                  "absolute top-1 bottom-1 flex flex-col justify-center p-3 rounded-lg border text-left transition-all overflow-hidden group/item",
                  isActive 
                    ? "bg-rose-600/20 border-rose-500/50 ring-1 ring-rose-500/30" 
                    : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                )}
                style={{ left: offset, width: width - 4 }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={cn(
                    "text-xs font-bold whitespace-nowrap",
                    isActive ? "text-rose-400" : "text-slate-400"
                  )}>
                    {format(program.startTime, 'HH:mm')} - {format(program.endTime, 'HH:mm')}
                  </span>
                  {prefs.alerts.includes(program.id) && (
                    <Bell className="w-3 h-3 text-yellow-400 fill-current" />
                  )}
                </div>
                <h3 className="font-bold text-sm leading-tight line-clamp-1 group-hover/item:text-rose-400 transition-colors">
                  {program.title}
                </h3>
                {width > 150 && (
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                    {program.description}
                  </p>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [epgData, setEpgData] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { prefs, toggleFavorite, toggleAlert } = useUserPreferences();
  
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
      <header className="flex flex-col gap-4 p-4 md:px-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
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
                    : "text-slate-400 hover:text-slate-200"
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
        <div className="sticky top-0 z-40 flex bg-slate-900 border-b border-slate-800">
          <div className="sticky left-0 z-50 w-48 md:w-64 bg-slate-900 flex-shrink-0 border-r border-slate-800 flex items-center px-6 font-bold text-xs uppercase tracking-widest text-slate-500">
            Canal
          </div>
          <div className="flex">
            {timelineHours.map((hour, i) => (
              <div 
                key={i} 
                className="flex-shrink-0 border-r border-slate-800/50 px-4 py-3 text-sm font-semibold text-slate-400"
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
              <div className="sticky left-0 z-30 bg-slate-900/90 backdrop-blur-md px-6 py-2 border-b border-slate-800 text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] flex items-center gap-2">
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
              <div className="sticky left-0 z-30 bg-slate-900/90 backdrop-blur-md px-6 py-2 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
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
              className="relative w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"
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
                    <h2 className="text-2xl font-bold leading-tight">{selectedProgram.title}</h2>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-6 mb-8 py-4 border-y border-slate-800/50">
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
                  <p className="text-slate-400 leading-relaxed text-sm">
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
                        ? "bg-slate-800 text-yellow-400 border border-yellow-400/20"
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
