const router = require('express').Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

router.post('/', auth, async (req, res) => {
  try {
    const msg = await Message.create({ ...req.body, name: req.user.name });
    res.status(201).json(msg);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/:complaint_id', auth, async (req, res) => {
  try {
    const msgs = await Message.find({ complaint_id: req.params.complaint_id }).sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;