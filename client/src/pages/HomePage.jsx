import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ThemeContext } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { Input, Title, Subtitle, ToggleButton } from '../components/StyledComponents';

const HomePage = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { connect, userData } = useSocket();
  const [username, setUsername] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() && !isAnonymous) return;
    
    setIsSubmitting(true);
  try {
    connect(userData?.userId, username, isAnonymous, language);
    navigate('/chat');
  } finally {
    setIsSubmitting(false);
    }
  };

  return (
    <HomeContainer>
      <Header>
        <Title>Welcome to EchoVerse</Title>
        <Subtitle>Experience next-gen communication</Subtitle>
        <ToggleButton onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </ToggleButton>
      </Header>
      
      <Form onSubmit={handleSubmit}>
        {!isAnonymous && (
          <Input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength="30"
            required
          />
        )}
        
        <CheckboxContainer>
          <CheckboxInput
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          <CheckboxLabel htmlFor="anonymous">Join as anonymous</CheckboxLabel>
        </CheckboxContainer>
        
        <LanguageSelect
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Select language"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="ja">Japanese</option>
          <option value="zh">Chinese</option>
        </LanguageSelect>
        
        <SubmitButton 
          type="submit"
          disabled={(!username.trim() && !isAnonymous) || isSubmitting}
          $isLoading={isSubmitting}
          aria-label="Enter chat room"
        >
          {isSubmitting ? 'Connecting...' : 'Enter Chat'}
        </SubmitButton>
      </Form>
    </HomeContainer>
  );
};

// Styled Components
const HomeContainer = styled.div`
  max-width: 500px;
  padding: 2rem;
  margin: 0 auto;
  text-align: center;
  background: ${({ theme }) => theme.background};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
`;

const CheckboxInput = styled.input`
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;
  user-select: none;
`;

const LanguageSelect = styled.select`
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.backgroundSecondary};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryLight};
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background: ${props => props.$isLoading ? '#e0e0e0' : '#3f51b5'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.$isLoading ? 'wait' : 'pointer'};
  transition: all 0.3s;
  width: 100%;

  &:hover:not(:disabled) {
    background: ${props => props.$isLoading ? '#e0e0e0' : '#303f9f'};
  }

  &:disabled {
    opacity: 0.7;
  }
`;

export default HomePage;