import axios from 'axios';

const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// Track if avatar is currently speaking (to prevent feedback loop)
let isAvatarSpeaking = false;

export function setAvatarSpeaking(speaking) {
  isAvatarSpeaking = speaking;
}

export function getAvatarSpeaking() {
  return isAvatarSpeaking;
}

// Speech-to-Text using HuggingFace Whisper
export async function speechToText(audioBlob) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
      audioBlob,
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'audio/wav',
        },
      }
    );
    
    return response.data.text;
  } catch (error) {
    console.error('Speech-to-Text Error:', error);
    throw error;
  }
}

// Text-to-Speech with avatar-specific voices
export async function textToSpeech(text, useElevenLabs = false, avatarName = 'sarah') {
  // Set flag that avatar is speaking
  setAvatarSpeaking(true);

  if (useElevenLabs && ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== 'your_elevenlabs_key_here') {
    try {
      // ElevenLabs voice IDs for different avatars
      const elevenLabsVoices = {
        sarah: '21m00Tcm4TlvDq8ikWAM', // Rachel - warm, professional female
        daisy: 'EXAVITQu4vr4xnSDxMaL', // Bella - friendly, energetic female
        john: 'VR6AewLTigWG4xSOukaG' // Arnold - confident male
      };

      const voiceId = elevenLabsVoices[avatarName] || elevenLabsVoices.sarah;

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          },
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );
      
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return new Promise((resolve) => {
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setAvatarSpeaking(false);
          resolve(true);
        };
        audio.onerror = () => {
          setAvatarSpeaking(false);
          resolve(false);
        };
        audio.play();
      });
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      // Fallback to browser TTS
      return browserTextToSpeech(text, avatarName);
    }
  } else {
    // Use free browser TTS with avatar-specific voices
    return browserTextToSpeech(text, avatarName);
  }
}

// Browser-based TTS with avatar-specific voices
function browserTextToSpeech(text, avatarName = 'sarah') {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Configure voice based on avatar
    if (avatarName === 'john') {
      // Male voice configuration
      utterance.rate = 0.95;
      utterance.pitch = 0.85; // Lower pitch for male voice
      utterance.volume = 1.0;
      
      // Try to find a male voice
      const maleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('male') ||
        voice.name.toLowerCase().includes('david') ||
        voice.name.toLowerCase().includes('james') ||
        voice.name.toLowerCase().includes('george') ||
        voice.name.toLowerCase().includes('daniel') ||
        voice.name.toLowerCase().includes('mark') ||
        voice.name.toLowerCase().includes('ryan')
      );
      
      if (maleVoice) {
        utterance.voice = maleVoice;
      } else {
        // Fallback to any male-sounding voice with lower pitch
        const englishVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          !voice.name.toLowerCase().includes('female')
        );
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
    } else if (avatarName === 'daisy') {
      // Daisy - energetic, younger female voice
      utterance.rate = 1.05; // Slightly faster
      utterance.pitch = 1.3; // Higher pitch for younger sound
      utterance.volume = 1.0;
      
      // Try to find an energetic female voice
      const daisyVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('kate') ||
        voice.name.toLowerCase().includes('emma') ||
        voice.name.toLowerCase().includes('fiona') ||
        voice.name.toLowerCase().includes('google uk english female')
      );
      
      if (daisyVoice) {
        utterance.voice = daisyVoice;
      } else {
        // Fallback to any female voice
        const femaleVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.lang.startsWith('en')
        );
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
      }
    } else {
      // Sarah - warm, professional female voice (default)
      utterance.rate = 0.95;
      utterance.pitch = 1.15; // Moderate pitch
      utterance.volume = 1.0;
      
      // Try to find a professional female voice
      const sarahVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('victoria') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('susan') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('hazel') ||
        voice.name.toLowerCase().includes('google us english female')
      );
      
      if (sarahVoice) {
        utterance.voice = sarahVoice;
      } else {
        // Fallback to any English voice
        const englishVoice = voices.find(voice => 
          voice.lang.startsWith('en')
        );
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
    }
    
    utterance.onend = () => {
      setAvatarSpeaking(false);
      resolve(true);
    };
    
    utterance.onerror = (error) => {
      console.error('TTS error:', error);
      setAvatarSpeaking(false);
      resolve(false);
    };
    
    window.speechSynthesis.speak(utterance);
  });
}

// Load voices (needed for browser TTS)
export function loadVoices() {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
    }
  });
}

// Get phoneme data for lip sync (simplified version)
export function getPhonemeData(text) {
  // Simplified phoneme mapping for basic lip sync
  const words = text.toLowerCase().split(' ');
  const phonemes = [];
  
  words.forEach((word, index) => {
    const timeOffset = index * 0.3; // Approximate time per word
    
    // Map common sounds to mouth shapes
    if (word.match(/[aeiou]/)) {
      phonemes.push({ time: timeOffset, shape: 'open' });
    }
    if (word.match(/[mn]/)) {
      phonemes.push({ time: timeOffset + 0.1, shape: 'closed' });
    }
    if (word.match(/[fv]/)) {
      phonemes.push({ time: timeOffset + 0.15, shape: 'tight' });
    }
  });
  
  return phonemes;
}