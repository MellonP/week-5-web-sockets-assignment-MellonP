// server/controllers/chatController.js
import Message from '../models/Message.js';

export const socketHandler = (io, socket) => {
  console.log('✅ New client connected:', socket.id);

  socket.on('joinRoom', async ({ room, username }) => {
    socket.join(room);
    console.log(`${username} joined room: ${room}`);

    socket.to(room).emit('userJoined', `${username} has joined the chat`);

    const previousMessages = await Message.find({ room }).sort({ timestamp: 1 });
    socket.emit('chatHistory', previousMessages);
  });

  socket.on('sendMessage', async ({ room, content, sender }) => {
    const message = new Message({ room, content, sender });
    await message.save();

    io.to(room).emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
};
