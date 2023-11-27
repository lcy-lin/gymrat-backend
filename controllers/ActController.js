import check from "../utils/check.js";
import jwt from "jsonwebtoken";
import config from "../config.js";
import ActModel from "../models/ActModel.js";
class ActController {
    static async createAct(req, res) {
        const token = check.authHeader(req.headers['authorization']);
        if(token == null){
            return res.status(403).json({ error: 'Client Error (No token) Response' });
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (decoded === null) {
            return res.status(403).json({ error: 'Client Error (Wrong token) Response' });
        }
        try {
            const {user_id, tags, description, publicity, movements} = req.body.data;
            if (user_id == null || tags == null || description == null || publicity == null || movements == null) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            for (let tag of tags) {
                if (
                    tag !== 'chest' &&
                    tag !== 'back' &&
                    tag !== 'shoulders' &&
                    tag !== 'arms' &&
                    tag !== 'legs' &&
                    tag !== 'others'
                ) {
                    return res.status(400).json({ error: 'Client Error Response' });
                }
            }
            const actId = await ActModel.insertAct(user_id, description, publicity, movements);
            const tagRes = await ActModel.insertTags(tags, actId);
            if (tagRes.success === false) {
                throw new Error(tagRes.error);
            }
            const movRes = await ActModel.insertMovements(movements, actId);
            if (movRes.success === false) {
                throw new Error(movRes.error);
            }
            return res.status(200).json({
                data:{
                    activity: {
                        id: actId,
                    }
                }
            });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }

    }
    static async getAct(req, res) {
        const category = req.query.category || 'all';
    }
}
export default ActController;