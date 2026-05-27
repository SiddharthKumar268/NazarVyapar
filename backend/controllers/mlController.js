const { exec } = require('child_process');
const path     = require('path');
const getPrediction = (req, res) => {
  const days  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = days[new Date().getDay()];
  const day   = req.query.day || today;
  const mlPath = path.join(__dirname, '../../ml/predict.py');
  const cmd    = 'python ' + mlPath + ' ' + day;
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ success: false, error: stderr || err.message });
    }
    try {
      const result = JSON.parse(stdout);
      res.json(result);
    } catch (e) {
      res.status(500).json({ success: false, error: 'Failed to parse ML output' });
    }
  });
};
module.exports = { getPrediction };
