// Import Express and create a router instance
import express from 'express';
const router = express.Router();

// Import controller
import enrollmentsController from '../controllers/enrollments.controller.js';

// Import authentication and authorization middleware
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

/**
 * ROUTES LAYER - ENROLLMENTS
 * Exposes endpoints for managing course enrollments and grades.
 * 
 * Access Control:
 * - Teachers: Can view all enrollments, create enrollments, update grades, delete enrollments
 * - Students: Can view their own enrollments and grades only
 */

// Student-specific routes (must be authenticated as student)
// GET /enrollments/my-courses - Get current student's enrolled courses
router.get('/my-courses', authenticate, enrollmentsController.getMyEnrollments.bind(enrollmentsController));

// GET /enrollments/my-statistics - Get current student's grade statistics
router.get('/my-statistics', authenticate, enrollmentsController.getMyStatistics.bind(enrollmentsController));

// Routes for viewing enrollments by student or course
// GET /enrollments/student/:studentId - Get all enrollments for a specific student
router.get('/student/:studentId', authenticate, enrollmentsController.getEnrollmentsByStudent.bind(enrollmentsController));

// GET /enrollments/student/:studentId/statistics - Get statistics for a specific student
router.get('/student/:studentId/statistics', authenticate, enrollmentsController.getStudentStatistics.bind(enrollmentsController));

// GET /enrollments/course/:courseId - Get all students enrolled in a course
router.get('/course/:courseId', authenticate, authorizeRoles('teacher' , 'admin'), enrollmentsController.getEnrollmentsByCourse.bind(enrollmentsController));

// Admin/Teacher only routes - Create, update, delete enrollments
// POST /enrollments - Create a new enrollment
router.post('/', authenticate, authorizeRoles('admin'), enrollmentsController.createEnrollment.bind(enrollmentsController));

// PATCH /enrollments/:id/grade - Update grade for an enrollment
router.patch('/:id/grade', authenticate, authorizeRoles('teacher'), enrollmentsController.updateEnrollmentGrade.bind(enrollmentsController));

// DELETE /enrollments/:id - Delete an enrollment
router.delete('/:id', authenticate, authorizeRoles('admin'), enrollmentsController.deleteEnrollment.bind(enrollmentsController));

// General routes
// GET /enrollments - Get all enrollments (Teacher only)
router.get('/', authenticate, authorizeRoles('teacher', 'admin'), enrollmentsController.getAllEnrollments.bind(enrollmentsController));

// GET /enrollments/:id - Get a specific enrollment by ID
router.get('/:id', authenticate, enrollmentsController.getEnrollmentById.bind(enrollmentsController));

// Export the router to be used in index.js
export default router;
