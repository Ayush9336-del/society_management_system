import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import {
  getDashboard, getResidents, addResident, updateResident, deleteResident,
  createNotification, getNotifications, getReports, getMonthlyRecords,
} from '../controllers/adminController.js';

const router = Router();

router.get('/dashboard',  verifyJWT, verifyAdmin, getDashboard);
router.get('/residents',  verifyJWT, verifyAdmin, getResidents);
router.post('/residents',      verifyJWT, verifyAdmin, addResident);
router.patch('/residents/:id', verifyJWT, verifyAdmin, updateResident);
router.delete('/residents/:id',verifyJWT, verifyAdmin, deleteResident);
router.get('/notifications',   verifyJWT, verifyAdmin, getNotifications);
router.post('/notifications',  verifyJWT, verifyAdmin, createNotification);
router.get('/reports',         verifyJWT, verifyAdmin, getReports);
router.get('/monthly-records', verifyJWT, verifyAdmin, getMonthlyRecords);

export default router;
