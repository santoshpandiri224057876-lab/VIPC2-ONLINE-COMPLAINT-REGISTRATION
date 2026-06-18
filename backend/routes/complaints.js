const router = require('express').Router();
const auth = require('../middleware/auth');
const Complaint = require('../models/Complaint');

router.post('/', auth, async (req, res) => {
  try {
    const c = await Complaint.create({ ...req.body, user_id: req.user.id });
    res.status(201).json(c);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/my', auth, async (req, res) => {
  try {
    const list = await Complaint.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/', auth, async (req, res) => {
  try {
    if (req.user.user_type === 'user') return res.status(403).json({ message: 'Access denied' });
    const filter = req.query.category ? { category: req.query.category } : {};
    const list = await Complaint.find(filter).populate('user_id', 'name email ph_no').sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') return res.status(403).json({ message: 'Access denied' });
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;