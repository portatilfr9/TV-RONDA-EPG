import re

with open('src/components/EPGGuide.tsx', 'r') as f:
    content = f.read()

# 1. Update hook usage
content = content.replace(
    'const { prefs, toggleFavorite, toggleAlert, toggleTheme } = useUserPreferences();',
    'const { prefs, toggleFavorite, toggleAlert, toggleTheme, setFavoriteTeam } = useUserPreferences();'
)

# 2. Add Ronda TV Web link
content = content.replace(
    '<h1 className="text-xl font-black tracking-tight">TV Ronda EPG</h1>',
    '<h1 className="text-xl font-black tracking-tight">TV Ronda EPG</h1>\n                <a href="http://ronsatvweb.manus.space" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-rose-500 hover:text-rose-400 transition-colors hidden sm:block">\n                  Ronda TV Web\n                </a>'
)

# 3. Add Team Selector in the right controls
team_selector = """
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
"""
content = content.replace(
    '<button onClick={toggleTheme} className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-rose-400 transition-colors">',
    team_selector + '\n          <button onClick={toggleTheme} className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-rose-400 transition-colors">'
)

# 4. Auto Alert Logic
# Insert after deep link useEffect
auto_alert_logic = """
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
"""

content = content.replace(
    'if (found) setSelectedProgram(found);\n    }\n  }, [epgData]);',
    'if (found) setSelectedProgram(found);\n    }\n  }, [epgData]);\n\n' + auto_alert_logic
)

with open('src/components/EPGGuide.tsx', 'w') as f:
    f.write(content)

