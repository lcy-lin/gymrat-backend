import check from "../utils/check.js";
import jwt from "jsonwebtoken";
import config from "../config.js";
import ActModel from "../models/ActModel.js";
import UserModel from "../models/UserModel.js";
class ActController {
    static async createAct(req, res) {
        const authRes = check.authenticateToken(req.headers);
        if (authRes.status !== 200) {
            return res.status(authRes.status).json({ error: authRes.error });
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
            const actId = await ActModel.insertAct(user_id, description, publicity);
            if(actId.success === false){
                throw new Error(actId.error);
            }
            const tagRes = await ActModel.insertTags(tags, actId);
            if (tagRes.success === false) {
                throw new Error(tagRes.error);
            }
            const movRes = await ActModel.insertMovements(movements, actId);
            if (movRes.success === false) {
                if (movRes.error === 'Invalid set properties') {
                    return res.status(400).json({ error: 'Client Error Response' });
                }
                throw new Error(movRes.error);
            }
            return res.status(200).json({
                data:{
                    activity : {
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
        try{
            const authRes = check.authenticateToken(req.headers);
            if (authRes.status !== 200) {
                return res.status(authRes.status).json({ error: authRes.error });
            }
            const category = req.query.category || 'all';
            const userId = req.query.user_id;
            if (userId == null) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const results = await ActModel.getActByUserId(category,userId);
            return res.status(200).json({
                category: category,
                activities: results,
            });
        }
        catch (error) {
            if(error.detail.name === 'TokenExpiredError'){
                return res.status(403).json({ error: 'Client Error (Token Expired) Response' });
            }
            return res.status(500).json({ error: 'Internal Server Error', detail: error });
        }
        
    }
    static async getStudentsActRecords(req, res) {
        try {
            const authRes = check.authenticateToken(req.headers);
            if (authRes.status !== 200) {
                return res.status(authRes.status).json({ error: authRes.error });
            }
            const {coachid} = req.params;
            if (coachid == null) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const results = await ActModel.getStudentActRecordsByCoachId(coachid);
            if(results.success === false){
                throw new Error(results.error);
            }
            return res.status(200).json({
                data: results.data,
            });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async getPublicActRecords(req, res) {
        try {
            const authRes = check.authenticateToken(req.headers);
            if (authRes.status !== 200) {
                return res.status(authRes.status).json({ error: authRes.error });
            }
            const {page} = req.query;
            if (page == null) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const results = await ActModel.getPublicActRecords(page);
            if(results.success === false){
                throw new Error(results.error);
            }
            return res.status(200).json({
                data: results.data,
            });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async getActRecords(req, res) {
        try{
            const authRes = check.authenticateToken(req.headers);
            if (authRes.status !== 200) {
                return res.status(authRes.status).json({ error: authRes.error });
            }
            const {userid} = req.params;
            const {year} = req.query;
            if (userid == null) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const results = await ActModel.getActRecordsByUser(userid, year);
            if(results.success === false){
                throw new Error(results.error);
            }
            return res.status(200).json({
                year: results.year,
                records: results.records,
            });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async getActDetail(req, res) {

        const authRes = check.authenticateToken(req.headers);
        if (authRes.status !== 200) {
            return res.status(authRes.status).json({ error: authRes.error });
        }
        const { userid, actid } = req.params;
        if (actid == null || userid == null) {
            return res.status(400).json({ error: 'Client Error Response' });
        }
        try {
            const results = await ActModel.getActByActId(actid);
            if(results.success === false){
                throw new Error(results.error);
            }
            if (results.activity.publicity === 0 && Number(results.activity.user_id) !== Number(userid)) {
                return res.status(401).json({ error: 'Unauthorized' });
            };
            const movementsAndSetsRes = await ActModel.getMovementsAndSetsByActId(actid);
            if(movementsAndSetsRes.success === false){
                throw new Error(movementsAndSetsRes.error);
            };
            const { activity } = results;
            const { movements } = movementsAndSetsRes;
            return res.status(200).json({
                activity: {
                    ...activity,
                    movements
                },
            });
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async putActDetail(req, res) {

        const authRes = check.authenticateToken(req.headers);
        if (authRes.status !== 200) {
            return res.status(authRes.status).json({ error: authRes.error });
        }
        const { userid, actid } = req.params;
        const updatedData = req.body.activity;
        if (actid == null || userid == null) {
            return res.status(400).json({ error: 'Client Error Response' });
        }
        try {
            const existingActivity = await ActModel.getActByActId(actid);
            if (!existingActivity.success) {
                return res.status(404).json({ error: 'Activity not found' });
            }
            if (Number(existingActivity.activity.user_id) !== Number(userid)) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const updateActRes = await ActModel.updateActivity(actid, updatedData);
            if (!updateActRes.success) {
                throw new Error(updateActRes.error);
            }

            const updateMoveSetRes = await ActModel.updateMovementsAndSets(updatedData.movements, actid);
            if (!updateMoveSetRes.success) {
                throw new Error(updateMoveSetRes.error);
            }
    
            return res.status(200).json({
                activity: {
                    id: actid,
                },
             });
        } catch (error) {
            console.error('Error updating activity:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async deleteActDetail(req, res) {
        const authRes = check.authenticateToken(req.headers);
        if (authRes.status !== 200) {
            return res.status(authRes.status).json({ error: authRes.error });
        }
        const { userid, actid } = req.params;
        if (actid == null || userid == null) {
            return res.status(400).json({ error: 'Client Error Response' });
        }
        try {
            const existingActivity = await ActModel.getActByActId(actid);
            if (!existingActivity.success) {
                return res.status(404).json({ error: 'Activity not found' });
            }
            if (Number(existingActivity.activity.user_id) !== Number(userid)) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const deleteActRes = await ActModel.deleteActivity(actid);
            if (!deleteActRes.success) {
                throw new Error(deleteActRes.error);
            }
            return res.status(200).json({
                activity: {
                    id: actid,
                },
             });
        } catch (error) {
            console.error('Error updating activity:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
export default ActController;