require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Nuclear data sanitizer - handles all edge cases
function nuclearSanitize(data) {
  const visited = new WeakSet();
  
  function sanitizer(key, value) {
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (visited.has(value)) return '[Circular]';
      visited.add(value);
    }
    
    // Convert special objects
    if (value instanceof Date) return value.toISOString();
    if (value instanceof Map) return Array.from(value.entries());
    if (value instanceof Set) return Array.from(value);
    if (value instanceof ArrayBuffer) return Array.from(new Uint8Array(value));
    if (ArrayBuffer.isView(value)) return Array.from(value);
    if (typeof value === 'bigint') return value.toString();
    if (value === undefined) return null;
    
    return value;
  }
  
  return JSON.parse(JSON.stringify(data, sanitizer));
}

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST']
}));

app.use(express.json({
  limit: '10kb',
  verify: (req, res, buf) => {
    try {
      nuclearSanitize(JSON.parse(buf.toString()));
    } catch (e) {
      throw new Error('Invalid data format');
    }
  }
}));

const httpServer = createServer(app);

// Socket.IO with nuclear-proof serialization
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  },
  // Force safe serialization
  serialize: (payload) => {
    return [JSON.stringify(nuclearSanitize(payload))];
  }
});

// Add safety wrapper to all sockets
io.use((socket, next) => {
  socket.nuclearEmit = (event, payload) => {
    try {
      const safe = nuclearSanitize(payload);
      socket.emit(event, safe);
    } catch (error) {
      console.error('Nuclear emit failed:', error);
      socket.emit('serialization_error', {
        event,
        error: 'Data could not be processed'
      });
    }
  };
  next();
});

// Import socket setup AFTER safety measures
const { setupSocket } = require('./socket/socketManager');
setupSocket(io);

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Nuclear-safe server running on port ${PORT}`);
});