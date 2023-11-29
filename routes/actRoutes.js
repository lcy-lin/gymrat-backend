import express from 'express';
const router = express.Router();
import ActController from '../controllers/ActController.js';

router.post('/create', ActController.createAct);
router.get('/search', ActController.getAct);
router.get('/:userid/:actid', ActController.getActDetail);

export default router;