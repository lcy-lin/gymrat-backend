import check from '../utils/check.js';
import WeightModel from '../models/WeightModel.js';

class WeightController {
    static async createWeight(req, res) {
        const authRes = check.authenticateToken(req.headers);
        if (authRes.status !== 200) {
            return res.status(authRes.status).json({ error: authRes.error });
        }
        try {
            const {user_id, weight, created_at} = req.body.data;
            if (user_id == null || weight == null || created_at == null) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const dailyWeightRes = await WeightModel.insertWeight(user_id, weight, created_at);
            if(dailyWeightRes.success === false){
                throw new Error(dailyWeightRes.error);
            }
            return res.status(200).json({
                data:{
                    daily_weight: {
                        id: dailyWeightRes.id,
                    }
                }
            });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async getWeight(req, res) {
        try{
            const authRes = check.authenticateToken(req.headers);
            if (authRes.status !== 200) {
                return res.status(authRes.status).json({ error: authRes.error });
            }
            const {user_id, start_date, end_date} = req.query;
            if (user_id == null || start_date == null || end_date == null) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const dailyWeightRes = await WeightModel.getWeight(user_id, start_date, end_date);
            if(dailyWeightRes.success === false){
                throw new Error(dailyWeightRes.error);
            }
            return res.status(200).json({ data: dailyWeightRes.daily_weight });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async putWeight(req, res) {
        try {
            const authRes = check.authenticateToken(req.headers);
            if (authRes.status !== 200) {
                return res.status(authRes.status).json({ error: authRes.error });
            }
            const {weight} = req.body.data;
            const {weightid} = req.params;
            if (weight == null || weightid == null) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const dailyWeightRes = await WeightModel.updateWeight(weight, Number(weightid));
            if(dailyWeightRes.success === false){
                throw new Error(dailyWeightRes.error);
            }
            return res.status(200).json({ data: {daily_weight: {id: weightid} }});
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
export default WeightController;