const mongoose = require('mongoose');
const complaintSchema = new mongoose.Schema({
  user_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true },
  category:  { type: String, enum: ['police', 'electricity', 'municipality', 'water', 'other'], default: 'other' },
  address:   { type: String, required: true },
  city:      { type: String, required: true },
  state:     { type: String, required: true },
  pincode:   { type: String, required: true },
  description: { type: String, required: true },
  status:    { type: String, enum: ['pending', 'in-review', 'resolved'], default: 'pending' },
  comment:   { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.model('Complaint', complaintSchema);