import express from 'express';
import gs01Route from '../routes/gs01';

const router = express.Router();
router.use('/gt', gs01Route);

export default router;