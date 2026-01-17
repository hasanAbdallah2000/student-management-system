// Import the courses repository for database operations
import coursesRepository from '../repositories/courses.repository.js';

/**
 * SERVICE LAYER - COURSES
 * The service layer contains business logic and validation rules.
 * It sits between the controller and repository layers.
 * - Validates data before sending it to the database
 * - Transforms data if needed
 * - Contains business rules (e.g., "credits must be positive")
 * - Does NOT handle HTTP requests/responses (that's the controller's job)
 */
class CoursesService {
    /**
     * Get all courses
     * @returns {Promise<Array>} - Array of all courses
     */
    async getAllCourses() {
        // Call repository to get data from database
        // db.execute() returns [rows, fields], we only need rows
        const [courses] = await coursesRepository.findAll();
        return courses;
    }

    /**
     * Get a single course by ID
     * @param {number} id - The course ID
     * @returns {Promise<Object|null>} - Course object or null if not found
     * @throws {Error} - If ID is invalid
     */
    async getCourseById(id) {
        // Validation: ID must be a positive integer
        if (id < 1) {
            throw new Error('Id must be a positive integer');
        }
        
        // Retrieve course from database
        const [course] = await coursesRepository.findById(id);
        
        // Return the first course or null if not found
        return course.length > 0 ? course[0] : null;
    }

    /**
     * Create a new course
     * @param {string} code - Course code
     * @param {string} name - Course name
     * @param {number} credits - Number of credits (default: 3)
     * @returns {Promise<number>} - The ID of the newly created course
     * @throws {Error} - If required fields are missing
     */
    async createCourse(code, name, credits = 3) {
        // Validation: Check required fields
        if (!code || !name) {
            throw new Error('Code and name are required');
        }
        
        // Create course in database
        const [result] = await coursesRepository.create(code, name, credits);
        
        // Return the auto-generated ID of the new course
        return result.insertId;
    }

    /**
     * Update an existing course
     * @param {number} id - The course ID to update
     * @param {string} code - Updated course code
     * @param {string} name - Updated course name
     * @param {number} credits - Updated number of credits (default: 3)
     * @returns {Promise<number>} - Number of rows affected (0 or 1)
     * @throws {Error} - If required fields are missing
     */
    async updateCourse(id, code, name, credits = 3) {
        // Validation: Check required fields
        if (!code || !name) {
            throw new Error('Code and name are required');
        }
        
        // Update course in database
        const [result] = await coursesRepository.update(id, code, name, credits);
        
        // Return number of rows affected (0 if course not found, 1 if updated)
        return result.affectedRows;
    }

    /**
     * Delete a course
     * @param {number} id - The course ID to delete
     * @returns {Promise<number>} - Number of rows affected (0 or 1)
     * @throws {Error} - If ID is invalid
     */
    async deleteCourse(id) {
        // Validation: ID must be a positive integer
        if (id < 1) {
            throw new Error('Id must be a positive integer');
        }
        
        // Delete course from database
        const [result] = await coursesRepository.deleteCourse(id);
        
        // Return number of rows affected (0 if not found, 1 if deleted)
        return result.affectedRows;
    }
}

// Export a singleton instance of the CoursesService class
export default new CoursesService();
