import express from 'express';
const router = express.Router();
import BodyController from '../controllers/BodyController.js';

router.post('/create', BodyController.createBody);
router.get('/search/:id', BodyController.getBody);

export default router;