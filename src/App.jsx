import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import SingleAvatar from './components/SingleAvatar';
import ChatInterface from './components/ChatInterface';
import RealEmotionDetector from './components/RealEmotionDetector';
import VoiceControl from './components/VoiceControl';
import { getAIResponse, getScriptedResponse, routeToAvatar } from './utils/geminiAI';
import { textToSpeech, setAvatarSpeaking } from './utils/speechAPI';

function App() {
  // Separate message history for each avatar
  const [conversationHistory, setConversationHistory] = useState({
    sarah: [],
    daisy: [],
    john: []
  });
  const [userContext, setUserContext] = useState(null);
  const [isAvatarAnimating, setIsAvatarAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [avatarEmotion, setAvatarEmotion] = useState('happy');
  const [currentSpokenText, setCurrentSpokenText] = useState('');
  const [activeAvatar, setActiveAvatar] = useState('sarah');
  const hasGreeted = useRef(false);
  const hasInitialized = useRef(false);

  // Avatar configurations
  const avatarConfigs = {
    sarah: {
      name: 'Sarah',
      role: 'Welcoming Host',
      badge: 'Host',
      color: '#6b9b76',
      responsibilities: 'General & Logistics'
    },
    daisy: {
      name: 'Daisy',
      role: 'Booking Specialist',
      badge: 'Concierge',
      color: '#d4a574',
      responsibilities: 'Scheduling & Payments'
    },
    john: {
      name: 'John',
      role: 'Support Manager',
      badge: 'Support',
      color: '#7c6a5c',
      responsibilities: 'Operations & Assistance'
    }
  };

  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;

    const welcomeMessage = {
      sender: 'ai',
      avatar: 'sarah',
      text: 'Hello! Welcome to Hotel Rafaela. I\'m Sarah, your host assistant. I can help with general information, facilities, and directions. For bookings, Daisy is here to assist. For support, John is ready to help. How may I assist you today?',
      context: null
    };
    
    setConversationHistory(prev => ({
      ...prev,
      sarah: [welcomeMessage]
    }));
    
    setTimeout(() => {
      handleAvatarSpeak(welcomeMessage.text, 'sarah');
    }, 500);
  }, []);

  const handleVisionDetection = useCallback((detection) => {
    setUserContext(detection);
    
    if (detection && detection.emotion) {
      setTimeout(() => {
        setAvatarEmotion(detection.emotion);
      }, 300);
    } else {
      setAvatarEmotion('happy');
    }
  }, []);

  const handleVoiceTranscript = (transcript) => {
    if (transcript && transcript.trim()) {
      handleSendMessage(transcript);
    }
  };

  const handleAvatarSpeak = async (text, avatar = activeAvatar) => {
    setCurrentSpokenText(text);
    setIsAvatarAnimating(true);
    setAvatarSpeaking(true);
    
    try {
      // UPDATED: Pass avatar name as third parameter
      await textToSpeech(text, true, avatar);
      
      const wordsPerSecond = 2.5;
      const words = text.split(' ').length;
      const speakDuration = (words / wordsPerSecond) * 1000;
      
      setTimeout(() => {
        setIsAvatarAnimating(false);
        setCurrentSpokenText('');
        setAvatarSpeaking(false);
      }, speakDuration);
    } catch (error) {
      console.error('Speech error:', error);
      const speakDuration = Math.min(text.length * 50, 5000);
      setTimeout(() => {
        setIsAvatarAnimating(false);
        setCurrentSpokenText('');
        setAvatarSpeaking(false);
      }, speakDuration);
    }
  };

  const handleSendMessage = async (userMessage) => {
    if (isProcessing || !userMessage.trim()) return;

    // Route message to appropriate avatar
    const assignedAvatar = routeToAvatar(userMessage);
    
    // Switch to the assigned avatar
    if (assignedAvatar !== activeAvatar) {
      setActiveAvatar(assignedAvatar);
    }

    const userMsg = {
      sender: 'user',
      text: userMessage,
      context: userContext
    };
    
    // Add user message to the assigned avatar's conversation
    setConversationHistory(prev => ({
      ...prev,
      [assignedAvatar]: [...prev[assignedAvatar], userMsg]
    }));

    setIsProcessing(true);

    try {
      // Get scripted or AI response
      let aiResponse = getScriptedResponse(userMessage, assignedAvatar);
      
      if (!aiResponse) {
        aiResponse = await getAIResponse(userMessage, userContext || {}, assignedAvatar);
      }

      const aiMsg = {
        sender: 'ai',
        avatar: assignedAvatar,
        text: aiResponse,
        context: null
      };
      
      // Add AI response to the assigned avatar's conversation
      setConversationHistory(prev => ({
        ...prev,
        [assignedAvatar]: [...prev[assignedAvatar], aiMsg]
      }));

      await handleAvatarSpeak(aiResponse, assignedAvatar);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = 'I apologize for the inconvenience. Could you please try again?';
      
      const errorMsg = {
        sender: 'ai',
        avatar: assignedAvatar,
        text: errorMessage,
        context: null
      };
      
      setConversationHistory(prev => ({
        ...prev,
        [assignedAvatar]: [...prev[assignedAvatar], errorMsg]
      }));
      
      await handleAvatarSpeak(errorMessage, assignedAvatar);
    }

    setIsProcessing(false);
  };

  const handleAvatarSwitch = (avatarKey) => {
    if (avatarKey === activeAvatar) return; // Don't greet if already active
    
    setActiveAvatar(avatarKey);
    
    // Only greet if this avatar hasn't been greeted yet
    if (conversationHistory[avatarKey].length === 0) {
      const config = avatarConfigs[avatarKey];
      const switchMessage = {
        sender: 'ai',
        avatar: avatarKey,
        text: `Hi! I'm ${config.name}, your ${config.role}. I specialize in ${config.responsibilities}. How can I help you?`,
        context: null
      };
      
      setConversationHistory(prev => ({
        ...prev,
        [avatarKey]: [switchMessage]
      }));
      
      handleAvatarSpeak(switchMessage.text, avatarKey);
    }
  };

  // Get current avatar's messages
  const currentMessages = conversationHistory[activeAvatar];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">🏠︎</div>
            <div className="header-text">
              <h1>Hotel Rafaela Smart Service</h1>
              <p className="header-subtitle">Multi-Avatar Service</p>
            </div>
          </div>
          <div className="header-status">
            <div className="status-indicator online">
              <span className="status-dot"></span>
              <span>All Assistants Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="main-container">
        <aside className="left-panel">
          <div className="panel-section">
            <h2 className="panel-title">Select Assistant</h2>
            <div className="avatar-selector">
              {Object.entries(avatarConfigs).map(([key, config]) => (
                <button
                  key={key}
                  className={`avatar-select-btn ${activeAvatar === key ? 'active' : ''}`}
                  onClick={() => handleAvatarSwitch(key)}
                  style={{
                    borderColor: activeAvatar === key ? config.color : 'var(--border-color)'
                  }}
                >
                  <div className="avatar-select-badge" style={{ background: config.color }}>
                    {config.badge}
                  </div>
                  <div className="avatar-select-info">
                    <span className="avatar-select-name">{config.name}</span>
                    <span className="avatar-select-role">{config.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <h2 className="panel-title">Emotion Detection</h2>
            <RealEmotionDetector onDetection={handleVisionDetection} />
            
            {userContext && (
              <div className="context-display">
                <h3>Detected Profile</h3>
                <div className="context-grid">
                  <div className="context-item">
                    <span className="context-label">Age</span>
                    <span className="context-value">{userContext.age}</span>
                  </div>
                  <div className="context-item">
                    <span className="context-label">Emotion</span>
                    <span className="context-value">{userContext.emotion}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="panel-section">
            <h2 className="panel-title"> ၊၊||၊ Voice Control</h2>
            <VoiceControl
              onTranscript={handleVoiceTranscript}
              onResponse={(text) => console.log('Avatar spoke:', text)}
            />
          </div>

          <div className="panel-section features-section">
            <h3 className="features-title">Quick Actions</h3>
            <div className="quick-actions">
              <button className="quick-action-btn" onClick={() => handleSendMessage('I want to schedule a room')}>
                Schedule Room
              </button>
              <button className="quick-action-btn" onClick={() => handleSendMessage('Check availability')}>
                Check Availability
              </button>
              <button className="quick-action-btn" onClick={() => handleSendMessage('What are the room types?')}>
                Room Types
              </button>
              <button className="quick-action-btn" onClick={() => handleSendMessage('What are your prices?')}>
                Pricing Info
              </button>
            </div>
          </div>
        </aside>

        <main className="center-panel">
          <div className="avatar-section">
            <div className="avatar-header">
              <div className="avatar-info">
                <div className="avatar-badge" style={{ background: avatarConfigs[activeAvatar].color }}>
                  {avatarConfigs[activeAvatar].badge}
                </div>
                <div>
                  <h2>{avatarConfigs[activeAvatar].name} - {avatarConfigs[activeAvatar].role}</h2>
                  <p className="avatar-role">{avatarConfigs[activeAvatar].responsibilities}</p>
                </div>
              </div>
              {isProcessing && (
                <div className="processing-badge">
                  <span className="processing-spinner"></span>
                  <span>Thinking...</span>
                </div>
              )}
            </div>
            
            <SingleAvatar
              activeAvatar={activeAvatar}
              isAnimating={isAvatarAnimating}
              currentEmotion={avatarEmotion}
              spokenText={currentSpokenText}
            />
          </div>
        </main>

        <aside className="right-panel">
          <div className="chat-header">
            <h2 className="panel-title">💬 Conversation with {avatarConfigs[activeAvatar].name}</h2>
            <span className="chat-count">{currentMessages.length} messages</span>
          </div>
          <ChatInterface 
            messages={currentMessages} 
            onSendMessage={handleSendMessage}
            avatarConfigs={avatarConfigs}
          />
        </aside>
      </div>

      <footer className="app-footer">
        <div className="footer-content">
          <p>Powered by AI • 3 Specialized Avatars • Emotion Detection • Voice • Lip Sync</p>
        </div>
      </footer>
    </div>
  );
}

export default App;