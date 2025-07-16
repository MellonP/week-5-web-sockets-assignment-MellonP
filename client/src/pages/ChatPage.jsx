import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ThemeContext } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { Button } from '../components/StyledComponents';
import ChatHeader from '../components/chat/ChatHeader.js';

// Create local versions of components not available in StyledComponents
const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const ToggleButton = styled(Button)`
  padding: 0.5rem;
  background: none;
  border: none;
  font-size: 1.25rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.backgroundSecondary};
  color: ${({ theme }) => theme.text};
  width: 100%;
`;

const ChatPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const {  
    userData, 
    currentRoom, 
    messages,   
    joinRoom, 
  } = useSocket();

  // ✅ Add this state to fix the crash
  const [showSettings, setShowSettings] = useState(false);

  // Automatically join the room (roomId from URL or default 'general-room')
  useEffect(() => {
    if (userData?.username) {
      const targetRoomId = roomId || 'general-room';
      joinRoom(targetRoomId, userData.username);

      // Optional: update URL if no roomId to keep URL consistent
      if (!roomId) {
        navigate(`/chat/${targetRoomId}`, { replace: true });
      }
    }
  }, [roomId, userData, joinRoom, navigate]);

  return (
    <ChatContainer>
      <ChatHeader>
        <Title>EchoVerse - {currentRoom || 'New Room'}</Title>
        <HeaderActions>
          <ToggleButton onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </ToggleButton>
          <SettingsButton onClick={() => setShowSettings(!showSettings)}>
          </SettingsButton>
        </HeaderActions>
      </ChatHeader>

      {/* Add chat body, messages, input, etc. here */}
      <div style={{ padding: '1rem', color: theme.text }}>
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id}>
              <strong>{msg.username}:</strong> {msg.content}
            </div>
          ))
        )}
      </div>
    </ChatContainer>
  );
};

// Styled Components (only define components that aren't imported)
const ChatContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const SettingsButton = styled(Button)`
  background: none;
  border: none;
  padding: 0.5rem;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text};
`;

export default ChatPage;
