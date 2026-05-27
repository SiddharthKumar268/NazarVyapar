const express = require('express');
const router = express.Router();
const {
  logEntry,
  getToday,
  getWeekly,
  getLightCorrelation
} = require('../controllers/footfallController');
const { getPrediction } = require('../controllers/mlController'); 

router.post('/log',           logEntry);
router.get('/stats/today',    getToday);
router.get('/stats/weekly',   getWeekly);
router.get('/stats/light',    getLightCorrelation);
router.get('/predict',        getPrediction);                     

module.exports = router;
