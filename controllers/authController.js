import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import User from '../models/user.js';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// === Register ===
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    req.flash('error', 'All fields are required');
    return res.redirect('/register');
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      req.flash('error', 'User already exists');
      return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });

    req.flash('success', 'Registration successful. Please log in.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Registration failed. Try again later.');
    res.redirect('/register');
  }
};

// === Login ===
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    req.flash('error', 'Email and password are required');
    return res.redirect('/login');
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    req.session.token = token;
    req.session.user = {
      name: user.username,
      email: user.email,
    };

    req.flash('success', 'Login successful');
    res.redirect('/main');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Login failed. Please try again.');
    res.redirect('/login');
  }
};

// === Logout ===
export const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};
