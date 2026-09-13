import re

with open('src/components/EPGGuide.tsx', 'r') as f:
    content = f.read()

# Row wrapper
content = content.replace(
    'className="flex border-b border-slate-800/50 group h-20"',
    'className={cn("flex border-b group h-20", prefs.theme === \'light\' ? \'border-slate-200\' : \'border-slate-800/50\')}'
)

# Left sticky channel header
content = content.replace(
    'className="sticky left-0 z-20 w-48 md:w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 flex items-center px-4 gap-4 transition-colors group-hover:bg-slate-800"',
    'className={cn("sticky left-0 z-20 w-48 md:w-64 backdrop-blur-sm border-r flex items-center px-4 gap-4 transition-colors", prefs.theme === \'light\' ? \'bg-white/95 border-slate-200 group-hover:bg-slate-50\' : \'bg-slate-900/95 border-slate-800 group-hover:bg-slate-800\')}'
)

# Time header container
content = content.replace(
    'className="sticky top-0 z-40 flex bg-slate-900 border-b border-slate-800"',
    'className={cn("sticky top-0 z-40 flex border-b", prefs.theme === \'light\' ? \'bg-white border-slate-200\' : \'bg-slate-900 border-slate-800\')}'
)

content = content.replace(
    'className="sticky left-0 z-50 w-48 md:w-64 bg-slate-900 flex-shrink-0 border-r border-slate-800 flex items-center px-6 font-bold text-xs uppercase tracking-widest text-slate-500"',
    'className={cn("sticky left-0 z-50 w-48 md:w-64 flex-shrink-0 border-r flex items-center px-6 font-bold text-xs uppercase tracking-widest text-slate-500", prefs.theme === \'light\' ? \'bg-white border-slate-200\' : \'bg-slate-900 border-slate-800\')}'
)

# Time slots in header
content = content.replace(
    'className="flex-shrink-0 border-r border-slate-800/50 px-4 py-3 text-sm font-semibold text-slate-400"',
    'className={cn("flex-shrink-0 border-r px-4 py-3 text-sm font-semibold text-slate-400", prefs.theme === \'light\' ? \'border-slate-200\' : \'border-slate-800/50\')}'
)

# Modal wrapper
content = content.replace(
    'className="relative w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"',
    'className={cn("relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden", prefs.theme === \'light\' ? \'bg-white border-slate-200\' : \'bg-slate-900 border-slate-800\')}'
)

# Modal bottom border
content = content.replace(
    'className="flex items-center gap-6 mb-8 py-4 border-y border-slate-800/50"',
    'className={cn("flex items-center gap-6 mb-8 py-4 border-y", prefs.theme === \'light\' ? \'border-slate-200\' : \'border-slate-800/50\')}'
)

# Program blocks (inside grid)
content = content.replace(
    'className={cn(\n                  "absolute top-1 bottom-1 flex flex-col justify-center px-3 py-1.5 rounded-lg border text-left transition-all overflow-hidden group/item",\n                  isActive \n                    ? "bg-rose-600/20 border-rose-500/50 ring-1 ring-rose-500/30" \n                    : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"\n                )}',
    'className={cn(\n                  "absolute top-1 bottom-1 flex flex-col justify-center px-3 py-1.5 rounded-lg border text-left transition-all overflow-hidden group/item",\n                  isActive \n                    ? "bg-rose-600/20 border-rose-500/50 ring-1 ring-rose-500/30" \n                    : (prefs.theme === \'light\' ? "bg-white border-slate-200 shadow-sm hover:border-slate-300" : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600")\n                )}'
)

# Active program text color
content = content.replace(
    'isActive ? "text-rose-400" : "text-slate-400"',
    'isActive ? (prefs.theme === \'light\' ? "text-rose-600" : "text-rose-400") : "text-slate-500"'
)
content = content.replace(
    'group-hover/item:text-rose-400',
    'group-hover/item:text-rose-500'
)

# Abstract image on top of modal based on category
abstract_header = """
              <div className={cn("w-full h-32 relative overflow-hidden", prefs.theme === 'light' ? 'bg-slate-100' : 'bg-slate-800')}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center opacity-20 transform scale-150 blur-sm">
                  {selectedProgram.category === 'Deportes' ? <Trophy className="w-48 h-48" /> : 
                   selectedProgram.category === 'Cine' ? <Film className="w-48 h-48" /> :
                   <Tv2 className="w-48 h-48" />}
                </div>
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors z-20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 pt-6">
"""
content = content.replace(
    '            <motion.div\n              initial={{ opacity: 0, y: 50, scale: 0.95 }}\n              animate={{ opacity: 1, y: 0, scale: 1 }}\n              exit={{ opacity: 0, y: 20, scale: 0.95 }}\n              className={cn("relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden", prefs.theme === \'light\' ? \'bg-white border-slate-200\' : \'bg-slate-900 border-slate-800\')}\n            >\n              <button\n                onClick={() => setSelectedProgram(null)}\n                className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-full text-slate-400 hover:text-slate-200 transition-colors z-10"\n              >\n                <X className="w-5 h-5" />\n              </button>\n\n              <div className="p-8">',
    '            <motion.div\n              initial={{ opacity: 0, y: 50, scale: 0.95 }}\n              animate={{ opacity: 1, y: 0, scale: 1 }}\n              exit={{ opacity: 0, y: 20, scale: 0.95 }}\n              className={cn("relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col", prefs.theme === \'light\' ? \'bg-white border-slate-200\' : \'bg-slate-900 border-slate-800\')}\n            >\n' + abstract_header
)

with open('src/components/EPGGuide.tsx', 'w') as f:
    f.write(content)

