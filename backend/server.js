require('dotenv').config();

const express = require('express');
const admin = require("firebase-admin");
const connectDB = require('./config/db');
const cors = require('cors');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  })
});

connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/links'));

app.get('/', (req, res) => res.send('API running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));