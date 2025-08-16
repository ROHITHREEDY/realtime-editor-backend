const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());

// Simple in-memory storage (replaces MongoDB)
let users = [];
let documents = [];
let nextUserId = 1;
let nextDocId = 1;

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Check if user exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ message: "Email already in use." });
  }

  // Create user
  const user = {
    _id: nextUserId++,
    username,
    email,
    password // In production, hash this!
  };
  users.push(user);

  const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
  res.status(201).json({ message: "User registered successfully!", token, username: user.username });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'All fields are required.' });

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, username: user.username });
});

// Document routes
app.get('/api/documents/list', authenticateToken, (req, res) => {
  const userDocs = documents.filter(doc => doc.user === req.user.userId);
  res.json(userDocs);
});

app.post('/api/documents/create', authenticateToken, (req, res) => {
  const { title } = req.body;
  const doc = {
    _id: nextDocId++,
    title,
    content: '',
    user: req.user.userId,
    createdAt: new Date()
  };
  documents.push(doc);
  res.status(201).json(doc);
});

app.get('/api/documents/:id', authenticateToken, (req, res) => {
  const doc = documents.find(d => d._id == req.params.id && d.user === req.user.userId);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  res.json(doc);
});

app.patch('/api/documents/:id', authenticateToken, (req, res) => {
  const { content } = req.body;
  const docIndex = documents.findIndex(d => d._id == req.params.id && d.user === req.user.userId);
  if (docIndex === -1) return res.status(404).json({ error: 'Document not found' });
  
  documents[docIndex].content = content;
  res.json(documents[docIndex]);
});

app.patch('/api/documents/:id/rename', authenticateToken, (req, res) => {
  const { title } = req.body;
  const docIndex = documents.findIndex(d => d._id == req.params.id && d.user === req.user.userId);
  if (docIndex === -1) return res.status(404).json({ error: 'Document not found' });
  
  documents[docIndex].title = title;
  res.json(documents[docIndex]);
});

app.delete('/api/documents/:id', authenticateToken, (req, res) => {
  const docIndex = documents.findIndex(d => d._id == req.params.id && d.user === req.user.userId);
  if (docIndex === -1) return res.status(404).json({ error: 'Document not found' });
  
  documents.splice(docIndex, 1);
  res.json({ message: 'Document deleted', id: req.params.id });
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
