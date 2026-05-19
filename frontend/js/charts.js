// js/charts.js — Chart.js wrappers

const ACCENT   = '#e8a020';
const ACCENT2  = '#f0c060';
const MUTED    = '#2a2a35';
const TEXT     = '#7a7880';
const SUCCESS  = '#3ecf8e';

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#18181f',
      borderColor: '#2a2a35',
      borderWidth: 1,
      titleColor: '#f0ede8',
      bodyColor: '#7a7880',
      padding: 10,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: { color: MUTED },
      ticks: { color: TEXT, font: { family: 'DM Sans', size: 11 } }
    },
    y: {
      grid: { color: MUTED },
      ticks: { color: TEXT, font: { family: 'DM Sans', size: 11 } },
      beginAtZero: true
    }
  }
};

let hourlyChart, weeklyChart, lightChart;

function buildHourlyChart(hourly) {
  const labels = hourly.map((_, i) => {
    const h = i % 12 || 12;
    return i < 12 ? h + 'am' : h + 'pm';
  });

  const colors = hourly.map(v => v === Math.max(...hourly) ? ACCENT : 'rgba(232,160,32,0.25)');

  if (hourlyChart) hourlyChart.destroy();
  hourlyChart = new Chart(document.getElementById('hourlyChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: hourly,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: { ...chartDefaults }
  });
}

function buildWeeklyChart(weekly) {
  const order = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const labels = order;
  const data   = order.map(d => weekly[d] || 0);
  const colors = data.map(v => v === Math.max(...data) ? SUCCESS : 'rgba(62,207,142,0.25)');

  if (weeklyChart) weeklyChart.destroy();
  weeklyChart = new Chart(document.getElementById('weeklyChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: { ...chartDefaults }
  });
}

function buildLightChart(entries) {
  const hourMap = {};
  entries.forEach(e => {
    if (!hourMap[e.hour]) hourMap[e.hour] = { light: 0, count: 0 };
    hourMap[e.hour].light += e.light;
    hourMap[e.hour].count += 1;
  });

  const labels = Object.keys(hourMap).map(h => {
    const hr = parseInt(h);
    const label = hr % 12 || 12;
    return hr < 12 ? label + 'am' : label + 'pm';
  });

  const lightData    = Object.values(hourMap).map(v => Math.round(v.light / v.count));
  const footfallData = Object.values(hourMap).map(v => v.count);

  if (lightChart) lightChart.destroy();
  lightChart = new Chart(document.getElementById('lightChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Light Level (LDR)',
          data: lightData,
          borderColor: ACCENT2,
          backgroundColor: 'rgba(240,192,96,0.08)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: ACCENT2,
          pointRadius: 4
        },
        {
          label: 'Footfall Count',
          data: footfallData,
          borderColor: SUCCESS,
          backgroundColor: 'rgba(62,207,142,0.08)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: SUCCESS,
          pointRadius: 4
        }
      ]
    },
    options: {
      ...chartDefaults,
      plugins: {
        ...chartDefaults.plugins,
        legend: {
          display: true,
          labels: { color: TEXT, font: { family: 'DM Sans', size: 11 }, boxWidth: 12 }
        }
      }
    }
  });
}