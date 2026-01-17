// Import Express and create a router instance
import express from 'express';
const router = express.Router();

// Import controller
import authController from '../controllers/auth.controller.js';

// Import authentication middleware
import { authenticate } from '../middlewares/auth.middleware.js';

/**
 * ROUTES LAYER - AUTHENTICATION
 * Exposes endpoints related to user authentication.
 * Each route delegates request handling to the controller.
 */

// POST /auth/login - Authenticate user and return JWT token
router.post('/login', authController.login.bind(authController));

// GET /auth/me - Get current authenticated user information
router.get('/me', authenticate, authController.getMe.bind(authController));

// Export the router to be used in index.js
export default router;
