import express from 'express';
import { upload } from '../config/multerConfig.js';
import { register, login, getMe, enroll, verify } from '../controllers/authController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

import type { AuthRequest } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', isAuthenticated, (req, res) => getMe(req as AuthRequest, res));

router.post('/enroll', isAuthenticated, upload.single('audio'), (req, res) => enroll(req as AuthRequest, res));
router.post('/verify', upload.single('audio'), verify);

export default router;