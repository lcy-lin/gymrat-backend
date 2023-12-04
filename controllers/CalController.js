import check from "../utils/check.js";
import CalModel from "../models/CalModel.js";
class CalController {
    static async createFood(req, res) {
        try {
            const authRes = check.authenticateToken(req.headers);
            if (authRes.status !== 200) {
                return res.status(authRes.status).json({ error: authRes.error });
            }
            const { user_id, description, meal_type, date } = req.body.data;
            if (user_id == null || description == null || meal_type == null || date == null) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const foodDataRes = await CalModel.getFoodData(description);
            if (foodDataRes.success === false) {
                throw new Error(foodDataRes.error);
            }
            
            const {data} = foodDataRes;
            const insertRes = await CalModel.insertFood(user_id, meal_type, date, data);
            if (insertRes.success === false) {
                throw new Error(insertRes.error);
            }
            return res.status(200).json({
                data: insertRes.data
            });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async getFood(req, res) {
        try{
            const authRes = check.authenticateToken(req.headers);
            if (authRes.status !== 200) {
                return res.status(authRes.status).json({ error: authRes.error });
            }
            const {user_id, start_date, end_date} = req.query;
            if (user_id == null || start_date == null || end_date == null) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const dailyCalsRes = await CalModel.getFood(user_id, start_date, end_date);
            if(dailyCalsRes.success === false){
                throw new Error(dailyWeightRes.error);
            }
            return res.status(200).json({ data: dailyCalsRes.daily_cals });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
export default CalController;