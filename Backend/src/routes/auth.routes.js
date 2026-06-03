import express from 'express';
const router = express.Router();

import authController from '../controllers/auth.controller.js';

import { authenticate } from '../middlewares/auth.middleware.js';


router.post('/login', authController.login.bind(authController));

router.get('/me', authenticate, authController.getMe.bind(authController));

export default router;
