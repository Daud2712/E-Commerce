import { Response } from 'express';
import Expense from '../models/Expense';
import { AuthRequest, UserRole } from '../types';

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private (Seller only)
export const createExpense = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Only sellers can create expenses.' });
  }

  const { description, amount, category, date } = req.body;

  if (!description || !amount || !category) {
    return res.status(400).json({ message: 'Description, amount, and category are required.' });
  }

  try {
    const expense = await Expense.create({
      seller: req.user.id,
      description,
      amount,
      category,
      date: date || new Date(),
    });

    res.status(201).json({
      message: 'Expense created successfully!',
      expense
    });
  } catch (error: any) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Failed to create expense.' });
  }
};

// @desc    Get seller's expenses
// @route   GET /api/expenses
// @access  Private (Seller only)
export const getSellerExpenses = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Only sellers can view expenses.' });
  }

  try {
    const expenses = await Expense.find({ seller: req.user.id })
      .sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Failed to fetch expenses.' });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private (Seller only)
export const updateExpense = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Only sellers can update expenses.' });
  }

  const { description, amount, category, date } = req.body;

  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    if (expense.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this expense.' });
    }

    expense.description = description || expense.description;
    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;

    await expense.save();

    res.status(200).json({
      message: 'Expense updated successfully!',
      expense
    });
  } catch (error: any) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Failed to update expense.' });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private (Seller only)
export const deleteExpense = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Only sellers can delete expenses.' });
  }

  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    if (expense.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this expense.' });
    }

    await expense.deleteOne();

    res.status(200).json({ message: 'Expense deleted successfully!' });
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Failed to delete expense.' });
  }
};
