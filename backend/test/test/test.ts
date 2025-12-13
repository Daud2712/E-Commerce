import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { checkout } from '../controllers/orders';
import { UserRole } from '../types';
import Product from '../models/Product';
import Order from '../models/Order';
import User from '../models/User';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('checkout', () => {
  it('should create an order and decrease product stock', async () => {
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
      role: UserRole.Buyer,
    });
    await user.save();

    const product = new Product({
      name: 'Test Product',
      price: 10,
      stock: 10,
      seller: new mongoose.Types.ObjectId(),
    });
    await product.save();

    const req = {
      user: {
        id: user._id,
        role: user.role,
      },
      body: {
        items: [{ productId: product._id, quantity: 2 }],
        shippingAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'USA',
          phone: '123-456-7890',
        },
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await checkout(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Order placed successfully!',
      })
    );

    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct?.stock).toBe(8);

    const order = await Order.findOne({ buyer: user._id });
    expect(order).not.toBeNull();
    expect(order?.totalAmount).toBe(20);
  });
});
