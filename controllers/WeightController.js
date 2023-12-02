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

    
}
export default WeightController;