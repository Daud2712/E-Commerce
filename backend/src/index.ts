import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import deliveryRoutes from './routes/deliveries';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import expenseRoutes from './routes/expenses';
import reportRoutes from './routes/reports';
import { setSocketIO } from './utils/socket';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Set the socket.io instance for use in controllers
setSocketIO(io);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5002;

app.get('/', (req, res) => {
    res.send('Freshedtz backend is running.');
});

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);
    
    // Join user-specific room (buyers)
    socket.on('join', (userId: string) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their room`);
    });
    
    // Join seller-specific room
    socket.on('joinSeller', (sellerId: string) => {
        socket.join(`seller-${sellerId}`);
        console.log(`Seller ${sellerId} joined their room`);
    });
    
    // Join rider-specific room
    socket.on('joinRider', (riderId: string) => {
        socket.join(`rider-${riderId}`);
        console.log(`Rider ${riderId} joined their room`);
    });
    
    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
    });
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/freshedtz';

// Suppress Mongoose strictQuery deprecation warning
mongoose.set('strictQuery', true);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });
