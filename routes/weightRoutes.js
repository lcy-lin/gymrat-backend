import express from 'express';
const router = express.Router();
import WeightController from '../controllers/WeightController.js';

router.post('/create', WeightController.createWeight);

export default router;