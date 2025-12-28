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
import adminRoutes from './routes/admin';
import { setSocketIO } from './utils/socket';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS origins
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Set the socket.io instance for use in controllers
setSocketIO(io);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5002;

app.get('/', (req, res) => {
    res.send('Freshedtz backend is running.');
});

io.on('connection', (socket) => {
    console.log(`[SOCKET] User connected: ${socket.id}`);

    // Buyer joins their room
    socket.on('join', (userId: string) => {
        // Leave all previous rooms except default rooms
        const rooms = Array.from(socket.rooms);
        rooms.forEach(room => {
            if (room !== socket.id) {
                socket.leave(room);
                console.log(`[SOCKET] ${socket.id} left room: ${room}`);
            }
        });

        // Join buyer room
        socket.join(`user-${userId}`);
        console.log(`[SOCKET] Buyer ${userId} (${socket.id}) joined room: user-${userId}`);
    });

    // Seller joins their room
    socket.on('joinSeller', (sellerId: string) => {
        // Leave all previous rooms except default rooms
        const rooms = Array.from(socket.rooms);
        rooms.forEach(room => {
            if (room !== socket.id) {
                socket.leave(room);
                console.log(`[SOCKET] ${socket.id} left room: ${room}`);
            }
        });

        // Join seller room
        socket.join(`seller-${sellerId}`);
        console.log(`[SOCKET] Seller ${sellerId} (${socket.id}) joined room: seller-${sellerId}`);
    });

    // Rider joins their room
    socket.on('joinRider', (riderId: string) => {
        // Leave all previous rooms except default rooms
        const rooms = Array.from(socket.rooms);
        rooms.forEach(room => {
            if (room !== socket.id) {
                socket.leave(room);
                console.log(`[SOCKET] ${socket.id} left room: ${room}`);
            }
        });

        // Join rider room
        socket.join(`rider-${riderId}`);
        console.log(`[SOCKET] Rider ${riderId} (${socket.id}) joined room: rider-${riderId}`);
    });

    socket.on('disconnect', () => {
        console.log(`[SOCKET] User disconnected: ${socket.id}`);
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
