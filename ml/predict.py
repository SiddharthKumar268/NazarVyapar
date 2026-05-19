# ml/predict.py
# Called by Node.js via child_process
# Usage: python predict.py <day>
# Example: python predict.py Mon
# Returns: JSON array of { hour, predicted_count } for all 24 hours

import sys
import json
import pickle

if len(sys.argv) < 2:
    print(json.dumps({ 'error': 'No day provided. Usage: python predict.py Mon' }))
    exit()

day = sys.argv[1]

try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('encoder.pkl', 'rb') as f:
        le = pickle.load(f)
except FileNotFoundError:
    print(json.dumps({ 'error': 'Model not trained yet. Run train_model.py first.' }))
    exit()

# encode day
try:
    day_encoded = int(le.transform([day])[0])
except:
    print(json.dumps({ 'error': 'Invalid day. Use Mon/Tue/Wed/Thu/Fri/Sat/Sun' }))
    exit()

# predict for all 24 hours — use avg light value 512 as default
results = []
for hour in range(24):
    pred = model.predict([[hour, day_encoded, 512]])[0]
    results.append({
        'hour': hour,
        'predicted_count': round(float(pred), 1)
    })

print(json.dumps({ 'success': True, 'day': day, 'predictions': results }))