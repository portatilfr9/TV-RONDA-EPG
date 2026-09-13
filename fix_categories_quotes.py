import re

with open('src/components/EPGGuide.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'activeCategory === cat \n                    ? "bg-rose-600 text-white shadow-md" \n                    : "text-slate-400 hover:text-slate-200"',
    'activeCategory === cat \n                    ? "bg-rose-600 text-white shadow-md" \n                    : (prefs.theme === \'light\' ? "text-slate-600 hover:text-slate-900 bg-slate-100" : "text-slate-400 hover:text-slate-200 bg-slate-800/50")'
)

with open('src/components/EPGGuide.tsx', 'w') as f:
    f.write(content)

