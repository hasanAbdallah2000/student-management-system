// Import the courses service for business logic
import coursesService from '../services/courses.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import ApiError from '../util/ApiError.js';

/**
 * CONTROLLER LAYER - COURSES
 * The controller layer handles HTTP requests and responses.
 * - Receives requests from routes
 * - Calls the service layer to perform operations
 * - Handles errors and sends appropriate HTTP responses
 * - Does NOT contain business logic or database queries
 */
class CoursesController {
    /**
     * Get all courses
     * Handles GET /courses
     */
    async getAllCourses(req, res) {
        try {
            // Call service to get all courses
            const courses = await coursesService.getAllCourses();
            
            // Check if any courses were found
            if (courses.length < 1) {
                return res.status(404).json({
                    error: 'No courses found in the database.'
                });
            }
            
            // Return success response with courses data
            return res.status(200).json({ courses });
        } catch (error) {
            // Log error for debugging
            console.error(error);
            
            // Return error response
            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }

    /**
     * Get a single course by ID
     * Handles GET /courses/:id
     */
    async getCourseById(req, res) {
        try {
            // Extract ID from URL parameters
            const { id } = req.params;
            
            // Call service to get course by ID
            const course = await coursesService.getCourseById(id);

            // Check if course was found
            if (!course) {
                return res.status(404).json({
                    error: `Course with id ${id} is not found`
                });
            }

            // Return success response with course data
            return res.status(200).json({ course });
        } catch (error) {
            console.error(error);
            
            // Handle validation errors (from service layer)
            if (error.message === 'Id must be a positive integer') {
                return res.status(400).json({ error: error.message });
            }
            
            // Handle unexpected errors
            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }

    /**
     * Create a new course
     * Handles POST /courses
     */
    async createCourse(req, res) {
        try {
            // Extract data from request body
            const { code, name, credits } = req.body;
            
            // Call service to create course
            const courseId = await coursesService.createCourse(code, name, credits);

            // Return success response with new course ID
            return res.status(201).json({
                message: 'Course created successfully',
                courseId
            });
        } catch (error) {
            console.error(error);
            
            // Handle validation errors (from service layer)
            if (error.message === 'Code and name are required') {
                return res.status(400).json({ error: error.message });
            }
            
            // Handle unexpected errors
            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }

    /**
     * Update an existing course
     * Handles PUT /courses/:id
     */
    async updateCourseById(req, res) {
        try {
            // Extract ID from URL parameters
            const { id } = req.params;
            
            // Extract updated data from request body
            const { code, name, credits } = req.body;
            
            // Call service to update course
            const affectedRows = await coursesService.updateCourse(id, code, name, credits);

            // Check if course was found and updated
            if (affectedRows === 0) {
                return res.status(404).json({
                    error: `Course with id ${id} is not found`
                });
            }

            // Return success response
            return res.status(200).json({
                message: `Course with id ${id} updated successfully`
            });
        } catch (error) {
            console.error(error);
            
            // Handle validation errors
            if (error.message === 'Code and name are required') {
                return res.status(400).json({ error: error.message });
            }
            
            // Handle duplicate entry errors (e.g., duplicate course code)
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    error: 'This course code already exists'
                });
            }
            
            // Handle unexpected errors
            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }

    /**
     * Delete a course
     * Handles DELETE /courses/:id
     */
    destroyCourseById = asyncHandler(async(req, res) => {
            // Extract ID from URL parameters
            const { id } = req.params;
            
            // Call service to delete course
            const affectedRows = await coursesService.deleteCourse(id);

            // Check if course was found and deleted
            if (!affectedRows){ throw new ApiError(404, `Course with id ${id} is not found`, "COURSE_NOT_FOUND");
}
           return res.status(200).json({ success: "true" , message: "course deleted",});

            // Return success response
            });
    
}

// Export a singleton instance of the CoursesController class
export default new CoursesController();
