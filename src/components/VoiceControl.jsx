import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { getAvatarSpeaking, loadVoices } from '../utils/speechAPI';

function VoiceControl({ onTranscript, selectedLanguage = 'en' }) {
  const [isListening, setIsListening] = useState(false);
  const [transcriptionStatus, setTranscriptionStatus] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Language codes for speech recognition
  const languageCodes = {
    en: 'en-US',
    tl: 'fil-PH',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR'
  };

  // Watchdog: If AI starts talking, kill the mic immediately
  useEffect(() => {
    const monitor = setInterval(() => {
      if (getAvatarSpeaking() && isListening) {
        stopListening();
      }
    }, 100);
    return () => clearInterval(monitor);
  }, [isListening]);

  useEffect(() => {
    loadVoices();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = languageCodes[selectedLanguage] || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscriptionStatus('🎤 Listening...');
      };

      recognition.onresult = (event) => {
        if (getAvatarSpeaking()) {
          recognition.stop();
          return;
        }

        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) final += transcript;
          else interim += transcript;
        }

        setInterimTranscript(interim);
        if (final) {
          onTranscript(final.trim());
          setInterimTranscript('');
          recognition.stop();
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setTranscriptionStatus(`⚠️ Error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTranscriptionStatus('');
      };

      recognitionRef.current = recognition;
    } else {
      setTranscriptionStatus('⚠️ Speech recognition not supported');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, selectedLanguage]);

  const startListening = () => {
    if (!getAvatarSpeaking() && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  return (
    <div className="voice-control">
      <div className="voice-header">
        <h3>🎙️ Voice Assistant</h3>
        <p className="voice-subtitle">Speak naturally for accurate recognition</p>
      </div>

      <button
        onClick={isListening ? stopListening : startListening}
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        disabled={getAvatarSpeaking()}
      >
        {isListening ? (
          <>
            <Mic size={24} className="pulse" />
            <span>Listening...</span>
          </>
        ) : (
          <>
            <MicOff size={24} />
            <span>{getAvatarSpeaking() ? 'AI Speaking...' : 'Click to Speak'}</span>
          </>
        )}
      </button>

      {interimTranscript && !getAvatarSpeaking() && (
        <div className="interim-transcript">
          <span className="interim-text">"{interimTranscript}"</span>
        </div>
      )}

      {transcriptionStatus && (
        <div className={`transcription-status ${transcriptionStatus.includes('✓') ? 'success' : 'listening'}`}>
          <small>{transcriptionStatus}</small>
        </div>
      )}
    </div>
  );
}

export default VoiceControl;