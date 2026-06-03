import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.config.js';

class AuthMiddleware {

    authenticate(req, res, next) {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            return res.status(401).json({ error: 'Authorization token is required' });
        }

        try {
            const payload = jwt.verify(token, jwtConfig.secret, {
                issuer: jwtConfig.issuer
            });

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


    authorizeRoles(...allowedRoles) {
        return (req, res, next) => {
            if (allowedRoles.length === 0) {
                return next();
            }

            if (!req.user || !req.user.role) {
                return res.status(403).json({ error: 'Forbidden: user role missing' });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
            }

            return next();
        };
    }
}

const middleware = new AuthMiddleware();

export const authenticate = middleware.authenticate.bind(middleware);
export const authorizeRoles = middleware.authorizeRoles.bind(middleware);
