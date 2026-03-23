import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import { getAllSubscriptions, updateSubscription } from '../controllers/subscriptionController.js';

const router = Router();

router.get('/',      verifyJWT, getAllSubscriptions);
router.put('/:id',   verifyJWT, verifyAdmin, updateSubscription);

export default router;
