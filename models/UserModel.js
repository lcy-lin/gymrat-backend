import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';
class UserModel {
    static async checkEmail(email){
        const [checkEmailResults] = await config.db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (checkEmailResults.length > 0) {
            return false;
        }
        return true;
    };
    static async insertUser(email, name, password, picture){
        const hashPassword = await bcrypt.hash(password, 12);
        const [insertResult] = await config.db.query(
            'INSERT INTO users (email, name, password, picture) VALUES (?, ?, ?, ?)',
            [email, name, hashPassword, picture]
        );
        return insertResult.insertId;
    }
    static async insertUserRole(userId, roleId){
        const [insertResult] = await config.db.query(
            'INSERT INTO users_roles (user_id, role_id) VALUES (?, ?)',
            [userId, roleId]
        );
        return insertResult.insertId;
    }
    static async generateAccessToken(userData) {
        return jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    } 
}
export default UserModel;