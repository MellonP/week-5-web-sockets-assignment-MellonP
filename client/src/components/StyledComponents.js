import styled, { css } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import PropTypes from 'prop-types'; // Added PropTypes import

// Button component with prop filtering
const ButtonBase = styled.button.withConfig({
  shouldForwardProp: (prop) => 
    isPropValid(prop) && !['size', 'absolute', 'bottom', 'right'].includes(prop)
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  outline: none;
  position: relative;
  overflow: hidden;

  &:focus-visible {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primaryLight};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

// Size variants
const sizeVariants = {
  small: css`
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  `,
  medium: css`
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  `,
  large: css`
    padding: 1rem 2rem;
    font-size: 1.125rem;
  `
};

// Primary Button
export const Button = styled(ButtonBase)`
  ${({ size }) => sizeVariants[size || 'medium']}
  background-color: ${({ theme }) => theme.primary};
  color: white;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.primaryDark};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  ${({ $isLoading }) => $isLoading && css`
    pointer-events: none;
    opacity: 0.7;
    &::after {
      content: '';
      position: absolute;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    }
  `}

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Secondary Button
export const SecondaryButton = styled(ButtonBase)`
  ${({ size }) => sizeVariants[size || 'medium']}
  background-color: ${({ theme }) => theme.backgroundSecondary};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.backgroundTertiary};
  }
`;

// Icon Button
export const IconButton = styled(ButtonBase)`
  background: none;
  padding: 0.5rem;
  border-radius: 50%;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${({ theme }) => theme.backgroundSecondary};
    color: ${({ theme }) => theme.primary};
  }

  ${({ size }) => size === 'large' && css`
    padding: 0.75rem;
    font-size: 1.5rem;
  `}
`;

// Floating Action Button
export const FabButton = styled(Button).attrs(({ absolute, bottom, right }) => ({
  style: {
    position: absolute ? 'absolute' : 'fixed',
    bottom: bottom || '2rem',
    right: right || '2rem'
  }
}))`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  padding: 0;
  box-shadow: ${({ theme }) => theme.elevation.medium};
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ size }) => size === 'small' && css`
    width: 2.5rem;
    height: 2.5rem;
  `}

  ${({ size }) => size === 'large' && css`
    width: 4.5rem;
    height: 4.5rem;
  `}
`;

// Other components (unchanged)
export const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

export const Title = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
`;

export const Subtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0;
`;

export const Input = styled.input`
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.backgroundSecondary};
  color: ${({ theme }) => theme.text};
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

export const ToggleButton = styled(ButtonBase)`
  padding: 0.5rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.textSecondary};
  
  &:hover {
    background-color: ${({ theme }) => theme.backgroundSecondary};
  }
`;

export const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
`;

// Prop type definitions
const commonButtonPropTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired
};

Button.propTypes = {
  ...commonButtonPropTypes,
  $isLoading: PropTypes.bool // Changed to transient prop
};

SecondaryButton.propTypes = commonButtonPropTypes;

IconButton.propTypes = {
  ...commonButtonPropTypes,
  'aria-label': PropTypes.string.isRequired
};

FabButton.propTypes = {
  ...commonButtonPropTypes,
  absolute: PropTypes.bool,
  bottom: PropTypes.string,
  right: PropTypes.string
};

ToggleButton.propTypes = {
  ...commonButtonPropTypes,
  'aria-label': PropTypes.string
};

// Default props
Button.defaultProps = {
  size: 'medium',
  $isLoading: false,
  disabled: false
};

SecondaryButton.defaultProps = {
  size: 'medium',
  disabled: false
};

IconButton.defaultProps = {
  size: 'medium',
  disabled: false
};

FabButton.defaultProps = {
  absolute: false,
  size: 'medium',
  disabled: false
};

ToggleButton.defaultProps = {
  size: 'medium',
  disabled: false
};

Input.defaultProps = {
  type: 'text'
};

// Add this with your other styled components (before the ChatPage component)
const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

// Also define SettingsButton if it's missing
const SettingsButton = styled(Button)`
  background: none;
  border: none;
  padding: 0.5rem;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text};
`;