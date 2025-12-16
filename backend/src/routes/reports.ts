import express from 'express';
import { getSalesReport, getStockReport, getExpenseReport } from '../controllers/reports';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/sales', authenticate, getSalesReport);
router.get('/stock', authenticate, getStockReport);
router.get('/expenses', authenticate, getExpenseReport);

export default router;
