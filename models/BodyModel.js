import config from "../config.js";
class BodyModel {
    static async insertBody (user_id, height, age, sex, act_level) {
        try {
            const sql = `INSERT INTO body_data (user_id, height, age, sex, act_level) VALUES (?, ?, ?, ?, ?)`;
            const [rows] = await config.db.query(sql, [user_id, height, age, sex, act_level]);
            return { success: true, id: rows.insertId };
        }
        catch (error) {
            console.error('Error inserting body data:', error);
            return { success: false, error: 'Internal Server Error' };
        }
    }
}
export default BodyModel;