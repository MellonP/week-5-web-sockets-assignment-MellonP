import React from 'react';
import PropTypes from 'prop-types'; // Optional, for prop type checking

const ChatHeader = ({ title = "Chat", onBack, showBackButton = false }) => {
  return (
    <div className="chat-header" style={styles.header}>
      {showBackButton && (
        <button onClick={onBack} style={styles.backButton}>
          &larr;
        </button>
      )}
      <h2 style={styles.title}>{title}</h2>
    </div>
  );
};

// Optional prop types
ChatHeader.propTypes = {
  title: PropTypes.string,
  onBack: PropTypes.func,
  showBackButton: PropTypes.bool,
};

// Basic styling (you can replace with CSS classes if preferred)
const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 15px',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ddd',
  },
  backButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    marginRight: '10px',
    cursor: 'pointer',
  },
  title: {
    margin: 0,
    fontSize: '18px',
  },
};

export default ChatHeader;