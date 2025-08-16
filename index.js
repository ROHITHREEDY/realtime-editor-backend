const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());

// MongoDB connection (production-ready)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realtime-editor');

// Import authentication middleware
const authenticateToken = require('./middleware/auth');

// Import and use routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');

app.use('/api/auth', authRoutes);
app.use('/api/documents', authenticateToken, documentRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
