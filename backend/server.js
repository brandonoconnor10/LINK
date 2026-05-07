const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Register Routes
app.use('/api', require('./routes/links'));

app.get('/', (req, res) => {
  res.send('API running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});