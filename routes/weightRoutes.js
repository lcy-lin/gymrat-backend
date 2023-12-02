import express from 'express';
const router = express.Router();
import WeightController from '../controllers/WeightController.js';

router.post('/create', WeightController.createWeight);
router.get('/search', WeightController.getWeight);
router.patch('/update/:weightid', WeightController.putWeight);

export default router;