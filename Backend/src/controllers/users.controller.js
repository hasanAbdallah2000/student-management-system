// Import the users service for business logic
import usersService from '../services/users.service.js';

/**
 * CONTROLLER LAYER - USERS
 * The controller layer handles HTTP requests and responses.
 * - Receives requests from routes
 * - Calls the service layer to perform operations
 * - Handles errors and sends appropriate HTTP responses
 * - Does NOT contain business logic or database queries
 */
class UsersController {
    /**
     * Get all users
     * Handles GET /users
     */
    async getAllUsers(req, res) {
        try {
            // Call service to get all users
            const users = await usersService.getAllUsers();
            
            // Check if any users were found
            if (users.length < 1) {
                return res.status(404).json({
                    error: 'No users found in the database.'
                });
            }
            
            // Return success response with users data
            return res.status(200).json({ users });
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
     * Get a single user by ID
     * Handles GET /users/:id
     */
    async getUserById(req, res) {
        try {
            // Extract ID from URL parameters
            const { id } = req.params;
            
            // Call service to get user by ID
            const user = await usersService.getUserById(id);

            // Check if user was found
            if (!user) {
                return res.status(404).json({
                    error: `User with id ${id} is not found`
                });
            }

            // Return success response with user data
            return res.status(200).json({ user });
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
     * Delete a user
     * Handles DELETE /users/:id
     */
    async destroyUserById(req, res) {
        try {
            // Extract ID from URL parameters
            const { id } = req.params;
            
            // Call service to delete user
            const affectedRows = await usersService.deleteUser(id);

            // Check if user was found and deleted
            if (affectedRows === 0) {
                return res.status(404).json({
                    error: `User with id ${id} is not found`
                });
            }

            // Return success response
            return res.status(200).json({
                message: `User with id ${id} was successfully deleted`
            });
        } catch (error) {
            console.error(error);
            
            // Handle validation errors
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
     * Create a new user (admin or student)
     * Handles POST /users
     */
    async createUser(req, res) {
        try {
            const { email, password, fullName, role, avatarUrl } = req.body;

            // Delegate to service to perform validation and creation
            const newUserId = await usersService.createUser({
                email,
                password,
                fullName,
                role,
                avatarUrl
            });

            return res.status(201).json({
                message: 'User created successfully',
                userId: newUserId
            });
        } catch (error) {
            console.error(error);

            if (error.message === 'Email, password, full name, and role are required') {
                return res.status(400).json({ error: error.message });
            }

            if (error.message === 'Invalid role provided') {
                return res.status(400).json({ error: error.message });
            }

            if (error.message === 'A user with this email already exists') {
                return res.status(409).json({ error: error.message });
            }

            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }
}

// Export a singleton instance of the UsersController class
export default new UsersController();
