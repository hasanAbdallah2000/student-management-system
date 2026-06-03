import 'dotenv/config';


 
class JwtConfig {
    constructor() {
        this.secret = process.env.JWT_SECRET || 'change-me-in-prod';
        this.expiresIn = process.env.JWT_EXPIRES_IN || '1h';
        this.issuer = process.env.JWT_ISSUER || 'uni-backend';
    }
}

export default new JwtConfig();
