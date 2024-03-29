import check from "../utils/check.js";
import BodyModel from "../models/BodyModel.js";
import WeightModel from "../models/WeightModel.js";

class BodyController {
    static async createBody(req, res) {
        const authRes = check.authenticateToken(req.headers);
        if (authRes.status !== 200) {
            return res.status(authRes.status).json({ error: authRes.error });
        }
        try {
            const {userid} = req.params;
            const {height, age, sex, act_level} = req.body.data;
            if (userid == null || height == null || age == null || sex == null || act_level == null) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const bodyRes = await BodyModel.insertBody(userid, height, age, sex, act_level);
            if(bodyRes.success === false && bodyRes.code === 409){
                return res.status(409).json({ error: bodyRes.error });
            }
            else if(bodyRes.success === false){
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
        try{
            const authRes = check.authenticateToken(req.headers);
            if (authRes.status !== 200) {
                return res.status(authRes.status).json({ error: authRes.error });
            }
            const {id} = req.params;
            if (id == null) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const weightRes = await WeightModel.getLatestWeight(id);
            if(weightRes.success === false && weightRes.code === 404){
                return res.status(404).json({ error: weightRes.error });
            }
            else if(weightRes.success === false){
                throw new Error(weightRes.error);
            }
            
            const bodyRes = await BodyModel.getBody(id, weightRes.data.weight);
            if(bodyRes.success === false && bodyRes.code === 404){
                return res.status(404).json({ error: bodyRes.error });
            }
            else if(bodyRes.success === false){
                throw new Error(bodyRes.error);
            }
            return res.status(200).json({ data: bodyRes.data });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async putBody(req, res) {
        try {
            const authRes = check.authenticateToken(req.headers);
            if (authRes.status !== 200) {
                return res.status(authRes.status).json({ error: authRes.error });
            }
            const {age, height, act_level, sex, weight} = req.body.data;
            const {id} = req.params;
            if (age == null || height == null || act_level == null || sex == null || id == null) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const updateRes = await BodyModel.updateBody(age, height, act_level, sex, Number(id), weight);
            if(updateRes.success === false){
                throw new Error(updateRes.error);
            }
            return res.status(200).json({ data: updateRes.data });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async deleteBody(req, res) {
        try {
            const authRes = check.authenticateToken(req.headers);
            if (authRes.status !== 200) {
                return res.status(authRes.status).json({ error: authRes.error });
            }
            const {id} = req.params;
            if (id == null) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const deleteRes = await BodyModel.deleteBody(Number(id));
            if(deleteRes.success === false && deleteRes.code === 404){
                return res.status(404).json({ error: deleteRes.error });
            }
            else if(deleteRes.success === false){
                throw new Error(deleteRes.error);
            }
            return res.status(200).json({ data: {user_id: id }});
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
export default BodyController;