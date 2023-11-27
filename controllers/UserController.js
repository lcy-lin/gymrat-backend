import UserModel from "../models/UserModel.js";
import jwt from 'jsonwebtoken';
import config from "../config.js";
import check from "../utils/check.js";

class UserController {

    static async respondWithToken(res, userData) {
        const token = await UserModel.generateAccessToken(userData);

        const response = {
            data: {
                access_token: token,
                access_expired: 3600,
                user: userData,
            },
        };

        res.status(200).json(response);
    }
    static async signUp(req, res) {
        const db = config.db;
        try {
            const contentTypeHeader = req.get('Content-Type');
            if (check.validJsonHeader(contentTypeHeader) == false) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const { name, email, password } = req.body;
            if(check.validBody(name, email, password) == false){
                return res.status(400).json({ error: 'Client Error Response' });
            }
            if(await UserModel.checkEmail(email) == false){
                return res.status(409).json({ error: 'Email Already Exists' });
            }
            const picture = null;
            db.query('BEGIN');
            const insertId = await UserModel.insertUser(email, name, password, picture);
            await UserModel.insertUserRole(insertId, 2);
            const userData = {
                id: insertId,
                name: name,
                email: email,
                picture: picture,
            };
            await UserController.respondWithToken(res, userData);
            db.query('COMMIT'); 
        }
        catch (error) {
            await db.query('ROLLBACK');
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    static async signIn(req, res) {
        try {
            const contentTypeHeader = req.get('Content-Type');
            if (check.validJsonHeader(contentTypeHeader) == false) {
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const { email, password } = req.body;
            if(email == null || password == null){
                return res.status(400).json({ error: 'Client Error Response' });
            }
            const user = await UserModel.getUserByEmail(email);
            if (user === null) {
                return res.status(403).json({ error: 'Sign In Failed' });
            }
            const isPasswordValid = await UserModel.verifyPassword(password, user.password);

            if (!isPasswordValid) {
                return res.status(403).json({ error: 'Sign In Failed' });
            }
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                picture: user.picture,
            };
            await UserController.respondWithToken(res, userData);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        } 
    }
    static async profile(req, res) {
        try{

            const token = check.authHeader(req.headers['authorization']);
            if(token == null){
                return res.status(403).json({ error: 'Client Error (No token) Response' });
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            if (decoded === null) {
                return res.status(403).json({ error: 'Client Error (Wrong token) Response' });
            }
            const userId = req.params.id;
            const userData = await UserModel.getUserById(userId);
            if (userData === null) {
                return res.status(403).json({ error: 'Client Error (Wrong token) Response' });
            }
            const isoDate = new Date(userData.created_at);
            const formattedDate = `${isoDate.getFullYear()}-${(isoDate.getMonth() + 1).toString().padStart(2, '0')}-${isoDate.getDate().toString().padStart(2, '0')} ${isoDate.getHours().toString().padStart(2, '0')}:${isoDate.getMinutes().toString().padStart(2, '0')}:${isoDate.getSeconds().toString().padStart(2, '0')}`;

            const response = {
                data: {
                    user: {
                        id: userData.id,
                        coach_id: userData.coach_id,
                        name: userData.name,
                        email: userData.email,
                        picture: userData.picture,
                        role: userData.roles,
                        created_at: formattedDate,
                    }
                }
            }
            return res.status(200).json(response);
        } catch (error) {
            console.error(error);
            if (error.name === 'JsonWebTokenError' || 'TokenExpiredError') {
                return res.status(401).json({ error: 'Client Error (Wrong token) Response' });
            }
            else {
                return res.status(500).json({ error: 'Internal Server Error' });
            }

        }
    }
}

export default UserController;