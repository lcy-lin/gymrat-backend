import express from 'express';
const router = express.Router();
import CalController from '../controllers/CalController.js';

router.post('/create', CalController.createFood);
router.get('/search', CalController.getFood);
// router.patch('/update/:weightid', WeightController.putWeight);
// router.delete('/delete/:weightid', WeightController.deleteWeight);
export default router;