import express from 'express';
const router = express.Router();

// Import controller
import coursesController from '../controllers/courses.controller.js';

import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';


// GET /courses - Retrieve all courses
router.get('/', coursesController.getAllCourses.bind(coursesController));

// POST /courses - Create a new course
router.post('/', authenticate, authorizeRoles('admin'), coursesController.createCourse.bind(coursesController));

// GET /courses/:id - Retrieve a specific course by ID
router.get('/:id', coursesController.getCourseById.bind(coursesController));

// PUT /courses/:id - Update a course by ID
router.put('/:id', authenticate, authorizeRoles('admin'), coursesController.updateCourseById.bind(coursesController));

// DELETE /courses/:id - Delete a course by ID
router.delete('/:id', authenticate, authorizeRoles('admin'), coursesController.destroyCourseById.bind(coursesController));

export default router;
