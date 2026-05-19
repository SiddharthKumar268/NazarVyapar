// js/dashboard.js — main controller

// ── DATE ──
document.getElementById('pageDate').textContent = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// ── NAV ──
const navItems = document.querySelectorAll('.nav-item');
const pages    = document.querySelectorAll('.page');
const titles   = { dashboard: "Today's Overview", weekly: "Weekly View", light: "Light Analysis" };

navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const target = item.dataset.page;

    navItems.forEach(n => n.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));

    item.classList.add('active');
    document.getElementById('page-' + target).classList.add('active');
    document.getElementById('pageTitle').textContent = titles[target];

    if (target === 'weekly') loadWeekly();
    if (target === 'light')  loadLight();
  });
});

// ── LOAD TODAY ──
async function loadToday() {
  try {
    const data = await API.today();
    if (!data.success) return;

    document.getElementById('totalVal').textContent = data.total;

    const peakH = data.peakHour;
    const peakLabel = (peakH % 12 || 12) + (peakH < 12 ? 'am' : 'pm');
    document.getElementById('peakVal').textContent = peakLabel;

    const activeHours = data.hourly.filter(v => v > 0).length || 1;
    document.getElementById('avgVal').textContent = Math.round(data.total / activeHours);

    buildHourlyChart(data.hourly);
  } catch (err) {
    console.error('loadToday error:', err);
  }
}
const overlay = document.getElementById('tosOverlay');
document.getElementById('tosLink').addEventListener('click', e => { e.preventDefault(); overlay.classList.add('open'); });
document.getElementById('tosClose').addEventListener('click', () => overlay.classList.remove('open'));
overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('open'); });

// ── LOAD LIGHT (for stat card) ──
async function loadLightStat() {
  try {
    const data = await API.light();
    if (!data.success || !data.data.length) return;
    const avg = Math.round(data.data.reduce((s, e) => s + e.light, 0) / data.data.length);
    document.getElementById('lightVal').textContent = avg;
  } catch (err) {
    console.error('loadLightStat error:', err);
  }
}

// ── LOAD WEEKLY ──
async function loadWeekly() {
  try {
    const data = await API.weekly();
    if (!data.success) return;
    buildWeeklyChart(data.weekly);
  } catch (err) {
    console.error('loadWeekly error:', err);
  }
}

// ── LOAD LIGHT CHART ──
async function loadLight() {
  try {
    const data = await API.light();
    if (!data.success) return;
    buildLightChart(data.data);
  } catch (err) {
    console.error('loadLight error:', err);
  }
}

// ── REFRESH ──
function refreshAll() {
  loadToday();
  loadLightStat();
}

// ── INIT ──
loadToday();
loadLightStat();

// auto refresh every 30 seconds
setInterval(loadToday, 30000);