// src/context/SocketContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { initSocket, setupSocketListeners } from '../socket/socketClient';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  /* ---------- state ---------- */
  const [socket, setSocket] = useState(null);
  const [userData, setUserData] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const navigate = useNavigate();

  /* ---------- 1. create socket once ---------- */
  useEffect(() => {
    const s = initSocket();
    setSocket(s);
    return () => s.disconnect();
  }, []);

  /* ---------- 2. helper to add system message ---------- */
  const addSystemMessage = useCallback((text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: text,
        userId: 'system',
        username: 'System',
        timestamp: new Date().toISOString(),
        moodColor: '#6b7280',
        isSystem: true,
      },
    ]);
  }, []);

  /* ---------- 3. unified socket‑event handler ---------- */
const handleSocketEvent = useCallback(
  (event, data) => {
    switch (event) {
      case 'connect':
        console.log('✅ socket connected');
        break;
      case 'disconnect':
        console.log('❌ socket disconnected');
        break;
      case 'connect_error':
        console.error('Connection error:', data);
        break;
      case 'user_data':
        setUserData(data);
        break;
      case 'room_joined':
        setCurrentRoom(data.roomId);
        break;
      case 'user_joined':
        setUsersInRoom((prev) => [...prev, data]);
        addSystemMessage(`${data.username} joined the room`);
        break;
      case 'user_left':
        setUsersInRoom((prev) =>
          prev.filter((user) => user.userId !== data.userId)
        );
        addSystemMessage(`${data.username} left the room`);
        break;

      case 'receive_message':
        setMessages((prev) => [...prev, data]);
        break;

      case 'anonymous_toggled':
        setUserData((prev) => ({ ...prev, ...data }));
        addSystemMessage(
          data.isAnonymous
            ? 'You are now anonymous'
            : `You are now visible as ${data.username}`
        );
        break;
      case 'language_changed':
        setUserData((prev) => ({ ...prev, language: data.language }));
        addSystemMessage(`Language changed to ${data.language}`);
        break;
      case 'room_expired':
        setCurrentRoom(null);
        setMessages([]);
        setUsersInRoom([]);
        addSystemMessage('This room has expired due to inactivity');
        navigate('/chat');
        break;
      default:
        console.warn('Unhandled socket event:', event, data);
    }
  },
  [addSystemMessage, navigate]
);

  /* ---------- 4a. register / clean listeners when socket ready ---------- */
  useEffect(() => {
    if (!socket) return;
    const cleanup = setupSocketListeners(socket, handleSocketEvent);
    return () => cleanup();
  }, [socket, handleSocketEvent]);

  /* ---------- 4b. clear typingTimeout on unmount ---------- */
  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [typingTimeout]);

  /* ---------- 5. actions exposed to app ---------- */
  const actions = useMemo(() => {
    // (ensureConnect + connect / joinRoom / sendMessage … unchanged)
    const ensureConnect = () =>
      new Promise((resolve) => {
        if (!socket) return;
        if (socket.connected) return resolve();
        socket.once('connect', resolve);
        socket.connect();
      });

    return {
      connect: async (userId, username, isAnonymous, language) => {
        if (!socket) return;
        await ensureConnect();
        socket.emit('join_app', { userId, username, isAnonymous, language });
        socket.emit('join_room', { roomId: 'general-room', username });
        setCurrentRoom('general-room');
        setMessages([]);
        setUsersInRoom([]);
      },
      joinRoom: (roomId, username) => {
        if (!socket) return;
        socket.emit('join_room', { roomId, username });
        setCurrentRoom(roomId);
        setMessages([]);
        setUsersInRoom([]);
      },
      sendMessage: (content, roomId) => {
        if (!socket) return;
        socket.emit('send_message', { content, roomId });
        setIsTyping(false);
      },
      toggleAnonymous: (isAnonymous) =>
        socket?.emit('toggle_anonymous', { isAnonymous }),
      changeLanguage: (language) =>
        socket?.emit('change_language', { language }),
      handleTyping: () => {
        if (!socket || !currentRoom) return;
        if (typingTimeout) clearTimeout(typingTimeout);

        setIsTyping(true);
        socket.emit('typing', { roomId: currentRoom, isTyping: true });

        const t = setTimeout(() => {
          setIsTyping(false);
          socket.emit('typing', { roomId: currentRoom, isTyping: false });
        }, 2000);
        setTypingTimeout(t);
      },
    };
  }, [socket, currentRoom, typingTimeout]);

  /* ---------- 6. context value ---------- */
  const value = useMemo(
    () => ({
      socket,
      userData,
      currentRoom,
      messages,
      usersInRoom,
      isTyping,
      ...actions,
    }),
    [socket, userData, currentRoom, messages, usersInRoom, isTyping, actions]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

/* ---------- hook ---------- */
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be inside SocketProvider');
  return ctx;
};
