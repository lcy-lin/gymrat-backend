import check from "../utils/check.js";
import BodyModel from "../models/BodyModel.js";

class BodyController {
    static async createBody(req, res) {
        const authRes = check.authenticateToken(req.headers);
        if (authRes.status !== 200) {
            return res.status(authRes.status).json({ error: authRes.error });
        }
        try {
            const {user_id, height, age, sex, act_level} = req.body.data;
            if (user_id == null || height == null || age == null || sex == null || act_level == null) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const bodyRes = await BodyModel.insertBody(user_id, height, age, sex, act_level);
            if(bodyRes.success === false){
                throw new Error(bodyRes.error);
            }
            return res.status(200).json({
                data:{
                    daily_weight: {
                        id: bodyRes.id,
                    }
                }
            });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async getBody(req, res) {
    }
}
export default BodyController;