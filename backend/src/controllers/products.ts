import { Request, Response } from 'express';
import Product from '../models/Product';
import { UserRole, AuthRequest } from '../types';

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Seller only)
export const createProduct = async (req: AuthRequest, res: Response) => {
  const { name, description, stock, category } = req.body;
  const price = parseFloat(req.body.price as string);
  const images: string[] = [];

  if (req.files && Array.isArray(req.files)) {
    req.files.forEach((file: Express.Multer.File) => {
      images.push(`${process.env.BACKEND_URL}/uploads/${file.filename}`);
    });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Only sellers can create products.' });
  }

  try {
    const product = new Product({
      name,
      description,
      price: Math.abs(price),
      stock,
      seller: req.user.id,
      images,
      category,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public for buyers, Private for sellers
export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    // For all users accessing the main /api/products route, show all available and non-deleted products.
    // Seller-specific products will be handled by the /api/products/my-products route.
    const products = await Product.find({ isAvailable: true, deleted: false }).populate('seller', 'name');
    res.status(200).json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email');

    if (!product || product.deleted) { // Do not show soft-deleted products
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json(product);
  } catch (error: any) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Seller only)
export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { name, description, stock, category, isAvailable, clearExistingImages } = req.body;
  const price = parseFloat(req.body.price as string);
  const newImages: string[] = [];

  if (req.files && Array.isArray(req.files)) {
    req.files.forEach((file: Express.Multer.File) => {
      newImages.push(`${process.env.BACKEND_URL}/uploads/${file.filename}`);
    });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this product.' });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined && !isNaN(price) ? Math.abs(price) : product.price;
    product.stock = stock !== undefined ? stock : product.stock;

    if (clearExistingImages === 'true') { // `clearExistingImages` will be a string if passed via FormData
      product.images = newImages; // Replace all existing images with new ones
    } else if (newImages.length > 0) {
      product.images = [...product.images, ...newImages]; // Append new images
    }
    // If clearExistingImages is false and newImages is empty, product.images remain unchanged.

    product.category = category || product.category;
    product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// @desc    Delete a product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private (Seller only)
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Ensure seller is the owner of the product
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product.' });
    }

    product.deleted = true;
    await product.save();
    res.status(200).json({ message: 'Product soft-deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
