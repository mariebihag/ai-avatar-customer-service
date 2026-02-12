// Avatar routing and response logic

// CLEAN TRIGGER WORDS - Properly assigned to each avatar

const avatarTriggers = {
  
  sarah: [
    // General info & welcome
    'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening',
    'welcome', 'information', 'tell me about', 'what is', 'where is', 'how do i get',
    'facilities', 'amenities', 'services', 'location', 'directions', 'address',
    'wifi', 'parking', 'pool', 'gym', 'restaurant', 'breakfast', 'lobby',
    'check in time', 'check out time', 'hotel policy', 'policies',
    'help', 'assist', 'guide', 'tour', 'general', 'question'
  ],
  
  daisy: [
    // Booking & scheduling
    'book', 'booking', 'reservation', 'reserve', 'schedule', 'availability',
    'available', 'room', 'rooms', 'suite', 'vacancy', 'free rooms',
    'payment', 'pay', 'price', 'cost', 'rate', 'pricing', 'charge',
    'credit card', 'deposit', 'cancellation', 'cancel', 'modify booking',
    'discount', 'promo', 'offer', 'package', 'deal',
    'dates', 'nights', 'stay', 'duration', 'when can i',
    'upgrade', 'downgrade', 'change room', 'room type', 'room types', 
  ],
  
  john: [
    // Support & operations
    'support', 'help with', 'issue', 'problem', 'complaint', 'concern',
    'broken', 'not working', 'fix', 'repair', 'maintenance',
    'lost', 'found', 'missing', 'forgot', 'left behind',
    'housekeeping', 'clean', 'cleaning', 'towels', 'toiletries',
    'request', 'need', 'extra', 'additional', 'more',
    'noise', 'loud', 'disturb', 'quiet',
    'temperature', 'ac', 'air conditioning', 'heating', 'cold', 'hot',
    'tv', 'remote', 'phone', 'safe', 'minibar',
    'emergency', 'urgent', 'now', 'immediate', 'pillows'
  ]
};

// Route message to appropriate avatar based on trigger words
export function routeToAvatar(message) {
  const lowerMessage = message.toLowerCase();
  const normalizedMessage = lowerMessage.replace(/check[- ]in/g, "check in");

  for (const [avatar, triggers] of Object.entries(avatarTriggers)) {
    for (const trigger of triggers) {
      if (normalizedMessage.includes(trigger)) {   // <-- use normalizedMessage
        console.log(`✓ Routed to ${avatar} (trigger: "${trigger}")`);
        return avatar;
      }
    }
  }

  console.log('✓ Defaulted to sarah (no specific trigger found)');
  return 'sarah';
}


// Scripted responses for common queries
const scriptedResponses = {
  sarah: {
    en: {
      'hello': 'Hello! Welcome to Hotel Rafaela. How may I assist you today?',
      'hi': 'Hi there! I\'m Sarah, your host assistant. What can I help you with?',
      'facilities': 'We offer a swimming pool, fitness center, restaurant, free WiFi, and parking. What would you like to know more about?',
      'wifi': 'Free WiFi is available throughout the hotel. The password is "Rafaela2024". Would you like help connecting?',
      'parking': 'We offer complimentary parking for all guests. The entrance is on the west side of the building.',
      'check in': 'Check-in time is 2:00 PM and check-out is 12:00 PM. Early check-in may be available upon request.',
      'location': 'Hotel Rafaela is located in the heart of the city, near major attractions and transport hubs.'
    },
    tl: {
      'hello': 'Kumusta! Maligayang pagdating sa Hotel Rafaela. Paano kita matutulungan ngayon?',
      'hi': 'Kumusta! Ako si Sarah, ang inyong host assistant. Ano ang maitutulong ko?',
      'facilities': 'Mayroon kaming swimming pool, fitness center, restaurant, libreng WiFi, at parking. Ano ang gusto mong malaman?',
      'wifi': 'Libreng WiFi sa buong hotel. Ang password ay "Rafaela2024". Kailangan mo ba ng tulong sa pagkonekta?',
      'parking': 'May libreng parking para sa lahat ng guests. Ang entrance ay nasa west side ng building.',
      'check in': 'Ang check-in ay 2:00 PM at check-out ay 12:00 PM. Pwedeng humiling ng early check-in.',
      'location': 'Ang Hotel Rafaela ay nasa gitna ng lungsod, malapit sa mga pangunahing atraksyon.'
    },
    zh: {
      'hello': '您好！欢迎来到拉法埃拉酒店。我能为您做些什么？',
      'hi': '您好！我是莎拉，您的接待助理。我能帮您什么？',
      'facilities': '我们提供游泳池、健身中心、餐厅、免费WiFi和停车场。您想了解什么？',
      'wifi': '整个酒店提供免费WiFi。密码是"Rafaela2024"。需要帮助连接吗？',
      'parking': '我们为所有客人提供免费停车。入口在建筑物西侧。',
      'check in': '入住时间是下午2点，退房时间是中午12点。可以要求提前入住。',
      'location': '拉法埃拉酒店位于市中心，靠近主要景点和交通枢纽。'
    },
    ja: {
      'hello': 'こんにちは！ホテルラファエラへようこそ。何かお手伝いできますか？',
      'hi': 'こんにちは！私はサラ、ホストアシスタントです。何をお手伝いできますか？',
      'facilities': 'プール、フィットネスセンター、レストラン、無料WiFi、駐車場があります。何について知りたいですか？',
      'wifi': 'ホテル全体で無料WiFiをご利用いただけます。パスワードは「Rafaela2024」です。接続のお手伝いが必要ですか？',
      'parking': '全てのゲストに無料駐車場を提供しています。入口は建物の西側にあります。',
      'check in': 'チェックインは午後2時、チェックアウトは正午12時です。アーリーチェックインをリクエストできます。',
      'location': 'ホテルラファエラは市の中心部にあり、主要な観光地や交通機関の近くです。'
    },
    ko: {
      'hello': '안녕하세요! 호텔 라파엘라에 오신 것을 환영합니다. 무엇을 도와드릴까요?',
      'hi': '안녕하세요! 저는 사라, 호스트 도우미입니다. 무엇을 도와드릴까요?',
      'facilities': '수영장, 피트니스 센터, 레스토랑, 무료 WiFi 및 주차장이 있습니다. 무엇에 대해 알고 싶으신가요?',
      'wifi': '호텔 전체에서 무료 WiFi를 이용하실 수 있습니다. 비밀번호는 "Rafaela2024"입니다. 연결에 도움이 필요하신가요?',
      'parking': '모든 투숙객에게 무료 주차를 제공합니다. 입구는 건물 서쪽에 있습니다.',
      'check in': '체크인은 오후 2시, 체크아웃은 정오 12시입니다. 조기 체크인을 요청할 수 있습니다.',
      'location': '호텔 라파엘라는 도심에 위치하며 주요 명소와 교통 허브 근처에 있습니다.'
    }
  },
  
  daisy: {
    en: {
      'book': 'I\'d be happy to help you with a booking! What dates are you looking for?',
      'availability': 'Let me check our availability for you. What dates do you need?',
      'price': 'Our rooms start at $120/night for Standard, $180/night for Deluxe, and $250/night for Suite. What type interests you?',
      'room': 'We have Standard rooms, Deluxe rooms, and Suites. Each comes with different amenities. Which would you like to know about?',
      'room types': 'We have Standard rooms, Deluxe rooms, and Suites. Each comes with different amenities. Which would you like to know about?',
      'payment': 'We accept all major credit cards, debit cards, and cash. A deposit is required to confirm your reservation.',
      'cancel': 'Our cancellation policy allows free cancellation up to 24 hours before check-in. Would you like to proceed?'
    },
    tl: {
      'book': 'Matutuwa akong tumulong sa booking! Anong mga petsa ang kailangan mo?',
      'availability': 'Titingnan ko ang availability. Anong mga petsa ang kailangan mo?',
      'price': 'Ang aming mga kuwarto ay nagsisimula sa $120/gabi para sa Standard, $180/gabi para sa Deluxe, at $250/gabi para sa Suite. Alin ang interesado ka?',
      'room': 'Mayroon kaming Standard rooms, Deluxe rooms, at Suites. May iba\'t ibang amenities ang bawat isa. Alin ang gusto mong malaman?',
      'room types': 'Mayroon kaming Standard rooms, Deluxe rooms, at Suites. May iba\'t ibang amenities ang bawat isa. Alin ang gusto mong malaman?',
      'payment': 'Tumatanggap kami ng lahat ng major credit cards, debit cards, at cash. Kailangan ng deposit para kumpirmahin ang reservation.',
      'bayad': 'Tumatanggap kami ng lahat ng major credit cards, debit cards, at cash. Kailangan ng deposit para kumpirmahin ang reservation.',
      'cancel': 'Ang aming cancellation policy ay nagbibigay-daan sa libreng cancellation hanggang 24 oras bago ang check-in. Gusto mo bang magpatuloy?'
    },
    zh: {
      'book': '我很乐意帮您预订！您需要什么日期？',
      'availability': '让我为您查看可用性。您需要什么日期？',
      'price': '我们的房间价格从标准间每晚120美元、豪华间每晚180美元、套房每晚250美元起。您对哪种感兴趣？',
      'room types': '我们有标准间、豪华间和套房。每种都有不同的设施。您想了解哪一种？',
      'payment': '我们接受所有主要信用卡、借记卡和现金。需要押金来确认您的预订。',
      'cancel': '我们的取消政策允许在入住前24小时免费取消。您想继续吗？'
    },
    ja: {
      'book': '予約のお手伝いをさせていただきます！どの日程をお探しですか？',
      'availability': '空室状況を確認いたします。どの日程が必要ですか？',
      'price': '客室料金はスタンダード1泊120ドル、デラックス1泊180ドル、スイート1泊250ドルからです。どれに興味がありますか？',
      'room types': 'スタンダードルーム、デラックスルーム、スイートがあります。それぞれ異なるアメニティがあります。どれについて知りたいですか？',
      'payment': '主要なクレジットカード、デビットカード、現金をお受けしています。予約確認には保証金が必要です。',
      'cancel': 'キャンセルポリシーではチェックイン24時間前まで無料キャンセルが可能です。続けますか？'
    },
    ko: {
      'book': '예약을 도와드리겠습니다! 어떤 날짜를 찾고 계신가요?',
      'availability': '예약 가능 여부를 확인하겠습니다. 어떤 날짜가 필요하신가요?',
      'price': '객실 요금은 스탠다드 1박 120달러, 디럭스 1박 180달러, 스위트 1박 250달러부터 시작합니다. 어떤 유형에 관심이 있으신가요?',
      'room types': '스탠다드룸, 디럭스룸, 스위트가 있습니다. 각각 다른 편의시설이 있습니다. 어떤 것에 대해 알고 싶으신가요?',
      'payment': '모든 주요 신용카드, 직불카드 및 현금을 받습니다. 예약 확인을 위해 보증금이 필요합니다.',
      'cancel': '취소 정책은 체크인 24시간 전까지 무료 취소가 가능합니다. 계속하시겠습니까?'
    }
  },
  
  john: {
    en: {
      'help': 'I\'m here to help! What do you need assistance with?',
      'problem': 'I\'m sorry to hear that. Please tell me what the issue is and I\'ll resolve it right away.',
      'housekeeping': 'I\'ll send housekeeping to your room immediately. What do you need?',
      'maintenance': 'I\'ll dispatch our maintenance team right away. What needs to be fixed?',
      'Pillows':"I'll have new pillows delivered to your room within 10 minutes. What room are you in?",
      'towels': 'I\'ll have fresh towels delivered to your room within 10 minutes. What room are you in?',
      'noise': 'I apologize for the disturbance. I\'ll address this immediately. What room are you in?',
      'emergency': 'This is urgent. Please tell me your room number and the nature of the emergency.'
    },
    tl: {
      'help': 'Nandito ako para tumulong! Ano ang kailangan mo?',
      'problem': 'Pasensya na po. Sabihin mo sa akin ang problema at aayusin ko agad.',
      'housekeeping': 'Ipapadala ko agad ang housekeeping sa inyong kuwarto. Ano ang kailangan ninyo?',
      'maintenance': 'Ipapadala ko agad ang maintenance team. Ano ang kailangang ayusin?',
      'Pillows':'Magpapadala ako ng bagong mga unan sa inyong kuwarto sa loob ng 10 minuto. Anong kuwarto kayo?',
      'towels': 'Magpapadala ako ng fresh towels sa inyong kuwarto sa loob ng 10 minuto. Anong kuwarto kayo?',
      'noise': 'Pasensya na sa abala. Aayusin ko ito agad. Anong kuwarto kayo?',
      'emergency': 'Ito ay urgent. Pakisabi ang room number ninyo at ang kalikasan ng emergency.'
    },
    zh: {
      'help': '我在这里帮助您！您需要什么帮助？',
      'problem': '很抱歉听到这个。请告诉我问题是什么，我会立即解决。',
      'housekeeping': '我会立即派客房服务到您的房间。您需要什么？',
      'maintenance': '我会立即派遣我们的维修团队。需要修理什么？',
      'towels': '我会在10分钟内将干净的毛巾送到您的房间。',
      'noise': '对不起造成打扰。我会立即处理。您在哪个房间？',
      'emergency': '这很紧急。请告诉我您的房间号和紧急情况的性质。'
    },
    ja: {
      'help': 'お手伝いします！何が必要ですか？',
      'problem': '申し訳ございません。問題を教えていただければ、すぐに解決いたします。',
      'housekeeping': 'すぐにハウスキーピングをお部屋に送ります。何が必要ですか？',
      'maintenance': 'すぐにメンテナンスチームを派遣します。何を修理する必要がありますか？',
      'towels': '10分以内に清潔なタオルをお部屋にお届けします。',
      'noise': 'ご迷惑をおかけして申し訳ございません。すぐに対処します。お部屋は何号室ですか？',
      'emergency': 'これは緊急です。お部屋番号と緊急事態の内容を教えてください。'
    },
    ko: {
      'help': '도와드리겠습니다! 무엇이 필요하신가요?',
      'problem': '죄송합니다. 문제가 무엇인지 말씀해 주시면 즉시 해결하겠습니다.',
      'housekeeping': '즉시 객실 청소 서비스를 보내겠습니다. 무엇이 필요하신가요?',
      'maintenance': '즉시 유지보수팀을 보내겠습니다. 무엇을 수리해야 하나요?',
      'towels': '10분 이내에 깨끗한 수건을 객실로 배달하겠습니다.',
      'noise': '방해를 드려 죄송합니다. 즉시 처리하겠습니다. 어느 방에 계신가요?',
      'emergency': '긴급 상황입니다. 객실 번호와 긴급 상황의 성격을 말씀해 주세요.'
    }
  }
};

// Get scripted response if available
export function getScriptedResponse(message, avatar, language = 'en') {
  const lowerMessage = message.toLowerCase();
  const responses = scriptedResponses[avatar]?.[language];
  
  if (!responses) return null;

  for (const [key, response] of Object.entries(responses)) {
    const regex = new RegExp(`\\b${key}\\b`, 'i'); 
    if (regex.test(lowerMessage)) {
      console.log(`✓ Using scripted response for "${key}"`);
      return response;
    }
  }

  console.log(`✗ No scripted response found for "${lowerMessage}" in ${avatar}/${language}`);
  return null;
}


// Fallback AI response generator (placeholder for actual AI integration)
export async function getAIResponse(message, context, avatar, language = 'en') {
  // This would connect to your actual AI service (Gemini, GPT, etc.)
  // For now, returning a contextual fallback
  
  const fallbackResponses = {
    sarah: {
      en: `I understand you're asking about "${message}". As your host assistant, I'm here to help with general information and hotel facilities. Could you please provide more details?`,
      tl: `Naiintindihan ko na nagtatanong ka tungkol sa "${message}". Bilang inyong host assistant, nandito ako para tumulong sa pangkalahatang impormasyon at mga pasilidad ng hotel. Maaari mo bang bigyan ng mas maraming detalye?`,
      zh: `我理解您在询问"${message}"。作为您的接待助理，我在这里帮助您了解一般信息和酒店设施。您能提供更多细节吗？`,
      ja: `"${message}"についてお尋ねですね。ホストアシスタントとして、一般情報とホテル施設についてお手伝いします。もう少し詳しく教えていただけますか？`,
      ko: `"${message}"에 대해 문의하시는 것으로 이해합니다. 호스트 도우미로서 일반 정보와 호텔 시설에 대해 도와드립니다. 더 자세히 알려주시겠습니까?`
    },
    daisy: {
      en: `Thank you for your inquiry about "${message}". As your booking specialist, I can help with reservations, pricing, and availability. What specific information do you need?`,
      tl: `Salamat sa inyong tanong tungkol sa "${message}". Bilang inyong booking specialist, makakatulong ako sa mga reservation, presyo, at availability. Anong tukoy na impormasyon ang kailangan ninyo?`,
      zh: `感谢您询问"${message}"。作为您的预订专员，我可以帮助您预订、定价和可用性。您需要什么具体信息？`,
      ja: `"${message}"についてのお問い合わせありがとうございます。予約スペシャリストとして、予約、料金、空室状況についてお手伝いできます。どのような具体的な情報が必要ですか？`,
      ko: `"${message}"에 대한 문의 감사합니다. 예약 전문가로서 예약, 가격 및 예약 가능 여부를 도와드릴 수 있습니다. 어떤 구체적인 정보가 필요하신가요?`
    },
    john: {
      en: `I'm here to help with "${message}". As your support manager, I handle operational issues and assistance. Please let me know the details so I can help you right away.`,
      tl: `Nandito ako para tumulong sa "${message}". Bilang inyong support manager, hinahawakan ko ang mga operational issues at tulong. Pakisabi sa akin ang mga detalye para matulungan kita kaagad.`,
      zh: `我在这里帮助您处理"${message}"。作为您的支持经理，我处理运营问题和协助。请让我知道详情，以便我立即帮助您。`,
      ja: `"${message}"についてお手伝いします。サポートマネージャーとして、運営上の問題や支援を担当しています。詳細を教えていただければ、すぐにお手伝いいたします。`,
      ko: `"${message}"을(를) 도와드리겠습니다. 지원 관리자로서 운영 문제와 지원을 처리합니다. 즉시 도와드릴 수 있도록 세부 사항을 알려주세요.`
    }
  };
  
  const response = fallbackResponses[avatar]?.[language] || fallbackResponses[avatar]?.en;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return response || "I'm here to help. Could you please rephrase your question?";
}