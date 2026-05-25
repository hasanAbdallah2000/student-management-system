// Import Express and create a router
import express from 'express';
const router = express.Router();

// Import controller
import usersController from '../controllers/users.controller.js';

// Import authentication and authorization middlewares
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

/**
 * ROUTES LAYER - USERS
 * The routes layer defines the API endpoints and maps them to controller functions.
 * This is where we define:
 * - HTTP methods (GET, POST, PUT, DELETE)
 * - URL paths (/users, /users/:id)
 * - Which controller function handles each endpoint
 */

// GET /users - Retrieve all users
// Only admins should access the list of users
router.get('/', authenticate, authorizeRoles('admin'), usersController.getAllUsers);

router.get('/teachers', authenticate, authorizeRoles('admin'), usersController.getTeachers);

router.get('/teachers/:id/courses', authenticate, authorizeRoles('admin'), usersController.getTeachersCourses);

router.put('/teachers/:id/courses', authenticate, authorizeRoles('admin'), usersController.assignTeacherCourses);



// POST /users - Create a new user (admin or student)
// Restricted to admins to prevent privilege escalation
router.post('/', authenticate, authorizeRoles('admin'), usersController.createUser);

// GET /users/:id - Retrieve a specific user by ID
// :id is a URL parameter that will be accessible in req.params.id
// Admins can inspect individual users
router.get('/:id', authenticate, authorizeRoles('admin'), usersController.getUserById.bind(usersController));

// PATCH /users/:id - Update a user by ID (Admin only)
router.patch('/:id', authenticate, authorizeRoles('admin'), usersController.updateUserById.bind(usersController));

// DELETE /users/:id - Delete a user by ID
router.delete('/:id', authenticate, authorizeRoles('admin'), usersController.destroyUserById.bind(usersController));


// Export the router to be used in index.js
export default router;
