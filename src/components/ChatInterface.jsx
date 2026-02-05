import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

function ChatInterface({ onSendMessage, messages, avatarConfigs }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const getAvatarInfo = (avatarKey) => {
    return avatarConfigs[avatarKey] || { name: 'Assistant', color: '#7c6a5c', badge: 'AI' };
  };

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.map((msg, index) => {
          const avatarInfo = msg.avatar ? getAvatarInfo(msg.avatar) : null;
          
          return (
            <div
              key={index}
              className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-content">
                {msg.sender === 'user' ? (
                  <strong>You:</strong>
                ) : (
                  <div className="message-avatar-header">
                    {avatarInfo && (
                      <span 
                        className="message-avatar-badge"
                        style={{ background: avatarInfo.color }}
                      >
                        {avatarInfo.badge}
                      </span>
                    )}
                    <strong>{avatarInfo ? avatarInfo.name : 'Avatar'}:</strong>
                  </div>
                )}
                <p>{msg.text}</p>
              </div>
              {msg.context && (
                <div className="message-context">
                  <small>
                    Detected: {msg.context.age} • {msg.context.emotion}
                  </small>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
        />
        <button type="submit" className="send-btn" disabled={!input.trim()}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}

export default ChatInterface;