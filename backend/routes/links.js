const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Schema for links
const linkSchema = new mongoose.Schema({
  url: String,
  title: String,
  originClient: String,
  createdAt: { type: Date, default: Date.now }
});

const Link = mongoose.model('Link', linkSchema);

// Save a new link
router.post('/saveLink', async (req, res) => {
  try {
    const { url, title, originClient } = req.body;
    const link = new Link({ url, title, originClient });
    await link.save();
    res.json({ message: 'Link saved!', link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all links
router.get('/getLinks', async (req, res) => {
  try {
    const links = await Link.find();
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// Delete a link by ID
router.delete('/deleteLink/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Link.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.json({ message: 'Link deleted successfully', deleted: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
