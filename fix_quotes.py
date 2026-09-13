import re

with open('src/components/EPGGuide.tsx', 'r') as f:
    content = f.read()

# Fix className="... ${...} ..." to className={cn("...", ...)}

content = content.replace(
    'className="flex flex-col gap-4 p-4 md:px-8 border-b border-slate-800 backdrop-blur-md ${prefs.theme === \'light\' ? \'bg-white/80 border-slate-200\' : \'bg-slate-900/50 border-slate-800\'} sticky top-0 z-50"',
    'className={cn("flex flex-col gap-4 p-4 md:px-8 border-b backdrop-blur-md sticky top-0 z-50", prefs.theme === \'light\' ? \'bg-white/80 border-slate-200\' : \'bg-slate-900/50 border-slate-800\')}'
)

content = content.replace(
    'className="sticky left-0 z-30 ${prefs.theme === \'light\' ? \'bg-white/90 border-slate-200\' : \'bg-slate-900/90 border-slate-800\'} backdrop-blur-md px-6 py-2 border-b border-slate-800 text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] flex items-center gap-2"',
    'className={cn("sticky left-0 z-30 backdrop-blur-md px-6 py-2 border-b text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] flex items-center gap-2", prefs.theme === \'light\' ? \'bg-white/90 border-slate-200\' : \'bg-slate-900/90 border-slate-800\')}'
)

content = content.replace(
    'className="sticky left-0 z-30 ${prefs.theme === \'light\' ? \'bg-white/90 border-slate-200\' : \'bg-slate-900/90 border-slate-800\'} backdrop-blur-md px-6 py-2 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"',
    'className={cn("sticky left-0 z-30 backdrop-blur-md px-6 py-2 border-b text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]", prefs.theme === \'light\' ? \'bg-white/90 border-slate-200\' : \'bg-slate-900/90 border-slate-800\')}'
)

content = content.replace(
    'className="w-full ${prefs.theme === \'light\' ? \'bg-slate-100 border-slate-300\' : \'bg-slate-800/50 border-slate-700\'} rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"',
    'className={cn("w-full rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all", prefs.theme === \'light\' ? \'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-500\' : \'bg-slate-800/50 border-slate-700 text-slate-200\')}'
)

content = content.replace(
    'className="flex bg-slate-800/50 p-1 rounded-xl"',
    'className={cn("flex p-1 rounded-xl", prefs.theme === \'light\' ? "bg-slate-200" : "bg-slate-800/50")}'
)

with open('src/components/EPGGuide.tsx', 'w') as f:
    f.write(content)

