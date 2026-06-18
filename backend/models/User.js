const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  ph_no:     { type: String },
  user_type: { type: String, enum: ['admin', 'agent', 'user'], default: 'user' },
  approved:  { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);