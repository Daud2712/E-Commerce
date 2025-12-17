import { Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Expense from '../models/Expense';
import { AuthRequest, UserRole } from '../types';

// @desc    Get sales report
// @route   GET /api/reports/sales
// @access  Private (Seller only)
export const getSalesReport = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Only sellers can view sales reports.' });
  }

  const { period } = req.query; // daily, weekly, monthly, 6months, yearly

  try {
    let startDate = new Date();
    
    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '6months') {
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (period === 'yearly') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      // Default to daily
      startDate.setHours(0, 0, 0, 0);
    }

    const orders = await Order.find({
      createdAt: { $gte: startDate },
      status: { $ne: 'cancelled' }
    })
      .populate('buyer', 'name email')
      .populate('items.product', 'name seller')
      .sort({ createdAt: -1 });

    // Filter orders that contain products from this seller
    const sellerOrders = orders.filter(order =>
      order.items.some((item: any) =>
        item.product?.seller?.toString() === req.user!.id
      )
    );

    const totalRevenue = sellerOrders.reduce((sum, order) => {
      const sellerItems = order.items.filter((item: any) =>
        item.product?.seller?.toString() === req.user!.id
      );
      return sum + sellerItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
    }, 0);

    const totalOrders = sellerOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.status(200).json({
      period,
      startDate,
      endDate: new Date(),
      totalRevenue,
      totalOrders,
      averageOrderValue,
      orders: sellerOrders
    });
  } catch (error: any) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ message: 'Failed to generate sales report.' });
  }
};

// @desc    Get stock/product report
// @route   GET /api/reports/stock
// @access  Private (Seller only)
export const getStockReport = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Only sellers can view stock reports.' });
  }

  try {
    const products = await Product.find({ seller: req.user.id, deleted: false });

    const totalProducts = products.length;
    const inStock = products.filter(p => p.stock > 0).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    const categoryBreakdown = products.reduce((acc: any, p) => {
      const category = p.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalStock: 0,
          totalValue: 0
        };
      }
      acc[category].count++;
      acc[category].totalStock += p.stock;
      acc[category].totalValue += p.price * p.stock;
      return acc;
    }, {});

    res.status(200).json({
      summary: {
        totalProducts,
        inStock,
        outOfStock,
        lowStock,
        totalStockValue
      },
      categoryBreakdown,
      products: products.map(p => ({
        _id: p._id,
        name: p.name,
        category: p.category,
        stock: p.stock,
        price: p.price,
        value: p.stock * p.price,
        isAvailable: p.isAvailable
      }))
    });
  } catch (error: any) {
    console.error('Error generating stock report:', error);
    res.status(500).json({ message: 'Failed to generate stock report.' });
  }
};

// @desc    Get expense report
// @route   GET /api/reports/expenses
// @access  Private (Seller only)
export const getExpenseReport = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Only sellers can view expense reports.' });
  }

  const { period } = req.query; // daily, weekly, monthly, 6months, yearly

  try {
    let startDate = new Date();
    
    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '6months') {
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (period === 'yearly') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      // Default to daily
      startDate.setHours(0, 0, 0, 0);
    }

    const expenses = await Expense.find({
      seller: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const categoryBreakdown = expenses.reduce((acc: any, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = {
          count: 0,
          total: 0
        };
      }
      acc[exp.category].count++;
      acc[exp.category].total += exp.amount;
      return acc;
    }, {});

    res.status(200).json({
      period,
      startDate,
      endDate: new Date(),
      totalExpenses,
      expenseCount: expenses.length,
      categoryBreakdown,
      expenses
    });
  } catch (error: any) {
    console.error('Error generating expense report:', error);
    res.status(500).json({ message: 'Failed to generate expense report.' });
  }
};
