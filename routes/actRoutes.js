import express from 'express';
const router = express.Router();
import ActController from '../controllers/ActController.js';

router.post('/create', ActController.createAct);
router.get('/search', ActController.getAct);
router.get('/records/:userid', ActController.getActRecords);
router.get('/:userid/:actid', ActController.getActDetail);
router.put('/:userid/:actid', ActController.putActDetail);
router.delete('/:userid/:actid', ActController.deleteActDetail);

export default router;