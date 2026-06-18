const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/assigned',   require('./routes/assigned'));
app.use('/api/messages',   require('./routes/messages'));
app.use('/api/users',      require('./routes/users'));

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`));