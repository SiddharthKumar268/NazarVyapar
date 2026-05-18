# NazarVyapar — Retail Footfall Analyzer

> Har ek kadam ginne wala — the watchful eye on your business.

---

## Problem Statement

A small shop owner in India — kirana store, medical shop, salon, clothing outlet — has **zero visibility** into how their business performs hour by hour.

They don't know:
- Which hours bring the most customers
- Whether a new offer actually increased footfall
- How many people walked past but didn't enter
- Should they hire extra help on weekends or not

Expensive solutions like what Reliance Retail uses cost ₹50,000+. A kirana owner earning ₹30,000/month cannot afford this.

**NazarVyapar solves this for under ₹300 in hardware.**

A PIR sensor counts every person who enters. An LDR sensor logs ambient light for time-of-day context. ESP32 posts data to a Node.js/Express backend, stored in MongoDB. A plain HTML/CSS/Vanilla JS dashboard gives the shop owner clear daily and weekly insights.

---

## Real World Impact

| Problem | How This Solves It |
|---|---|
| "I don't know my peak hours" | Hourly footfall bar chart |
| "My offer didn't work?" | Before/after footfall comparison |
| "Hire extra help on Sunday?" | Weekly pattern view |
| "Does lighting affect customers?" | LDR vs footfall correlation |

---

## Hardware Required

| Component | Cost |
|---|---|
| ESP32 / NodeMCU | ₹180 |
| PIR Sensor x2 (entry + exit) | ₹60 |
| LDR + 10kΩ resistor | ₹10 |
| Jumper wires + breadboard | ₹50 |
| **Total** | **~₹300** |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Hardware | ESP32 · PIR HC-SR501 · LDR |
| Firmware | Arduino C (ESP32 HTTP POST) |
| Backend | Node.js · Express · MongoDB Atlas · Mongoose |
| Frontend | HTML · CSS · Vanilla JS · Chart.js |
| Alerts | Telegram Bot API |
| ML | Python · scikit-learn (peak hour prediction) |

---

## Repo Structure

```
NazarVyapar/
│
├── firmware/
│   └── esp32_sensor.ino           # Reads PIR + LDR, POSTs to /api/footfall/log
│
├── backend/
│   ├── server.js                  # Express entry point
│   ├── models/
│   │   └── FootfallEntry.js       # Mongoose schema
│   ├── routes/
│   │   └── footfall.js            # All API routes
│   ├── controllers/
│   │   └── footfallController.js  # Route logic separated
│   └── .env                       # MONGO_URI, PORT, TELEGRAM_TOKEN
│
├── frontend/
│   ├── index.html                 # Main dashboard page
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── dashboard.js           # Fetches API, renders charts
│       ├── charts.js              # Chart.js wrappers
│       └── api.js                 # All fetch() calls in one place
│
├── ml/
│   ├── train_model.py             # Trains peak hour predictor
│   ├── predict.py                 # Returns JSON prediction
│   └── model.pkl                  # Saved model
│
├── .gitignore
├── README.md
└── circuit_diagram.png
```

---

## How It Works

```
PIR detects person → ESP32 reads LDR value
        ↓
HTTP POST → /api/footfall/log
{ count: 1, light: 743, timestamp }
        ↓
MongoDB stores with hour + day + light_level
        ↓
Vanilla JS dashboard fetches /api/footfall/stats
        ↓
Chart.js renders hourly bar + weekly graph
        ↓
Telegram bot sends daily summary at 9 PM
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/footfall/log` | ESP32 logs new entry |
| GET | `/api/footfall/stats/today` | Hourly breakdown today |
| GET | `/api/footfall/stats/weekly` | Day-wise count this week |
| GET | `/api/footfall/predict` | ML predicted peak hours |

---

## Mongoose Schema

```js
// models/FootfallEntry.js
const FootfallSchema = new mongoose.Schema({
  count:      { type: Number, default: 1 },
  light:      { type: Number },        // LDR analog value
  hour:       { type: Number },        // 0-23
  day:        { type: String },        // Mon-Sun
  timestamp:  { type: Date, default: Date.now }
});
```

---

## Setup

```bash
# Backend
cd backend
npm install
node server.js

# Frontend — served as static files from Express
# No separate server needed

# ML
cd ml
pip install scikit-learn pandas
python train_model.py
```

---

## Environment Variables

```
MONGO_URI=mongodb+srv://...
PORT=5000
TELEGRAM_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

---

## Features

- [x] Real-time footfall counter
- [x] Hourly bar chart (Chart.js, no framework)
- [x] Weekly footfall heatmap
- [x] Light level vs footfall correlation
- [x] Telegram daily summary bot
- [x] ML predicted peak hours
- [ ] SMS alert if footfall drops below threshold (planned)
- [ ] Multi-shop support with shop ID (planned)

---

## Made with ❤️ for Indian small businesses

**Hardware cost: ₹300. Value delivered: priceless.**