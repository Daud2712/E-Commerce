import express from 'express';
import cors from 'cors'; // Added for CORS
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import deliveryRoutes from './routes/deliveries';
import userRoutes from './routes/users';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors()); // Added to enable CORS
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Freshedtz backend is running.');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/freshedtz';

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
