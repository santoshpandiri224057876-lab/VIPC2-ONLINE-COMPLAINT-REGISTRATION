const router = require('express').Router();
const auth = require('../middleware/auth');
const Assigned = require('../models/Assigned');

router.post('/', auth, async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const a = await Assigned.create(req.body);
    res.status(201).json(a);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/', auth, async (req, res) => {
  try {
    const filter = req.user.user_type === 'agent' ? { user_id: req.user.id } : {};
    const list = await Assigned.find(filter)
      .populate('complaint_id').populate('user_id', 'name email');
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const updated = await Assigned.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;