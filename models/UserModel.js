import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import roleIdConverter from '../utils/roleIdConverter.js';
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
        return jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' });
    }
    static async getUserByEmail(email){
        const [rows] = await config.db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return null;
        }
        else {
            const [role] = await config.db.query('SELECT * FROM users_roles WHERE user_id = ? AND soft_delete = 0', [rows[0].id]);
            rows[0].roles = role.map(role => roleIdConverter(role.role_id));
            return rows[0];
        }
        
    }
    static async getUserById(id){
        const [rows] = await config.db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
            return null;
        }
        else {
            const [role] = await config.db.query('SELECT * FROM users_roles WHERE user_id = ? AND soft_delete = 0', [rows[0].id]);
            rows[0].roles = role.map(role => roleIdConverter(role.role_id));
            return rows[0];
        }
    }
    static async getCoachByKeyword(keyword){
        const sql = `
            SELECT id, name, picture
            FROM users
            WHERE name LIKE ? 
            AND id IN (SELECT user_id FROM users_roles WHERE role_id = 3 AND soft_delete = 0)
            `;
        const [rows] = await config.db.query(sql, [`%${keyword}%`]);
        if (rows.length === 0) {
            return null;
        }
        return rows;
    }
    static async updateCoach(id, coachId){
        try{
            const sql = `UPDATE users SET coach_id = ? WHERE id = ?`;
            await config.db.query(sql, [coachId, id]);
            
            return {success: true};
        }
        catch(error){
            return {success: true};
        }
        
    }
    
    static async updateRole(id, roles){
        try{
            const [existingRoles] = await config.db.query('SELECT * FROM users_roles WHERE user_id = ?', [id]);
            const existingRoleIds = existingRoles.map(role => role.role_id);
            await Promise.all(roles.map(async (role) => {
                if (existingRoleIds.includes(role)) {
                    await config.db.query('UPDATE users_roles SET soft_delete = 0 WHERE user_id = ? AND role_id = ?', [id, role]);
                }
                else {
                    await config.db.query('INSERT INTO users_roles (user_id, role_id) VALUES (?, ?)', [id, role]);
                }
            }));
            const rolesToDelete = existingRoleIds.filter((roleId) => !roles.includes(roleId));
            await Promise.all(rolesToDelete.map(async (role) => {
                await config.db.query('UPDATE users_roles SET soft_delete = 1 WHERE user_id = ? AND role_id = ?', [id, role]);
            }));
            return {success: true};
        }
        catch(error){
            return {success: true};
        }
    }
    static async verifyPassword(password, storedPassword) {
        return bcrypt.compare(password, storedPassword);
    }
}
export default UserModel;