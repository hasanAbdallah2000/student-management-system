// Import the users repository for database operations
import usersRepository from '../repositories/users.repository.js';
import bcrypt from 'bcryptjs';

/**
 * SERVICE LAYER - USERS
 * The service layer contains business logic and validation rules.
 * It sits between the controller and repository layers.
 * - Validates data before sending it to the database
 * - Transforms data if needed
 * - Contains business rules
 * - Does NOT handle HTTP requests/responses (that's the controller's job)
 */
class UsersService {
    /**
     * Get all users
     * @returns {Promise<Array>} - Array of all users
     */
    async getAllUsers() {
        // Call repository to get data from database
        // db.execute() returns [rows, fields], we only need rows
        const [users] = await usersRepository.findAll();
        return users;
    }

    /**
     * Get a single user by ID
     * @param {number} id - The user ID
     * @returns {Promise<Object|null>} - User object or null if not found
     * @throws {Error} - If ID is invalid
     */
    async getUserById(id) {
        // Validation: ID must be a positive integer
        if (id < 1) {
            throw new Error('Id must be a positive integer');
        }
        
        // Retrieve user from database
        const [user] = await usersRepository.findById(id);
        
        // Return the first user or null if not found
        return user.length > 0 ? user[0] : null;
    }

    /**
     * Delete a user
     * @param {number} id - The user ID to delete
     * @returns {Promise<number>} - Number of rows affected (0 or 1)
     * @throws {Error} - If ID is invalid
     */
    async deleteUser(id) {
        // Validation: ID must be a positive integer
        if (id < 1) {
            throw new Error('Id must be a positive integer');
        }
        
        // Delete user from database
        const [result] = await usersRepository.deleteUser(id);
        
        // Return number of rows affected (0 if not found, 1 if deleted)
        return result.affectedRows;
    }

    /**
     * Create a new user (admin or student).
     * @param {Object} userData
     * @param {string} userData.email
     * @param {string} userData.password
     * @param {string} userData.fullName
     * @param {'admin'|'student'|'instructor'} userData.role
     * @param {string|null} userData.avatarUrl
     * @returns {Promise<number>} - New user's id
     * @throws {Error} - On invalid input
     */
    async createUser({ email, password, fullName, role, avatarUrl = null }) {
        if (!email || !password || !fullName || !role) {
            throw new Error('Email, password, full name, and role are required');
        }

        const allowedRoles = ['admin', 'student', 'teacher'];
        if (!allowedRoles.includes(role)) {
            throw new Error('Invalid role provided');
        }

        // Hash the password before storing it
        const passwordHash = await bcrypt.hash(password, 10);

        try {
            const [result] = await usersRepository.createUser({
                email,
                passwordHash,
                fullName,
                role,
                avatarUrl
            });

            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('A user with this email already exists');
            }
            throw error;
        }
    }
}

// Export a singleton instance of the UsersService class
export default new UsersService();
