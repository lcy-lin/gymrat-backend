import express from 'express';
const router = express.Router();
import WeightController from '../controllers/WeightController.js';

router.post('/create', WeightController.createWeight);
router.get('/search', WeightController.getWeight);
router.patch('/:userid', WeightController.putWeight);
router.delete('/delete/:weightid', WeightController.deleteWeight);
export default router;