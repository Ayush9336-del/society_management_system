import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import { getAllFlats, createFlat, updateFlat, vacateFlat, assignResident } from '../controllers/flatController.js';

const router = Router();

router.get('/',              verifyJWT, getAllFlats);
router.post('/',             verifyJWT, verifyAdmin, createFlat);
router.put('/:id',           verifyJWT, verifyAdmin, updateFlat);
router.patch('/:id/vacate',  verifyJWT, verifyAdmin, vacateFlat);
router.patch('/:id/assign',  verifyJWT, verifyAdmin, assignResident);

export default router;
