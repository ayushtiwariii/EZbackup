import express from 'express';
import session from 'express-session';
import { takeMySQLBackup } from '../controllers/mysqlcontroller.js';
import { exportFullMongoAsJSON } from '../controllers/mongocontroller.js';

const router = express.Router();
router.get('/main', (req, res) => {
  const user = req.session.user || null;
  console.log("session user",user)

  // Also pass any flash messages for success or error
  res.render('main', {
    user,
    successMessage: req.flash('success_msg'),
    errorMessage: req.flash('error_msg')
  });
});

router.post('/test', (req, res) => {
  console.log("BODY:", req.body);
  console.log("HEADERS:", req.headers);
  res.json({ received: req.body });
});


router.post('/backup/mysql', takeMySQLBackup);
router.post('/backup/mongo', exportFullMongoAsJSON);


export default router;
