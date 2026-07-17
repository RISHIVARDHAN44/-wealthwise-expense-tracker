import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { createRequire } from 'module';

// Fix for ECONNREFUSED on SRV lookups (forces Google DNS)
dns.setServers(['8.8.8.8', '8.8.4.4']);

import User from './models/User.js';
import Transaction from './models/Transaction.js';

// Load environment variables from the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_wealth_tracker_key_for_local_use';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB connection error:');
    console.error('Please make sure you have replaced <db_username> and <db_password> in your .env file!');
    console.error(err.message);
  });

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    // Convert the id string back to a proper mongoose ObjectId
    try {
      req.userId = new mongoose.Types.ObjectId(String(decoded.id));
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token id' });
    }
    next();
  });
};

// Signup
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    
    const token = jwt.sign({ id: newUser._id, name, email }, SECRET_KEY);
    res.json({ token, user: { id: newUser._id, name, email, budget: newUser.budget } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, SECRET_KEY);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, budget: user.budget } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get transactions
app.get('/api/transactions', authenticate, async (req, res) => {
  try {
    const userTx = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
    // Map them to remove _id and just return id
    const formattedTx = userTx.map(t => ({
      id: t.id,
      title: t.title,
      type: t.type,
      category: t.category,
      amount: t.amount,
      date: t.date
    }));
    res.json(formattedTx);
  } catch (err) {
    console.error('GET /api/transactions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add or update transaction
app.post('/api/transactions', authenticate, async (req, res) => {
  const { id, title, type, category, amount, date } = req.body;
  
  try {
    const existingTx = await Transaction.findOne({ id });
    
    if (existingTx) {
      if (existingTx.userId.toString() !== req.userId) {
         return res.status(403).json({ error: 'Forbidden' });
      }
      existingTx.title = title;
      existingTx.type = type;
      existingTx.category = category;
      existingTx.amount = amount;
      existingTx.date = date;
      await existingTx.save();
    } else {
      const newTx = new Transaction({ id, userId: req.userId, title, type, category, amount, date });
      await newTx.save();
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/transactions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete transaction
app.delete('/api/transactions/:id', authenticate, async (req, res) => {
  try {
    await Transaction.deleteOne({ id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user budget
app.get('/api/budget', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ budget: user?.budget || null });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user budget
app.post('/api/budget', authenticate, async (req, res) => {
  const { budget } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (user) {
      user.budget = Number(budget);
      await user.save();
      res.json({ success: true, budget: Number(budget) });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve built React app (frontend)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
