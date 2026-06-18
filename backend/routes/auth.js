const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, ph_no, user_type } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed, ph_no, user_type: user_type || 'user' });
    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (!await bcrypt.compare(password, user.password))
      return res.status(400).json({ message: 'Wrong password' });
    const token = jwt.sign(
      { id: user._id, name: user.name, user_type: user.user_type },
      process.env.JWT_SECRET, { expiresIn: '1d' }
    );
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, user_type: user.user_type } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;