import express from 'express';
import { google, signin, signup } from '../controllers/auth.js';
import { signout } from '../controllers/user.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', google);
router.post('/logout', signout);
router.get('/check', verifyToken, (req, res) => {
  res.status(200).json({ isAuthenticated: true });
});

export default router;