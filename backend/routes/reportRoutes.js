import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import { getMonthlyReport, getYearlyReport } from '../controllers/reportController.js';

const router = Router();

router.get('/monthly', verifyJWT, verifyAdmin, getMonthlyReport);
router.get('/yearly',  verifyJWT, verifyAdmin, getYearlyReport);

export default router;
