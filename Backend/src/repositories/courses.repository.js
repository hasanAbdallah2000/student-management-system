import db from '../database/connection.js';


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

async countEnrollmentsByCourseId(courseId) {
    const [rows] = await db.execute(
      "SELECT COUNT(*) AS count FROM enrollments WHERE course_id = ?",
      [courseId]
    );
    return rows[0].count;
  }
}

export default new CoursesRepository();