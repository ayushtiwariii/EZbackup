import express from 'express';
import { register, login, logout } from '../controllers/authController.js';

const router = express.Router();

router.get("/", (req, res) => {
  res.render("home"); // ✅ This renders views/home.ejs
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get('/main', (req, res) => {
  const user = req.session.user;
  const successMessage = req.flash('success_msg');
  const errorMessage = req.flash('error_msg');

  res.render('main', { user, successMessage, errorMessage });
});



router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

export default router;
