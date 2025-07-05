// topic.tsx (version đã được tối ưu hóa)

export interface SubTopic {
  title: string;
  words: string[];
}

export interface TopicGroup {
  id: number;
  title: string;
  subtopics: SubTopic[];
}

export const topicData: TopicGroup[] = [
  {
    id: 1,
    title: "Core & Daily Communication (Cơ bản & Giao tiếp hàng ngày)",
    subtopics: [
      {
        title: "Pronouns, Articles & Prepositions (Đại từ, Mạo từ & Giới từ)",
        words: ["i", "you", "he", "she", "it", "we", "they", "the", "a", "an", "in", "on", "at", "for", "with", "about", "to", "from", "of"]
      },
      {
        title: "Conjunctions & Discourse Adverbs (Liên từ & Trạng từ nối ý)",
        words: ["and", "but", "so", "because", "however", "therefore", "although", "if", "or", "when", "then"]
      },
      {
        title: "Modal & Auxiliary Verbs (Động từ khuyết thiếu & Phụ trợ)",
        words: ["can", "could", "will", "would", "may", "must", "should", "is", "are", "was", "were", "do", "did", "have", "has", "had"]
      },
      {
        title: "Degree & Frequency (Mức độ & Tần suất)",
        words: ["very", "really", "so", "just", "only", "always", "never", "often", "sometimes", "basically", "literally", "absolutely"]
      },
      {
        title: "Fillers & Communicative Words (Từ đệm & Từ giao tiếp)",
        words: ["yeah", "well", "like", "you know", "i mean", "okay", "right", "anyway", "hello", "please", "thank you", "sorry", "congratulations"]
      }
    ]
  },
  {
    id: 2,
    title: "People & Society (Con người & Xã hội)",
    subtopics: [
      {
        title: "Family & Relationships (Gia đình & Mối quan hệ)",
        words: ["family", "friend", "mother", "father", "son", "daughter", "husband", "wife", "partner", "relationship"]
      },
      {
        title: "Professions & Roles (Nghề nghiệp & Vai trò)",
        words: ["doctor", "lawyer", "engineer", "manager", "artist", "scientist", "president", "ceo", "employee", "leader"]
      },
      {
        title: "Government & Politics (Chính phủ & Chính trị)",
        words: ["government", "politics", "democracy", "election", "senate", "congress", "campaign", "vote", "policy", "federal", "political"]
      },
      {
        title: "Law & Justice (Luật pháp & Công lý)",
        words: ["law", "justice", "court", "police", "crime", "prison", "legal", "authority", "rule", "trial", "violence"]
      },
      {
        title: "Society & Culture (Xã hội & Văn hóa)",
        words: ["society", "community", "culture", "history", "tradition", "religion", "race", "gender", "diversity", "language", "social", "public"]
      }
    ]
  },
  {
    id: 3,
    title: "Science & Academia (Khoa học & Học thuật)",
    subtopics: [
      {
        title: "Education (Giáo dục)",
        words: ["school", "college", "university", "student", "teacher", "class", "course", "education", "learning", "study", "degree", "academic", "campus", "thesis"]
      },
      {
        title: "Scientific Concepts (Khái niệm khoa học)",
        words: ["science", "theory", "evidence", "experiment", "analysis", "discovery", "model", "fact", "method", "research"]
      },
      {
        title: "Mathematics & Computing (Toán học & Tin học)",
        words: ["math", "equation", "matrix"]
      },
      {
        title: "Physics & Space (Vật lý & Vũ trụ)",
        words: ["physics", "energy", "force", "quantum", "gravity", "atom", "particle", "light", "speed", "wave", "space", "star", "planet", "universe", "galaxy", "earth", "orbit", "rocket", "telescope"]
      },
      {
        title: "Biology & Chemistry (Sinh học & Hóa học)",
        words: ["biology", "cell", "dna", "gene", "protein", "organism", "species", "evolution", "chemical", "molecule", "acid", "oxygen", "carbon", "bacteria"]
      }
    ]
  },
  {
    id: 4,
    title: "Technology & Computing (Công nghệ & Tin học)",
    subtopics: [
      {
        title: "Devices & Machines (Thiết bị & Máy móc)",
        words: ["technology", "device", "machine", "engine", "ai", "robot", "drone", "camera", "phone", "screen"]
      },
      {
        title: "Software & Hardware (Phần mềm & Phần cứng)",
        words: ["computer", "software", "hardware", "app", "program", "code", "database", "server", "network", "internet", "website", "digital", "online"]
      },
      {
        title: "Systems & Processes (Hệ thống & Quy trình)",
        words: ["data", "algorithm", "interface", "system", "function", "process", "platform", "cloud", "virtual", "cyber", "programming"]
      }
    ]
  },
  {
    id: 5,
    title: "Business & Finance (Kinh doanh & Tài chính)",
    subtopics: [
      {
        title: "Economy & Markets (Kinh tế & Thị trường)",
        words: ["economy", "market", "business", "company", "industry", "growth", "trade", "consumer"]
      },
      {
        title: "Financial Terms (Thuật ngữ tài chính)",
        words: ["money", "finance", "budget", "cost", "price", "tax", "investment", "stock", "credit", "bank", "dollar", "cash"]
      },
      {
        title: "Work & Management (Công việc & Quản lý)",
        words: ["job", "career", "management", "project", "team", "meeting", "office", "goal", "strategy", "organization", "customer"]
      }
    ]
  },
  {
    id: 6,
    title: "Health & Medicine (Sức khỏe & Y học)",
    subtopics: [
      {
        title: "Anatomy (Giải phẫu)",
        words: ["body", "head", "face", "eye", "hand", "heart", "brain", "blood", "skin", "bone", "muscle"]
      },
      {
        title: "Health & Disease (Sức khỏe & Bệnh lý)",
        words: ["health", "healthy", "disease", "cancer", "virus", "pain", "symptom", "mental", "physical", "illness", "pandemic"]
      },
      {
        title: "Medical Practice (Thực hành y khoa)",
        words: ["medicine", "hospital", "treatment", "drug", "vaccine", "therapy", "clinical", "medical", "surgery", "patient"]
      }
    ]
  },
  {
    id: 7,
    title: "Nature & Environment (Thiên nhiên & Môi trường)",
    subtopics: [
      {
        title: "Fauna (Động vật)",
        words: ["animal", "dog", "cat", "fish", "bird", "horse", "wildlife"]
      },
      {
        title: "Flora (Thực vật)",
        words: ["plant", "tree", "flower", "garden", "forest", "leaf", "farm", "agriculture", "crop"]
      },
      {
        title: "Geography & Climate (Địa lý & Khí hậu)",
        words: ["world", "country", "land", "sea", "ocean", "river", "mountain", "nature", "environment", "water", "air", "weather", "climate", "sun", "wind", "rain", "snow", "temperature", "heat", "cold", "storm"]
      }
    ]
  },
  {
    id: 8,
    title: "Arts & Entertainment (Nghệ thuật & Giải trí)",
    subtopics: [
      {
        title: "Visual Arts (Nghệ thuật thị giác)",
        words: ["art", "design", "image", "picture", "photo", "color", "style", "creative", "painting", "drawing"]
      },
      {
        title: "Media (Truyền thông)",
        words: ["music", "song", "audio", "film", "movie", "video", "sound", "theater", "entertainment"]
      },
      {
        title: "Literature & Games (Văn học & Trò chơi)",
        words: ["book", "story", "word", "write", "read", "author", "page", "article", "literature", "game", "sport", "player", "win", "score"]
      }
    ]
  },
  {
    id: 9,
    title: "Objects, Home & Life (Đồ vật, Nhà & Cuộc sống)",
    subtopics: [
      {
        title: "Food & Drink (Thức ăn & Đồ uống)",
        words: ["food", "water", "eat", "drink", "apple", "bread", "coffee", "sugar", "meat", "chicken", "cheese", "pizza"]
      },
      {
        title: "Common Objects & Tools (Đồ vật & Công cụ thông thường)",
        words: ["thing", "object", "tool", "box", "key", "table", "chair", "door", "window", "car"]
      },
      {
        title: "Living Environment (Môi trường sống)",
        words: ["home", "house", "room", "kitchen", "street", "city", "town"]
      },
      {
        title: "Clothing (Quần áo)",
        words: ["clothes", "wear", "shirt", "hat", "shoe"]
      }
    ]
  },
  {
    id: 10,
    title: "Actions, States & Qualities (Hành động, Trạng thái & Tính chất)",
    subtopics: [
      {
        title: "Common Actions (Hành động thông thường)",
        words: ["go", "come", "get", "give", "make", "take", "see", "look", "run", "walk", "talk", "say", "ask", "help", "try", "work", "play"]
      },
      {
        title: "Qualities (Adjectives) (Tính chất - Tính từ)",
        words: ["good", "bad", "big", "small", "new", "old", "high", "low", "long", "short", "easy", "hard", "beautiful", "important", "different", "same"]
      },
      {
        title: "States & Change (Verbs) (Trạng thái & Thay đổi - Động từ)",
        words: ["be", "become", "seem", "feel", "change", "continue", "start", "stop", "end", "live", "die", "happen"]
      }
    ]
  },
  {
    id: 11,
    title: "Abstract Concepts & Thinking (Khái niệm trừu tượng & Tư duy)",
    subtopics: [
      {
        title: "Cognition & Knowledge (Nhận thức & Kiến thức)",
        words: ["idea", "thought", "mind", "think", "know", "believe", "understand", "remember", "forget", "learn", "information", "knowledge"]
      },
      {
        title: "Emotions (Cảm xúc)",
        words: ["love", "hate", "fear", "hope", "feeling", "emotion", "happy", "sad", "angry", "excited", "proud"]
      },
      {
        title: "Philosophical Concepts (Khái niệm triết học)",
        words: ["truth", "life", "death", "power", "reason", "sense", "purpose", "problem", "solution", "freedom", "value", "issue"]
      }
    ]
  },
  {
    id: 12,
    title: "Time & Numbers (Thời gian & Số lượng)",
    subtopics: [
      {
        title: "Time Terms (Thuật ngữ thời gian)",
        words: ["time", "year", "month", "week", "day", "hour", "minute", "second", "today", "yesterday", "tomorrow", "morning", "night", "january", "monday"]
      },
      {
        title: "Numbers & Quantities (Số & Số lượng)",
        words: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "hundred", "thousand", "million", "number", "amount", "few", "many", "some", "all"]
      }
    ]
  },
  {
    id: 13,
    title: "Slang, Informal & Profanity (Tiếng lóng, Thông tục & Thô tục)",
    subtopics: [
      {
        title: "Informal & Slang (Thông tục & Tiếng lóng)",
        words: ["wanna", "gonna", "kinda", "dude", "guy", "kid", "stuff", "cool", "awesome", "y'all"]
      },
      {
        title: "Profanity (Thô tục)",
        words: ["fuck", "shit", "crap", "ass", "damn"]
      }
    ]
  }
];
