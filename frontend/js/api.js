// js/api.js — all fetch calls live here

const BASE = '/api/footfall';

const API = {
  today: async () => {
    const res = await fetch(BASE + '/stats/today');
    return res.json();
  },

  weekly: async () => {
    const res = await fetch(BASE + '/stats/weekly');
    return res.json();
  },

  light: async () => {
    const res = await fetch(BASE + '/stats/light');
    return res.json();
  }
};