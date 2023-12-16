// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
    origin: ['http://localhost:5173','https://frontquiz-8593.onrender.com'], 
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,UPDATE',
    optionsSuccessStatus: 204,
  };
  
app.use(cors(corsOptions));
  
app.use(bodyParser.json());


mongoose.connect('mongodb+srv://shaiksalam2002:<password>@cluster0.sjaa1ru.mongodb.net/?retryWrites=true&w=majority', {});


const User = require('./models/user');
const Exercise = require('./models/exercise');
const Leaderboard = require('./models/leaderboard');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


 app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ username: user.username, lang: user.lang }, 'your-secret-key');
    res.json({ token });
    
  } else {
    res.status(401).send('Invalid login credentials');
  }
});



// Registration endpoint
app.post('/api/register', async (req, res) => {
    const { username, password, lang } = req.body;
    console.log('Received registration request:', { username, password, lang });

    const hashedPassword = await bcrypt.hash(password, 10);
  
    const user = new User({
      username,
      password: hashedPassword,
      lang, 
    });
  
    try {
      await user.save();
      res.status(201).send('User registered successfully');
    } catch (error) {
      res.status(500).send('Error registering user');
    }
  });

 
  app.post('/api/finish', async (req, res) => {
    try {
      const { username, score } = req.body;
  
      console.log('Received request with username:', username);
  
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
  
      user.progress.push({ score });
      if(score<5) user.proficiency=1
      else if(score==10) user.proficiency=3
      else  user.proficiency=2
      await user.save({ validateBeforeSave: false });
  
      // Update the leaderboard
      const existingLeaderboardEntry = await Leaderboard.findOne({ username });
  
      if (existingLeaderboardEntry) {
        // If the user already has a score, update it if the new score is higher
        if (score > existingLeaderboardEntry.score) {
          existingLeaderboardEntry.score = score;
          await existingLeaderboardEntry.save();
        }
      } else {
        // If the user doesn't have a score in the leaderboard, create a new entry
        const newLeaderboardEntry = new Leaderboard({
          username,
          score,
        });
        await newLeaderboardEntry.save();
      }
  
      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error('Error updating score:', error);
      res.status(500).json({ success: false, error: 'Error updating score' });
    }
  });
  

  


// Fetch questions endpoint
app.post('/api/questions',  async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const questions = await Exercise.find({ language: user.lang });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Fetch leaderboard endpoint
app.get('/api/leaderboard', async (req, res) => {
  const leaderboard = await Leaderboard.find().sort({ score: -1 }).limit(10);
  res.json(leaderboard);
});

// Fetch user profile endpoint
app.post('/api/userprofile',  async (req, res) => {
  const { username } = req.body;
  
  try {
    
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(user.lang);
    res.json({
      username: user.username,
      lang: user.lang,
      proficiency: user.proficiency,
      progress: user.progress,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
