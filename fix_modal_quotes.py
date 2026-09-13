import re

with open('src/components/EPGGuide.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'className="text-sm mb-1 ${prefs.theme === \'light\' ? \'text-slate-700\' : \'text-slate-300\'}"',
    'className={cn("text-sm mb-1", prefs.theme === \'light\' ? \'text-slate-700\' : \'text-slate-300\')}'
)
content = content.replace(
    'className="font-bold ${prefs.theme === \'light\' ? \'text-slate-900\' : \'text-slate-400\'}">Director',
    'className={cn("font-bold", prefs.theme === \'light\' ? \'text-slate-900\' : \'text-slate-400\')}>Director'
)
content = content.replace(
    'className="font-bold ${prefs.theme === \'light\' ? \'text-slate-900\' : \'text-slate-400\'}">Reparto',
    'className={cn("font-bold", prefs.theme === \'light\' ? \'text-slate-900\' : \'text-slate-400\')}>Reparto'
)
content = content.replace(
    'className="font-bold ${prefs.theme === \'light\' ? \'text-slate-900\' : \'text-slate-400\'}">Año',
    'className={cn("font-bold", prefs.theme === \'light\' ? \'text-slate-900\' : \'text-slate-400\')}>Año'
)

content = content.replace(
    'className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"',
    'className={cn("flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all", prefs.theme === \'light\' ? \'bg-slate-100 text-slate-700 hover:bg-slate-200\' : \'bg-slate-800 text-slate-300 hover:bg-slate-700\')}'
)

content = content.replace(
    ' ? "bg-slate-800 text-yellow-400 border border-yellow-400/20"\n                        : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20"',
    ' ? (prefs.theme === \'light\' ? \'bg-yellow-50 text-yellow-600 border border-yellow-300\' : \'bg-slate-800 text-yellow-400 border border-yellow-400/20\')\n                        : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20"'
)

with open('src/components/EPGGuide.tsx', 'w') as f:
    f.write(content)

