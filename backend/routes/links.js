const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const linkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  url: { type: String, required: true },
  favicon: { type: String, default: '' },
  tags: { type: [String], default: [] },
  notes: { type: String, default: '' },
  section: { type: String, default: 'General' },
  originClient: { type: String, default: 'extension' },
  createdAt: { type: Date, default: Date.now }
});

const Link = mongoose.model('Link', linkSchema);

router.post('/saveLink', authMiddleware, async (req, res) => {
  try {
    const { title, url, favicon, tags, section, originClient } = req.body;
    const link = new Link({
      userId: req.userId,
      title,
      url,
      favicon: favicon || `https://www.google.com/s2/favicons?domain=${url}&sz=64`,
      tags: tags || [],
      section: section || 'General',
      originClient
    });
    await link.save();
    res.json({ message: 'Link saved!', link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getLinks', authMiddleware, async (req, res) => {
  try {
    const links = await Link.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/deleteLink/:id', authMiddleware, async (req, res) => {
  try {
    const result = await Link.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ message: 'Link not found' });
    res.json({ message: 'Link deleted', deleted: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/updateLink/:id', authMiddleware, async (req, res) => {
  try {
    const { title, url, favicon, tags, section } = req.body;
    const updated = await Link.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, url, favicon, tags, section },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Link not found' });
    res.json({ message: 'Link updated', updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;