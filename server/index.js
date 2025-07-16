// server/index.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { socketHandler } from './controllers/chatController.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // or specify your frontend URL
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Setup Socket.IO
io.on('connection', (socket) => {
  socketHandler(io, socket);
});

// Fallback route
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
