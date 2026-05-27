const FootfallEntry = require('../models/FootfallEntry');

// POST  api to catch mera data/api/footfall/log  — called by ESP32
const logEntry = async (req, res) => {
  try {
    const { count, light } = req.body;
    const now = new Date();
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    const entry = new FootfallEntry({
      count: count || 1,
      light: light,
      hour:  now.getHours(),
      day:   days[now.getDay()],
      timestamp: now
    });

    await entry.save();
    res.status(201).json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/footfall/stats/today
const getToday = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const entries = await FootfallEntry.find({ timestamp: { $gte: start } });

    // build hourly buckets 0-23
    const hourly = Array(24).fill(0);
    entries.forEach(e => { hourly[e.hour] += e.count; });

    const total = hourly.reduce((a, b) => a + b, 0);
    const peakHour = hourly.indexOf(Math.max(...hourly));

    res.json({ success: true, total, peakHour, hourly });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET one to call mera /api/footfall/stats/weekly
const getWeekly = async (req, res) => {
  try {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const entries = await FootfallEntry.find({ timestamp: { $gte: start } });

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weekly = {};
    days.forEach(d => weekly[d] = 0);
    entries.forEach(e => { weekly[e.day] += e.count; });

    res.json({ success: true, weekly });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/footfall/stats/light
const getLightCorrelation = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const entries = await FootfallEntry.find(
      { timestamp: { $gte: start }, light: { $exists: true } },
      { hour: 1, light: 1, count: 1 }
    );

    res.json({ success: true, data: entries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { logEntry, getToday, getWeekly, getLightCorrelation };
