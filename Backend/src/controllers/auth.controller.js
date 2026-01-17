// Import the authentication service that carries the business logic
import authService from '../services/auth.service.js';

/**
 * CONTROLLER LAYER - AUTHENTICATION
 * Translates HTTP requests into service calls and shapes the responses.
 * Responsibilities:
 * - Validate incoming payloads at a high level.
 * - Delegate credential verification to the service layer.
 * - Handle error mapping to appropriate HTTP status codes.
 */
class AuthController {
    /**
     * Handle user login attempts.
     * Route: POST /auth/login
     */
    async login(req, res) {
        try {
            console.log('LOGIN BODY :' , req.body);
            const { email, password } = req.body;

            // Delegate authentication to the service layer
            const authResult = await authService.login(email, password);

            // Return 401 for invalid credentials to avoid leaking details
            if (!authResult) {
                return res.status(401).json({
                    error: 'Invalid email or password'
                });
            }

            // Successful login returns token and safe user payload
            return res.status(200).json({
                message: 'Login successful',
                token: authResult.token,
                user: authResult.user
            });
        } catch (error) {
            console.error(error);

            // Handle known validation errors
            if (error.message === 'Email and password are required') {
                return res.status(400).json({ error: error.message });
            }

            // Fallback for unexpected errors
            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }

    /**
     * Get current authenticated user information.
     * Route: GET /auth/me
     */
    async getMe(req, res) {
        try {
            // req.user is set by the authenticate middleware
            const userId = req.user.id;

            // Delegate to the service layer to fetch user details
            const user = await authService.getMe(userId);

            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            return res.status(200).json({
                user
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }
}

// Export a singleton instance of the AuthController class
export default new AuthController();
