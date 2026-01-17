// Load environment variables so JWT settings can be controlled per environment
import 'dotenv/config';

/**
 * JWT CONFIGURATION CLASS
 * Centralizes token-related constants to avoid scattering magic values.
 * - secret: Used to sign and verify tokens (must stay private).
 * - expiresIn: How long a token remains valid.
 * - issuer: Marks who generated the token to help future validation.
 */
class JwtConfig {
    constructor() {
        this.secret = process.env.JWT_SECRET || 'change-me-in-prod';
        this.expiresIn = process.env.JWT_EXPIRES_IN || '1h';
        this.issuer = process.env.JWT_ISSUER || 'uni-backend';
    }
}

export default new JwtConfig();
