import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';

const ChatInput = ({ roomId }) => {
  const [message, setMessage] = useState('');
  const { handleTyping, sendMessage } = useSocket();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message, roomId);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleTyping} // 👈 Typing detection
        onFocus={handleTyping}   // Optional: Trigger on focus
        placeholder="Type a message..."
        style={styles.input}
      />
      <button type="submit" style={styles.button}>
        Send
      </button>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderTop: '1px solid #ddd',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  button: {
    marginLeft: '10px',
    padding: '8px 16px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
  },
};

export default ChatInput;