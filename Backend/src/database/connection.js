import 'dotenv/config';

import mysql from 'mysql2/promise';


class Database {
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }

        // Create a connection pool to the MySQL database
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',              // Database server address
            port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306, // Database port
            user: process.env.DB_USER || '',                       // Database username
            password: process.env.DB_PASSWORD || '',               // Database password
            database: process.env.DB_DATABASE || '',               // Database name
            waitForConnections: true,                              // Wait for available connection if pool is full
            connectionLimit: 10                                    // Maximum number of connections in the pool
        });

        Database.instance = this;
    }

    /**
     * @param {string} sql - SQL query string
     * @param {Array} params - Query parameters
     * @returns {Promise} - Query result
     */
    async execute(sql, params = []) {
        return await this.pool.execute(sql, params);
    }

    /**
     * @returns {Pool} - MySQL connection pool
     */
    getPool() {
        return this.pool;
    }
}

const db = new Database();
export default db;