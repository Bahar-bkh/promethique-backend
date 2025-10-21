const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const scanRoutes = require('./routes/scan');
const locationsRoutes = require('./routes/locations');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/locations', locationsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
