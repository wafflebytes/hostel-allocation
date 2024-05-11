// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/hostel-allocation';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Schema and model
const friendSchema = new mongoose.Schema({
  name: String,
});

const matchSchema = new mongoose.Schema({
  friend1: String,
  friend2: String,
});

const Friend = mongoose.model('Friend', friendSchema);
const Match = mongoose.model('Match', matchSchema);

// API routes
app.get('/api/friends', async (req, res) => {
  try {
    const friends = await Friend.find({}, 'name');
    res.json(friends.map(friend => friend.name));
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'An error occurred while fetching friends.' });
  }
});

app.get('/api/matches', async (req, res) => {
  try {
    const matches = await Match.find({});
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'An error occurred while fetching matches.' });
  }
});

app.post('/api/vote', async (req, res) => {
  try {
    const { friend, roommate } = req.body;

    // Check if the vote is valid (friend and roommate are different)
    if (friend === roommate) {
      return res.status(400).json({ error: 'You cannot vote for yourself as a roommate.' });
    }

    // Check if the vote already exists in the database
    const existingMatch = await Match.findOne({ $or: [{ friend1: friend, friend2: roommate }, { friend1: roommate, friend2: friend }] });
    if (existingMatch) {
      return res.status(400).json({ error: 'This match already exists.' });
    }

    // Create a new match
    const newMatch = new Match({ friend1: friend, friend2: roommate });
    await newMatch.save();

    res.json({ message: `Vote recorded: ${friend} has matched with ${roommate}.`, match: newMatch });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'An error occurred while submitting your vote.' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
