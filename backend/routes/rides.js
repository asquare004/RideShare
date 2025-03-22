import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { createRide, deleteRide, getRides, updateRide } from '../controllers/ride.js';

const router = express.Router();

router.post('/create', verifyToken, createRide)
router.get('/getRides', getRides)
router.delete('/deleteRide/:postId/:userId', verifyToken, deleteRide)
router.put('/updateRide/:postId/:userId', verifyToken, updateRide)


export default router;