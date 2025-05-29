import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import User from '../models/user.js';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      req.flash('error', 'User already exists');
      return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });

    req.flash('success', 'User registered successfully. You can now log in.');
    res.redirect('/login');
  } catch (err) {
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/register');
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error_msg', 'Invalid credentials');
      return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid credentials');
      return res.redirect('/login');
    }

    // Save token and user info in session
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.SECRET_KEY, { expiresIn: '1h' });
    req.session.token = token;

    // ✅ Store user info in session for later access
    req.session.user = {
      name: user.username,
      email: user.email
    };

    req.flash('success_msg', 'Login successful');
    res.redirect('/main');
  } catch (err) {
    req.flash('error_msg', 'Login failed');
    res.redirect('/login');
  }
};


export const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};
