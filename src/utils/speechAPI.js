// Speech API with Gender-Specific Multi-Language Voices

let isCurrentlySpeaking = false;

export function setAvatarSpeaking(speaking) {
  isCurrentlySpeaking = speaking;
}

export function isAvatarSpeaking() {
  return isCurrentlySpeaking;
}

// Alias for compatibility
export function getAvatarSpeaking() {
  return isCurrentlySpeaking;
}

// Function to preload voices
export function loadVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.getVoices();
  }
  return [];
}

// Voice configuration: John = male voices, Sarah & Daisy = female voices
const voiceMapping = {
  john: {
    en: { lang: 'en-US', gender: 'male', preferredNames: ['Google US English Male', 'Microsoft David - English (United States)', 'Alex', 'Daniel'] },
    tl: { lang: 'fil-PH', gender: 'male', preferredNames: ['Google Filipino (Philippines) Male', 'Google Filipino Male', 'Microsoft Filipino Male'] },
    zh: { lang: 'zh-CN', gender: 'male', preferredNames: ['Google 普通话（中国大陆）Male', 'Microsoft Yunyang - Chinese (Mainland)', 'Kangkang'] },
    ja: { lang: 'ja-JP', gender: 'male', preferredNames: ['Google 日本語 Male', 'Microsoft Ichiro - Japanese (Japan)', 'Otoya'] },
    ko: { lang: 'ko-KR', gender: 'male', preferredNames: ['Google 한국의 Male', 'Microsoft Korean Male', 'Minsu'] }
  },
  sarah: {
    en: { lang: 'en-US', gender: 'female', preferredNames: ['Google US English Female', 'Microsoft Zira - English (United States)', 'Samantha', 'Victoria'] },
    tl: { lang: 'fil-PH', gender: 'female', preferredNames: ['Google Filipino (Philippines) Female', 'Google Filipino Female', 'Microsoft Filipino Female', 'Rosa'] },
    zh: { lang: 'zh-CN', gender: 'female', preferredNames: ['Google 普通话（中国大陆）Female', 'Microsoft Huihui - Chinese (Simplified, PRC)', 'Yaoyao'] },
    ja: { lang: 'ja-JP', gender: 'female', preferredNames: ['Google 日本語 Female', 'Microsoft Ayumi - Japanese (Japan)', 'Kyoko'] },
    ko: { lang: 'ko-KR', gender: 'female', preferredNames: ['Google 한국의 Female', 'Microsoft Heami - Korean (Korea)', 'Yuna'] }
  },
  daisy: {
    en: { lang: 'en-US', gender: 'female', preferredNames: ['Google US English Female', 'Microsoft Zira - English (United States)', 'Samantha', 'Victoria'] },
    tl: { lang: 'fil-PH', gender: 'female', preferredNames: ['Google Filipino (Philippines) Female', 'Google Filipino Female', 'Microsoft Filipino Female', 'Rosa'] },
    zh: { lang: 'zh-CN', gender: 'female', preferredNames: ['Google 普通话（中国大陆）Female', 'Microsoft Huihui - Chinese (Simplified, PRC)', 'Yaoyao'] },
    ja: { lang: 'ja-JP', gender: 'female', preferredNames: ['Google 日本語 Female', 'Microsoft Ayumi - Japanese (Japan)', 'Kyoko'] },
    ko: { lang: 'ko-KR', gender: 'female', preferredNames: ['Google 한국의 Female', 'Microsoft Heami - Korean (Korea)', 'Yuna'] }
  }
};

function selectVoice(avatar, language) {
  const voices = window.speechSynthesis.getVoices();
  const config = voiceMapping[avatar]?.[language] || voiceMapping[avatar]?.en;
  
  if (!config) {
    console.warn(`No voice config for avatar: ${avatar}, language: ${language}`);
    return null;
  }

  // First, try to find exact preferred voice names
  for (const preferredName of config.preferredNames) {
    const exactMatch = voices.find(voice => 
      voice.name.includes(preferredName) || voice.voiceURI.includes(preferredName)
    );
    if (exactMatch) {
      console.log(`✓ Found preferred voice: ${exactMatch.name}`);
      return exactMatch;
    }
  }

  // Filter by language and gender with improved detection
  const filteredVoices = voices.filter(voice => {
    const matchesLang = voice.lang.startsWith(config.lang.split('-')[0]);
    const voiceName = voice.name.toLowerCase();
    const voiceURI = voice.voiceURI.toLowerCase();
    
    // Enhanced gender detection with more specific patterns
    // Female voice indicators
    const isFemale = voiceName.includes('female') || 
                     voiceURI.includes('female') ||
                     ['zira', 'samantha', 'karen', 'moira', 'ayumi', 'huihui', 'heami', 
                      'kyoko', 'yuna', 'yaoyao', 'rosa', 'victoria'].some(name => 
                       voiceName.includes(name) || voiceURI.includes(name)
                     );
    
    // Male voice indicators - explicitly exclude female voices
    const isMale = !isFemale && (
                   voiceName.includes('male') || 
                   voiceURI.includes('male') ||
                   ['david', 'alex', 'daniel', 'ichiro', 'yunyang', 'otoya', 'minsu', 'kangkang'].some(name => 
                     voiceName.includes(name) || voiceURI.includes(name)
                   ));
    
    const matchesGender = config.gender === 'female' ? isFemale : isMale;
    
    return matchesLang && matchesGender;
  });

  if (filteredVoices.length > 0) {
    console.log(`✓ Found ${config.gender} voice for ${config.lang}: ${filteredVoices[0].name}`);
    return filteredVoices[0];
  }

  // Fallback: just match language, then strictly filter by gender
  const langVoices = voices.filter(voice => voice.lang.startsWith(config.lang.split('-')[0]));
  
  if (langVoices.length > 0) {
    const genderFilteredFallback = langVoices.filter(voice => {
      const name = voice.name.toLowerCase();
      const uri = voice.voiceURI.toLowerCase();
      
      if (config.gender === 'female') {
        // Must have female indicator OR not have male indicator
        return name.includes('female') || uri.includes('female') || 
               (!name.includes('male') && !uri.includes('male'));
      } else {
        // Must have male indicator AND not have female indicator
        return (name.includes('male') || uri.includes('male')) && 
               !name.includes('female') && !uri.includes('female');
      }
    });
    
    const fallbackVoice = genderFilteredFallback[0] || langVoices[0];
    console.log(`⚠ Using fallback voice: ${fallbackVoice.name}`);
    return fallbackVoice;
  }

  // Last resort: use any default voice
  console.warn(`⚠ No suitable voice found, using default`);
  return voices[0] || null;
}

export function textToSpeech(text, interrupt = false, avatar = 'sarah', language = 'en') {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    if (interrupt) {
      window.speechSynthesis.cancel();
      isCurrentlySpeaking = false;
    }

    if (isCurrentlySpeaking && !interrupt) {
      console.log('Already speaking, queuing...');
    }

    // Ensure voices are loaded
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        voices = window.speechSynthesis.getVoices();
        speakText();
      }, { once: true });
    } else {
      speakText();
    }

    function speakText() {
      const utterance = new SpeechSynthesisUtterance(text);
      
      const selectedVoice = selectVoice(avatar, language);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        const config = voiceMapping[avatar]?.[language] || voiceMapping[avatar]?.en;
        utterance.lang = config?.lang || 'en-US';
      }

      // Adjust speech parameters for better quality
      utterance.rate = 1.0;
      utterance.pitch = avatar === 'john' ? 0.9 : 1.1; // Lower pitch for John, higher for Sarah/Daisy
      utterance.volume = 1.0;

      utterance.onstart = () => {
        isCurrentlySpeaking = true;
        console.log(`🔊 Speaking as ${avatar} in ${language}: "${text.substring(0, 50)}..."`);
      };

      utterance.onend = () => {
        isCurrentlySpeaking = false;
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        isCurrentlySpeaking = false;
        reject(event);
      };

      window.speechSynthesis.speak(utterance);
    }
  });
}

export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    isCurrentlySpeaking = false;
  }
}

// Initialize voices on load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    const voices = window.speechSynthesis.getVoices();
    console.log('✓ Voices loaded:', voices.length);
  });
}