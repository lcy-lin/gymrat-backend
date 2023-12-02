import express from 'express';
const router = express.Router();
import WeightController from '../controllers/WeightController.js';

router.post('/create', WeightController.createWeight);
router.get('/search', WeightController.getWeight);

export default router;