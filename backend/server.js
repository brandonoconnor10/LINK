const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const linksRoutes = require('./routes/links');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(require('cors')());
app.use('/api', linksRoutes);

app.get('/', (req, res) => res.send('API running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
