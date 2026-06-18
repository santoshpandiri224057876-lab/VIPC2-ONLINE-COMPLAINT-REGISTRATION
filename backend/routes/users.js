const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/', auth, async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') return res.status(403).json({ message: 'Access denied' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;