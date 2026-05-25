// Import the enrollments service for business logic
import enrollmentsService from '../services/enrollments.service.js';

/**
 * CONTROLLER LAYER - ENROLLMENTS
 * Handles HTTP requests and responses for enrollment operations.
 * Routes requests to the service layer and formats responses.
 */
class EnrollmentsController {
    /**
     * Get all enrollments (Admin/Teacher only)
     * Handles GET /enrollments
     */
    async getAllEnrollments(req, res) {
  try {
    const enrollments = await enrollmentsService.getAllEnrollments();

    // ✅ always 200, even if []
    return res.status(200).json({
      success: true,
      data: enrollments,
      count: enrollments.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error, please try again.",
      errorCode: "INTERNAL_SERVER_ERROR"
    });
  }
}

    /**
     * Get a single enrollment by ID
     * Handles GET /enrollments/:id
     */
    async getEnrollmentById(req, res) {
        try {
            const { id } = req.params;
            const enrollment = await enrollmentsService.getEnrollmentById(id);

            if (!enrollment) {
                return res.status(404).json({
                    error: `Enrollment with id ${id} is not found`
                });
            }

            return res.status(200).json({ enrollment });
        } catch (error) {
            console.error(error);

            if (error.message === 'Id must be a positive integer') {
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }

    /**
     * Get all enrollments for a specific student
     * Handles GET /enrollments/student/:studentId
     * Students can only see their own enrollments
     */
    async getEnrollmentsByStudent(req, res) {
        try {
            const { studentId } = req.params;
            const requestingUser = req.user;

            // Students can only view their own enrollments
            if (requestingUser.role === 'student' && requestingUser.id !== Number(studentId)) {
                return res.status(403).json({
                    error: 'Forbidden: You can only view your own enrollments'
                });
            }

            const enrollments = await enrollmentsService.getEnrollmentsByStudentId(studentId);

            return res.status(200).json({ 
                enrollments,
                count: enrollments.length
            });
        } catch (error) {
            console.error(error);

            if (error.message === 'Student ID must be a positive integer') {
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }

    /**
     * Get all enrollments for the current authenticated student
     * Handles GET /enrollments/my-courses
     */
    async getMyEnrollments(req, res) {
        try {
            const studentId = req.user.id;

            // Only students can access this endpoint
            if (req.user.role !== 'student') {
                return res.status(403).json({
                    error: 'This endpoint is only for students'
                });
            }

            const enrollments = await enrollmentsService.getEnrollmentsByStudentId(studentId);

            return res.status(200).json({ 
                enrollments,
                count: enrollments.length
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }

    /**
     * Get all students enrolled in a specific course
     * Handles GET /enrollments/course/:courseId
     */
    async getEnrollmentsByCourse(req, res) {
        try {
            const { courseId } = req.params;
            const enrollments = await enrollmentsService.getEnrollmentsByCourseId(courseId);

            return res.status(200).json({ 
                enrollments,
                count: enrollments.length
            });
        } catch (error) {
            console.error(error);

            if (error.message === 'Course ID must be a positive integer') {
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }

    /**
     * Create a new enrollment (Admin/Teacher only)
     * Handles POST /enrollments
     */
    async createEnrollment(req, res) {
        try {
            const { student_id, course_id, enrolled_at } = req.body;

            const enrollmentId = await enrollmentsService.createEnrollment(
                student_id,
                course_id,
                enrolled_at
            );

            return res.status(201).json({
                message: 'Enrollment created successfully',
                enrollmentId
            });
        } catch (error) {
            console.error(error);

            // Handle validation errors
            if (
                error.message === 'Student ID and Course ID are required' ||
                error.message === 'Student ID must be a positive integer' ||
                error.message === 'Course ID must be a positive integer' ||
                error.message === 'Student not found' ||
                error.message === 'Course not found' ||
                error.message === 'User must have student role to be enrolled'
            ) {
                return res.status(400).json({ error: error.message });
            }

            // Handle duplicate enrollment
            if (error.message === 'Student is already enrolled in this course') {
                return res.status(409).json({ error: error.message });
            }

            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }

    /**
     * Update grade for an enrollment (Admin/Teacher only)
     * Handles PATCH /enrollments/:id/grade
     */
    async updateEnrollmentGrade(req, res) {
        try {
            const { id } = req.params;
            const { grade } = req.body;

            const affectedRows = await enrollmentsService.updateGrade(id, grade);

            if (affectedRows === 0) {
                return res.status(404).json({
                    error: `Enrollment with id ${id} is not found`
                });
            }

            return res.status(200).json({
                message: `Grade updated successfully for enrollment ${id}`
            });
        } catch (error) {
            console.error(error);

            // Handle validation errors
            if (
                error.message === 'Enrollment ID must be a positive integer' ||
                error.message === 'Grade is required' ||
                error.message === 'Grade must be a number between 0 and 100'
            ) {
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }

    /**
     * Delete an enrollment (Admin/Teacher only)
     * Handles DELETE /enrollments/:id
     */
    async deleteEnrollment(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await enrollmentsService.deleteEnrollment(id);

            if (affectedRows === 0) {
                return res.status(404).json({
                    error: `Enrollment with id ${id} is not found`
                });
            }

            return res.status(200).json({
                message: `Enrollment with id ${id} was successfully deleted`
            });
        } catch (error) {
            console.error(error);

            if (error.message === 'Id must be a positive integer') {
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }

    /**
     * Get statistics for a student's enrollments
     * Handles GET /enrollments/student/:studentId/statistics
     */
    async getStudentStatistics(req, res) {
        try {
            const { studentId } = req.params;
            const requestingUser = req.user;

            // Students can only view their own statistics
            if (requestingUser.role === 'student' && requestingUser.id !== Number(studentId)) {
                return res.status(403).json({
                    error: 'Forbidden: You can only view your own statistics'
                });
            }

            const statistics = await enrollmentsService.getStudentStatistics(studentId);

            if (!statistics) {
                return res.status(404).json({
                    error: 'Student not found or has no enrollments'
                });
            }

            return res.status(200).json({ statistics });
        } catch (error) {
            console.error(error);

            if (error.message === 'Student ID must be a positive integer') {
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }

    /**
     * Get statistics for the current authenticated student
     * Handles GET /enrollments/my-statistics
     */
    async getMyStatistics(req, res) {
        try {
            const studentId = req.user.id;

            // Only students can access this endpoint
            if (req.user.role !== 'student') {
                return res.status(403).json({
                    error: 'This endpoint is only for students'
                });
            }

            const statistics = await enrollmentsService.getStudentStatistics(studentId);

            if (!statistics) {
                return res.status(404).json({
                    error: 'No enrollment data found'
                });
            }

            return res.status(200).json({ statistics });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }
}

// Export a singleton instance of the EnrollmentsController class
export default new EnrollmentsController();
