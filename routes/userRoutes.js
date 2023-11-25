import express from 'express';
const router = express.Router();
import UserController from '../controllers/UserController.js';

router.post('/signup', UserController.signUp);
router.post('/signin', UserController.signIn);
router.get('/profile', UserController.profile);
export default router;