import config from "../config.js";

class BodyModel {
    static actLevels = {
        0: 1.2,
        1: 1.375,
        2: 1.55,
        3: 1.725,
        4: 1.9,
    }
    static async insertBody (user_id, height, age, sex, act_level) {
        try {
            const checkQuery = `SELECT * FROM body_data WHERE user_id = ?`;
            const [checkRows] = await config.db.query(checkQuery, [user_id]);
            if (checkRows.length > 0) {
                return { success: false, code: 409 ,  error: 'Body data already exists for this user' };
            }
            const sql = `INSERT INTO body_data (user_id, height, age, sex, act_level) VALUES (?, ?, ?, ?, ?)`;
            const [rows] = await config.db.query(sql, [user_id, height, age, sex, act_level]);
            return { success: true, id: rows.insertId };
        }
        catch (error) {
            console.error('Error inserting body data:', error);
            return { success: false, code:500, error: 'Internal Server Error' };
        }
    }
    static async getBody (id, weight) {
        try {
            const sql = `SELECT * FROM body_data WHERE user_id = ? AND soft_delete = 0`;
            const [row] = await config.db.query(sql, [id]);
            if (row.length === 0) {
                return { success: false, code: 404, error: 'Body data not found' };
            }
            let bmr = 0;
            row[0].sex === 'male' ? bmr = 66 + (13.7 * weight) + (5 * row[0].height) - (6.8 * row[0].age) : bmr = 655 + (9.6 * weight) + (1.8 * row[0].height) - (4.7 * row[0].age);
            const data = {
                id: row[0].id,
                height: row[0].height,
                weight: weight,
                age: row[0].age,
                sex: row[0].sex,
                act_level: row[0].act_level,
                bmr: bmr,
                tdee: bmr * this.actLevels[row[0].act_level],
            };

            return { success: true, data: data };
        }
        catch (error) {
            console.error('Error getting body data:', error);
            return { success: false, error: 'Internal Server Error' };
        }
    }

}
export default BodyModel;