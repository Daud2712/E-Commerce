import express from 'express';
import { createExpense, getSellerExpenses, updateExpense, deleteExpense } from '../controllers/expenses';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createExpense);
router.get('/', authenticate, getSellerExpenses);
router.put('/:id', authenticate, updateExpense);
router.delete('/:id', authenticate, deleteExpense);

export default router;
