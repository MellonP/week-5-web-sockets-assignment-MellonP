import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --transition: all 0.3s ease;
  }

  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.5;
    transition: var(--transition);
    min-height: 100vh;
  }

  a {
    text-decoration: none;
    color: inherit;
    transition: var(--transition);
    
    &:hover {
      color: ${({ theme }) => theme.primary};
    }
  }

  button {
    cursor: pointer;
    border: none;
    background: transparent;
    color: inherit;
    font-family: inherit;
    transition: var(--transition);
  }

  input, 
  textarea,
  select {
    background-color: ${({ theme }) => theme.backgroundSecondary};
    color: ${({ theme }) => theme.text};
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 4px;
    padding: 0.75rem 1rem;
    width: 100%;
    outline: none;
    font-family: inherit;
    font-size: 1rem;
    transition: var(--transition);

    &:focus {
      border-color: ${({ theme }) => theme.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}33;
    }

    &::placeholder {
      color: ${({ theme }) => theme.textSecondary};
      opacity: 0.7;
    }
  }

  img {
    max-width: 100%;
    display: block;
  }

  ul, ol {
    list-style: none;
  }

  .scrollbar {
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.primary} ${({ theme }) => theme.backgroundSecondary};

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: ${({ theme }) => theme.backgroundSecondary};
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.primary};
      border-radius: 4px;
      
      &:hover {
        background: ${({ theme }) => theme.primary}dd;
      }
    }
  }

  /* Accessibility improvements */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;