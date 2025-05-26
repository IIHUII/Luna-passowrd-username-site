const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const FILE_PATH = path.join(__dirname, 'feedbacks.json');

app.use(cors());
app.use(bodyParser.json());

let feedbacks = [];
if (fs.existsSync(FILE_PATH)) {
  feedbacks = JSON.parse(fs.readFileSync(FILE_PATH));
}

app.get('/api/feedbacks', (req, res) => {
  res.json(feedbacks);
});

app.post('/api/feedbacks', (req, res) => {
  const { text } = req.body;
  if (!text || text.length < 3) {
    return res.status(400).json({ error: 'Invalid feedback' });
  }
  const entry = { text, date: new Date().toISOString() };
  feedbacks.push(entry);
  fs.writeFileSync(FILE_PATH, JSON.stringify(feedbacks, null, 2));
  res.status(201).json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
