const mongoose = require('mongoose');
const assignedSchema = new mongoose.Schema({
  complaint_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  user_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  agent:        { type: String },
  status:       { type: String, enum: ['pending', 'in-review', 'resolved'], default: 'pending' },
}, { timestamps: true });
module.exports = mongoose.model('Assigned', assignedSchema);