# ml/seed_data.py
from pymongo import MongoClient
from dotenv import dotenv_values
from datetime import datetime, timedelta
import random

config = dotenv_values('../backend/.env')
client = MongoClient(config['MONGO_URI'])
db     = client['nazarvyapar']
col    = db['footfallentries']

days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

hourly_pattern = {
    0:2,  1:1,  2:0,  3:0,  4:0,  5:2,
    6:8,  7:18, 8:30, 9:50, 10:65, 11:75,
    12:90, 13:80, 14:70, 15:60, 16:55,
    17:65, 18:80, 19:70, 20:50, 21:30,
    22:15, 23:6
}

light_pattern = {
    0:3900, 1:3950, 2:4000, 3:4050, 4:4050, 5:3600,
    6:2800, 7:2000, 8:1400, 9:800,  10:500, 11:300,
    12:250, 13:280, 14:450, 15:700, 16:1000,
    17:1500, 18:2100, 19:2900, 20:3300, 21:3600,
    22:3800, 23:3900
}

col.delete_many({})
print('Cleared existing data.')

entries = []
base_date = datetime.now() - timedelta(days=180)

for d in range(180):
    current   = base_date + timedelta(days=d)
    day_name  = days[current.weekday()]
    is_weekend = day_name in ['Sat','Sun']
    is_monday  = day_name == 'Mon'
    is_friday  = day_name == 'Fri'

    for hour in range(24):
        base = hourly_pattern[hour]

        if is_weekend:  base = int(base * 1.5)
        if is_monday:   base = int(base * 0.8)
        if is_friday:   base = int(base * 1.2)

        # seasonal variation — more footfall in evening on cold months
        month = current.month
        if month in [11, 12, 1, 2] and hour in range(17, 21):
            base = int(base * 1.3)

        # random daily noise
        noise = random.randint(-8, 8)
        count = max(0, base + noise)

        for _ in range(count):
            entries.append({
                'count':     1,
                'light':     max(0, min(4095, light_pattern[hour] + random.randint(-150, 150))),
                'hour':      hour,
                'day':       day_name,
                'timestamp': current.replace(hour=hour, minute=random.randint(0,59), second=random.randint(0,59))
            })

    if len(entries) >= 5000:
        col.insert_many(entries)
        print('Inserted batch... total so far: ' + str(col.count_documents({})))
        entries = []

if entries:
    col.insert_many(entries)

total = col.count_documents({})
print('Done. Total entries: ' + str(total))
client.close()