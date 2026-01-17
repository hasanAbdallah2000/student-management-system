// Import the enrollments repository for database operations
import enrollmentsRepository from '../repositories/enrollments.repository.js';
import usersRepository from '../repositories/users.repository.js';
import coursesRepository from '../repositories/courses.repository.js';

/**
 * SERVICE LAYER - ENROLLMENTS
 * Contains business logic for enrollment operations.
 * Validates input, enforces business rules, and coordinates with repositories.
 */
class EnrollmentsService {
    /**
     * Get all enrollments
     * @returns {Promise<Array>} - Array of all enrollments
     */
    async getAllEnrollments() {
        const [rows] = await enrollmentsRepository.findAll();
        return rows;
    }

    /**
     * Get a single enrollment by ID
     * @param {string|number} id - The enrollment ID
     * @returns {Promise<Object|null>} - The enrollment object or null if not found
     * @throws {Error} - If ID is invalid
     */
    async getEnrollmentById(id) {
        // Validate ID
        const numericId = Number(id);
        if (!Number.isInteger(numericId) || numericId <= 0) {
            throw new Error('Id must be a positive integer');
        }

        const [rows] = await enrollmentsRepository.findById(numericId);
        return rows[0] || null;
    }

    /**
     * Get all enrollments for a specific student
     * @param {string|number} studentId - The student's user ID
     * @returns {Promise<Array>} - Array of enrollments for the student
     * @throws {Error} - If student ID is invalid
     */
    async getEnrollmentsByStudentId(studentId) {
        // Validate student ID
        const numericId = Number(studentId);
        if (!Number.isInteger(numericId) || numericId <= 0) {
            throw new Error('Student ID must be a positive integer');
        }

        const [rows] = await enrollmentsRepository.findByStudentId(numericId);
        return rows;
    }

    /**
     * Get all enrollments for a specific course
     * @param {string|number} courseId - The course ID
     * @returns {Promise<Array>} - Array of students enrolled in the course
     * @throws {Error} - If course ID is invalid
     */
    async getEnrollmentsByCourseId(courseId) {
        // Validate course ID
        const numericId = Number(courseId);
        if (!Number.isInteger(numericId) || numericId <= 0) {
            throw new Error('Course ID must be a positive integer');
        }

        const [rows] = await enrollmentsRepository.findByCourseId(numericId);
        return rows;
    }

    /**
     * Create a new enrollment
     * @param {number} studentId - The student's user ID
     * @param {number} courseId - The course ID
     * @param {string} [enrolledAt] - Optional enrollment date
     * @returns {Promise<number>} - The new enrollment ID
     * @throws {Error} - If validation fails or enrollment already exists
     */
    async createEnrollment(studentId, courseId, enrolledAt) {
        // Validate required fields
        if (!studentId || !courseId) {
            throw new Error('Student ID and Course ID are required');
        }

        // Validate IDs are positive integers
        const numericStudentId = Number(studentId);
        const numericCourseId = Number(courseId);
        
        if (!Number.isInteger(numericStudentId) || numericStudentId <= 0) {
            throw new Error('Student ID must be a positive integer');
        }
        
        if (!Number.isInteger(numericCourseId) || numericCourseId <= 0) {
            throw new Error('Course ID must be a positive integer');
        }

        // Check if student exists and is actually a student (not a teacher)
        const [studentRows] = await usersRepository.findById(numericStudentId);
        const student = studentRows[0];
        
        if (!student) {
            throw new Error('Student not found');
        }
        
        if (student.role !== 'student') {
            throw new Error('User must have student role to be enrolled');
        }

        // Check if course exists
        const [courseRows] = await coursesRepository.findById(numericCourseId);
        const course = courseRows[0];
        
        if (!course) {
            throw new Error('Course not found');
        }

        // Check if enrollment already exists
        const [existingRows] = await enrollmentsRepository.findByStudentAndCourse(
            numericStudentId,
            numericCourseId
        );
        
        if (existingRows.length > 0) {
            throw new Error('Student is already enrolled in this course');
        }

        // Create the enrollment
        const [result] = await enrollmentsRepository.createEnrollment({
            studentId: numericStudentId,
            courseId: numericCourseId,
            enrolledAt
        });

        return result.insertId;
    }

    /**
     * Update the grade for an enrollment
     * @param {string|number} id - The enrollment ID
     * @param {string|number} grade - The grade to assign
     * @returns {Promise<number>} - Number of affected rows
     * @throws {Error} - If validation fails
     */
    async updateGrade(id, grade) {
        // Validate enrollment ID
        const numericId = Number(id);
        if (!Number.isInteger(numericId) || numericId <= 0) {
            throw new Error('Enrollment ID must be a positive integer');
        }

        // Validate grade
        if (grade === null || grade === undefined || grade === '') {
            throw new Error('Grade is required');
        }

        const numericGrade = Number(grade);
        if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
            throw new Error('Grade must be a number between 0 and 100');
        }

        // Check if enrollment exists
        const [rows] = await enrollmentsRepository.findById(numericId);
        if (rows.length === 0) {
            return 0; // Not found
        }

        // Update the grade
        const [result] = await enrollmentsRepository.updateGrade(numericId, numericGrade);
        return result.affectedRows;
    }

    /**
     * Delete an enrollment
     * @param {string|number} id - The enrollment ID
     * @returns {Promise<number>} - Number of affected rows
     * @throws {Error} - If ID is invalid
     */
    async deleteEnrollment(id) {
        // Validate ID
        const numericId = Number(id);
        if (!Number.isInteger(numericId) || numericId <= 0) {
            throw new Error('Id must be a positive integer');
        }

        const [result] = await enrollmentsRepository.deleteEnrollment(numericId);
        return result.affectedRows;
    }

    /**
     * Get statistics for a student's enrollments
     * @param {string|number} studentId - The student's user ID
     * @returns {Promise<Object>} - Statistics object
     * @throws {Error} - If student ID is invalid
     */
    async getStudentStatistics(studentId) {
        // Validate student ID
        const numericId = Number(studentId);
        if (!Number.isInteger(numericId) || numericId <= 0) {
            throw new Error('Student ID must be a positive integer');
        }

        const [rows] = await enrollmentsRepository.getStudentStatistics(numericId);
        return rows[0] || null;
    }
}

// Export a singleton instance of the EnrollmentsService class
export default new EnrollmentsService();
