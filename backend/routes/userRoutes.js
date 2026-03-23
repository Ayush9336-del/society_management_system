import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import { getDashboard, pay, getPaymentById, getSubscriptions, getNotifications } from '../controllers/userController.js';

const router = Router();

router.get('/dashboard',     verifyJWT, getDashboard);
router.post('/pay',          verifyJWT, pay);
router.get('/payments/:id',  verifyJWT, getPaymentById);
router.get('/subscriptions', verifyJWT, getSubscriptions);
router.get('/notifications', verifyJWT, getNotifications);

export default router;
