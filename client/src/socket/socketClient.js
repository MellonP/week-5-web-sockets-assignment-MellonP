// src/utils/socketClient.js
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const initSocket = () => {
  const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
  return socket;
};

export const connectSocket = (socket, userId, username, isAnonymous, language) => {
  socket.connect();
  socket.emit('join_app', { userId, username, isAnonymous, language });
};

export const joinRoom = (socket, roomId, username) => {
  socket.emit('join_room', { roomId, username });
};

export const sendMessage = (socket, content, roomId) => {
  socket.emit('send_message', { content, roomId });
};

export const toggleAnonymous = (socket, isAnonymous) => {
  socket.emit('toggle_anonymous', { isAnonymous });
};

export const changeLanguage = (socket, language) => {
  socket.emit('change_language', { language });
};

export const setupSocketListeners = (socket, handlers) => {
  const cleanupFunctions = [
    () => socket.off('connect'),
    () => socket.off('disconnect'),
    () => socket.off('connect_error'),
    () => socket.off('user_data'),
    () => socket.off('room_joined'),
    () => socket.off('user_joined'),
    () => socket.off('user_left'),
    () => socket.off('receive_message'),
    () => socket.off('anonymous_toggled'),
    () => socket.off('language_changed'),
    () => socket.off('room_expired'),
  ];

  socket.on('connect', () => handlers.onConnect?.());
  socket.on('disconnect', () => handlers.onDisconnect?.());
  socket.on('connect_error', (err) => handlers.onConnectError?.(err));
  socket.on('user_data', (data) => handlers.onUserData?.(data));
  socket.on('room_joined', (data) => handlers.onRoomJoined?.(data));
  socket.on('user_joined', (data) => handlers.onUserJoined?.(data));
  socket.on('user_left', (data) => handlers.onUserLeft?.(data));
  socket.on('receive_message', (data) => handlers.onReceiveMessage?.(data));
  socket.on('anonymous_toggled', (data) => handlers.onAnonymousToggled?.(data));
  socket.on('language_changed', (data) => handlers.onLanguageChanged?.(data));
  socket.on('room_expired', () => handlers.onRoomExpired?.());

  return () => cleanupFunctions.forEach((fn) => fn());
};
