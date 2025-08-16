const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

// List all documents for the authenticated user
router.get('/list', async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.userId });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new document
router.post('/create', async (req, res) => {
  try {
    const { title } = req.body;
    const doc = new Document({
      title,
      user: req.user.userId
    });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific document
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user.userId });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update document content
router.patch('/:id', async (req, res) => {
  try {
    const { content } = req.body;
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { content },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rename a document
router.patch('/:id/rename', async (req, res) => {
  try {
    const { title } = req.body;
    const updatedDoc = await Document.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { title },
      { new: true }
    );
    if (!updatedDoc) return res.status(404).json({ error: 'Document not found or access denied' });
    res.json(updatedDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const deletedDoc = await Document.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!deletedDoc) return res.status(404).json({ error: 'Document not found or access denied' });
    res.json({ message: 'Document deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
