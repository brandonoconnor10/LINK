// routes/test.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  url: String,
  title: String,
  originClient: String
});
const Link = mongoose.model('Link', linkSchema);

router.get('/test', async (req, res) => {
  try {
    const link = new Link({
      url: 'https://example.com',
      title: 'Example Site',
      originClient: 'extension'
    });
    await link.save();
    res.json({ message: 'Dummy link saved!', link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
