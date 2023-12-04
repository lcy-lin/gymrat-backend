import axios from "axios";
import config from "../config.js";

class CalModel {
    static async getFoodData(description) {
        try{
            const response = await axios.get(`https://api.calorieninjas.com/v1/nutrition?query=${description}`, {
                headers: {
                    'x-api-key': process.env.CALORIES_NINJA_API_KEY,
                },
            });
            return { success: true, data: response.data.items };
        }
        catch {
            return { success: false, error: 'Internal Server Error' };
        }   
    }
    static queries = {
        calories: {
            calculateQuery: `
                SELECT SUM(calories) AS total
                FROM food
                WHERE daily_cals_id = ?;
            `,
            updateQuery: `
                UPDATE daily_cals
                SET calories = ?
                WHERE id = ?;
            `,
        },
        carbs: {
            calculateQuery: `
                SELECT SUM(carbs) AS total
                FROM food
                WHERE daily_cals_id = ?;
            `,
            updateQuery: `
                UPDATE daily_cals
                SET carbs = ?
                WHERE id = ?;
            `,
        },
        protein: {
            calculateQuery: `
                SELECT SUM(protein) AS total
                FROM food
                WHERE daily_cals_id = ?;
            `,
            updateQuery: `
                UPDATE daily_cals
                SET protein = ?
                WHERE id = ?;
            `,
        },
        fat: {
            calculateQuery: `
                SELECT SUM(fat) AS total
                FROM food
                WHERE daily_cals_id = ?;
            `,
            updateQuery: `
                UPDATE daily_cals
                SET fat = ?
                WHERE id = ?;
            `,
        },
    }
    static async updateDailyTotal(calculateQuery, updateQuery, dailyCalsId) {
        try {
            const [result] = await config.db.query(calculateQuery, [dailyCalsId]);
            const totalResult = result[0].total || 0;    
            await config.db.query(updateQuery, [totalResult, dailyCalsId]);
    
            return { success: true };
        } catch (error) {
            console.error('Error updating daily calories:', error);
            return { success: false, error: 'Internal Server Error' };
        }
    }
    static async insertFood(user_id, meal_type, date, data) {
        try {
            const insertFoodQuery = `
                INSERT INTO food (daily_cals_id, name, meal_type, calories, carbs, protein, fat, servings)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            `;
    
            const dailyCalsIdQuery = `
                SELECT id
                FROM daily_cals
                WHERE user_id = ? AND date = ?;
            `;
    
            const [dailyCalsIdRows] = await config.db.query(dailyCalsIdQuery, [user_id, date]);
    
            let dailyCalsId;

            if (!dailyCalsIdRows.length) {
                const insertDailyCalsQuery = `
                    INSERT INTO daily_cals (user_id, calories, date)
                    VALUES (?, 0, ?);
                `;
                const [insertResult] = await config.db.query(insertDailyCalsQuery, [user_id, date]);
                dailyCalsId = insertResult.insertId;
            } else {
                dailyCalsId = dailyCalsIdRows[0].id;
            }
            let result = [];
            for (const item of data) {
                const { name, calories, carbohydrates_total_g, protein_g, fat_total_g, serving_size_g } = item;
                await config.db.query(insertFoodQuery, [dailyCalsId, name, meal_type, calories, carbohydrates_total_g, protein_g, fat_total_g, serving_size_g]);
                result.push({ name, calories, carbs: carbohydrates_total_g, protein: protein_g, fat: fat_total_g, servings: serving_size_g });
            }
            await this.updateDailyTotal(this.queries.calories.calculateQuery, this.queries.calories.updateQuery, dailyCalsId);
            await this.updateDailyTotal(this.queries.carbs.calculateQuery, this.queries.carbs.updateQuery, dailyCalsId);
            await this.updateDailyTotal(this.queries.protein.calculateQuery, this.queries.protein.updateQuery, dailyCalsId);
            await this.updateDailyTotal(this.queries.fat.calculateQuery, this.queries.fat.updateQuery, dailyCalsId);
            
            return { success: true, data: result };
        } catch (error) {
            console.error('Error inserting food:', error);
            return { success: false, error: 'Internal Server Error' };
        }
    }
    static async getFood(user_id, start_date, end_date) {
        try {
            const sql = `SELECT id, calories, fat, protein, carbs, DATE_FORMAT(date, '%Y-%m-%d') AS date
                        FROM daily_cals WHERE user_id = ? AND date BETWEEN ? AND ? AND soft_delete = 0`;
            const [rows] = await config.db.query(sql, [user_id, start_date, end_date]);
            const transformedData = rows.map(row => ({
                id: row.id,
                calories: row.calories,
                fat: row.fat,
                protein: row.protein,
                carbs: row.carbs,
                date: row.date,
            }));
            const foodQuery = `
                SELECT id, name, meal_type, calories, carbs, protein, fat, servings
                FROM food
                WHERE daily_cals_id = ?;
            `;
            for (const dailyCals of transformedData) {
                const [foodRows] = await config.db.query(foodQuery, [dailyCals.id]);
                const transformedFoodRows = foodRows.map(row => ({
                    id: row.id,
                    name: row.name,
                    meal_type: row.meal_type,
                    calories: row.calories,
                    carbs: row.carbs,
                    protein: row.protein,
                    fat: row.fat,
                    servings: row.servings,
                }));
                dailyCals.food = transformedFoodRows;
            }
            return {daily_cals: transformedData};
        }
        catch (error) {
            return { success: false, error: 'Internal Server Error' };
        }
    }
}
export default CalModel;