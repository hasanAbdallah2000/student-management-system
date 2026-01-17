// Import JWT to validate tokens signed by our application
import jwt from 'jsonwebtoken';
// Centralized configuration that stores secret, expiry, issuer, etc.
import jwtConfig from '../config/jwt.config.js';

/**
 * MIDDLEWARE - AUTHENTICATION & AUTHORIZATION
 * These helpers are reused across routes to guard sensitive endpoints.
 * - authenticate: Verifies the JWT token and attaches the user to the request.
 * - authorizeRoles: Ensures the authenticated user has one of the allowed roles.
 */
class AuthMiddleware {
    /**
     * Validate JWT tokens found in the Authorization header.
     * Expected format: "Authorization: Bearer <token>"
     */
    authenticate(req, res, next) {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            return res.status(401).json({ error: 'Authorization token is required' });
        }

        try {
            // Verify the token signature and issuer
            const payload = jwt.verify(token, jwtConfig.secret, {
                issuer: jwtConfig.issuer
            });

            // Attach a simplified user object to the request for downstream handlers
            req.user = {
                id: payload.sub,
                email: payload.email,
                role: payload.role
            };

            return next();
        } catch (error) {
            console.error('JWT verification failed:', error.message);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    }

    /**
     * Authorize only specific roles to access a route.
     * Usage: router.post('/', authMiddleware.authenticate, authMiddleware.authorizeRoles('admin'), handler);
     */
    authorizeRoles(...allowedRoles) {
        return (req, res, next) => {
            // If no roles were provided, allow any authenticated user
            if (allowedRoles.length === 0) {
                return next();
            }

            // Ensure authenticate middleware ran beforehand
            if (!req.user || !req.user.role) {
                return res.status(403).json({ error: 'Forbidden: user role missing' });
            }

            // Check if the user's role is within the permitted list
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
            }

            return next();
        };
    }
}

// Create instance and export individual methods
const middleware = new AuthMiddleware();

export const authenticate = middleware.authenticate.bind(middleware);
export const authorizeRoles = middleware.authorizeRoles.bind(middleware);
