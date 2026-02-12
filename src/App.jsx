import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import SingleAvatar from './components/SingleAvatar';
import ChatInterface from './components/ChatInterface';
import RealEmotionDetector from './components/RealEmotionDetector';
import VoiceControl from './components/VoiceControl';
import { getAIResponse, getScriptedResponse, routeToAvatar } from './utils/geminiAI';
import { textToSpeech, setAvatarSpeaking } from './utils/speechAPI';

function App() {
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
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const hasGreeted = useRef(false);

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

  const languages = {
    en: { name: 'English', flag: '🇺🇸' },
    tl: { name: 'Filipino', flag: '🇵🇭' },
    zh: { name: 'Chinese', flag: '🇨🇳' },
    ja: { name: 'Japanese', flag: '🇯🇵' },
    ko: { name: 'Korean', flag: '🇰🇷' }
  };

  const welcomeMessages = {
    en: 'Hello! Welcome to Hotel Rafaela. I\'m your host assistant. How may I assist you today?',
    tl: 'Kumusta! Maligayang pagdating sa Hotel Rafaela. Ako ang inyong host assistant. Paano kita matutulungan ngayon?',
    zh: '你好！欢迎来到拉法埃拉酒店。今天我能为您做些什么？',
    ja: 'こんにちは！ホテルラファエラへようこそ。今日は何をお手伝いできますか？',
    ko: '안녕하세요! 호텔 라파엘라에 오신 것을 환영합니다. 오늘 무엇을 도와드릴까요?'
  };

  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;

    const welcomeMessage = {
      sender: 'ai',
      avatar: 'sarah',
      text: welcomeMessages[selectedLanguage],
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
      // Wait for actual speech to complete - no manual timing!
      await textToSpeech(text, false, avatar, selectedLanguage);
      
      // Stop animation immediately when speech ends
      setIsAvatarAnimating(false);
      setCurrentSpokenText('');
      setAvatarSpeaking(false);
      
    } catch (error) {
      console.error('Speech error:', error);
      // Fallback: stop after reasonable time if speech fails
      setTimeout(() => {
        setIsAvatarAnimating(false);
        setCurrentSpokenText('');
        setAvatarSpeaking(false);
      }, 3000);
    }
  };

  const handleSendMessage = async (userMessage) => {
    if (isProcessing || !userMessage.trim()) return;

    // Route to the correct avatar based on trigger words
    const assignedAvatar = routeToAvatar(userMessage);
    
    console.log(`Message: "${userMessage}" → Routed to: ${assignedAvatar}`);
    
    // IMPORTANT: Switch to the assigned avatar BEFORE processing
    if (assignedAvatar !== activeAvatar) {
      setActiveAvatar(assignedAvatar);
    }

    const userMsg = {
      sender: 'user',
      text: userMessage,
      context: userContext
    };
    
    setConversationHistory(prev => ({
      ...prev,
      [assignedAvatar]: [...prev[assignedAvatar], userMsg]
    }));

    setIsProcessing(true);

    try {
      // Pass language parameter to get responses in the correct language
      let aiResponse = getScriptedResponse(userMessage, assignedAvatar, selectedLanguage);
      
      if (!aiResponse) {
        aiResponse = await getAIResponse(userMessage, userContext || {}, assignedAvatar, selectedLanguage);
      }

      const aiMsg = {
        sender: 'ai',
        avatar: assignedAvatar,
        text: aiResponse,
        context: null
      };
      
      setConversationHistory(prev => ({
        ...prev,
        [assignedAvatar]: [...prev[assignedAvatar], aiMsg]
      }));

      // Make sure to speak with the correct avatar
      await handleAvatarSpeak(aiResponse, assignedAvatar);

    } catch (error) {
      console.error('Error:', error);
      
      const errorMessages = {
        en: 'I apologize for the inconvenience. Could you please try again?',
        tl: 'Paumanhin sa abala. Maaari mo bang subukan muli?',
        zh: '很抱歉给您带来不便。您能再试一次吗？',
        ja: 'ご不便をおかけして申し訳ございません。もう一度お試しいただけますか？',
        ko: '불편을 드려 죄송합니다. 다시 시도해 주시겠습니까?'
      };
      
      const errorMessage = errorMessages[selectedLanguage] || errorMessages.en;
      
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
    if (avatarKey === activeAvatar) return;
    
    setActiveAvatar(avatarKey);
    
    if (conversationHistory[avatarKey].length === 0) {
      const config = avatarConfigs[avatarKey];
      
      const switchMessages = {
        en: `Hi! I'm ${config.name}, your ${config.role}. I specialize in ${config.responsibilities}. How can I help you?`,
        tl: `Kumusta! Ako si ${config.name}, ang iyong ${config.role}. Dalubhasa ako sa ${config.responsibilities}. Paano kita matutulungan?`,
        zh: `你好！我是${config.name}，您的${config.role}。我专门负责${config.responsibilities}。我能帮您什么？`,
        ja: `こんにちは！私は${config.name}、あなたの${config.role}です。${config.responsibilities}を専門としています。何かお手伝いできますか？`,
        ko: `안녕하세요! 저는 ${config.name}, 귀하의 ${config.role}입니다. ${config.responsibilities}를 전문으로 합니다. 무엇을 도와드릴까요?`
      };
      
      const switchMessage = {
        sender: 'ai',
        avatar: avatarKey,
        text: switchMessages[selectedLanguage] || switchMessages.en,
        context: null
      };
      
      setConversationHistory(prev => ({
        ...prev,
        [avatarKey]: [switchMessage]
      }));
      
      handleAvatarSpeak(switchMessage.text, avatarKey);
    }
  };

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    
    const greetMessage = {
      sender: 'ai',
      avatar: activeAvatar,
      text: `Language changed to ${languages[langCode].name}. ${welcomeMessages[langCode]}`,
      context: null
    };
    
    setConversationHistory(prev => ({
      ...prev,
      [activeAvatar]: [...prev[activeAvatar], greetMessage]
    }));
    
    handleAvatarSpeak(greetMessage.text, activeAvatar);
  };

  const currentMessages = conversationHistory[activeAvatar];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">🏠︎</div>
            <div className="header-text">
              <h1>Hotel Rafaela Smart Service</h1>
              <p className="header-subtitle">Multi-Avatar • Multi-Language Service</p>
            </div>
          </div>
          <div className="header-status">
            <div className="language-selector">
              <span className="language-label">Language</span>
              <select 
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="language-select"
              >
                {Object.entries(languages).map(([code, lang]) => (
                  <option key={code} value={code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
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
            <h2 className="panel-title">၊၊||၊ Voice Control</h2>
            <VoiceControl
              onTranscript={handleVoiceTranscript}
              onResponse={(text) => console.log('Avatar spoke:', text)}
              selectedLanguage={selectedLanguage}
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
                  <p className="avatar-role">{avatarConfigs[activeAvatar].responsibilities} • {languages[selectedLanguage].name}</p>
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
            currentLanguage={selectedLanguage}
          />
        </aside>
      </div>

      <footer className="app-footer">
        <div className="footer-content">
          <p>Powered by AI • 3 Specialized Avatars • 5 Languages • Emotion Detection • Voice • Facial Expressions</p>
        </div>
      </footer>
    </div>
  );
}

export default App;