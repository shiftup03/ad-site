/**
 * 1-Min Challenge - 온라인 타자 연습 (typing-practice.js)
 * 한글/영문 자모 분해 타수(CPM) 계산, 5대 연습 모드, 60초/180초 타이머, 실시간 오타 판정, 개인 통계 대시보드
 */

(function ($) {
  'use strict';

  // ==========================================================================
  // 1. 연습 콘텐츠 데이터베이스 (한글 / 영문 방대한 데이터)
  // ==========================================================================

  // ==========================================================================
  // [1-1] 한글 낱말 (초급 / 중급 / 고급 명확 분리)
  // ==========================================================================
  // 초급: 1~2음절 기본 낱말 (받침 없거나 기본 단받침, 일상 기초 어휘)
  const KO_WORDS_EASY = [
    "봄", "여름", "가을", "겨울", "하늘", "바다", "구름", "나무", "바람", "소리",
    "마음", "사랑", "친구", "나비", "우산", "시계", "모자", "물", "불", "달",
    "별", "해", "산", "강", "길", "집", "문", "눈", "꽃", "새",
    "차", "책", "밥", "꿈", "밤", "낮", "손", "발", "입", "귀",
    "노래", "편지", "선물", "미소", "기쁨", "행복", "평화", "아침", "저녁", "하루"
  ];

  // 중급: 2~4음절 실생활/비즈니스/학습 복합어 (복모음, 일반 복합 단어)
  const KO_WORDS_MID = [
    "컴퓨터", "키보드", "스마트폰", "도서관", "프로젝트", "아이디어", "알고리즘", "소프트웨어",
    "성취감", "회복탄력성", "대중교통", "인공지능", "네트워크", "프레젠테이션", "자기계발",
    "스트레스", "커뮤니케이션", "다이어리", "문화유산", "지구온난화", "상호작용", "백과사전",
    "협력관계", "창의력", "집중력", "문제해결", "프로그래밍", "데이터베이스", "업무효율",
    "고객만족", "가치창출", "지속가능", "의사소통", "디지털시대", "환경보호", "동기부여"
  ];

  // 고급: 겹받침 (ㄳ, ㄵ, ㄶ, ㄺ, ㄻ, ㄼ, ㄽ, ㄾ, ㄿ, ㅀ, ㅄ), 사자성어, 고난도 어휘
  const KO_WORDS_HARD = [
    // 겹받침 집중 어휘
    "갉아먹다", "닭볶음탕", "흙먼지", "읊조리다", "넋두리", "옭아매다", "훑어보다", "굶주림",
    "떫은맛", "맑은물", "값어치", "넙치구이", "앉은뱅이", "여덟째", "곪아터지다", "끊임없이",
    "끓어오르다", "얹어놓다", "핥아먹다", "삯바느질", "홑이불", "넓적다리", "읊는소리", "옭매이다",
    // 사자성어 및 고난도 어휘
    "일취월장", "마부위침", "역지사지", "감언이설", "온고지신", "결초보은", "고진감래", "주경야독",
    "동고동락", "괄목상대", "전광석화", "천고마비", "유비무환", "파죽지세", "이심전심", "전화위복",
    "대동소이", "수수방관", "자포자기", "권토중래", "교학상장", "침소봉대", "군계일학", "풍전등화"
  ];

  // ==========================================================================
  // [1-2] 영문 낱말 (초급 / 중급 / 고급 명확 분리)
  // ==========================================================================
  // 초급: 3~4글자 기초 단어
  const EN_WORDS_EASY = [
    "sun", "sky", "sea", "tree", "book", "pen", "cup", "car", "bus", "run",
    "walk", "red", "blue", "milk", "fish", "star", "moon", "home", "time", "food",
    "love", "hand", "foot", "door", "wind", "rain", "snow", "bird", "cat", "dog",
    "park", "desk", "road", "ship", "song", "game", "gold", "fire", "leaf", "city"
  ];

  // 중급: 5~8글자 표준 단어
  const EN_WORDS_MID = [
    "practice", "keyboard", "monitor", "library", "student", "teacher", "computer", "internet",
    "program", "balance", "creative", "harmony", "explore", "forward", "journey", "dynamic",
    "patient", "reflect", "silence", "thought", "victory", "morning", "network", "project",
    "develop", "science", "future", "culture", "respect", "freedom", "calendar", "weather",
    "machine", "strength", "energy", "history", "imagine", "whisper", "comfort", "element"
  ];

  // 고급: 9~16글자 전문/학술 단어
  const EN_WORDS_HARD = [
    "synchronization", "conscientiousness", "incomprehensible", "vulnerability", "extraordinary",
    "transformation", "sustainability", "philosophical", "unprecedented", "characteristic",
    "indispensable", "infrastructure", "accomplishment", "comprehensive", "environmental",
    "distinguished", "revolutionary", "perseverance", "sophisticated", "interconnected",
    "acknowledgment", "claustrophobia", "maneuverability", "reconnaissance", "troubleshooting",
    "interoperability", "proportionality", "experimentation", "responsiveness", "generalization"
  ];

  // ==========================================================================
  // [1-3] 한글 짧은 글 (초급 / 중급 / 고급 명확 분리)
  // ==========================================================================
  // 초급: 10~18자 내외 단순 기초 단문
  const KO_SHORT_SENTENCES_EASY = [
    "맑은 하늘이 참 예쁩니다.",
    "오늘 하루도 힘차게 시작해요.",
    "시원한 바람이 솔솔 불어옵니다.",
    "따뜻한 물을 천천히 마셔요.",
    "새로운 아침이 밝았습니다.",
    "매일 조금씩 꾸준히 연습해요.",
    "친구와 함께 산책을 합니다.",
    "책상 위를 깨끗이 정돈해요.",
    "새들의 맑은 노랫소리가 울려요.",
    "달콤한 과일을 맛있게 먹어요.",
    "음악을 들으며 편안히 쉬어요.",
    "서로 웃으며 인사를 나눕니다.",
    "푸른 바다를 보며 힐링합니다.",
    "작은 일에도 감사함을 느껴요.",
    "포기하지 않고 끝까지 해봐요."
  ];

  // 중급: 25~45자 쉼표, 복문 구조, 감정 및 일상 사색
  const KO_SHORT_SENTENCES_MID = [
    "작은 성취가 모여, 단단한 자신감을 이루는 밑거름이 됩니다.",
    "바쁜 일상 속에서도 잠시 멈추어, 파란 하늘을 올려다보세요.",
    "실패를 두려워하지 않고 다시 도전하는 용기가 가장 값집니다.",
    "따뜻한 차 한 잔을 마시며, 지나간 하루를 차분히 정리합니다.",
    "비가 내린 뒤에 땅이 굳어지듯, 시련은 우리를 성장시킵니다.",
    "타인의 성공을 진심으로 축하할 줄 아는 너그러움이 필요합니다.",
    "매일 10분씩 독서하는 습관이, 깊이 있는 생각을 만들어 줍니다.",
    "서로를 배려하는 따뜻한 말 한마디가, 얼어붙은 마음을 녹입니다.",
    "자연이 주는 평온함 속에서, 지친 몸과 마음에 활력을 채웁니다.",
    "목표를 향해 묵묵히 걷다 보면, 어느새 정상에 닿아 있습니다.",
    "스스로를 믿고 신중하게 결정할 때, 후회 없는 선택을 하게 됩니다.",
    "좋은 습관을 만드는 시간은 길지만, 그 결과는 평생을 지탱합니다."
  ];

  // 고급: 45~75자 숫자, 영문, 특수기호(!, ?, %, "", '', [], ()), 겹받침 밀집
  const KO_SHORT_SENTENCES_HARD = [
    "2026년 AI·클라우드 환경에서 정확도 99.5% 이상의 초고속 타자(CPM 600+)를 달성해 보세요!",
    "‘시작이 반이다’라는 격언처럼, 키보드[Shift/Ctrl]와 겹받침(ㄳ, ㄵ, ㄶ, ㄺ) 연습이 중요합니다.",
    "소통(Communication)과 회복탄력성(Resilience)은 프로젝트 성공의 90% 이상을 좌우합니다.",
    "매일 1%씩 성장한다면 1년(365일) 뒤에는 약 37.78배의 눈부신 성취를 거두게 됩니다.",
    "흙먼지 속에서도 맑고 밝은 꿈을 잃지 않고, 넙치처럼 넙죽 엎드리기보다 당당히 전진합시다!",
    "디지털 대전환(DX) 시대, 창의적 문제 해결력(Creative Problem Solving)과 정밀 타건 능력을 기릅시다.",
    "역지사지(易地思之)의 태도로 상대방의 넋두리를 경청하는 배려가 조직의 시너지를 극대화합니다.",
    "어제의 한계(Limit)를 깨뜨리고 오늘의 나를 120% 뛰어넘는 열정으로 도전을 계속하세요!",
    "읊조리듯 시를 낭송하며 끊임없이(Endless) 자판을 두드리는 연습은 고도의 집중력을 요구합니다.",
    "‘마부위침(磨斧爲針)’의 끈기로 매일 15분씩 연습하면, 누구나 최고급 타자왕이 될 수 있습니다!"
  ];

  // ==========================================================================
  // [1-4] 영문 짧은 글 (초급 / 중급 / 고급 명확 분리)
  // ==========================================================================
  // 초급: 15~25자 단순 단문
  const EN_SHORT_SENTENCES_EASY = [
    "The sun rises in the morning.",
    "Practice makes better every day.",
    "A good book opens a new world.",
    "Keep smiling and stay positive.",
    "Walking in the park is relaxing.",
    "Small steps bring great results.",
    "Fresh air gives good energy.",
    "Music brings joy to everyone.",
    "Kind words make people happy.",
    "Believe in yourself each day.",
    "Drink water and stay healthy.",
    "Every day is a fresh start."
  ];

  // 중급: 35~55자 콤마, 복합문 구조
  const EN_SHORT_SENTENCES_MID = [
    "Success is the sum of small efforts, repeated day in and day out.",
    "When you focus on the good, the good around you gets even better.",
    "Consistency is the true foundation of meaningful mastery and growth.",
    "Difficult roads often lead to beautiful and unexpected destinations.",
    "Clear thinking requires courage rather than sheer intelligence alone.",
    "Find joy in the process itself, rather than stressing over the outcome.",
    "A disciplined routine brings lasting freedom and genuine peace of mind.",
    "The secret of getting ahead is simply having the bravery to begin.",
    "True confidence grows quietly through daily preparation and self-respect.",
    "Reading good literature is like conversing with history's finest minds."
  ];

  // 고급: 60~95자 기호, 인용구, 약어, 기술 복합문
  const EN_SHORT_SENTENCES_HARD = [
    "In 2026, mastering high-speed typing (650+ CPM) with 99.8% accuracy is essential for IT/AI careers!",
    "“The secret of change is to focus all of your energy not on fighting the old, but on building the new.” — Socrates",
    "Effective cross-functional communication (API, UX/UI, DevOps) requires empathy, agility, and 100% dedication.",
    "Keep your back straight (90° posture), wrists elevated, and fingers positioned precisely on the 'ASDF / JKL;' home row!",
    "Technological innovation [Cloud & LLMs] accelerates productivity by 35%~50% across multidisciplinary domains.",
    "“Success isn't always about greatness; it's about consistency. Consistent hard work leads to success.” — Dwayne Johnson",
    "Are you ready to test your cognitive agility, typing velocity, and keyboard coordination under 60-second pressure?",
    "Mastering complex programming paradigms (OOP, Functional, Reactive) demands continuous curiosity & resilience!"
  ];

  // ==========================================================================
  // [1-5] 한글 긴 글 (초급 / 중급 / 고급 명확 분리 및 행별 줄바꿈 \n 지원)
  // ==========================================================================
  // 초급 긴 글: 100~150자 내외, 3~4개의 명확한 행, 쉬운 어휘 (각 행 끝 Enter로 줄바꿈)
  const KO_LONG_TEXTS_EASY = [
    {
      title: "봄날의 아침 산책",
      content: "따뜻한 봄바람이 살랑살랑 불어옵니다.\n파란 하늘 위로 하얀 구름이 천천히 흘러갑니다.\n나무마다 파릇파릇한 새싹이 기분 좋게 돋아납니다.\n오늘 하루도 힘차고 즐겁게 시작해 봅니다."
    },
    {
      title: "책 한 권의 여유",
      content: "조용한 방 안에 앉아 책장을 천천히 넘깁니다.\n은은한 종이 냄새가 마음을 편안하게 감싸줍니다.\n새로운 이야기를 읽으며 작은 행복을 느낍니다.\n차 한 잔과 함께하는 여유로운 시간입니다."
    },
    {
      title: "작은 다짐의 시작",
      content: "매일 조금씩 꾸준히 연습하는 습관을 기릅니다.\n처음에는 서툴러도 하루하루 실력이 늘어갑니다.\n어제보다 조금 더 성장한 나를 발견합니다.\n오늘도 밝은 미소로 나의 꿈을 응원합니다."
    }
  ];

  // 중급 긴 글: 250~350자 내외, 6~8행, 표준 수필/에세이
  const KO_LONG_TEXTS_MID = [
    {
      title: "작은 습관이 만드는 큰 변화",
      content: "우리는 매일 수많은 결정을 내리고 행동하며 살아갑니다.\n사소해 보이는 좋은 습관 하나가 모여 삶 전체를 바꿉니다.\n매일 아침 시원한 물 한 잔을 마시는 작은 습관,\n하루 15분씩 책을 읽거나 타자 연습을 하는 꾸준한 정성이\n우리의 일상을 더욱 단단하고 건강하게 채워줍니다.\n조급한 마음을 내려놓고 작은 목표를 끈기 있게 실천해 보세요.\n처음에는 우리가 습관을 만들지만, 결국 그 습관이\n우리의 찬란한 미래를 만들어 갈 것입니다."
    },
    {
      title: "숲길을 걸으며 찾는 평온",
      content: "푸른 나무들이 우거진 조용한 숲길을 천천히 걸어봅니다.\n복잡했던 머릿속 생각들이 맑은 공기 속에 잔잔하게 가라앉습니다.\n나뭇잎 사이로 부서져 내리는 눈부신 햇살과\n뺨을 스치는 시원한 바람이 지친 일상에 다정한 위로를 건넵니다.\n발걸음을 옮길 때마다 사각거리는 흙과 낙엽의 감촉은\n자연이 우리에게 건네는 가장 순수하고 따뜻한 선물입니다.\n서두르지 않고 온전히 나 자신에게 집중하는 시간을 가져보세요."
    },
    {
      title: "새로운 배움과 지혜의 여정",
      content: "새로운 지식을 배우고 경험을 쌓아가는 모든 과정은\n나이와 상관없이 우리 삶에 깊은 활기를 불어넣어 줍니다.\n키보드 위에서 손가락이 유연하게 움직이는 순간마다\n매일 조금씩 익숙해지는 뿌듯함을 온전히 맛볼 수 있습니다.\n실수를 두려워하지 않고 한 걸음씩 나아가는 용기야말로\n더 넓은 세상으로 도약할 수 있는 진정한 밑거름입니다.\n배움이란 정해진 종착역이 있는 경쟁이 아니라,\n평생을 걸쳐 스스로를 발견해 나가는 아름다운 여행입니다."
    }
  ];

  // 고급 긴 글: 450~600자 내외, 8~12행, 전문 어휘, 겹받침, 숫자, 영문, 철학/사설 텍스트
  const KO_LONG_TEXTS_HARD = [
    {
      title: "디지털 대전환(DX)과 인공지능(AI) 시대의 통찰",
      content: "2026년 인공지능(AI)과 클라우드 컴퓨팅 기술은 사회 전반을 획기적으로 재편하고 있습니다.\n방대한 빅데이터(Big Data)와 복합 신경망 알고리즘의 발전 속에서도 인간 고유의 통찰력은 여전히 핵심입니다.\n단순한 첨단 기술의 수동적 소비자에 머무르지 않고, 창의적 문제 해결사(Problem Solver)로 도약해야 합니다.\n키보드를 신속·정밀하게 조작하는 타건 능력(CPM 600+)과 디지털 문해력(Digital Literacy)은 필수 무기입니다.\n흙먼지 가득한 거친 환경에서도 맑은 꿈을 잃지 않는 강인한 회복탄력성(Resilience)을 함께 길러야 합니다.\n‘마부위침(磨斧爲針)’의 끈기로 매일 역량을 연마할 때, 기술은 비로소 인류 번영을 향한 강력한 날개가 됩니다.\n끊임없는 호기심과 불굴의 탐구 정신으로 미래 사회의 새로운 지평(Horizon)을 당당하게 열어가세요."
    },
    {
      title: "회복탄력성과 불요불굴(不撓不屈)의 개척 정신",
      content: "인생의 여정에서 마주하는 뜻밖의 좌절과 시련은 결코 우리를 옭아매는 실패의 종착점이 아닙니다.\n오히려 곪아터진 상처를 치유하고 내면의 단단한 정신적 근육을 단련하는 값진 전환점(Turning Point)입니다.\n누구나 넋두리를 읊조리며 주저앉고 싶은 순간을 겪지만, 다시 흙을 털고 꿋꿋이 일어나는 용기가 중요합니다.\n떫은맛의 고통 속에서도 향기로운 결실을 맺는 열매처럼, 인내와 헌신은 찬란한 성공의 밑거름이 됩니다.\n역지사지(易地思之)의 너그러운 배려로 주변 동료들과 동고동락(同苦同樂)하며 협력의 시너지를 발휘해 보세요.\n스스로 설정한 한계선(Limit)을 120% 뛰어넘으려는 불요불굴(不撓不屈)의 도전 정신이 진정한 기적을 만듭니다.\n어제보다 오늘 한 걸음 더 전진하는 당신의 묵묵한 노력은 반드시 값진 열매로 보답받을 것입니다."
    },
    {
      title: "기술 문명 속 인간다움의 가치와 성찰",
      content: "초연결 사회(Hyper-Connected Society)의 눈부신 편리함 속에서 우리는 종종 내면의 고요를 잃어버립니다.\n수많은 디지털 알림과 단편적인 정보의 홍수 속에서 사유(Deep Reflection)의 깊이는 얕아지기 십상입니다.\n하지만 인류의 참된 지혜는 속도(Velocity)보다 깊이 있는 철학적 성찰과 따뜻한 감정적 교감(Empathy)에서 비롯됩니다.\n타인을 훑어보며 가볍게 재단하기보다, 진심 어린 눈빛으로 경청하는 태도가 훨씬 값어치 있고 고귀합니다.\n‘온고지신(溫故知新)’의 지혜로 옛 성현들의 가르침을 되새기며, 첨단 기술과 인문학의 조화로운 공존을 모색해야 합니다.\n기계가 흉내 낼 수 없는 인간 고유의 온기와 도덕적 품격을 지켜낼 때, 미래 공동체는 진정으로 성숙해집니다.\n화려한 기교보다 진실한 정성을 담아 키보드를 두드리는 순간, 우리의 언어는 세상에 선한 영향력을 전합니다."
    }
  ];

  // ==========================================================================
  // [1-6] 영문 긴 글 (초급 / 중급 / 고급 명확 분리 및 행별 줄바꿈 \n 지원)
  // ==========================================================================
  // 초급 긴 글: 100~150자 내외, 4행, 기초 영문
  const EN_LONG_TEXTS_EASY = [
    {
      title: "A Sunny Morning Walk",
      content: "The bright morning sun shines in the sky.\nGentle birds are singing sweet songs in the green trees.\nWalking along the quiet path brings a peaceful smile.\nToday is a wonderful day to learn and grow."
    },
    {
      title: "Reading Good Books",
      content: "Sitting in a cozy room with a warm cup of tea.\nTurning each clean page opens up a new dream.\nQuiet words bring calm thoughts to the heart.\nEnjoy this simple moment of peace today."
    }
  ];

  // 중급 긴 글: 250~350자 내외, 6~8행
  const EN_LONG_TEXTS_MID = [
    {
      title: "The Power of Atomic Habits",
      content: "It is so easy to overestimate the importance of one defining moment\nand underestimate the value of making small improvements on a daily basis.\nImproving by just one percent each day may not be noticeable at first,\nbut it compounds into extraordinary results over the course of a year.\nIf you stay dedicated to positive routines, your habits will shape your future.\nSmall actions, practiced consistently, create lasting personal mastery."
    },
    {
      title: "The Serenity of Morning Light",
      content: "There is an ethereal tranquility in the quiet moments before dawn.\nThe soft golden glow slowly illuminates the sleeping horizon.\nTaking time to breathe deeply and reflect anchors the mind for the day.\nWhen we approach our mornings with calm mindfulness rather than hurried rush,\nwe establish a resilient inner foundation that gracefully endures any challenge."
    }
  ];

  // 고급 긴 글: 450~600자 내외, 8~12행, 전문 기술 및 철학
  const EN_LONG_TEXTS_HARD = [
    {
      title: "Technological Transformation and Human Wisdom",
      content: "In 2026, artificial intelligence (AI) and cloud computing infrastructures\nare fundamentally transforming how humanity communicates, collaborates, and creates.\nWhile computational velocity increases exponentially across digital ecosystems,\nfoundational cognitive capabilities—such as critical thinking and typing dexterity—remain vital.\nMastering keyboard ergonomics with high accuracy (99.8%) and 600+ CPM allows seamless ideation.\nWe must balance technological acceleration with ethical wisdom, empathy, and philosophical introspection.\nOnly when advanced algorithms serve humanistic values can global society flourish sustainably."
    },
    {
      title: "Cultivating Psychological Resilience and Grit",
      content: "Adversity is an inevitable facet of human experience, yet it holds transformative power.\nWhen complex projects encounter unexpected friction, genuine character is forged through grit.\nResilient innovators view temporary setbacks not as insurmountable roadblocks,\nbut as rigorous empirical masterclasses in strategic troubleshooting and perseverance.\nMaintain 100% focus on iterative progress rather than dwelling on temporary mistakes.\nThrough disciplined routines, continuous curiosity, and emotional fortitude,\nordinary effort is transmuted into world-class excellence and enduring triumph."
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
    const diff = state.difficulty; // 'all' | 'easy' | 'mid' | 'hard'

    if (state.mode === 'word') {
      const db = isKo
        ? { easy: KO_WORDS_EASY, mid: KO_WORDS_MID, hard: KO_WORDS_HARD }
        : { easy: EN_WORDS_EASY, mid: EN_WORDS_MID, hard: EN_WORDS_HARD };

      if (diff === 'easy') {
        list = [...db.easy];
      } else if (diff === 'mid') {
        list = [...db.mid];
      } else if (diff === 'hard') {
        list = [...db.hard];
      } else {
        list = [...db.easy, ...db.mid, ...db.hard];
      }
      list = shuffleArray(list);
    } else if (state.mode === 'short' || state.mode === 'test1' || state.mode === 'test3') {
      const db = isKo
        ? { easy: KO_SHORT_SENTENCES_EASY, mid: KO_SHORT_SENTENCES_MID, hard: KO_SHORT_SENTENCES_HARD }
        : { easy: EN_SHORT_SENTENCES_EASY, mid: EN_SHORT_SENTENCES_MID, hard: EN_SHORT_SENTENCES_HARD };

      if (diff === 'easy') {
        list = [...db.easy];
      } else if (diff === 'mid') {
        list = [...db.mid];
      } else if (diff === 'hard') {
        list = [...db.hard];
      } else {
        list = [...db.easy, ...db.mid, ...db.hard];
      }
      list = shuffleArray(list);
    } else if (state.mode === 'long') {
      const db = isKo
        ? { easy: KO_LONG_TEXTS_EASY, mid: KO_LONG_TEXTS_MID, hard: KO_LONG_TEXTS_HARD }
        : { easy: EN_LONG_TEXTS_EASY, mid: EN_LONG_TEXTS_MID, hard: EN_LONG_TEXTS_HARD };

      let selected = [];
      if (diff === 'easy') {
        selected = [...db.easy];
      } else if (diff === 'mid') {
        selected = [...db.mid];
      } else if (diff === 'hard') {
        selected = [...db.hard];
      } else {
        selected = [...db.easy, ...db.mid, ...db.hard];
      }
      list = selected.map(t => `${t.title}\n${t.content}`);
    } else if (state.mode === 'custom') {
      list = state.customTexts.length > 0 ? [...state.customTexts] : ["연습할 문장을 직접 등록해보세요."];
    }

    state.currentList = list;
    state.currentIndex = 0;
  }

  function setCurrentTarget() {
    if (!state.currentList || state.currentList.length === 0) loadContentList();

    if (state.currentIndex >= state.currentList.length) {
      // 순환 및 재셔플 (단어/짧은글은 재셔플, 긴글은 순환)
      state.currentList = (state.mode === 'long') ? state.currentList : shuffleArray(state.currentList);
      state.currentIndex = 0;
    }

    const rawTarget = state.currentList[state.currentIndex] || '';
    state.targetText = rawTarget.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    state.userInput = '';
  }

  // ==========================================================================
  // 6. UI 텍스트 렌더링 & 실시간 글자별 상태 표시 (섹션 11)
  // - 올바른 글자 (char-correct)
  // - 틀린 글자 (char-wrong)
  // - 현재 입력 위치 (char-current + 커서)
  // - 아직 입력하지 않은 글자 (char-pending)
  // - 줄바꿈 엔터 기호 (char-enter)
  // ==========================================================================
  function renderTypingDisplay() {
    const target = state.targetText;
    const input = state.userInput;
    const $display = $('#typingDisplay');
    $display.empty();

    let targetLen = target.length;
    let inputLen = input.length;

    for (let i = 0; i < targetLen; i++) {
      const targetChar = target[i];
      let charClass = 'char-pending';

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

      // 줄바꿈 문자(\n) 처리: 시각적인 Enter 배지와 br 줄바꿈 태그 렌더링
      if (targetChar === '\n') {
        $display.append(`<span class="type-char char-enter ${charClass}" title="Enter 키로 줄바꿈">↵</span><br>`);
        continue;
      }

      // 공백 표시 최적화
      let textContent = targetChar;
      if (targetChar === ' ') {
        textContent = '&nbsp;';
      }

      $display.append(`<span class="type-char ${charClass}">${textContent}</span>`);
    }

    // 커서 자동 수직 스크롤: 현재 입력 위치(char-current)가 박스 내에서 항상 보이도록 유지
    const $current = $display.find('.char-current');
    if ($current.length > 0) {
      const displayEl = $display[0];
      const currentEl = $current[0];
      const currentTop = currentEl.offsetTop - displayEl.offsetTop;
      const targetScroll = currentTop - (displayEl.clientHeight / 2) + (currentEl.clientHeight / 2);
      if (Math.abs(displayEl.scrollTop - targetScroll) > 15) {
        displayEl.scrollTop = Math.max(0, targetScroll);
      }
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

      // 긴 글 / 커스텀 모드에서 엔터 키 처리
      if (state.mode === 'long' || state.mode === 'custom') {
        if (e.key === 'Enter' && !isComposing) {
          // 텍스트 전체를 다 입력했거나 마지막 글자까지 타이핑했을 때 Enter 누르면 즉시 완료
          if (state.userInput.length >= state.targetText.length) {
            e.preventDefault();
            if (state.mode === 'long') {
              checkLongTextComplete();
            } else {
              checkSentenceComplete();
            }
            return;
          }
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

    const rawVal = $('#typingInput').val() || '';
    const val = rawVal.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
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

  // 결과 이미지 저장 (Canvas PNG)
  function handleDownloadResultImage() {
    const mode = $('#resMode').text() || '타자 연습';
    const cpm = $('#resCpm').text() || '0 타/분';
    const maxCpm = $('#resMaxCpm').text() || '0 타/분';
    const accuracy = $('#resAccuracy').text() || '100%';
    const time = $('#resTime').text() || '0초';

    if (typeof window.downloadGameResultImage === 'function') {
      window.downloadGameResultImage({
        title: '스마트 타자 연습',
        category: 'TYPING MASTERY',
        rankBadge: '⌨️',
        grade: '[ TYPING RESULT ]',
        gradeDesc: mode,
        stats: [
          { label: '평균 타수', value: cpm, color: '#0284c7' },
          { label: '최고 순간 타수', value: maxCpm, color: '#db2777' },
          { label: '최종 정확도', value: accuracy, color: '#059669' },
          { label: '연습 시간', value: time, color: '#d97706' }
        ],
        filename: '타자연습_결과'
      });
    } else {
      alert('결과 이미지 생성 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    }
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
      $('#typingInput').prop('disabled', false);

      if (newMode === 'word') {
        $('#typingInput').attr('placeholder', '단어를 입력하고 스페이스바 또는 Enter 키를 누르세요...');
      } else if (newMode === 'long') {
        $('#typingInput').attr('placeholder', '위의 글을 보고 그대로 타이핑하세요... (줄바꿈 위치에서 Enter 키)');
      } else {
        $('#typingInput').attr('placeholder', '위의 문장을 보고 그대로 타이핑하세요... (완료 시 Enter 키)');
      }
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

    $('#downloadResultImgBtn').on('click', handleDownloadResultImage);

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
