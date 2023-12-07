import express from 'express';
const router = express.Router();
import UserController from '../controllers/UserController.js';

router.post('/signup', UserController.signUp);
router.post('/signin', UserController.signIn);
router.get('/search', UserController.search);
router.get('/:id/profile', UserController.profile);
router.patch('/:id/coach', UserController.updateCoach);

export default router;