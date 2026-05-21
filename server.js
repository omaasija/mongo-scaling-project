require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const User = require('./models/User');

const app = express();
app.use(express.json());

// Connect to the database
connectDB();

// ==========================================
// WRITE OPERATION (Handled by Primary Node)
// ==========================================
app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// READ OPERATION (Handled by Secondary Replicas)
// ==========================================
app.get('/api/users', async (req, res) => {
  try {
    // .read('secondaryPreferred') explicitly routes this query to read replicas
    // If all replicas are down, it falls back to the primary node.
    const users = await User.find().read('secondaryPreferred');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
