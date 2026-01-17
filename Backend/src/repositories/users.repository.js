// Import the database connection pool
import db from '../database/connection.js';


/**
 * REPOSITORY LAYER - USERS
 * The repository layer is responsible for direct database operations.
 * It contains only SQL queries and database interactions - NO business logic.
 * Think of it as the "data access layer" that talks to the database.
 */
class UsersRepository {
    /**
     * Retrieve all users from the database
     * @returns {Promise} - Returns a promise with all user records
     */
    async findAll() {
        const sql = 'SELECT id, email, full_name, role, avatar_url, created_at, updated_at FROM users';
        return await db.execute(sql);
    }

    /**
     * Retrieve a single user by their ID
     * @param {number} id - The user ID to search for
     * @returns {Promise} - Returns a promise with the user record or empty array
     */
    async findById(id) {
        const sql = 'SELECT id, email, full_name, role, avatar_url, created_at, updated_at FROM users WHERE id = ?';
        return await db.execute(sql, [id]);
    }

    /**
     * Delete a user from the database
     * @param {number} id - The user ID to delete
     * @returns {Promise} - Returns a promise with the delete result
     */
    async deleteUser(id) {
        const sql = 'DELETE FROM users WHERE id = ?';
        return await db.execute(sql, [id]);
    }

    /**
     * Retrieve a single user by email including the password hash.
     * This is only used during authentication and should never be exposed elsewhere.
     * @param {string} email - Email used to identify the user.
     * @returns {Promise} - Returns the user row with sensitive columns.
     * NOTE: The users table must store the hashed password in a column named password_hash.
     */
    async findWithPasswordByEmail(email) {
        const sql = `
            SELECT id, email, password AS password_hash, full_name, role, avatar_url
            FROM users
            WHERE email = ?
            LIMIT 1
        `;
        return await db.execute(sql, [email]);
    }

    /**
     * Create a new user record in the database.
     * @param {Object} userData - Properties to insert
     * @param {string} userData.email
     * @param {string} userData.passwordHash
     * @param {string} userData.fullName
     * @param {string} userData.role
     * @param {string|null} userData.avatarUrl
     * @returns {Promise} - Insert result containing the new id
     */
    async createUser({ email, passwordHash, fullName, role, avatarUrl }) {
        console.log(`Role being sent: "${role}"`);

        const sql = `
            INSERT INTO users (email, password , full_name, role, avatar_url)
            VALUES (?, ?, ?, ?, ?)
        `;
        return await db.execute(sql, [email, passwordHash, fullName, role, avatarUrl ?? null]);
    }
    async countAll() {
  const [rows] = await db.execute("SELECT COUNT(*) AS count FROM users");
  return rows[0].count;
}

}


// Export a singleton instance of the UsersRepository class
export default new UsersRepository();
