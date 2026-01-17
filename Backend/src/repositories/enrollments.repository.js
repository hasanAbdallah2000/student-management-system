// Import the database connection pool
import db from '../database/connection.js';


/**
 * REPOSITORY LAYER - ENROLLMENTS
 * Handles all database operations for enrollments.
 * Contains only SQL queries - NO business logic.
 */
class EnrollmentsRepository {
    /**
     * Get all enrollments with student and course details
     * @returns {Promise} - Returns all enrollments with joined user and course data
     */
    async findAll() {
        const sql = `
            SELECT 
                e.id,
                e.student_id,
                e.course_id,
                e.enrolled_at,
                e.grade,
                e.created_at,
                e.updated_at,
                u.email as student_email,
                u.full_name as student_name,
                c.code as course_code,
                c.name as course_name,
                c.credits as course_credits
            FROM enrollments e
            INNER JOIN users u ON e.student_id = u.id
            INNER JOIN courses c ON e.course_id = c.id
            ORDER BY e.created_at DESC
        `;
        return await db.execute(sql);
    }

    /**
     * Get a single enrollment by ID
     * @param {number} id - The enrollment ID
     * @returns {Promise} - Returns the enrollment with student and course details
     */
    async findById(id) {
        const sql = `
            SELECT 
                e.id,
                e.student_id,
                e.course_id,
                e.enrolled_at,
                e.grade,
                e.created_at,
                e.updated_at,
                u.email as student_email,
                u.full_name as student_name,
                c.code as course_code,
                c.name as course_name,
                c.credits as course_credits
            FROM enrollments e
            INNER JOIN users u ON e.student_id = u.id
            INNER JOIN courses c ON e.course_id = c.id
            WHERE e.id = ?
        `;
        return await db.execute(sql, [id]);
    }

    /**
     * Get all enrollments for a specific student
     * @param {number} studentId - The student's user ID
     * @returns {Promise} - Returns all enrollments for the student
     */
    async findByStudentId(studentId) {
        const sql = `
            SELECT 
                e.id,
                e.student_id,
                e.course_id,
                e.enrolled_at,
                e.grade,
                e.created_at,
                e.updated_at,
                c.code as course_code,
                c.name as course_name,
                c.credits as course_credits
            FROM enrollments e
            INNER JOIN courses c ON e.course_id = c.id
            WHERE e.student_id = ?
            ORDER BY e.enrolled_at DESC
        `;
        return await db.execute(sql, [studentId]);
    }

    /**
     * Get all enrollments for a specific course
     * @param {number} courseId - The course ID
     * @returns {Promise} - Returns all students enrolled in the course
     */
    async findByCourseId(courseId) {
        const sql = `
            SELECT 
                e.id,
                e.student_id,
                e.course_id,
                e.enrolled_at,
                e.grade,
                e.created_at,
                e.updated_at,
                u.email as student_email,
                u.full_name as student_name,
            FROM enrollments e
            INNER JOIN users u ON e.student_id = u.id
            WHERE e.course_id = ?
            ORDER BY u.full_name ASC
        `;
        return await db.execute(sql, [courseId]);
    }

    /**
     * Check if an enrollment already exists
     * @param {number} studentId - The student's user ID
     * @param {number} courseId - The course ID
     * @returns {Promise} - Returns the enrollment if it exists
     */
    async findByStudentAndCourse(studentId, courseId) {
        const sql = `
            SELECT id, student_id, course_id, enrolled_at, grade
            FROM enrollments
            WHERE student_id = ? AND course_id = ?
        `;
        return await db.execute(sql, [studentId, courseId]);
    }

    /**
     * Create a new enrollment
     * @param {Object} enrollmentData
     * @param {number} enrollmentData.studentId - The student's user ID
     * @param {number} enrollmentData.courseId - The course ID
     * @param {string} [enrollmentData.enrolledAt] - Optional enrollment date (defaults to today)
     * @returns {Promise} - Insert result containing the new enrollment ID
     */
    async createEnrollment({ studentId, courseId, enrolledAt }) {
        const sql = `
            INSERT INTO enrollments (student_id, course_id, enrolled_at)
            VALUES (?, ?, ?)
        `;
        const enrollDate = enrolledAt || new Date().toISOString().split('T')[0];
        return await db.execute(sql, [studentId, courseId, enrollDate]);
    }
    async countByTeacher(teacherId) {
        const [rows] = await db.execute(
     `SELECT COUNT(*) AS count
     FROM enrollments e
     INNER JOIN courses c ON e.course_id = c.id
     WHERE c.teacher_id = ?`,
    [teacherId]
  );
  return rows[0].count;
}


    /**
     * Update the grade for an enrollment
     * @param {number} id - The enrollment ID
     * @param {number} grade - The grade to assign (can be decimal)
     * @returns {Promise} - Update result with affected rows
     */
    async updateGrade(id, grade) {
        const sql = `
            UPDATE enrollments
            SET grade = ?
            WHERE id = ?
        `;
        return await db.execute(sql, [grade, id]);
    }

    /**
     * Delete an enrollment
     * @param {number} id - The enrollment ID to delete
     * @returns {Promise} - Delete result with affected rows
     */
    async deleteEnrollment(id) {
        const sql = 'DELETE FROM enrollments WHERE id = ?';
        return await db.execute(sql, [id]);
    }

    /**
     * Get student's grade statistics
     * @param {number} studentId - The student's user ID
     * @returns {Promise} - Returns statistics like average grade, total credits, etc.
     */
    async getStudentStatistics(studentId) {
        const sql = `
            SELECT 
                COUNT(*) as total_enrollments,
                COUNT(e.grade) as graded_courses,
                COALESCE(AVG(e.grade), 0) as average_grade,
                COALESCE(SUM(c.credits), 0) as total_credits
            FROM enrollments e
            INNER JOIN courses c ON e.course_id = c.id
            WHERE e.student_id = ?
        `;
        return await db.execute(sql, [studentId]);
    }
    async countAll() {
  const [rows] = await db.execute("SELECT COUNT(*) AS count FROM enrollments");
  return rows[0].count;
}

    async countByStudent(studentId) {
  const [rows] = await db.execute(
    "SELECT COUNT(*) AS count FROM enrollments WHERE student_id = ?",
    [studentId]
  );
  return rows[0].count;
}

async countCoursesByStudent(studentId) {
  const [rows] = await db.execute(
    "SELECT COUNT(DISTINCT course_id) AS count FROM enrollments WHERE student_id = ?",
    [studentId]
  );
  return rows[0].count;
}

}

// Export a singleton instance of the EnrollmentsRepository class
export default new EnrollmentsRepository();
