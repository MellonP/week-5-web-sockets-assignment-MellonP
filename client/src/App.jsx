// src/App.jsx
import styled from 'styled-components';
import { GlobalStyles } from './components/GlobalStyles';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat/:roomId?" element={<ChatPage />} />
        </Routes>
      </AppContainer>
    </>
  );
}

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  transition: all 0.3s ease;
`;

export default App;
