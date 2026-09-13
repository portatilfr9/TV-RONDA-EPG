import re

with open('src/components/EPGGuide.tsx', 'r') as f:
    content = f.read()

# Modal title
content = content.replace(
    '<h2 className="text-2xl font-bold leading-tight">{selectedProgram.title}</h2>',
    '<h2 className={cn("text-2xl font-bold leading-tight", prefs.theme === \'light\' ? \'text-slate-900\' : \'text-white\')}>{selectedProgram.title}</h2>'
)

# Modal description
content = content.replace(
    '<p className="text-slate-400 leading-relaxed text-sm">',
    '<p className={cn("leading-relaxed text-sm", prefs.theme === \'light\' ? \'text-slate-600\' : \'text-slate-400\')}>'
)

# Similar programs background
content = content.replace(
    'className="mb-6 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50"',
    'className={cn("mb-6 p-4 rounded-xl border", prefs.theme === \'light\' ? \'bg-slate-50 border-slate-200\' : \'bg-slate-800/40 border-slate-700/50\')}'
)

content = content.replace(
    'text-slate-300 mb-1',
    'mb-1 ${prefs.theme === \'light\' ? \'text-slate-700\' : \'text-slate-300\'}'
)

content = content.replace(
    'text-slate-400">Director',
    '${prefs.theme === \'light\' ? \'text-slate-900\' : \'text-slate-400\'}">Director'
)
content = content.replace(
    'text-slate-400">Reparto',
    '${prefs.theme === \'light\' ? \'text-slate-900\' : \'text-slate-400\'}">Reparto'
)
content = content.replace(
    'text-slate-400">Año',
    '${prefs.theme === \'light\' ? \'text-slate-900\' : \'text-slate-400\'}">Año'
)

# Modal buttons
content = content.replace(
    'bg-slate-800 text-yellow-400 border border-yellow-400/20',
    '${prefs.theme === \'light\' ? \'bg-yellow-50 text-yellow-600 border border-yellow-200\' : \'bg-slate-800 text-yellow-400 border border-yellow-400/20\'}'
)

content = content.replace(
    'bg-slate-800 text-slate-300 hover:bg-slate-700',
    '${prefs.theme === \'light\' ? \'bg-slate-100 text-slate-700 hover:bg-slate-200\' : \'bg-slate-800 text-slate-300 hover:bg-slate-700\'}'
)


with open('src/components/EPGGuide.tsx', 'w') as f:
    f.write(content)

