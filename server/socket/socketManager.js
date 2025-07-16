const { v4: uuidv4 } = require('uuid');
const { translateMessage } = require('../utils/translation');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const activeRooms = new Map(); // roomId -> { users: Set, lastActivity: Date }

class User {
  constructor(socketId, userId, username, isAnonymous, language = 'en') {
    this.socketId = socketId;
    this.userId = userId;
    this.username = username;
    this.isAnonymous = isAnonymous;
    this.language = language;
    this.currentRoom = null;
  }
}

const users = new Map(); // socketId -> User

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins the app
    socket.on('join_app', ({ username, isAnonymous, userId, language }) => {
      const user = new User(
        socket.id,
        userId || uuidv4(),
        isAnonymous ? `Anonymous${Math.floor(1000 + Math.random() * 9000)}` : username,
        isAnonymous,
        language || 'en'
      );
      users.set(socket.id, user);
      socket.emit('user_data', {
        userId: user.userId,
        username: user.username,
        isAnonymous: user.isAnonymous
      });
    });

    // Create or join room - **UPDATED HANDLER**
    socket.on('join_room', async ({ roomId, username }) => {
      const user = users.get(socket.id);
      if (!user) return;

      // Leave current room if any
      if (user.currentRoom) {
        socket.leave(user.currentRoom);
        removeUserFromRoom(user.currentRoom, socket.id);
      }

      // Join new room or create one
      const targetRoom = roomId || uuidv4();
      user.currentRoom = targetRoom;
      socket.join(targetRoom);

      if (!activeRooms.has(targetRoom)) {
        activeRooms.set(targetRoom, {
          users: new Set(),
          lastActivity: new Date(),
          isEphemeral: !roomId // If no roomId provided, it's ephemeral
        });
      }

      const room = activeRooms.get(targetRoom);
      room.users.add(socket.id);
      room.lastActivity = new Date();

      // Notify room users that someone joined
      io.to(targetRoom).emit('user_joined', {
        userId: user.userId,
        username: user.username,
        timestamp: new Date().toISOString()
      });

      // ** SEND WELCOME MESSAGE TO THE JOINING USER ONLY **
  socket.emit('receive_message', {
    id: uuidv4(),
    content: `Welcome to ${user.currentRoom}!`,
    userId: 'system',
    username: 'System',
    timestamp: new Date().toISOString(),
    moodColor: '#6b7280',
    isSystem: true,
    isOriginal: true,
    translated: false,
    });

      // Let joining client know they joined the room
      socket.emit('room_joined', { roomId: targetRoom });

      // Send welcome system message to the joining client
      socket.emit('receive_message', {
        id: uuidv4(),
        content: `Welcome to ${targetRoom}!`,
        userId: 'system',
        username: 'System',
        timestamp: new Date().toISOString(),
        moodColor: '#6b7280',
        isSystem: true,
        isOriginal: true,
        translated: false
      });
    });

    // Handle messages - FIXED VERSION
    socket.on('send_message', async (rawData) => {
      try {
        const data = deepSanitize(rawData);
        const user = users.get(socket.id);
        if (!user || !user.currentRoom) return;
        const room = activeRooms.get(user.currentRoom);
        if (!room) return;

        const content = data.content;
        if (!content || typeof content !== 'string') {
          throw new Error('Invalid message content');
        }

        // SAFE sentiment analysis - only extract score
        let moodColor = '#ffffff';
        let moodScore;
        try {
          moodScore = sentiment.analyze(content).score;
        } catch {
          moodScore = 0;
        }

        // Assign moodColor based on moodScore
        if (moodScore > 3) moodColor = '#4ade80';
        else if (moodScore > 1) moodColor = '#a3e635';
        else if (moodScore > -1) moodColor = '#facc15';
        else if (moodScore > -3) moodColor = '#fb923c';
        else moodColor = '#f87171';

        const messageId = uuidv4();
        const timestamp = new Date().toISOString();

        // Create COMPLETELY clean message object
        const baseMessage = {
          id: messageId,
          content: content.toString(),
          userId: user.userId,
          username: user.username,
          timestamp,
          moodColor,
          isAnonymous: user.isAnonymous
        };

        // Send to sender
        socket.emit('receive_message', {
          ...baseMessage,
          isOriginal: true,
          translated: false
        });

        // Send to others
        const broadcastPromises = Array.from(room.users)
          .filter(socketId => socketId !== socket.id)
          .map(async socketId => {
            const recipient = users.get(socketId);
            if (!recipient) return;

            const basePayload = {
              id: messageId,
              userId: user.userId,
              username: user.username,
              timestamp,
              moodColor,
              isAnonymous: user.isAnonymous,
              isOriginal: false
            };

            try {
              if (recipient.language !== 'en') {
                const translatedContent = await translateMessage(content, recipient.language);
                socket.to(socketId).emit('receive_message', {
                  ...basePayload,
                  content: translatedContent,
                  translated: true,
                  originalLanguage: 'en',
                  targetLanguage: recipient.language
                });
              } else {
                socket.to(socketId).emit('receive_message', {
                  ...basePayload,
                  content,
                  translated: false
                });
              }
            } catch (error) {
              socket.to(socketId).emit('receive_message', {
                ...basePayload,
                content,
                translated: false
              });
            }
          });

        await Promise.all(broadcastPromises);
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    // Toggle anonymous mode
    socket.on('toggle_anonymous', ({ isAnonymous }) => {
      const user = users.get(socket.id);
      if (!user) return;

      user.isAnonymous = isAnonymous;
      user.username = isAnonymous
        ? `Anonymous${Math.floor(1000 + Math.random() * 9000)}`
        : user.username.replace(/^Anonymous\d{4}/, '').trim() || `User${Math.floor(1000 + Math.random() * 9000)}`;

      socket.emit('anonymous_toggled', {
        username: user.username,
        isAnonymous: user.isAnonymous
      });
    });

    // Change language
    socket.on('change_language', ({ language }) => {
      const user = users.get(socket.id);
      if (user) {
        user.language = language;
        socket.emit('language_changed', { language });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      const user = users.get(socket.id);
      if (user && user.currentRoom) {
        removeUserFromRoom(user.currentRoom, socket.id);
        io.to(user.currentRoom).emit('user_left', {
          userId: user.userId,
          username: user.username,
          timestamp: new Date().toISOString()
        });
      }
      users.delete(socket.id);
      console.log(`User disconnected: ${socket.id}`);
    });

    // Cleanup ephemeral rooms periodically
    setInterval(() => {
      const now = new Date();
      for (const [roomId, room] of activeRooms) {
        // Clean empty rooms regardless of ephemeral status
        if (room.users.size === 0) {
          activeRooms.delete(roomId);
          continue;
        }
        
        // Clean inactive ephemeral rooms
        if (room.isEphemeral && (now - room.lastActivity) > 30 * 60 * 1000) {
          io.to(roomId).emit('room_expired', { roomId });
          room.users.forEach(socketId => {
            const user = users.get(socketId);
            if (user) user.currentRoom = null;
          });
          activeRooms.delete(roomId);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  });
};

function removeUserFromRoom(roomId, socketId) {
  const room = activeRooms.get(roomId);
  if (!room) return;

  room.users.delete(socketId);
  room.lastActivity = new Date();

  if (room.users.size === 0 && room.isEphemeral) {
    activeRooms.delete(roomId);
  }
}

module.exports = { setupSocket };
