import os
import pandas as pd
from pymongo import MongoClient
from dotenv import dotenv_values

config = dotenv_values('../backend/.env')
client = MongoClient(config['MONGO_URI'])
db     = client['nazarvyapar']
col    = db['footfallentries']

docs = list(col.find({}, {'_id': 0, 'hour': 1, 'day': 1, 'light': 1}))

if not docs:
    print('No data found in DB.')
    exit()

df = pd.DataFrame(docs)
print('Raw records: ' + str(len(df)))
print('Unique hours: ' + str(sorted(df['hour'].unique())))
print('Unique days:  ' + str(df['day'].unique()))

agg = df.groupby(['hour', 'day']).agg(
    count=('light', 'count'),
    light=('light', 'mean')
).reset_index()

agg['light'] = agg['light'].round(0).astype(int)
agg.to_csv('data.csv', index=False)

print('Aggregated records: ' + str(len(agg)))
print(agg.sort_values('count', ascending=False).head(10))
client.close()