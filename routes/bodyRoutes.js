import express from 'express';
const router = express.Router();
import BodyController from '../controllers/BodyController.js';

router.post('/create', BodyController.createBody);
router.get('/search', BodyController.getBody);

export default router;