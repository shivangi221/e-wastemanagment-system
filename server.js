// server.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors'); 
const bcrypt = require('bcryptjs'); // 🆕 Added bcryptjs for secure password hashing
require('dotenv').config();

const Bin = require('./models/Bin');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 5000;

// 🛠️ Modified: Configured dynamic production CORS alignment rules
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
})); 

app.use(express.json());

// Configure Multer to temporarily hold uploaded files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🎉 Connected to MongoDB Atlas successfully!"))
  .catch((err) => console.error("❌ Database connection error:", err));

// 1. Fetch all bins currently in the database
app.get('/api/bins', async (req, res) => {
  try {
    const bins = await Bin.find();
    res.json(bins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Find bins within 5 kilometers of specific coordinates
app.get('/api/bins/nearby', async (req, res) => {
  try {
    const { lng, lat } = req.query;
    if (!lng || !lat) {
      return res.status(400).json({ error: "Please provide both 'lng' and 'lat' parameters." });
    }
    const nearbyBins = await Bin.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 5000 
        }
      }
    });
    res.json(nearbyBins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3a. 🆕 Secure User Registration Endpoint
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please provide name, email, and password." });
    }

    // Verify if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "This email address is already registered." });
    }

    // Hash the raw password securely before writing to Atlas
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword 
    });

    await newUser.save();
    res.status(201).json({ 
      success: true,
      message: "User account created successfully!",
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3b. 🆕 Secure User Login Endpoint
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide both email and password." });
    }

    // Find the user entry
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password credentials." });
    }

    // Decrypt and match password hashes
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password credentials." });
    }

    // Validation success! Send back safe user stats to frontend state
    res.json({
      success: true,
      message: "Authentication successful!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        ecoPoints: user.ecoPointsBalance || user.ecoPoints || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Log a recycling event and award Eco-Points manually
app.post('/api/recycle', async (req, res) => {
  try {
    const { userId, binId, itemCategory } = req.body;
    let points = 10; 
    if (itemCategory.toLowerCase() === 'smartphone') points = 50;
    if (itemCategory.toLowerCase() === 'laptop') points = 100;
    if (itemCategory.toLowerCase() === 'keyboard') points = 25;

    const transaction = new Transaction({ userId, binId, itemCategory, pointsAwarded: points });
    await transaction.save();

    await User.findByIdAndUpdate(userId, { $inc: { ecoPointsBalance: points } });
    res.status(201).json({ message: `Successfully recycled ${itemCategory}!`, pointsAwarded: points, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. The AI Bridge Endpoint: Upload image -> Predict via Python -> Return details
app.post('/api/recycle/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload an image file." });
    }

    console.log("📸 Image received by Node server. Forwarding to Python AI...");

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // 🛠️ Note: Ensure your Python model server environment is live during scanning operations
    const pythonAIResponse = await axios.post('http://localhost:8000/api/classify', form, {
      headers: { ...form.getHeaders() }
    });

    const aiData = pythonAIResponse.data;
    console.log("🤖 Python AI Response received:", aiData);

    res.json({
      message: "Device scanned successfully!",
      category: aiData.category,
      confidence: aiData.confidence,
      safety_flags: aiData.safety_flags
    });

  } catch (error) {
    console.error("❌ Bridge Error:", error.message);
    res.status(500).json({ error: "Failed to communicate with AI model processing server." });
  }
});

// Boot up server listener
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});