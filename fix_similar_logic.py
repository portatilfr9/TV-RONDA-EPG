import re

with open('src/components/EPGGuide.tsx', 'r') as f:
    content = f.read()

similar_logic = """
                {selectedProgram.metadata && Object.keys(selectedProgram.metadata).length > 0 && (
                  <div className={cn("mb-6 p-4 rounded-xl border", prefs.theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/50')}>
                    {selectedProgram.metadata.director && <p className={cn("text-sm mb-1", prefs.theme === 'light' ? 'text-slate-700' : 'text-slate-300')}><span className={cn("font-bold", prefs.theme === 'light' ? 'text-slate-900' : 'text-slate-400')}>Director:</span> {selectedProgram.metadata.director}</p>}
                    {selectedProgram.metadata.cast && <p className={cn("text-sm mb-1", prefs.theme === 'light' ? 'text-slate-700' : 'text-slate-300')}><span className={cn("font-bold", prefs.theme === 'light' ? 'text-slate-900' : 'text-slate-400')}>Reparto:</span> {selectedProgram.metadata.cast}</p>}
                    {selectedProgram.metadata.year && <p className={cn("text-sm mb-1", prefs.theme === 'light' ? 'text-slate-700' : 'text-slate-300')}><span className={cn("font-bold", prefs.theme === 'light' ? 'text-slate-900' : 'text-slate-400')}>Año:</span> {selectedProgram.metadata.year}</p>}
                  </div>
                )}
                
                {epgData.filter(p => p.id !== selectedProgram.id && p.category === selectedProgram.category).slice(0, 2).length > 0 && (
                  <div className="mb-8">
                    <h3 className={cn("font-bold mb-3 text-sm", prefs.theme === 'light' ? 'text-slate-800' : 'text-slate-300')}>Similares ({selectedProgram.category})</h3>
                    <div className="flex flex-col gap-2">
                      {epgData.filter(p => p.id !== selectedProgram.id && p.category === selectedProgram.category).slice(0, 2).map(p => (
                        <div key={p.id} onClick={() => setSelectedProgram(p)} className={cn("p-3 rounded-xl cursor-pointer transition-colors border", prefs.theme === 'light' ? 'bg-slate-50 border-transparent hover:border-slate-300 hover:bg-slate-100' : 'bg-slate-800/40 border-transparent hover:border-slate-600 hover:bg-slate-700/50')}>
                          <p className={cn("text-xs font-bold", prefs.theme === 'light' ? 'text-rose-600' : 'text-rose-400')}>{format(p.startTime, 'HH:mm')} - {CHANNELS.find(c => c.id === p.channelId)?.name}</p>
                          <p className={cn("text-sm font-bold truncate", prefs.theme === 'light' ? 'text-slate-800' : 'text-slate-200')}>{p.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
"""

content = content.replace(
    '</p>\n                </div>\n                <div className="flex gap-4">',
    '</p>\n                </div>\n' + similar_logic + '\n                <div className="flex gap-4">'
)

with open('src/components/EPGGuide.tsx', 'w') as f:
    f.write(content)

