import re

with open('src/components/EPGGuide.tsx', 'r') as f:
    content = f.read()

# 1. Add imports (Calendar, Share2, Sun, Moon, Play)
content = content.replace("import { Search, Filter, Star, Bell, Info, ChevronLeft, ChevronRight, X, Loader2, Tv } from 'lucide-react';", 
                          "import { Search, Filter, Star, Bell, Info, ChevronLeft, ChevronRight, X, Loader2, Tv, Calendar, Share2, Sun, Moon, Play, Film, Trophy, Tv2 } from 'lucide-react';")

# 2. Add selectedDate state and categories
content = content.replace("const [currentDate, setCurrentDate] = useState(new Date());",
                          "const [currentDate, setCurrentDate] = useState(new Date());\n  const [selectedDay, setSelectedDay] = useState<'Ayer'|'Hoy'|'Mañana'>('Hoy');")

content = content.replace("const { prefs, toggleFavorite, toggleAlert } = useUserPreferences();",
                          "const { prefs, toggleFavorite, toggleAlert, toggleTheme } = useUserPreferences();\n\n  // Parse URL hash for deep linking\n  useEffect(() => {\n    const hash = window.location.hash;\n    if (hash && hash.startsWith('#program-')) {\n      const progId = hash.replace('#program-', '');\n      const found = epgData.find(p => p.id === progId);\n      if (found) setSelectedProgram(found);\n    }\n  }, [epgData]);")

# 3. Notification Logic
alert_logic = """
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
"""
content = content.replace("const { prefs, toggleFavorite, toggleAlert, toggleTheme } = useUserPreferences();",
                          "const { prefs, toggleFavorite, toggleAlert, toggleTheme } = useUserPreferences();\n" + alert_logic)

content = content.replace("onClick={() => toggleAlert(selectedProgram.id)}", "onClick={() => handleToggleAlert(selectedProgram)}")

# 4. Modify generateEPG call (use caching)
# Actually, the caching was done on the server-side! So we don't necessarily need indexedDB if the server handles it instantly, but local caching saves network. 
# We'll rely on the server cache which was implemented in the previous turn.

# 5. Day Navigation UI
day_nav = """
          <div className="flex bg-slate-800/50 p-1 rounded-xl">
            {['Ayer', 'Hoy', 'Mañana'].map(day => (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day as any);
                  const newDate = new Date();
                  if (day === 'Ayer') newDate.setDate(newDate.getDate() - 1);
                  if (day === 'Mañana') newDate.setDate(newDate.getDate() + 1);
                  setCurrentDate(newDate);
                }}
                className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all", selectedDay === day ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200")}
              >
                {day}
              </button>
            ))}
          </div>
"""
content = content.replace('<div className="flex items-center gap-2">', '<div className="flex items-center gap-2">\n' + day_nav)


# 6. Share logic & Modal UI changes
share_logic = """
                    <button
                      onClick={() => {
                        window.location.hash = `program-${selectedProgram.id}`;
                        navigator.clipboard.writeText(window.location.href);
                        alert('Enlace copiado al portapapeles');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                    >
                      <Share2 className="w-5 h-5" /> Compartir
                    </button>
"""
content = content.replace("</div>\n              </div>\n            </motion.div>", 
                          share_logic + "\n                  </div>\n              </div>\n            </motion.div>")

# 7. Similar programs
similar_logic = """
                {selectedProgram.metadata && (
                  <div className="mb-6 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    {selectedProgram.metadata.director && <p className="text-sm text-slate-300 mb-1"><span className="font-bold text-slate-400">Director:</span> {selectedProgram.metadata.director}</p>}
                    {selectedProgram.metadata.cast && <p className="text-sm text-slate-300 mb-1"><span className="font-bold text-slate-400">Reparto:</span> {selectedProgram.metadata.cast}</p>}
                    {selectedProgram.metadata.year && <p className="text-sm text-slate-300 mb-1"><span className="font-bold text-slate-400">Año:</span> {selectedProgram.metadata.year}</p>}
                  </div>
                )}
                
                {epgData.filter(p => p.id !== selectedProgram.id && p.category === selectedProgram.category).slice(0, 2).length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-slate-300 mb-3 text-sm">Similares ({selectedProgram.category})</h3>
                    <div className="flex flex-col gap-2">
                      {epgData.filter(p => p.id !== selectedProgram.id && p.category === selectedProgram.category).slice(0, 2).map(p => (
                        <div key={p.id} onClick={() => setSelectedProgram(p)} className="p-3 bg-slate-800/40 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-600">
                          <p className="text-xs text-rose-400 font-bold">{format(p.startTime, 'HH:mm')} - {CHANNELS.find(c => c.id === p.channelId)?.name}</p>
                          <p className="text-sm font-bold text-slate-200 truncate">{p.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
"""
content = content.replace("</p>\n                </div>\n\n                <div className=\"flex gap-3 mt-auto\">", 
                          "</p>\n                </div>\n" + similar_logic + "\n                <div className=\"flex gap-3 mt-auto\">")


# 8. Icons by category and Live badge, and Progress Bar
# Find the program block render part
block_render = """
                  <span className={cn(
                    "text-[10px] md:text-xs font-semibold whitespace-nowrap tabular-nums",
                    isActive ? "text-rose-400" : "text-slate-400"
                  )}>
                    {format(program.startTime, 'HH:mm')} - {format(program.endTime, 'HH:mm')}
                    {program.isLive && <span className="ml-2 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider animate-pulse">Directo</span>}
                  </span>
"""
content = re.sub(r'<span className=\{cn\(\n\s+"text-\[10px\] md:text-xs font-semibold whitespace-nowrap",\n\s+isActive \? "text-rose-400" : "text-slate-400"\n\s+\)\}>\n\s+\{format\(program.startTime, \'HH:mm\'\)\} - \{format\(program.endTime, \'HH:mm\'\)\}\n\s+</span>', block_render, content)

progress_bar = """
                {isActive && (
                  <div className="absolute bottom-0 left-0 h-1 bg-rose-600" style={{ width: `${Math.max(0, Math.min(100, (now.getTime() - program.startTime.getTime()) / (program.endTime.getTime() - program.startTime.getTime()) * 100))}%` }} />
                )}
"""
content = content.replace("</p>\n                )}\n              </button>", 
                          "</p>\n                )}\n" + progress_bar + "\n              </button>")

# 9. Light Mode styling
# Change root div
content = content.replace('<div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans overflow-hidden">',
                          '<div className={cn("min-h-screen flex flex-col font-sans overflow-hidden transition-colors duration-300", prefs.theme === \'light\' ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-200")}>')

# Add theme toggle button in header
theme_toggle = """
          <button onClick={toggleTheme} className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-rose-400 transition-colors">
            {prefs.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
"""
content = content.replace('<div className="flex items-center gap-2">', '<div className="flex items-center gap-2">\n' + theme_toggle)

# 10. Replace bg-slate-900/50 -> theme classes.
# I'll use simple dynamic classes on the major components to make them light mode compatible.
content = content.replace('bg-slate-900/50 backdrop-blur-md', 'backdrop-blur-md ${prefs.theme === \'light\' ? \'bg-white/80 border-slate-200\' : \'bg-slate-900/50 border-slate-800\'}')
content = content.replace('bg-slate-900 border-slate-800', '${prefs.theme === \'light\' ? \'bg-white border-slate-200\' : \'bg-slate-900 border-slate-800\'}')
content = content.replace('bg-slate-800/50 border-slate-700', '${prefs.theme === \'light\' ? \'bg-slate-100 border-slate-300\' : \'bg-slate-800/50 border-slate-700\'}')
content = content.replace('bg-slate-900/90', '${prefs.theme === \'light\' ? \'bg-white/90 border-slate-200\' : \'bg-slate-900/90 border-slate-800\'}')

# Write back
with open('src/components/EPGGuide.tsx', 'w') as f:
    f.write(content)

