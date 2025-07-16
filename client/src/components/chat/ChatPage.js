import React from 'react';
import ChatHeader from '@components/chat/ChatHeader';      // alias import
import ChatMessages from '@components/chat/ChatMessages';  // cleaned path
import ChatInput from '@components/chat/ChatInput';        // cleaned path

const ChatPage = () => {
  return (
    <div style={styles.chatContainer}>
      <ChatHeader title="Group Chat" showBackButton />
      <ChatMessages />
      <ChatInput roomId="general-room" />
    </div>
  );
};

const styles = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f8f9fa', // optional: light background for chat layout
  },
};

export default ChatPage;
