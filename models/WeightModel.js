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
    static async getWeight(user_id, start_date, end_date) {
        try {
            const sql = `SELECT id, weight, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS formatted_created_at 
                     FROM daily_weight 
                     WHERE user_id = ? AND created_at BETWEEN ? AND ?`;
            const [rows] = await config.db.query(sql, [user_id, start_date, end_date]);
            const transformedData = rows.map(row => ({
                id: row.id,
                weight: row.weight,
                created_at: row.formatted_created_at
            }));

            return {daily_weight: transformedData};
        }
        catch (error) {
            return { success: false, error: 'Internal Server Error' };
        }
    }

}
export default WeightModel;