import re

with open('src/components/EPGGuide.tsx', 'r') as f:
    content = f.read()

# Replace selectedDate to selectedDate and selectedDay
content = content.replace(
    'const [selectedDate, setSelectedDate] = useState(new Date());',
    'const [selectedDate, setSelectedDate] = useState(new Date());\n  const [selectedDay, setSelectedDay] = useState<\'Ayer\'|\'Hoy\'|\'Mañana\'>(\'Hoy\');'
)

# In the header, setCurrentDate is used, it should be setSelectedDate
content = content.replace('setCurrentDate(newDate)', 'setSelectedDate(newDate)')

# Fix `now` issue
content = content.replace('now.getTime()', 'currentTime.getTime()')


with open('src/components/EPGGuide.tsx', 'w') as f:
    f.write(content)

