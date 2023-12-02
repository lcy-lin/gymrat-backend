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
                     WHERE user_id = ? AND created_at BETWEEN ? AND ? AND soft_delete = 0`;
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
    static async updateWeight(weight, weightid) {
        try {
            const sql = `UPDATE daily_weight SET weight = ? WHERE id = ?`;
            await config.db.query(sql, [weight, weightid]);
            return { success: true };
        }
        catch (error) {
            console.error('Error updating weight:', error);
            return { success: false, error: 'Internal Server Error' };
        }
    }
    static async deleteWeight(weightid) {
        try {
            const sql = `UPDATE daily_weight SET soft_delete = 1 WHERE id = ?`;
            await config.db.query(sql, [weightid]);
            return { success: true };
        }
        catch (error) {
            console.error('Error deleting weight:', error);
            return { success: false, error: 'Internal Server Error' };
        }
    }
}
export default WeightModel;