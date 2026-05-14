const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Auth middleware
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

// Schema — now includes userId
const linkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  url: String,
  title: String,
  originClient: String,
  createdAt: { type: Date, default: Date.now }
});

const Link = mongoose.model('Link', linkSchema);

// Save a new link
router.post('/saveLink', authMiddleware, async (req, res) => {
  try {
    const { url, title, originClient } = req.body;
    const link = new Link({ userId: req.userId, url, title, originClient });
    await link.save();
    res.json({ message: 'Link saved!', link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get links for this user only
router.get('/getLinks', authMiddleware, async (req, res) => {
  try {
    const links = await Link.find({ userId: req.userId });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a link (only if it belongs to this user)
router.delete('/deleteLink/:id', authMiddleware, async (req, res) => {
  try {
    const result = await Link.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!result) return res.status(404).json({ message: 'Link not found' });
    res.json({ message: 'Link deleted successfully', deleted: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a link (only if it belongs to this user)
router.put('/updateLink/:id', authMiddleware, async (req, res) => {
  try {
    const { url, title } = req.body;
    const updatedLink = await Link.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { url, title },
      { new: true }
    );
    if (!updatedLink) return res.status(404).json({ message: 'Link not found' });
    res.json({ message: 'Link updated successfully', updated: updatedLink });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;