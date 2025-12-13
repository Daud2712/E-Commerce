import { Router, Request, Response, NextFunction } from 'express';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controllers/products';
import { auth, optionalAuth } from '../middleware/auth';
import { UserRole, AuthRequest } from '../types';
import multer from 'multer';
import path from 'path';

const router = Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Seller only)
router.post('/', auth, upload.array('images'), (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Access denied. Only sellers can create products.' });
  }
  next();
}, createProduct);

// @route   GET /api/products
// @desc    Get all products (public for buyers, private for sellers to view their own)
// @access  Public for buyers, Private for sellers
router.get('/', optionalAuth, getProducts); // Use optionalAuth to populate req.user if authenticated

// @route   GET /api/products/my-products
// @desc    Get products belonging to the authenticated seller
// @access  Private (Seller only)
router.get('/my-products', auth, (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Access denied. Only sellers can view their own products.' });
  }
  next();
}, getProducts);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', getProductById);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Seller only)
router.put('/:id', auth, upload.array('images'), (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Access denied. Only sellers can update products.' });
  }
  next();
}, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Soft-delete a product
// @access  Private (Seller only)
router.delete('/:id', auth, (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Access denied. Only sellers can delete products.' });
  }
  next();
}, deleteProduct);

export default router;
