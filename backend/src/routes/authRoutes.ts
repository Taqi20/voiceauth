import express from 'express';
import { upload } from '../config/multerConfig';
import { register, login, getMe, enroll, verify } from '../controllers/authController';
import { isAuthenticated, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', isAuthenticated, (req, res) => getMe(req as AuthRequest, res));

router.post('/enroll', isAuthenticated, upload.single('audio'), (req, res) => enroll(req as AuthRequest, res));
router.post('/verify', upload.single('audio'), verify);

export default router;