import React from 'react';
import { useSocket } from '../../context/SocketContext';

const ChatMessages = () => {
  const { messages, isTyping } = useSocket();

  return (
    <div style={styles.messagesContainer}>
      <div style={styles.messages}>
        {messages.map((msg) => (
          <div key={msg.id} style={styles.message}>
            <strong>{msg.username}:</strong> {msg.content}
          </div>
        ))}
      </div>
      {isTyping && (
        <div style={styles.typingIndicator}>
          Someone is typing...
        </div>
      )}
    </div>
  );
};

const styles = {
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
  },
  message: {
    marginBottom: '8px',
    padding: '8px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
  },
  typingIndicator: {
    color: '#666',
    fontStyle: 'italic',
    padding: '4px 8px',
  },
};

export default ChatMessages;