// Import the database connection pool
import db from '../database/connection.js';

/**
 * REPOSITORY LAYER - COURSES
 * The repository layer is responsible for direct database operations.
 * It contains only SQL queries and database interactions - NO business logic.
 * Think of it as the "data access layer" that talks to the database.
 */
class CoursesRepository {
    /**
     * Retrieve all courses from the database
     * @returns {Promise} - Returns a promise with all course records
     */
    async findAll() {
        const sql = 'SELECT * FROM courses';
        return await db.execute(sql);
    }

    /**
     * Retrieve a single course by its ID
     * @param {number} id - The course ID to search for
     * @returns {Promise} - Returns a promise with the course record or empty array
     */
    async findById(id) {
        const sql = 'SELECT * FROM courses WHERE id = ?';
        return await db.execute(sql, [id]);
    }

    /**
     * Create a new course in the database
     * @param {string} code - The course code (e.g., "CS101")
     * @param {string} name - The course name (e.g., "Introduction to Programming")
     * @param {number} credits - The number of credits (default: 3)
     * @returns {Promise} - Returns a promise with the insert result
     */
    async create(code, name, credits) {
        const sql = 'INSERT INTO courses (code, name, credits) VALUES (?, ?, ?)';
        return await db.execute(sql, [code, name, credits]);
    }

    /**
     * Update an existing course in the database
     * @param {number} id - The course ID to update
     * @param {string} code - The updated course code
     * @param {string} name - The updated course name
     * @param {number} credits - The updated number of credits
     * @returns {Promise} - Returns a promise with the update result
     */
    async update(id, code, name, credits) {
        const sql = 'UPDATE courses SET code = ?, name = ?, credits = ? WHERE id = ?';
        return await db.execute(sql, [code, name, credits, id]);
    }

    /**
     * Delete a course from the database
     * @param {number} id - The course ID to delete
     * @returns {Promise} - Returns a promise with the delete result
     */
    async deleteCourse(id) {
        const sql = 'DELETE FROM courses WHERE id = ?';
        return await db.execute(sql, [id]);
    }
    async countAll() {
  const [rows] = await db.execute("SELECT COUNT(*) AS count FROM courses");
  return rows[0].count;
}
    async countByTeacher(teacherId) {
  const [rows] = await db.execute(
    "SELECT COUNT(*) AS count FROM courses WHERE teacher_id = ?",
    [teacherId]
  );
  return rows[0].count;
}   
}

// Export a singleton instance of the CoursesRepository class
export default new CoursesRepository();