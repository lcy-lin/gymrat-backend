import express from 'express';
const router = express.Router();
import BodyController from '../controllers/BodyController.js';

router.post('/create', BodyController.createBody);
router.get('/:id', BodyController.getBody);
router.put('/:id', BodyController.putBody);
router.delete('/:id', BodyController.deleteBody);
export default router;