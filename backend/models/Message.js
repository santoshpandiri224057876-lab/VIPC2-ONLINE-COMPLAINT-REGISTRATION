const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  complaint_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  name:         { type: String, required: true },
  message:      { type: String, required: true },
}, { timestamps: true });
module.exports = mongoose.model('Message', messageSchema);