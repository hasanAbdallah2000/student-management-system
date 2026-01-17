import express from 'express';
const router = express.Router();

// Import controller
import coursesController from '../controllers/courses.controller.js';

// Import authentication and authorization middlewares
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

/**
 * ROUTES LAYER - COURSES
 * Defines the API endpoints for course management
 */

// GET /courses - Retrieve all courses
// Public endpoint (no authentication needed)
router.get('/', coursesController.getAllCourses.bind(coursesController));

// POST /courses - Create a new course
// Only admins can create courses
router.post('/', authenticate, authorizeRoles('admin'), coursesController.createCourse.bind(coursesController));

// GET /courses/:id - Retrieve a specific course by ID
// Public endpoint
router.get('/:id', coursesController.getCourseById.bind(coursesController));

// PUT /courses/:id - Update a course by ID
// Only admins can update courses
router.put('/:id', authenticate, authorizeRoles('admin'), coursesController.updateCourseById.bind(coursesController));

// DELETE /courses/:id - Delete a course by ID
// Only admins can delete courses
router.delete('/:id', authenticate, authorizeRoles('admin'), coursesController.destroyCourseById.bind(coursesController));

export default router;
