import re

with open('src/components/EPGGuide.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold ${prefs.theme === \'light\' ? \'bg-slate-100 text-slate-700 hover:bg-slate-200\' : \'bg-slate-800 text-slate-300 hover:bg-slate-700\'} transition-all"',
    'className={cn("flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all", prefs.theme === \'light\' ? \'bg-slate-100 text-slate-700 hover:bg-slate-200\' : \'bg-slate-800 text-slate-300 hover:bg-slate-700\')}'
)

with open('src/components/EPGGuide.tsx', 'w') as f:
    f.write(content)

