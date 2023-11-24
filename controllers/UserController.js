import UserModel from "../models/UserModel.js";
import jwt from 'jsonwebtoken';
import config from "../config.js";
import check from "../utils/check.js";
import axios from "axios";

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
//     static async signIn(req, res) {
//         const provider = req.body.provider;
//         try {
//             if (provider == 'native') {
//                 const contentTypeHeader = req.get('Content-Type');
//                 if (UserModel.userHeaderValidity(contentTypeHeader) == false) {
//                     return res.status(400).json({ error: 'Client Error Response' });
//                 }
//                 const { provider, email, password } = req.body;
//                 if(UserModel.checkNativeSignIn(email, password, provider) == false){
//                     return res.status(400).json({ error: 'Client Error Response' });
//                 }
//                 const user = await UserModel.getUserByEmail(email);
//                 if (user === null) {
//                     return res.status(403).json({ error: 'Sign In Failed' });
//                 }
//                 const isPasswordValid = await UserModel.verifyPassword(password, user.password);

//                 if (!isPasswordValid) {
//                     return res.status(403).json({ error: 'Sign In Failed' });
//                 }
//                 const userData = {
//                     id: user.id,
//                     name: user.name,
//                     email: user.email,
//                     picture: user.picture,
//                     provider: user.provider,
//                 };
//                 await UserController.respondWithToken(res, userData);
//             }
//             else if (provider == 'google') {
//                 try{
//                     const access_token = req.body.access_token;
//                     const {data} = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + access_token);
//                     const tokenDetail = await axios.get('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + access_token);
//                     const response = {
//                         data: {
//                             access_token: access_token,
//                             access_expired: tokenDetail.data.expires_in,
//                             user: {
//                                 id: data.id,
//                                 provider: 'google',
//                                 name: data.name,
//                                 email: data.email,
//                                 picture: data.picture,
//                             }
//                         }
//                     }
//                     return res.status(200).json(response);
//                 }
//                 catch(error){
//                     console.error(error);
//                     return res.status(403).json({ error: 'Google Authentication Failed' });
//                 }
//             } 
//             else {
//                 return res.status(400).json({ error: 'Client Error Response' });
//             } 
//         }
//         catch (error) {
//             console.error(error);
//             res.status(500).json({ error: 'Internal Server Error' });
//         } 
//     }
//     static async profile(req, res) {
//         try{
//             const authHeader = req.headers['authorization'];
//             const token = authHeader && authHeader.split(' ')[1];
//             if(token == null){
//                 return res.status(403).json({ error: 'Client Error (No token) Response' });
//             }
//             const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//             const response = {
//                 data: {
//                     provider: decoded.provider,
//                     name: decoded.name,
//                     email: decoded.email,
//                     picture: decoded.picture,

//                 }
//             }
//             return res.status(200).json(response);
//         } catch (error) {
//             console.error(error);
//             if (error.name === 'JsonWebTokenError' || 'TokenExpiredError') {
//                 return res.status(401).json({ error: 'Client Error (Wrong token) Response' });
//             }
//             else {
//                 return res.status(500).json({ error: 'Internal Server Error' });
//             }

//         }
//     }
}

export default UserController;