const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const sectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  sections: { type: [String], default: ['General'] },
  updatedAt: { type: Date, default: Date.now }
});

const SectionList = mongoose.model('SectionList', sectionSchema);

router.get('/getSections', authMiddleware, async (req, res) => {
  try {
    let doc = await SectionList.findOne({ userId: req.userId });
    if (!doc) {
      doc = new SectionList({ userId: req.userId, sections: ['General'] });
      await doc.save();
    }
    res.json({ sections: doc.sections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/saveSections', authMiddleware, async (req, res) => {
  try {
    const { sections } = req.body;
    const doc = await SectionList.findOneAndUpdate(
      { userId: req.userId },
      { sections, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json({ sections: doc.sections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;