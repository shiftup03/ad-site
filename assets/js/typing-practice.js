/**
 * 1-Min Challenge - 온라인 타자 연습 (typing-practice.js)
 * 한글/영문 자모 분해 타수(CPM) 계산, 5대 연습 모드, 60초/180초 타이머, 실시간 오타 판정, 개인 통계 대시보드
 */

(function ($) {
  'use strict';

  // ==========================================================================
  // 1. 연습 콘텐츠 데이터베이스 (한글 / 영문 방대한 데이터)
  // ==========================================================================

  // 한글 낱말 (100개 이상, 난이도 및 카테고리별)
  const KO_WORDS = [
    // 일상 & 감정
    "사과", "바람", "여행", "컴퓨터", "키보드", "하늘", "설렘", "도전", "목표", "집중",
    "시간", "연습", "성장", "기록", "바다", "노을", "기차", "운동", "음악", "영화",
    "사랑", "행복", "미소", "우정", "희망", "용기", "감사", "평화", "기쁨", "친절",
    // 학교 & 직장 & 기술
    "학교", "도서관", "선생님", "학생", "공부", "시험", "교실", "연필", "공책", "지우개",
    "직장", "회의", "프로젝트", "업무", "성공", "아이디어", "기획", "보고서", "동료", "일정",
    "스마트폰", "인터넷", "인공지능", "모니터", "마우스", "데이터", "네트워크", "알고리즘", "소프트웨어", "프로그래밍",
    // 음식 & 자연 & 취미
    "커피", "녹차", "초콜릿", "딸기", "포도", "수박", "아침식사", "도시락", "따뜻한밥", "신선한과일",
    "봄날", "여름비", "가을단풍", "겨울눈", "숲속", "산책로", "별빛", "달빛", "은하수", "무지개",
    "그림", "독서", "피아노", "기타", "자전거", "사진", "요리", "등산", "수영", "캠핑",
    // 동물 & 식물 & 사회
    "강아지", "고양이", "다람쥐", "토끼", "돌고래", "호랑이", "참새", "나비", "꽃잎", "해바라기",
    "대한민국", "세계여행", "문화", "역사", "미래", "환경", "나눔", "존중", "소통", "약속"
  ];

  // 영문 낱말 (100개 이상, 초급/중급/고급)
  const EN_WORDS = [
    // 초급
    "apple", "book", "time", "water", "dream", "home", "happy", "music", "world", "friend",
    "light", "heart", "smile", "peace", "star", "green", "cloud", "river", "space", "earth",
    "sound", "paper", "phone", "plant", "ocean", "bread", "train", "sunny", "laugh", "sweet",
    // 중급
    "practice", "keyboard", "journey", "discover", "creative", "improve", "balance", "learning",
    "mountain", "sunshine", "freedom", "success", "courage", "harmony", "horizon", "inspire",
    "together", "treasure", "dynamic", "explore", "forward", "genuine", "history", "imagine",
    "morning", "network", "patient", "reflect", "silence", "thought", "victory", "whisper",
    // 고급
    "communication", "responsibility", "determination", "productivity", "collaboration",
    "extraordinary", "transformation", "understanding", "revolutionary", "sustainability",
    "infrastructure", "accomplishment", "comprehensive", "enthusiastic", "philosophical",
    "significance", "unprecedented", "consciousness", "environmental", "perseverance",
    "sophisticated", "characteristic", "distinguished", "indispensable", "strengthening",
    "vulnerability", "interconnected", "recommendation", "breakthrough", "synchronize",
    "inspirational", "trustworthy", "transparency", "versatility", "accessibility",
    "innovation", "achievement", "confidence", "leadership", "excellence", "dedication",
    "experience", "opportunity", "efficiency", "creativity", "motivation", "resilience"
  ];

  // 한글 짧은 글 (40문장 이상)
  const KO_SHORT_SENTENCES = [
    // 초급 (짧고 일상적)
    "오늘의 작은 노력이 내일의 변화를 만듭니다.",
    "새로운 것을 배우는 일은 언제나 즐겁습니다.",
    "따뜻한 햇살이 창문 사이로 들어왔습니다.",
    "꾸준한 연습은 실력을 조금씩 성장시킵니다.",
    "여행은 익숙한 일상에서 새로운 시선을 발견하게 합니다.",
    "좋은 습관은 작은 실천에서 시작됩니다.",
    "책상 위에 놓인 커피가 천천히 식어갑니다.",
    "목표를 향해 한 걸음씩 나아가고 있습니다.",
    "맑은 하늘 아래 사람들이 천천히 걸어갑니다.",
    "오늘 하루도 나만의 속도로 살아가면 됩니다.",
    "가벼운 산책으로 지친 몸과 마음에 활력을 채웁니다.",
    "친구와 나눈 따뜻한 대화가 마음에 남습니다.",
    "시원한 바람이 불어와 기분 좋은 하루를 만듭니다.",
    "음악을 들으며 편안한 휴식을 취해봅니다.",
    "매일 조금씩 성장하는 나를 응원합니다.",
    // 중급 (문장부호 및 어휘 다양성)
    "작은 성취가 모여 단단한 자신감을 이루는 밑거름이 됩니다.",
    "바쁜 일상 속에서도 잠시 멈추어 하늘을 올려다보세요.",
    "실패를 두려워하지 않고 다시 도전하는 태도가 소중합니다.",
    "책 속에 담긴 지혜는 삶을 더욱 풍요롭게 만들어 줍니다.",
    "서로를 배려하는 따뜻한 말 한마디가 큰 힘이 됩니다.",
    "지금 이 순간에 온전히 집중할 때 최고의 몰입이 생깁니다.",
    "비가 내린 뒤에 땅이 더욱 굳어지듯 시련은 우리를 단단하게 합니다.",
    "스스로를 믿고 묵묵히 걷다 보면 어느새 목표에 닿아 있습니다.",
    "건강한 신체에 건강한 정신이 깃든다는 말을 기억하세요.",
    "자연이 주는 평온함 속에서 지친 일상을 치유받습니다.",
    "새로운 아침은 누구에게나 공평하게 주어지는 선물입니다.",
    "생각을 정리하고 일기를 쓰며 하루를 차분히 마무리합니다.",
    "깊은 바다처럼 넓고 흔들림 없는 마음가짐을 가지고 싶습니다.",
    "타인의 성공을 진심으로 축하해줄 수 있는 여유가 필요합니다.",
    "단정한 책상 정리는 명확한 사고를 돕는 첫걸음입니다.",
    // 고급 (복합 문장 및 숫자, 특수문자 포함)
    "2026년 새해 목표를 위해 매일 30분씩 꾸준히 연습하고 있습니다.",
    "정확도 98% 이상을 유지하며 빠른 타수를 기록하는 것은 멋진 도전입니다!",
    "소통(Communication)과 배려(Empathy)는 성숙한 인간관계의 핵심 요소입니다.",
    "“시작이 반이다”라는 옛말처럼, 첫 글자를 타이핑하는 용기가 중요합니다.",
    "기술의 발전(AI, 클라우드) 속에서도 사람다운 따뜻함은 변치 않습니다.",
    "매일 1%씩 성장한다면 1년 뒤에는 약 37배(37.78)의 성장을 이룹니다.",
    "키보드 위에 손을 얹고 바른 자세로 타자 연습을 시작해 볼까요?",
    "노력의 대가는 결코 사라지지 않으며, 때가 되면 결실을 맺습니다.",
    "어제의 나와 오늘의 나를 비교하며 긍정적인 자극을 얻어보세요.",
    "준비된 자에게 기회가 찾아온다는 격언을 가슴에 새깁니다."
  ];

  // 영문 짧은 글 (40문장 이상)
  const EN_SHORT_SENTENCES = [
    // 초급
    "Practice makes progress every day.",
    "Small steps can lead to big changes.",
    "Every new day brings another opportunity.",
    "Learning something new takes patience.",
    "A good habit begins with a simple action.",
    "The morning sunlight filled the room.",
    "Keep moving forward at your own pace.",
    "A quiet moment can bring a fresh idea.",
    "Believe in yourself and take the first step.",
    "Happiness is found in the little things.",
    "Music has the power to brighten your day.",
    "Kind words can make a big difference.",
    "Focus on what you can control right now.",
    "Stay curious and keep exploring the world.",
    "A smile is the universal language of kindness.",
    // 중급
    "Success is the sum of small efforts repeated day in and day out.",
    "The only limit to our realization of tomorrow is our doubts of today.",
    "Consistency is the true foundation of meaningful mastery and growth.",
    "Do not be afraid of moving slowly, be afraid only of standing still.",
    "Great things are done by a series of small things brought together.",
    "Your attitude determines your direction in both life and work.",
    "Take time to appreciate how far you have already come today.",
    "Clear thinking requires courage rather than sheer intelligence.",
    "Every accomplishment starts with the decision to try your best.",
    "Difficult roads often lead to beautiful and unexpected destinations.",
    "Reading good books is like having a conversation with the finest minds.",
    "True confidence comes from preparation, persistence, and self-respect.",
    "Find joy in the process rather than stressing over the final outcome.",
    "A disciplined routine brings freedom and long-term peace of mind.",
    "The secret of getting ahead is simply getting started right away.",
    // 고급
    "In 2026, consistent digital literacy and typing speed are essential skills.",
    "Strive for 99% accuracy; speed will naturally follow with practice!",
    "Effective communication requires listening twice as much as speaking.",
    "“The journey of a thousand miles begins with a single step.” — Lao Tzu",
    "Technological innovation transforms how we live, work, and collaborate.",
    "Focus 100% on quality first; high velocity is a byproduct of precision.",
    "Keep your back straight and hands relaxed while typing on the keyboard.",
    "Cultivate resilience in the face of temporary setbacks and challenges.",
    "Compare yourself only to who you were yesterday, not to someone else today.",
    "Dedication, patience, and enthusiasm are the keys to lasting achievement."
  ];

  // 한글 긴 글 (10개, 각 300~600자)
  const KO_LONG_TEXTS = [
    {
      title: "작은 습관의 놀라운 힘",
      content: "우리는 매일 수많은 결정을 내리고 행동하며 살아갑니다. 하지만 하루의 많은 부분은 의식적인 선택보다 무의식적인 습관에 의해 움직입니다. 아주 사소해 보이는 좋은 습관 하나가 1년, 5년, 10년이 지나면 상상할 수 없을 만큼 커다란 삶의 차이를 만듭니다. 매일 아침 물 한 잔을 마시는 습관, 하루 10분씩 책을 읽거나 타자 연습을 하는 작은 노력들이 모여 우리의 삶을 건강하고 단단하게 바꿉니다. 처음에는 우리가 습관을 만들지만, 결국 그 습관이 우리의 미래를 만듭니다. 오늘부터 실천할 수 있는 나만의 작은 좋은 습관을 시작해 보세요."
    },
    {
      title: "계절이 머무는 숲길",
      content: "푸른 나무들이 우거진 숲길을 걷다 보면 마음속에 쌓여 있던 복잡한 생각들이 잔잔하게 가라앉습니다. 나뭇잎 사이로 부서져 내리는 햇살과 뺨을 스치는 시원한 바람은 지친 일상에 다정한 위로를 건넵니다. 발걸음을 옮길 때마다 사각거리는 흙의 감촉과 은은한 풀내음은 오랫동안 잊고 지냈던 자연의 온기를 일깨워 줍니다. 서두르지 않고 계절의 변화를 온몸으로 느끼며 천천히 걷는 시간은 삶의 속도를 늦추고 내면을 돌아보는 소중한 선물이 됩니다. 자연은 언제나 그 자리에서 묵묵히 우리를 기다리고 있습니다."
    },
    {
      title: "새로운 배움의 즐거움",
      content: "새로운 지식을 배우고 경험을 쌓는 일은 나이와 상관없이 삶에 생기와 열정을 불어넣어 줍니다. 낯선 악기를 배우거나, 새로운 언어를 익히고, 키보드 타자 실력을 키우는 모든 과정은 뇌를 자극하고 호기심을 깨웁니다. 처음에는 손에 익지 않아 서투르고 실수가 잦을 수 있지만, 매일 반복하며 조금씩 익숙해지는 순간에 느끼는 뿌듯함은 그 무엇과도 바꿀 수 없습니다. 배움은 정해진 종착역이 있는 레이스가 아니라 평생을 걸쳐 즐기는 흥미진진한 여행입니다. 오늘 새로운 첫걸음을 떼어보세요."
    },
    {
      title: "기다림과 차 한 잔의 여유",
      content: "따뜻한 물을 붓고 찻잎이 천천히 우러나기를 기다리는 시간은 바쁜 현대 사회에서 누릴 수 있는 특별한 휴식입니다. 급하게 마시기보다 찻잔에서 피어오르는 은은한 김을 바라보며 향기를 음미할 때 비로소 진정한 차의 매력을 느낄 수 있습니다. 조급한 마음을 잠시 내려놓고 기다림의 미학을 배우는 일은 우리 삶의 태도와도 닮아 있습니다. 조급해한다고 해서 원하는 결과가 더 빨리 오지는 않습니다. 충분히 무르익을 때까지 기다릴 줄 아는 여유가 삶의 깊이를 더해줍니다."
    },
    {
      title: "독서가 선사하는 세상",
      content: "책장을 한 장씩 넘길 때마다 우리는 시공간을 초월하여 전혀 다른 세상으로 여행을 떠납니다. 다른 사람의 깊은 사유와 삶의 경험을 활자로 마주하며 우리의 시야는 한층 더 넓어집니다. 책은 우리가 가보지 못한 곳을 보여주고, 미처 생각하지 못했던 질문을 던지며 내면의 세계를 풍요롭게 채워줍니다. 하루 단 15분이라도 조용한 공간에서 책을 펼치는 습관은 번잡한 세상 속에서 나만의 중심을 지킬 수 있는 단단한 힘을 길러줍니다. 오늘 밤 책 한 권과 함께 평온한 사색에 잠겨보세요."
    },
    {
      title: "여행이 남기는 소중한 기억",
      content: "일상의 테두리를 벗어나 낯선 장소로 떠나는 여행은 언제나 가슴을 설레게 합니다. 낯선 언어와 새로운 풍경, 우연히 마주친 사람들의 따뜻한 미소는 익숙한 일상에서 굳어있던 감각을 새롭게 일깨웁니다. 여행지에서 겪는 뜻밖의 실수나 우연한 길 잃음조차도 시간이 지나면 잊지 못할 추억의 한 페이지가 됩니다. 여행은 단순히 새로운 명소를 구경하는 것이 아니라, 낯선 환경 속에서 새로운 나를 발견하는 특별한 시간입니다. 마음속에 품어둔 목적지로 떠나보세요."
    },
    {
      title: "실패를 바라보는 시선",
      content: "어떤 일에 도전하다 보면 누구나 원치 않는 실수나 실패를 마주하게 됩니다. 그러나 실패는 결코 끝이 아니라 올바른 방향을 찾아가는 소중한 이정표입니다. 실패를 겪지 않았다는 것은 새로운 도전을 하지 않았다는 뜻일 수도 있습니다. 넘어졌을 때 주저앉아 자책하기보다는 무엇을 배웠는지 돌아보고 다시 흙을 털고 일어나는 회복탄력성이 중요합니다. 성공한 사람들은 실패가 없었던 사람이 아니라, 실패할 때마다 다시 일어선 사람들입니다. 당신의 도전을 끝까지 응원합니다."
    },
    {
      title: "디지털 시대의 아날로그 감성",
      content: "스마트폰과 초고속 인터넷이 지배하는 오늘날에도 손편지나 종이책, 아날로그 시계 같은 감성이 여전히 많은 사람들에게 깊은 사랑을 받고 있습니다. 빠르고 편리한 것만이 삶의 전부는 아니기 때문입니다. 손가락으로 키보드를 정성스럽게 두드리며 전하는 메시지 속에서도 상대를 향한 진심과 따뜻한 정성은 고스란히 담길 수 있습니다. 화면 너머로 오가는 텍스트 한 글자 한 글자에 온기를 싣는 연습은 각박한 현대 사회에서 우리의 마음을 부드럽게 지켜줍니다. 기술의 편리함을 지혜롭게 활용하되 사람 사이의 따뜻한 정서와 교감을 결코 잃지 않는 것, 그것이 바로 디지털 시대를 살아가는 우리가 지켜내야 할 가장 소중한 균형입니다."
    },
    {
      title: "맑은 아침을 맞이하는 태도",
      content: "눈을 떴을 때 창밖으로 비치는 아침 햇살을 마주하는 순간은 하루 전체의 기분과 생산성을 결정짓는 매우 중요한 시간입니다. 피곤하다는 불평 대신 '오늘도 나에게 새로운 기회의 하루가 주어졌구나'라는 감사의 마음을 품어보세요. 가벼운 스트레칭과 깊은 심호흡으로 굳어있던 몸을 부드럽게 깨우고, 오늘 해야 할 일들을 차분하게 정리하는 아침 루틴은 삶에 긍정적인 통제감을 부여합니다. 하루의 시작이 밝고 평온하면 오후에 찾아오는 뜻밖의 피로와 예상치 못한 변수들도 한결 너그럽고 침착하게 받아들일 수 있습니다. 매일 아침 나 자신을 다정하게 격려하는 습관을 들여보세요."
    },
    {
      title: "성공적인 협력과 배려",
      content: "혼자 가면 빨리 갈 수 있지만 함께 가면 훨씬 더 멀리 갈 수 있다는 아프리카 속담이 있습니다. 복잡하고 다양한 문제를 지혜롭게 해결해야 하는 현대 사회에서 팀워크와 배려의 가치는 그 어느 때보다 중요해졌습니다. 서로의 다른 점을 비난하거나 단점으로 보지 않고 상호 보완해야 할 개성으로 바라보며, 동료의 의견을 진심으로 경청하는 열린 자세가 진정한 시너지를 만듭니다. 신뢰를 바탕으로 한 건강한 소통과 서로를 북돋아 주는 따뜻한 격려는 개인의 성장은 물론 공동체 전체를 풍요롭고 단단하게 만드는 가장 강력한 힘입니다. 함께하는 사람들의 존재에 감사해 보세요."
    }
  ];

  // 영문 긴 글 (10개, 각 300~600자)
  const EN_LONG_TEXTS = [
    {
      title: "The Power of Atomic Habits",
      content: "It is so easy to overestimate the importance of one defining moment and underestimate the value of making small improvements on a daily basis. Too often, we convince ourselves that massive success requires massive action. However, improving by one percent isn't particularly notable, sometimes it isn't even noticeable, but it can be far more meaningful in the long run. The difference a tiny improvement can make over time is astounding. If you can get one percent better each day for one year, you will end up thirty-seven times better by the time you are done. Small habits matter tremendously."
    },
    {
      title: "Embracing the Digital Future",
      content: "Technology continues to evolve at a breathtaking pace, transforming the fundamental ways we communicate, learn, and collaborate across international borders. Artificial intelligence, cloud infrastructure, and modern web applications have opened up unprecedented opportunities for personal productivity and creative problem solving. However, as the digital world becomes faster and more integrated, foundational digital literacy skills such as fast and accurate typing remain indispensable. Mastering your interaction with the keyboard empowers you to express your thoughts with speed and clarity."
    },
    {
      title: "The Beauty of Morning Light",
      content: "There is an ethereal serenity in the early morning before the rest of the world awakens. The soft glow of dawn slowly illuminates the quiet horizon, casting gentle shadows across tranquil neighborhoods and silent avenues. Taking a quiet moment to breathe deeply, sip a hot cup of coffee, and listen to the faint melodies of waking birds can anchor your spirit for the entire day ahead. When we greet the morning with calm mindfulness rather than hurried stress, we create a resilient foundation capable of handling whatever challenges arise."
    },
    {
      title: "Continuous Learning and Curiosity",
      content: "Curiosity is the engine of intellectual growth and creative achievement. When we maintain a childlike sense of wonder toward the unknown, learning ceases to be a tedious chore and becomes an exhilarating journey of discovery. Reading insightful literature, exploring novel philosophies, and honing practical technical abilities keep our cognitive faculties sharp and youthful. Growth requires humility because we must acknowledge the boundaries of our current understanding before we can expand them. Commit yourself to being a lifelong student."
    },
    {
      title: "Resilience in Difficult Seasons",
      content: "Adversity is an inevitable dimension of the human condition, yet it often carries the seeds of profound inner strength. When plans unravel and circumstances disappoint, our true character is forged through resilience and determined persistence. Rather than allowing temporary setbacks to define our identity, we can view them as rigorous masterclasses in patience and perseverance. The oak tree grows strong not in spite of turbulent storms, but because resisting the harsh winds forces its roots to dig deeper into the earth."
    },
    {
      title: "The Art of Thoughtful Reflection",
      content: "In our hyper-connected society driven by instant notifications and relentless speed, genuine reflection has become a rare and endangered luxury. Taking the time to disconnect from digital noise and introspect allows us to align our daily actions with our core values. Journaling, quiet walks in nature, and honest self-examination help clarify ambiguous feelings and generate strategic insights. Without deliberate periods of pause, we risk running swiftly in directions we never intended to pursue. Guard your quiet hours with fierce loyalty."
    },
    {
      title: "Collaborative Synergy and Teamwork",
      content: "While individual brilliance can spark remarkable breakthroughs, enduring triumphs are almost universally the product of harmonious collective cooperation. When diverse minds unite with a shared objective, individual limitations are offset by complementary talents. Genuine teamwork flourishes within an atmosphere of psychological safety, open vulnerability, and mutual respect. Celebrating one another's successes fosters a generous culture where everyone is inspired to contribute their highest and best efforts without hesitation."
    },
    {
      title: "Mindfulness in Everyday Moments",
      content: "Mindfulness is not an esoteric ritual reserved for quiet mountaintops; it is the practical art of inhabiting the present moment with non-judgmental awareness. Whether washing dishes, typing an email, or savoring an ordinary meal, bringing complete attention to your current activity infuses mundane routines with rich vitality. When our thoughts constantly dwell on past regrets or fret over anticipated futures, we forfeit the only reality we truly possess: the precious and vibrant present moment right now."
    },
    {
      title: "Cultivating Genuine Empathy",
      content: "Empathy is the gentle bridge that connects separate human souls across chasms of misunderstanding and emotional isolation. It demands that we step outside our own preconceptions and strive to perceive reality through the perspective and feelings of another person. Listening with generous, unhurried attention is often the most profound kindness we can offer to someone who feels overlooked. When empathy guides our discourse, conflict softens into constructive dialog and shared humanity prevails over ideological division."
    },
    {
      title: "The Discipline of Creative Mastery",
      content: "Many romanticize inspiration as an unpredictable lightning bolt that strikes the chosen few, but true creative mastery is primarily the child of disciplined consistency. Professional writers, artists, and engineers show up at their desks regardless of whether mood and motivation align. They understand that creative momentum is generated through the physical act of starting. By establishing reliable daily rituals and honoring the craft with focused patience, ordinary effort is eventually transmuted into extraordinary excellence."
    }
  ];

  // ==========================================================================
  // 2. 한글 자모 분해 엔진 & 타수(CPM) 계산 규칙
  // 초성, 중성, 종성 분해 및 복모음/겹받침 2타 환산 적용
  // ==========================================================================
  const HANGUL = {
    CHOSUNG_STROKES: [
      1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1 // ㄱ, ㄲ(2), ㄴ, ㄷ, ㄸ(2), ㄹ, ㅁ, ㅂ, ㅃ(2), ㅅ, ㅆ(2), ㅇ, ㅈ, ㅉ(2), ㅊ, ㅋ, ㅌ, ㅍ, ㅎ
    ],
    JUNGSUNG_STROKES: [
      1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 1, 2, 1 // ㅏ, ㅐ, ㅑ, ㅒ(2), ㅓ, ㅔ, ㅕ, ㅖ(2), ㅗ, ㅘ(2), ㅙ(2), ㅚ(2), ㅛ, ㅜ, ㅝ(2), ㅞ(2), ㅟ(2), ㅠ, ㅡ, ㅢ(2), ㅣ
    ],
    JONGSUNG_STROKES: [
      0, 1, 2, 2, 1, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1 // 없음(0), ㄱ, ㄲ, ㄳ, ㄴ, ㄵ, ㄶ, ㄷ, ㄹ, ㄺ, ㄻ, ㄼ, ㄽ, ㄾ, ㄿ, ㅀ, ㅁ, ㅂ, ㅄ, ㅅ, ㅆ, ㅇ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㅎ
    ],
    // 단일 문자 타수 계산
    getCharStrokes: function (ch) {
      if (!ch) return 0;
      const code = ch.charCodeAt(0);

      // 1) 한글 음절 (가 ~ 힣)
      if (code >= 0xAC00 && code <= 0xD7A3) {
        const offset = code - 0xAC00;
        const cho = Math.floor(offset / (21 * 28));
        const jung = Math.floor((offset % (21 * 28)) / 28);
        const jong = offset % 28;

        const choS = this.CHOSUNG_STROKES[cho] || 1;
        const jungS = this.JUNGSUNG_STROKES[jung] || 1;
        const jongS = this.JONGSUNG_STROKES[jong] || 0;
        return choS + jungS + jongS;
      }

      // 2) 한글 자모 단독 입력 (ㄱ ~ ㅎ, ㅏ ~ ㅣ)
      if (code >= 0x3131 && code <= 0x3163) {
        // 쌍자음, 복모음 일부 2타 처리
        const doubleConsonants = ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ', 'ㅒ', 'ㅖ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'];
        return doubleConsonants.includes(ch) ? 2 : 1;
      }

      // 3) 영문 대문자 (Shift+키이므로 2타로 계산 가능하나 기본 1~2타, 여기선 1타 기본에 대문자 2타 옵션 or 1타)
      if (code >= 65 && code <= 90) {
        return 2; // Shift + Alpha
      }

      // 4) 특수문자 Shift 조합 (!, @, #, $, %, ^, &, *, (, ), _, +, {, }, |, :, ", <, >, ?, ~)
      const shiftSymbols = '!@#$%^&*()_+{}|:"<>?~';
      if (shiftSymbols.includes(ch)) {
        return 2;
      }

      // 5) 일반 문자 / 공백 / 숫자
      return 1;
    },

    // 문자열 전체 타수 계산
    getStringStrokes: function (str) {
      if (!str) return 0;
      let total = 0;
      for (let i = 0; i < str.length; i++) {
        total += this.getCharStrokes(str[i]);
      }
      return total;
    }
  };

  // ==========================================================================
  // 3. 애플리케이션 상태 (State)
  // ==========================================================================
  const state = {
    lang: 'ko', // 'ko' | 'en'
    mode: 'short', // 'word' | 'short' | 'long' | 'test1' | 'test3'
    difficulty: 'all', // 'all' | 'easy' | 'mid' | 'hard'

    // 현재 연습 텍스트
    currentList: [],
    currentIndex: 0,
    targetText: '',
    userInput: '',

    // 세션 통계
    sessionStartTime: null,
    lastKeystrokeTime: null,
    isPaused: false,
    pauseStartTime: null,
    totalPausedTimeMs: 0,

    // 누적 카운트
    completedUnitsCount: 0, // 완료한 단어 or 문장 수
    totalCorrectStrokes: 0, // 완료한 문장들의 누적 정타수
    totalAttemptKeystrokes: 0, // 전체 키 입력 시도수
    totalTypoCount: 0, // 전체 누적 오타수
    maxInstantCpm: 0, // 최고 순간 타수

    // 테스트 타이머 (1분 / 3분)
    timerSeconds: 0,
    timerMaxSeconds: 0,
    timerIntervalId: null,
    countdownIntervalId: null,
    isTestRunning: false,

    // 옵션 설정 (localStorage 저장)
    soundEnabled: false,
    fontSize: 'normal', // 'small' | 'normal' | 'large'
    autoNext: true,

    // 사용자 직접 입력 문장
    customTexts: []
  };

  const STORAGE_KEY_RECORDS = 'challenge_1min_typing_records';
  const STORAGE_KEY_SETTINGS = 'challenge_1min_typing_settings';
  const STORAGE_KEY_CUSTOM = 'challenge_1min_typing_custom';

  // ==========================================================================
  // 4. 사운드 효과 유틸리티 (Web Audio API)
  // ==========================================================================
  function playKeyClickSound() {
    if (!state.soundEnabled) return;
    try {
      if (window.SoundFX && typeof window.SoundFX.keyClick === 'function') {
        window.SoundFX.keyClick();
      }
    } catch (e) {}
  }

  function playSuccessSound() {
    if (!state.soundEnabled) return;
    try {
      if (window.SoundFX && typeof window.SoundFX.correctAnswer === 'function') {
        window.SoundFX.correctAnswer();
      }
    } catch (e) {}
  }

  function playWrongSound() {
    if (!state.soundEnabled) return;
    try {
      if (window.SoundFX && typeof window.SoundFX.wrongAnswer === 'function') {
        window.SoundFX.wrongAnswer();
      }
    } catch (e) {}
  }

  // ==========================================================================
  // 5. 텍스트 소스 로더 및 셔플 알고리즘
  // ==========================================================================
  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function loadContentList() {
    let list = [];
    const isKo = (state.lang === 'ko');
    const diff = state.difficulty;

    if (state.mode === 'word') {
      const full = isKo ? KO_WORDS : EN_WORDS;
      if (diff === 'easy') {
        list = full.slice(0, Math.floor(full.length * 0.35));
      } else if (diff === 'mid') {
        list = full.slice(Math.floor(full.length * 0.35), Math.floor(full.length * 0.7));
      } else if (diff === 'hard') {
        list = full.slice(Math.floor(full.length * 0.7));
      } else {
        list = [...full];
      }
      list = shuffleArray(list);
    } else if (state.mode === 'short' || state.mode === 'test1' || state.mode === 'test3') {
      const full = isKo ? KO_SHORT_SENTENCES : EN_SHORT_SENTENCES;
      if (diff === 'easy') {
        list = full.slice(0, 15);
      } else if (diff === 'mid') {
        list = full.slice(15, 30);
      } else if (diff === 'hard') {
        list = full.slice(30);
      } else {
        list = [...full];
      }
      list = shuffleArray(list);
    } else if (state.mode === 'long') {
      const texts = isKo ? KO_LONG_TEXTS : EN_LONG_TEXTS;
      let selected = texts;
      if (diff === 'easy') {
        selected = texts.slice(0, 3);
      } else if (diff === 'mid') {
        selected = texts.slice(3, 7);
      } else if (diff === 'hard') {
        selected = texts.slice(7);
      }
      list = selected.map(t => `${t.title}\n\n${t.content}`);
    } else if (state.mode === 'custom') {
      list = state.customTexts.length > 0 ? [...state.customTexts] : ["연습할 문장을 직접 등록해보세요."];
    }

    state.currentList = list;
    state.currentIndex = 0;
  }

  function setCurrentTarget() {
    if (state.currentList.length === 0) loadContentList();

    if (state.currentIndex >= state.currentList.length) {
      // 순환 및 재셔플
      state.currentList = shuffleArray(state.currentList);
      state.currentIndex = 0;
    }

    state.targetText = state.currentList[state.currentIndex];
    state.userInput = '';
  }

  // ==========================================================================
  // 6. UI 텍스트 렌더링 & 실시간 글자별 상태 표시 (섹션 11)
  // - 올바른 글자 (char-correct)
  // - 틀린 글자 (char-wrong)
  // - 현재 입력 위치 (char-current + 커서)
  // - 아직 입력하지 않은 글자 (char-pending)
  // ==========================================================================
  function renderTypingDisplay() {
    const target = state.targetText;
    const input = state.userInput;
    const $display = $('#typingDisplay');
    $display.empty();

    let targetLen = target.length;
    let inputLen = input.length;

    // 긴 글 모드 처리 (줄바꿈 보존)
    for (let i = 0; i < targetLen; i++) {
      const targetChar = target[i];
      let charClass = 'char-pending';
      let displayChar = targetChar;

      if (displayChar === '\n') {
        $display.append('<br>');
        continue;
      }

      if (i < inputLen) {
        const inputChar = input[i];
        if (inputChar === targetChar) {
          charClass = 'char-correct';
        } else {
          charClass = 'char-wrong';
        }
      } else if (i === inputLen) {
        charClass = 'char-current';
      }

      // 공백 표시 최적화
      let textContent = targetChar;
      if (targetChar === ' ') {
        textContent = '&nbsp;';
      }

      $display.append(`<span class="type-char ${charClass}">${textContent}</span>`);
    }

    // 진행률 업데이트 (섹션 12)
    updateProgressBar();
  }

  function updateProgressBar() {
    let percent = 0;
    const targetLen = state.targetText.length;
    const inputLen = state.userInput.length;

    if (state.mode === 'test1' || state.mode === 'test3') {
      // 남은 시간 진행률
      if (state.timerMaxSeconds > 0) {
        percent = Math.round(((state.timerMaxSeconds - state.timerSeconds) / state.timerMaxSeconds) * 100);
      }
    } else {
      // 문장 진행률
      if (targetLen > 0) {
        percent = Math.min(100, Math.round((inputLen / targetLen) * 100));
      }
    }

    $('#typingProgressBar').css('width', `${percent}%`);
    $('#progressPercentDisplay').text(`${percent}%`);
  }

  // ==========================================================================
  // 7. 실시간 타수 및 정확도 계산 엔진 (섹션 9 & 10)
  // ==========================================================================
  function updateLiveMetrics() {
    if (!state.sessionStartTime) return;

    const now = Date.now();
    // 일시정지 중이면 시간 누적 멈춤
    const elapsedMs = (now - state.sessionStartTime) - state.totalPausedTimeMs;
    const elapsedMinutes = Math.max(0.015, elapsedMs / 60000); // 최소 0.9초 기준 (폭등 방지)

    // 1) 현재 문장에서 올바르게 입력된 글자들의 타수 계산
    let currentSentenceCorrectStrokes = 0;
    const target = state.targetText;
    const input = state.userInput;
    const checkLen = Math.min(target.length, input.length);

    let matchCount = 0;
    for (let i = 0; i < checkLen; i++) {
      if (target[i] === input[i]) {
        matchCount++;
        currentSentenceCorrectStrokes += HANGUL.getCharStrokes(target[i]);
      }
    }

    // 누적 완료 정타수 + 현재 문장 정타수
    const totalCorrectStrokes = state.totalCorrectStrokes + currentSentenceCorrectStrokes;

    // 분당 타수(CPM) 계산
    let currentCpm = 0;
    if (elapsedMs >= 600) { // 0.6초 이후부터 실시간 타수 계산
      currentCpm = Math.round(totalCorrectStrokes / elapsedMinutes);
    }

    // 최고 순간 타수 갱신 (1초 이후 비정상 스파이크 방지)
    if (elapsedMs >= 2000 && currentCpm > state.maxInstantCpm && currentCpm < 2500) {
      state.maxInstantCpm = currentCpm;
    }

    // 2) 정확도 계산 (%)
    // 최종 정확도 = 현재까지 맞은 글자수 / 전체 입력한 글자수
    let accuracy = 100;
    const totalInputChars = (state.completedUnitsCount * 20) + input.length; // 대략 누적 또는 현재
    if (input.length > 0) {
      accuracy = Math.round((matchCount / input.length) * 1000) / 10;
    }

    // UI 지표 갱신
    $('#liveCpm').text(currentCpm);
    $('#liveAccuracy').text(`${accuracy}%`);

    const elapsedSecs = Math.floor(elapsedMs / 1000);
    const mm = String(Math.floor(elapsedSecs / 60)).padStart(2, '0');
    const ss = String(elapsedSecs % 60).padStart(2, '0');
    $('#liveTime').text(`${mm}:${ss}`);
  }

  // ==========================================================================
  // 8. 입력 이벤트 핸들러 (한글 IME 완벽 대응)
  // ==========================================================================
  let isComposing = false;

  function initInputEvents() {
    const $input = $('#typingInput');

    $input.on('compositionstart', function () {
      isComposing = true;
    });

    $input.on('compositionupdate', function (e) {
      // 한글 조합 중
      handleTyping(e);
    });

    $input.on('compositionend', function (e) {
      isComposing = false;
      handleTyping(e);
    });

    $input.on('input', function (e) {
      handleTyping(e);
    });

    $input.on('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }

      // 사운드 효과
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
        playKeyClickSound();
        state.totalAttemptKeystrokes++;
      }

      // 낱말 모드에서 스페이스바/엔터 처리
      if (state.mode === 'word') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          checkWordComplete();
          return;
        }
      }

      // 짧은 글 모드에서 엔터 키 입력 시 완성 검사
      if (state.mode === 'short' || state.mode === 'test1' || state.mode === 'test3') {
        if (e.key === 'Enter' && !isComposing) {
          e.preventDefault();
          checkSentenceComplete();
          return;
        }
      }
    });

    // 붙여넣기 방지 (공식 테스트 및 일반 연습 공정성)
    $input.on('paste', function (e) {
      e.preventDefault();
      alert('타자 연습에서는 직접 타이핑만 허용됩니다.');
    });
  }

  function handleTyping(e) {
    if (state.isPaused) return;

    // 세션 첫 입력 시 시작 시간 기록
    if (!state.sessionStartTime && (state.mode !== 'test1' && state.mode !== 'test3')) {
      state.sessionStartTime = Date.now();
    }

    const val = $('#typingInput').val();
    state.userInput = val;

    // 실시간 디스플레이 갱신
    renderTypingDisplay();
    updateLiveMetrics();

    // 짧은 글/긴 글에서 글자가 끝까지 정확하게 일치하면 자동 다음 문장 넘김 (옵션 ON)
    if (state.autoNext && !isComposing) {
      if (state.mode === 'word' && val === state.targetText) {
        checkWordComplete();
      } else if ((state.mode === 'short' || state.mode === 'test1' || state.mode === 'test3') && val === state.targetText) {
        checkSentenceComplete();
      } else if (state.mode === 'long' && val.length >= state.targetText.length) {
        checkLongTextComplete();
      }
    }
  }

  // 단어 완성 판정 (MODE 01)
  function checkWordComplete() {
    const input = state.userInput.trim();
    const target = state.targetText.trim();

    if (!input) return;

    if (input === target) {
      // 정타 누적
      state.totalCorrectStrokes += HANGUL.getStringStrokes(target) + 1; // 단어 구분 공백 1타
      state.completedUnitsCount++;
      playSuccessSound();
    } else {
      state.totalTypoCount++;
      playWrongSound();
    }

    $('#completedCountDisplay').text(state.completedUnitsCount);

    // 다음 단어로 이동
    state.currentIndex++;
    setCurrentTarget();
    $('#typingInput').val('');
    renderTypingDisplay();
    updateLiveMetrics();
  }

  // 문장 완성 판정 (MODE 02, MODE 04, MODE 05)
  function checkSentenceComplete() {
    const input = state.userInput;
    const target = state.targetText;

    if (!input) return;

    // 정타수 누적
    let matchedStrokes = 0;
    const checkLen = Math.min(target.length, input.length);
    for (let i = 0; i < checkLen; i++) {
      if (target[i] === input[i]) {
        matchedStrokes += HANGUL.getCharStrokes(target[i]);
      } else {
        state.totalTypoCount++;
      }
    }

    state.totalCorrectStrokes += matchedStrokes;
    state.completedUnitsCount++;
    playSuccessSound();

    $('#completedCountDisplay').text(state.completedUnitsCount);

    // 다음 문장 진행
    state.currentIndex++;
    setCurrentTarget();
    $('#typingInput').val('');
    renderTypingDisplay();
    updateLiveMetrics();
  }

  // 긴 글 완성 판정 (MODE 03)
  function checkLongTextComplete() {
    let matchedStrokes = 0;
    const target = state.targetText;
    const input = state.userInput;
    for (let i = 0; i < Math.min(target.length, input.length); i++) {
      if (target[i] === input[i]) {
        matchedStrokes += HANGUL.getCharStrokes(target[i]);
      } else {
        state.totalTypoCount++;
      }
    }
    state.totalCorrectStrokes += matchedStrokes;
    state.completedUnitsCount = 1;
    finishPracticeSession();
  }

  // ==========================================================================
  // 9. 1분 / 3분 타자 테스트 타이머 (섹션 13)
  // Date.now() / performance.now() 기반 실제 경과 시간 정밀 측정
  // ==========================================================================
  function startTestWithCountdown(durationSeconds) {
    resetPracticeSession();

    state.timerMaxSeconds = durationSeconds;
    state.timerSeconds = durationSeconds;

    // 3초 카운트다운 모달 표시
    const $modal = $('#countdownOverlay').fadeIn(150);
    const $countText = $('#countdownNumber');
    let count = 3;
    $countText.text(count);

    // 사운드
    if (window.SoundFX && typeof window.SoundFX.countdownTick === 'function') {
      window.SoundFX.countdownTick();
    }

    $('#typingInput').prop('disabled', true);

    state.countdownIntervalId = setInterval(() => {
      count--;
      if (count > 0) {
        $countText.text(count);
        if (window.SoundFX && typeof window.SoundFX.countdownTick === 'function') {
          window.SoundFX.countdownTick();
        }
      } else if (count === 0) {
        $countText.text('START!');
        if (window.SoundFX && typeof window.SoundFX.keyClick === 'function') {
          window.SoundFX.keyClick();
        }
      } else {
        clearInterval(state.countdownIntervalId);
        $modal.fadeOut(150);
        beginActualTest(durationSeconds);
      }
    }, 1000);
  }

  function beginActualTest(durationSeconds) {
    state.isTestRunning = true;
    state.sessionStartTime = Date.now();
    $('#typingInput').prop('disabled', false).focus();

    $('#testTimerBox').show();
    $('#testTimerDisplay').text(`${durationSeconds}s`);

    const targetEndTime = Date.now() + (durationSeconds * 1000);

    state.timerIntervalId = setInterval(() => {
      const remainingMs = targetEndTime - Date.now();
      const remainingSecs = Math.max(0, Math.ceil(remainingMs / 1000));

      state.timerSeconds = remainingSecs;
      $('#testTimerDisplay').text(`${remainingSecs}s`);
      updateLiveMetrics();
      updateProgressBar();

      if (remainingMs <= 0) {
        clearInterval(state.timerIntervalId);
        state.isTestRunning = false;
        $('#typingInput').prop('disabled', true);
        if (window.SoundFX && typeof window.SoundFX.gameOver === 'function') {
          window.SoundFX.gameOver();
        }
        finishPracticeSession();
      }
    }, 200);
  }

  // ==========================================================================
  // 10. 연습 종료 및 결과 화면 렌더링 (섹션 14 & 15)
  // ==========================================================================
  function finishPracticeSession() {
    if (state.timerIntervalId) clearInterval(state.timerIntervalId);
    if (state.countdownIntervalId) clearInterval(state.countdownIntervalId);

    const now = Date.now();
    const elapsedMs = Math.max(1000, (now - state.sessionStartTime) - state.totalPausedTimeMs);
    const elapsedMinutes = elapsedMs / 60000;
    const elapsedSeconds = Math.round(elapsedMs / 1000);

    // 최종 타수 계산
    const finalCpm = Math.round(state.totalCorrectStrokes / elapsedMinutes);

    // 최종 정확도 계산
    let finalAccuracy = 100;
    const totalChars = state.totalAttemptKeystrokes;
    if (totalChars > 0) {
      finalAccuracy = Math.max(0, Math.min(100, Math.round(((totalChars - state.totalTypoCount) / totalChars) * 1000) / 10));
    }

    const modeLabels = {
      word: '낱말 연습',
      short: '짧은 글 연습',
      long: '긴 글 연습',
      test1: '1분 타자 테스트',
      test3: '3분 타자 테스트',
      custom: '사용자 직접 문장'
    };

    const record = {
      id: Date.now(),
      date: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      lang: state.lang,
      mode: state.mode,
      modeLabel: modeLabels[state.mode] || state.mode,
      cpm: finalCpm,
      maxCpm: Math.max(finalCpm, state.maxInstantCpm),
      accuracy: finalAccuracy,
      elapsedSeconds: elapsedSeconds,
      correctStrokes: state.totalCorrectStrokes,
      typoCount: state.totalTypoCount,
      completedUnits: state.completedUnitsCount
    };

    // 로컬스토리지 저장 (최근 50개)
    saveRecord(record);

    // 모달 렌더링
    renderResultModal(record);
  }

  function renderResultModal(record) {
    $('#resMode').text(`${record.lang === 'ko' ? '🇰🇷 한글' : '🇺🇸 영문'} · ${record.modeLabel}`);
    $('#resCpm').text(`${record.cpm} 타/분`);
    $('#resMaxCpm').text(`${record.maxCpm} 타/분`);
    $('#resAccuracy').text(`${record.accuracy}%`);
    $('#resTime').text(`${record.elapsedSeconds}초`);
    $('#resCorrect').text(`${record.correctStrokes}타`);
    $('#resTypo').text(`${record.typoCount}회`);
    $('#resCompleted').text(`${record.completedUnits}개`);

    // 이전 최고 기록과 비교 메시지 (섹션 14)
    const bestRecord = getBestRecord(record.lang, record.mode);
    let msg = "오늘의 타자 연습을 완료했어요!";
    if (bestRecord && record.cpm > bestRecord.cpm) {
      msg = `🎉 축하합니다! 지난 최고 기록보다 ${record.cpm - bestRecord.cpm}타 빨라졌어요!`;
    } else if (record.accuracy >= 98) {
      msg = `✨ 훌륭합니다! 정확도 ${record.accuracy}%를 달성했어요.`;
    }
    $('#resHeadline').text(msg);

    $('#resultModal').fadeIn(200);
  }

  // ==========================================================================
  // 11. 개인 기록 저장 & 대시보드 통계 (섹션 15 & 16)
  // ==========================================================================
  function getRecords() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_RECORDS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveRecord(record) {
    try {
      const records = getRecords();
      records.unshift(record);
      if (records.length > 50) records.splice(50); // 최대 50개 보관
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
      updateDashboardStats();
    } catch (e) {}
  }

  function getBestRecord(lang, mode) {
    const records = getRecords().filter(r => r.lang === lang && r.mode === mode);
    if (records.length === 0) return null;
    return records.reduce((best, curr) => (curr.cpm > best.cpm ? curr : best), records[0]);
  }

  function updateDashboardStats() {
    const records = getRecords();

    // 1) 한글 최고 타수
    const koRecords = records.filter(r => r.lang === 'ko');
    const bestKo = koRecords.reduce((max, r) => Math.max(max, r.cpm), 0);
    $('#dashBestKo').text(bestKo > 0 ? `${bestKo} 타` : '-');

    // 2) 영문 최고 타수
    const enRecords = records.filter(r => r.lang === 'en');
    const bestEn = enRecords.reduce((max, r) => Math.max(max, r.cpm), 0);
    $('#dashBestEn').text(bestEn > 0 ? `${bestEn} 타` : '-');

    // 3) 최근 평균 타수
    const recentRecords = records.slice(0, 10);
    const avgCpm = recentRecords.length > 0
      ? Math.round(recentRecords.reduce((sum, r) => sum + r.cpm, 0) / recentRecords.length)
      : 0;
    $('#dashAvgCpm').text(avgCpm > 0 ? `${avgCpm} 타` : '-');

    // 4) 최고 정확도
    const bestAcc = records.reduce((max, r) => Math.max(max, r.accuracy), 0);
    $('#dashBestAcc').text(bestAcc > 0 ? `${bestAcc}%` : '-');

    // 5) 총 연습 횟수 및 시간
    const totalCount = records.length;
    const totalSecs = records.reduce((sum, r) => sum + (r.elapsedSeconds || 0), 0);
    const totalMins = Math.round(totalSecs / 60);
    $('#dashTotalCount').text(`${totalCount}회`);
    $('#dashTotalTime').text(`${totalMins}분`);

    // 6) 기록 목록 및 차트 렌더링
    renderRecordListAndChart('all');
  }

  function renderRecordListAndChart(filterDays) {
    const allRecords = getRecords();
    const now = Date.now();

    // 기간 필터링
    let filtered = allRecords;
    if (filterDays === '7') {
      filtered = allRecords.filter(r => (now - r.id) <= 7 * 24 * 60 * 60 * 1000);
    } else if (filterDays === '30') {
      filtered = allRecords.filter(r => (now - r.id) <= 30 * 24 * 60 * 60 * 1000);
    }

    // 목록 렌더링
    const $tbody = $('#recordTableBody');
    $tbody.empty();

    if (filtered.length === 0) {
      $tbody.html('<tr><td colspan="6" class="text-center py-4 text-muted">저장된 연습 기록이 없습니다.</td></tr>');
    } else {
      filtered.slice(0, 20).forEach(r => {
        $tbody.append(`
          <tr>
            <td>${r.date}</td>
            <td><span class="badge ${r.lang === 'ko' ? 'badge-primary' : 'badge-secondary'}">${r.lang === 'ko' ? '한글' : '영문'}</span></td>
            <td>${r.modeLabel}</td>
            <td class="font-bold text-primary">${r.cpm} 타</td>
            <td>${r.accuracy}%</td>
            <td>${r.elapsedSeconds}초</td>
          </tr>
        `);
      });
    }

    // CSS 막대 차트 시각화 (최근 최대 10개)
    const $chart = $('#chartBarsWrapper');
    $chart.empty();

    const chartData = filtered.slice(0, 10).reverse();
    if (chartData.length === 0) {
      $chart.html('<div class="empty-chart">차트에 표시할 기록이 없습니다.</div>');
      return;
    }

    const maxChartCpm = Math.max(500, ...chartData.map(d => d.cpm));

    chartData.forEach(d => {
      const heightPercent = Math.max(10, Math.round((d.cpm / maxChartCpm) * 100));
      $chart.append(`
        <div class="chart-bar-item" title="${d.date} - ${d.cpm}타">
          <div class="chart-bar-value">${d.cpm}</div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="height: ${heightPercent}%;"></div>
          </div>
          <div class="chart-bar-label">${d.lang === 'ko' ? '한' : '영'}</div>
        </div>
      `);
    });
  }

  function clearAllRecords() {
    if (confirm('저장된 타자 연습 기록을 모두 삭제하시겠습니까?\n삭제 후에는 복원할 수 없습니다.')) {
      localStorage.removeItem(STORAGE_KEY_RECORDS);
      updateDashboardStats();
      alert('타자 연습 기록이 초기화되었습니다.');
    }
  }

  // ==========================================================================
  // 12. 연습 리셋 및 모드 변경
  // ==========================================================================
  function resetPracticeSession() {
    if (state.timerIntervalId) clearInterval(state.timerIntervalId);
    if (state.countdownIntervalId) clearInterval(state.countdownIntervalId);

    state.sessionStartTime = null;
    state.lastKeystrokeTime = null;
    state.isPaused = false;
    state.totalPausedTimeMs = 0;
    state.completedUnitsCount = 0;
    state.totalCorrectStrokes = 0;
    state.totalAttemptKeystrokes = 0;
    state.totalTypoCount = 0;
    state.maxInstantCpm = 0;
    state.isTestRunning = false;

    $('#typingInput').val('').prop('disabled', false);
    $('#liveCpm').text('0');
    $('#liveAccuracy').text('100%');
    $('#liveTime').text('00:00');
    $('#completedCountDisplay').text('0');
    $('#testTimerBox').hide();
    $('#pauseOverlay').hide();

    setCurrentTarget();
    renderTypingDisplay();
  }

  function changeMode(newMode) {
    state.mode = newMode;
    $('.mode-btn').removeClass('active');
    $(`.mode-btn[data-mode="${newMode}"]`).addClass('active');

    // 일시정지 버튼은 자유 연습 모드에서만 활성화 (섹션 18)
    if (newMode === 'test1' || newMode === 'test3') {
      $('#pauseBtn').prop('disabled', true).addClass('opacity-50').attr('title', '공식 테스트에서는 일시정지를 사용할 수 없습니다.');
      $('#testStartAction').show();
      $('#typingInput').prop('disabled', true).attr('placeholder', '[테스트 시작] 버튼을 눌러주세요.');
    } else {
      $('#pauseBtn').prop('disabled', false).removeClass('opacity-50').attr('title', '연습 일시정지');
      $('#testStartAction').hide();
      $('#typingInput').prop('disabled', false).attr('placeholder', '위의 문장을 보고 그대로 타이핑하세요...');
    }

    loadContentList();
    resetPracticeSession();
  }

  function changeLanguage(newLang) {
    state.lang = newLang;
    $('.lang-btn').removeClass('active');
    $(`.lang-btn[data-lang="${newLang}"]`).addClass('active');

    loadContentList();
    resetPracticeSession();
  }

  // ==========================================================================
  // 13. 사용자 편의 기능 (섹션 18)
  // 글자 크기, 효과음, 일시정지, 자동 다음 문장
  // ==========================================================================
  function initPreferences() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const s = JSON.parse(saved);
        state.soundEnabled = !!s.sound;
        state.fontSize = s.fontSize || 'normal';
        state.autoNext = s.autoNext !== undefined ? s.autoNext : true;
      }
    } catch (e) {}

    // UI 반영
    $('#soundToggleBtn').toggleClass('active', state.soundEnabled);
    $('#soundToggleBtn').find('.sound-status').text(state.soundEnabled ? 'ON' : 'OFF');
    $('#autoNextCheckbox').prop('checked', state.autoNext);
    applyFontSize(state.fontSize);
  }

  function savePreferences() {
    try {
      const s = {
        sound: state.soundEnabled,
        fontSize: state.fontSize,
        autoNext: state.autoNext
      };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(s));
    } catch (e) {}
  }

  function applyFontSize(size) {
    state.fontSize = size;
    const $display = $('#typingDisplay');
    $display.removeClass('font-size-small font-size-normal font-size-large');
    $display.addClass(`font-size-${size}`);
    $('.font-btn').removeClass('active');
    $(`.font-btn[data-size="${size}"]`).addClass('active');
  }

  function togglePause() {
    if (state.mode === 'test1' || state.mode === 'test3') return; // 공식 테스트 금지

    state.isPaused = !state.isPaused;
    if (state.isPaused) {
      state.pauseStartTime = Date.now();
      $('#pauseOverlay').fadeIn(150);
      $('#typingInput').prop('disabled', true);
      $('#pauseBtn').html('<span>▶ 재개</span>');
    } else {
      if (state.pauseStartTime) {
        state.totalPausedTimeMs += (Date.now() - state.pauseStartTime);
      }
      $('#pauseOverlay').fadeOut(150);
      $('#typingInput').prop('disabled', false).focus();
      $('#pauseBtn').html('<span>⏸ 일시정지</span>');
    }
  }

  // ==========================================================================
  // 14. 사용자 직접 문장 입력 (섹션 8)
  // ==========================================================================
  function loadCustomTexts() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CUSTOM);
      if (data) state.customTexts = JSON.parse(data);
    } catch (e) {}
  }

  function saveCustomTexts(texts) {
    try {
      state.customTexts = texts;
      localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(texts));
    } catch (e) {}
  }

  // ==========================================================================
  // 15. DOM 이벤트 바인딩
  // ==========================================================================
  function initEvents() {
    // 언어 변경
    $('.lang-btn').on('click', function () {
      const lang = $(this).data('lang');
      changeLanguage(lang);
    });

    // 모드 변경
    $('.mode-btn').on('click', function () {
      const mode = $(this).data('mode');
      changeMode(mode);
    });

    // 난이도 변경 (초급 / 중급 / 고급 / 전체)
    $('.diff-btn').on('click', function () {
      $('.diff-btn').removeClass('active');
      $(this).addClass('active');
      state.difficulty = $(this).data('diff');
      loadContentList();
      resetPracticeSession();
    });

    // 테스트 시작 버튼 (1분 / 3분 모드 전용)
    $('#startTestBtn').on('click', function () {
      const secs = (state.mode === 'test3') ? 180 : 60;
      startTestWithCountdown(secs);
    });

    // 다시 시작 / 다른 문장
    $('#restartSentenceBtn').on('click', function () {
      resetPracticeSession();
    });

    $('#nextSentenceBtn').on('click', function () {
      state.currentIndex++;
      setCurrentTarget();
      $('#typingInput').val('');
      renderTypingDisplay();
    });

    // 일시정지
    $('#pauseBtn, #resumeFromPauseBtn').on('click', function () {
      togglePause();
    });

    // 사운드 토글
    $('#soundToggleBtn').on('click', function () {
      state.soundEnabled = !state.soundEnabled;
      $(this).toggleClass('active', state.soundEnabled);
      $(this).find('.sound-status').text(state.soundEnabled ? 'ON' : 'OFF');
      savePreferences();
      if (state.soundEnabled) playSuccessSound();
    });

    // 글자 크기 변경
    $('.font-btn').on('click', function () {
      const size = $(this).data('size');
      applyFontSize(size);
      savePreferences();
    });

    // 자동 다음 문장 체크박스
    $('#autoNextCheckbox').on('change', function () {
      state.autoNext = $(this).is(':checked');
      savePreferences();
    });

    // 결과 모달 닫기 및 다시 연습
    $('#modalRestartBtn').on('click', function () {
      $('#resultModal').fadeOut(150);
      resetPracticeSession();
      if (state.mode === 'test1' || state.mode === 'test3') {
        const secs = (state.mode === 'test3') ? 180 : 60;
        startTestWithCountdown(secs);
      }
    });

    $('#modalNextBtn').on('click', function () {
      $('#resultModal').fadeOut(150);
      state.currentIndex++;
      resetPracticeSession();
    });

    $('#closeResultModalBtn').on('click', function () {
      $('#resultModal').fadeOut(150);
      resetPracticeSession();
    });

    // 대시보드 필터 변경
    $('.dash-filter-btn').on('click', function () {
      $('.dash-filter-btn').removeClass('active');
      $(this).addClass('active');
      const days = $(this).data('filter');
      renderRecordListAndChart(days);
    });

    // 기록 삭제
    $('#clearRecordsBtn').on('click', function () {
      clearAllRecords();
    });

    // 사용자 문장 모달
    $('#openCustomModalBtn').on('click', function () {
      $('#customModal').fadeIn(150);
    });

    $('#closeCustomModalBtn, #cancelCustomBtn').on('click', function () {
      $('#customModal').fadeOut(150);
    });

    $('#saveCustomBtn').on('click', function () {
      const text = $('#customTextInput').val().trim();
      if (!text) {
        alert('연습할 문장을 입력해주세요.');
        return;
      }
      if (text.length > 2000) {
        alert('문장은 2,000자 이내로 입력해주세요.');
        return;
      }

      // 줄바꿈 기준으로 문장 분할
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      saveCustomTexts(lines);
      $('#customModal').fadeOut(150);
      changeMode('custom');
      alert('내 문장 연습 모드가 시작되었습니다.');
    });
  }

  // ==========================================================================
  // 16. 페이지 로드 초기화
  // ==========================================================================
  $(document).ready(function () {
    loadCustomTexts();
    initPreferences();
    loadContentList();
    setCurrentTarget();
    renderTypingDisplay();
    initInputEvents();
    initEvents();
    updateDashboardStats();
  });

})(jQuery);
