import { Router } from 'express';
import { getPaymentsByMonth, createManualPayment, verifyOnlinePayment } from '../controllers/paymentController.js';

const router = Router();

router.get('/', getPaymentsByMonth);
router.post('/manual',createManualPayment);
router.post('/verify',verifyOnlinePayment);

export default router;
