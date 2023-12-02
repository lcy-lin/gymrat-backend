import config from '../config.js';
class WeightModel {
    static async insertWeight(user_id, weight, created_at) {
        try {
            const sql = `INSERT INTO daily_weight (user_id, weight, created_at) VALUES (?, ?, ?)`;
            const [rows] = await config.db.query(sql, [user_id, weight, created_at]);
            return { success: true, id: rows.insertId };
        }
        catch (error) {
            console.error('Error inserting weight:', error);
            return { success: false, error: 'Internal Server Error' };
        }
    }

}
export default WeightModel;