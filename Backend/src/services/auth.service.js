// Import hashing helper to verify passwords securely
import bcrypt from 'bcryptjs';
// Import JWT library to sign authentication tokens
import jwt from 'jsonwebtoken';
// Import repository to fetch user data
import usersRepository from '../repositories/users.repository.js';
// Import centralized JWT configuration
import jwtConfig from '../config/jwt.config.js';

/**
 * SERVICE LAYER - AUTHENTICATION
 * Handles business logic for authenticating users and issuing JWT tokens.
 * Responsibilities:
 * - Validate the incoming credentials.
 * - Fetch the user with the stored password hash.
 * - Compare the provided password with the stored hash.
 * - Emit a signed JWT token with minimal user information.
 */
class AuthService {
    /**
     * Authenticate a user with email and password.
     * @param {string} email - User email address.
     * @param {string} password - Plain text password supplied by the client.
     * @returns {Promise<{token: string, user: Object}>} - Signed token and safe user payload.
     * @throws {Error} - When required data is missing or validation fails.
     */
    async login(email, password) {
        // Basic validation to avoid hitting the database with bad input
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        // Retrieve the user along with their password hash
        const [rows] = await usersRepository.findWithPasswordByEmail(email);
        const userRecord = rows[0];
        const hashedPassword = userRecord ? (userRecord.password_hash || userRecord.password) : null;

        // If user does not exist or has no stored hash, treat as invalid credentials
        if (!userRecord || !hashedPassword) {
            return null;
        }

        // Compare the supplied password with the stored hash (timing safe)
        const passwordMatches = await bcrypt.compare(password, hashedPassword);
        if (!passwordMatches) {
            return null;
        }

        // Prepare token payload with only the required data
        const payload = {
            sub: userRecord.id,
            email: userRecord.email,
            role: userRecord.role
        };

        // Sign JWT token using centralized configuration
        const token = jwt.sign(payload, jwtConfig.secret, {
            expiresIn: jwtConfig.expiresIn,
            issuer: jwtConfig.issuer
        });

        // Remove sensitive data before returning the user object
        const { password_hash, password: _password, ...safeUser } = userRecord;

        return {
            token,
            user: safeUser
        };
    }

    /**
     * Get user information by ID.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<Object|null>} - Safe user payload without sensitive data.
     */
    async getMe(userId) {
        // Fetch the user by ID
        const [rows] = await usersRepository.findById(userId);
        const userRecord = rows[0];

        // Return null if user doesn't exist
        if (!userRecord) {
            return null;
        }

        // Return the user (repository already excludes password_hash)
        return userRecord;
    }
}

// Export a singleton instance of the AuthService class
export default new AuthService();
