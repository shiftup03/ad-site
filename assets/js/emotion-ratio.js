/**
 * ========================================================
 * 나의 현재 감정 비율 분석 테스트 자바스크립트 엔진 (emotion-ratio.js)
 * 지금 내 마음에는 어떤 감정이 있을까? - 1-Min Challenge
 * ========================================================
 */

(function($) {
  'use strict';

  // 로컬 스토리지 & 세션 스토리지 키
  const STORAGE_KEY_HISTORY = 'challenge_1min_emotion_history';
  const SESSION_KEY_PROGRESS = 'challenge_1min_emotion_session';

  // 8가지 감정 마스터 정의 (고정 ID, 이름, 색상, 아이콘, 키워드, 해설, 질문, 제안)
  const EMOTIONS_MASTER = {
    joy: {
      id: 'joy',
      name: '기쁨',
      color: '#f59e0b',
      icon: '✨',
      keywords: '즐거움 / 만족감 / 긍정적 기분',
      desc: '최근 일상에서 즐거움이나 만족감을 느끼는 순간이 있었어요. 좋은 감정은 큰 사건뿐 아니라 작은 일에서도 발견할 수 있어요.',
      question: '최근 나를 가장 즐겁게 했던 순간은 언제였나요?',
      action: '좋았던 순간 하나를 짧게 메모하거나 사진으로 남겨보세요.'
    },
    peace: {
      id: 'peace',
      name: '평온함',
      color: '#10b981',
      icon: '🍃',
      keywords: '편안함 / 안정감 / 여유',
      desc: '마음이 편안하거나 안정감을 느끼는 시간이 있었어요. 편안함을 주는 장소나 행동을 알아두면 일상에서 큰 힘이 됩니다.',
      question: '어떤 환경이나 순간에 가장 편안함을 느끼나요?',
      action: '나에게 편안함을 주는 온전한 휴식 시간을 10분만 만들어보세요.'
    },
    hope: {
      id: 'hope',
      name: '기대감',
      color: '#f97316',
      icon: '🚀',
      keywords: '희망 / 설렘 / 긍정적 기대',
      desc: '앞으로의 일에 대해 기대하거나 설레는 마음이 나타났어요. 기대감은 새로운 시도를 시작할 때 훌륭한 내적 동기가 됩니다.',
      question: '요즘 가장 기대하고 있거나 기다려지는 일은 무엇인가요?',
      action: '기대하고 있는 일과 관련된 기분 좋은 작은 계획을 세워보세요.'
    },
    anxiety: {
      id: 'anxiety',
      name: '불안',
      color: '#8b5cf6',
      icon: '⚡',
      keywords: '걱정 / 긴장 / 불확실성',
      desc: '최근 걱정이나 불확실함을 느끼는 순간이 있었어요. 불안을 느끼는 것 자체는 자연스러우며, 무엇이 염려되는지 구체화하는 것이 도움이 됩니다.',
      question: '지금 내 머릿속을 가장 복잡하게 만드는 생각은 무엇인가요?',
      action: '걱정되는 일과 지금 당장 내가 통제할 수 있는 일을 구분해 적어보세요.'
    },
    sadness: {
      id: 'sadness',
      name: '슬픔',
      color: '#3b82f6',
      icon: '💧',
      keywords: '마음 가라앉음 / 아쉬움 / 속상함',
      desc: '최근 마음이 가라앉거나 속상한 감정이 나타났어요. 모든 순간에 밝은 기분을 유지할 필요는 없으며, 슬픔은 마음을 쉬어가게 돕습니다.',
      question: '최근 내 마음을 묵직하게 만들었던 아쉬운 순간이 있었나요?',
      action: '감정을 억지로 바꾸려 하지 말고 편안한 차 한 잔과 함께 온전히 마주해주세요.'
    },
    anger: {
      id: 'anger',
      name: '분노',
      color: '#ef4444',
      icon: '🔥',
      keywords: '짜증 / 답답함 / 화',
      desc: '최근 답답함이나 화가 나는 순간이 있었어요. 불편한 감정은 나의 중요한 경계선이나 기대가 침범받았다는 정당한 신호일 수 있습니다.',
      question: '어떤 상황에서 가장 답답하거나 억울함을 느꼈나요?',
      action: '감정이 올라올 때 심호흡을 세 번 하고, 내가 진짜 바라는 것이 무엇인지 적어보세요.'
    },
    tired: {
      id: 'tired',
      name: '지침',
      color: '#64748b',
      icon: '🔋',
      keywords: '정서적 피로 / 소진감 / 의욕 저하',
      desc: '마음이 지치거나 의욕이 떨어진 순간이 있었어요. 이런 느낌은 에너지가 소진되었으니 잠시 멈추어 충전해야 한다는 몸과 마음의 요청입니다.',
      question: '최근 나의 소중한 에너지를 가장 많이 앗아간 일은 무엇인가요?',
      action: '오늘 꼭 하지 않아도 되는 사소한 일 하나를 과감히 취소해보세요.'
    },
    lonely: {
      id: 'lonely',
      name: '외로움',
      color: '#ec4899',
      icon: '🌙',
      keywords: '고립감 / 소외감 / 연결에 대한 바람',
      desc: '누군가에게 깊이 이해받고 싶거나 정서적으로 연결되고 싶은 마음이 나타났어요. 혼자 있는 시간과 정서적 외로움은 서로 다른 경험일 수 있습니다.',
      question: '지금 나의 솔직한 기분을 편안하게 털어놓을 수 있는 사람은 누구인가요?',
      action: '부담 없는 편안한 방식으로 가까운 친구나 가족에게 가벼운 안부를 전해보세요.'
    }
  };

  // 8개 감정 고정 순서 키 목록
  const EMOTION_KEYS = ['joy', 'peace', 'hope', 'anxiety', 'sadness', 'anger', 'tired', 'lonely'];

  // 24개 실제 테스트 질문 데이터 (기획안 순서 및 감정 매핑 엄격 준수)
  const QUESTIONS = [
    { id: 1, emotion: 'joy', text: '최근 일주일 동안 사소한 일에도 즐거움을 느꼈다.' },
    { id: 2, emotion: 'anxiety', text: '별일이 없어도 앞으로 일어날 일을 걱정하는 순간이 있었다.' },
    { id: 3, emotion: 'peace', text: '혼자 있는 시간이나 일상 속에서 마음이 편안한 순간이 있었다.' },
    { id: 4, emotion: 'lonely', text: '누군가에게 내 마음을 이해받고 싶다고 느꼈다.' },
    { id: 5, emotion: 'hope', text: '앞으로 다가올 일 중 기대되는 일이 있었다.' },
    { id: 6, emotion: 'tired', text: '특별히 큰일을 하지 않았는데도 마음이 지친 느낌이 들었다.' },
    { id: 7, emotion: 'anger', text: '사소한 일에도 짜증이 나거나 화가 나는 순간이 있었다.' },
    { id: 8, emotion: 'sadness', text: '이유를 분명히 설명하기 어렵지만 마음이 가라앉는 순간이 있었다.' },
    { id: 9, emotion: 'joy', text: '하루 중 웃거나 기분이 좋아졌던 순간을 떠올릴 수 있다.' },
    { id: 10, emotion: 'peace', text: '걱정하던 일을 잠시 내려놓고 편안하게 시간을 보낼 수 있었다.' },
    { id: 11, emotion: 'anxiety', text: '아직 일어나지 않은 상황을 여러 번 생각하며 긴장했다.' },
    { id: 12, emotion: 'hope', text: '새로운 경험이나 계획을 생각하면 설레는 기분이 들었다.' },
    { id: 13, emotion: 'sadness', text: '최근의 일이나 지나간 일을 떠올리며 속상하거나 슬펐다.' },
    { id: 14, emotion: 'lonely', text: '사람들과 함께 있어도 마음 한편이 외롭다고 느꼈다.' },
    { id: 15, emotion: 'anger', text: '내 뜻대로 되지 않는 일 때문에 답답하거나 화가 났다.' },
    { id: 16, emotion: 'tired', text: '평소에 하던 일도 시작하기 버겁게 느껴질 때가 있었다.' },
    { id: 17, emotion: 'joy', text: '최근 내 일상에서 만족스럽거나 행복하다고 느낀 순간이 있었다.' },
    { id: 18, emotion: 'hope', text: '앞으로의 내 삶에 좋은 일이 생길 수도 있겠다고 생각했다.' },
    { id: 19, emotion: 'anxiety', text: '불확실한 상황 때문에 마음이 쉽게 진정되지 않는 순간이 있었다.' },
    { id: 20, emotion: 'sadness', text: '평소보다 서운함이나 슬픈 감정을 자주 느꼈다.' },
    { id: 21, emotion: 'anger', text: '누군가의 말이나 행동 때문에 불쾌한 감정이 오래 남았다.' },
    { id: 22, emotion: 'peace', text: '최근 내 감정을 비교적 차분하게 받아들이는 순간이 있었다.' },
    { id: 23, emotion: 'tired', text: '쉬어도 마음이 쉽게 가벼워지지 않는다고 느꼈다.' },
    { id: 24, emotion: 'lonely', text: '가까운 사람과 더 깊이 연결되고 싶다는 생각이 들었다.' }
  ];

  // 28가지 감정 쌍 조합 심층 분석 사전 (정규화된 알파벳/순서 무관 키 매핑)
  const PAIR_COMBINATIONS = {
    'joy_peace': '최근 일상에서 즐거움과 편안함을 함께 느낀 순간들이 있었어요. 안정적인 일상 속에서 만족감을 찾는 마음이 드러난 평화로운 결과예요.',
    'hope_joy': '삶에 대한 긍정적인 기대와 설렘이 넘치는 활기찬 상태입니다. 새로운 시작이나 다가올 일들에 대한 밝은 에너지가 마음에 가득 차 있습니다.',
    'anxiety_joy': '즐거운 순간도 있었지만 동시에 걱정되는 일도 마음 한편에 남아 있었을 수 있어요. 서로 다른 감정이 함께 나타나는 것은 지극히 자연스러운 일이에요.',
    'joy_sadness': '행복한 순간 속에서도 뭉클한 아쉬움이나 서운함이 공존하고 있어요. 감정의 폭이 깊고 감수성이 풍부해져 있는 섬세한 시기입니다.',
    'anger_joy': '좋은 순간들과 답답한 일들이 번갈아 나타났어요. 즐거운 에너지로 마음을 환기하며 나를 불편하게 했던 요인을 차분히 정리해보세요.',
    'joy_tired': '마음은 긍정적이고 즐거움을 느끼지만, 신체적·정서적 피로감이 쌓여 있어요. 좋은 마음을 유지하되 몸에게 충분한 휴식을 선물해주세요.',
    'joy_lonely': '일상에서 소소한 만족을 누리면서도, 이 좋은 순간을 깊이 나눌 누군가를 바라는 마음이 함께 나타났어요. 소중한 이와의 교감을 추천합니다.',
    'hope_peace': '차분한 안정감 속에서 미래를 향한 희망적인 시선을 품고 있는 상태입니다. 조급함 없이 나만의 속도로 차근차근 나아가기 가장 좋은 흐름입니다.',
    'anxiety_peace': '마음의 평온을 지키고 싶지만 불확실한 걱정이 문득문득 떠오르고 있어요. 편안한 호흡과 함께 지금 내가 있는 자리에 주의를 기울여보세요.',
    'peace_sadness': '차분하게 가라앉은 마음속에 아쉬움이나 서운함이 조용히 머물러 있습니다. 슬픔을 억지로 떨쳐내지 않고 담담히 품어주는 성숙한 시간입니다.',
    'anger_peace': '갈등을 피하고 평온을 유지하려 하지만, 마음속에 억눌린 답답함이 남아 있어요. 내 진솔한 생각과 경계선을 부드럽게 표현해보는 것이 도움이 됩니다.',
    'peace_tired': '복잡한 세상의 자극을 잠시 내려놓고 고요히 쉬어가고 싶은 마음이 강해요. 편안함과 피로감은 모순이 아니니 온전히 재충전에 집중해보세요.',
    'lonely_peace': '혼자만의 고요한 시간을 잘 보내고 있으면서도 마음 한구석에서는 따뜻한 교감을 원하고 있어요. 편안한 방식으로 누군가에게 안부를 전해보세요.',
    'anxiety_hope': '앞으로의 일이 기대되면서도 결과를 알 수 없어 걱정되는 마음이 함께 나타났어요. 새로운 시작을 앞둔 상황에서 자연스럽게 느껴지는 두근거림입니다.',
    'hope_sadness': '바라는 미래가 있지만 지나간 일에 대한 미련이나 속상함이 남아 있어요. 과거를 차분히 정리하고 새로운 희망에 다정하게 물을 주는 시기입니다.',
    'anger_hope': '더 나은 변화를 강력히 바라면서도 뜻대로 풀리지 않는 현실에 답답함을 느끼고 있어요. 이 에너지를 긍정적인 행동과 도전의 추진력으로 삼아보세요.',
    'hope_tired': '하고 싶은 일이나 나아가고 싶은 방향은 뚜렷하지만, 현재 에너지가 다소 고갈되어 있어요. 멋진 목표를 위해 지금은 잠깐 멈추어 쉴 때입니다.',
    'hope_lonely': '새로운 미래를 꿈꾸면서도 곁에서 든든하게 손잡아줄 동반자나 친구를 간절히 바라고 있어요. 나와 뜻이 통하는 사람들과 연결을 시도해보세요.',
    'anxiety_sadness': '마음이 가라앉고 속상한 감정과 불확실한 걱정이 함께 찾아와 마음이 무거운 상태예요. 자책하지 말고 나를 가장 따뜻하게 위로해줄 시간입니다.',
    'anger_anxiety': '상황에 대한 두려움과 내 뜻대로 통제되지 않는 환경에 대한 답답함이 겹쳐 있어요. 심호흡과 함께 지금 내가 바꿀 수 있는 작은 일에만 집중해보세요.',
    'anxiety_tired': '지속적인 걱정과 긴장으로 인해 심신이 몹시 지쳐 있는 상태입니다. 지금은 생각의 스위치를 잠시 끄고 깊은 수면과 무위의 휴식을 최우선으로 두세요.',
    'anxiety_lonely': '불안한 마음을 기댈 곳이 부족하다고 느껴져 외로움이 더 크게 다가올 수 있어요. 믿을 수 있는 사람에게 내 솔직한 감정을 털어놓아 보세요.',
    'anger_sadness': '속상한 슬픔과 억울하고 답답한 화가 함께 얽혀 있는 상태입니다. 어떤 상황에서는 서운함과 분노가 동시에 느껴지는 것이 당연하니 감정을 존중해주세요.',
    'sadness_tired': '마음이 무겁게 가라앉아 일상적인 활동조차 버겁게 느껴지는 소진감 상태입니다. 아무것도 해내지 않아도 괜찮으니 나만의 안전한 쉼터에서 쉬어가세요.',
    'lonely_sadness': '깊은 쓸쓸함과 위로받고 싶은 마음이 함께 찾아온 상태입니다. 나 자신에게 따뜻한 차 한 잔을 건네듯 스스로를 다정하게 보듬어주세요.',
    'anger_tired': '누적된 피로와 스트레스로 인해 신경이 예민해지고 사소한 일에도 짜증이 나기 쉬운 상태입니다. 휴식이 절대적으로 필요하다는 마음의 강력한 신호입니다.',
    'anger_lonely': '내 마음을 아무도 제대로 알아주지 않는다는 서운함이 답답한 분노로 표출될 수 있어요. 화 뒤에 숨겨진 연결에 대한 바람을 가만히 들여다보세요.',
    'lonely_tired': '몸도 마음도 완전히 방전된 상태에서 홀로 남겨진 듯한 소외감을 느끼고 있어요. 무리하게 관계를 넓히려 하지 말고 온전한 휴식을 먼저 취하세요.'
  };

  // 애플리케이션 상태
  const state = {
    currentQuestionIndex: 0, // 0-indexed (0 ~ 23)
    answers: {},             // { [questionId]: score (0~4) }
    calculatedResult: null,  // 계산된 최신 결과 캐시
    history: [],             // 과거 검사 기록 배열
    selectedTrendEmotion: 'peace' // 추이 차트 선택 감정
  };

  /* ========================================================
     점수 계산 및 100% 분배 알고리즘 (Hamilton-Hare 최대 잔여법)
     ======================================================== */
  function calculateEmotionScores(answers) {
    // 1. 감정별 원점수 계산 (각 감정당 3문항 × 최대 4점 = 0 ~ 12점)
    const rawScores = {};
    EMOTION_KEYS.forEach(key => { rawScores[key] = 0; });

    QUESTIONS.forEach(q => {
      const score = answers[q.id];
      if (typeof score === 'number') {
        rawScores[q.emotion] += score;
      }
    });

    // 2. 원점수 총합 계산
    let totalRaw = 0;
    EMOTION_KEYS.forEach(key => { totalRaw += rawScores[key]; });

    // 3. 총합이 0점인 경우 예외 처리 (모든 감정 0% 완전 중립 상태)
    if (totalRaw === 0) {
      const zeroPercents = {};
      EMOTION_KEYS.forEach(key => { zeroPercents[key] = 0; });
      return {
        rawScores,
        totalRaw: 0,
        percents: zeroPercents,
        rankedList: EMOTION_KEYS.map((key, idx) => ({
          key,
          idx,
          name: EMOTIONS_MASTER[key].name,
          color: EMOTIONS_MASTER[key].color,
          icon: EMOTIONS_MASTER[key].icon,
          keywords: EMOTIONS_MASTER[key].keywords,
          raw: 0,
          percent: 0
        })),
        topEmotions: [],
        pairKey: null,
        isAllZero: true
      };
    }

    // 4. 감정 두드러짐(Salience) 비선형 가중치 모델 (Power Scaling: exponent 2.0)
    // 한두 가지 특정 감정에 치우쳐 응답했을 때 실제 사용자의 체감 감정 비중(70~90% 등)이 명확히 반영되도록 가중치 증폭
    const weightedScores = {};
    let totalWeighted = 0;
    EMOTION_KEYS.forEach(key => {
      const w = Math.pow(rawScores[key], 2.0);
      weightedScores[key] = w;
      totalWeighted += w;
    });

    // 5. 최대 잔여법(Hamilton-Hare) 적용하여 정확히 100% 분배
    const intPercents = {};
    const remainders = [];
    let intSum = 0;

    EMOTION_KEYS.forEach((key, idx) => {
      const exact = totalWeighted > 0 ? (weightedScores[key] / totalWeighted) * 100 : 0;
      const integerPart = Math.floor(exact);
      intPercents[key] = integerPart;
      intSum += integerPart;
      remainders.push({
        key,
        idx,
        rem: exact - integerPart
      });
    });

    let toDistribute = 100 - intSum;
    // 소수점 잔여값 내림차순 정렬 (원점수가 0점인 감정은 잔여 분배 대상에서 제외)
    remainders.sort((a, b) => {
      if (rawScores[a.key] === 0 && rawScores[b.key] > 0) return 1;
      if (rawScores[b.key] === 0 && rawScores[a.key] > 0) return -1;
      if (b.rem !== a.rem) return b.rem - a.rem;
      return a.idx - b.idx;
    });

    let remIdx = 0;
    while (toDistribute > 0 && remIdx < remainders.length) {
      const targetKey = remainders[remIdx].key;
      if (rawScores[targetKey] > 0) {
        intPercents[targetKey] += 1;
        toDistribute--;
      }
      remIdx++;
    }
    if (toDistribute > 0) {
      const maxKey = EMOTION_KEYS.reduce((m, k) => (rawScores[k] > rawScores[m] ? k : m), EMOTION_KEYS[0]);
      intPercents[maxKey] += toDistribute;
    }

    // 6. 순위 계산 (퍼센트 높은 순, 동점 시 원점수, 고정 ID 순)
    const rankedList = EMOTION_KEYS.map((key, idx) => ({
      key,
      idx,
      name: EMOTIONS_MASTER[key].name,
      color: EMOTIONS_MASTER[key].color,
      icon: EMOTIONS_MASTER[key].icon,
      keywords: EMOTIONS_MASTER[key].keywords,
      raw: rawScores[key],
      percent: intPercents[key]
    })).sort((a, b) => {
      if (b.percent !== a.percent) return b.percent - a.percent;
      if (b.raw !== a.raw) return b.raw - a.raw;
      return a.idx - b.idx;
    });

    // 상위 감정 TOP 3
    const topEmotions = rankedList.slice(0, 3);

    // 7. 상위 2개 감정 조합 키 생성 (알파벳 정렬 순)
    let pairKey = null;
    if (topEmotions.length >= 2 && totalRaw > 0) {
      const keys = [topEmotions[0].key, topEmotions[1].key].sort();
      pairKey = `${keys[0]}_${keys[1]}`;
    }

    return {
      rawScores,
      totalRaw,
      percents: intPercents,
      rankedList,
      topEmotions,
      pairKey,
      isAllZero: false
    };
  }

  /* ========================================================
     화면 단계(Stage) 전환
     ======================================================== */
  function showStage(stageName) {
    $('#stageIntro').hide();
    $('#stageQuestion').hide();
    $('#stageResult').hide();

    if (stageName === 'intro') {
      $('#stageIntro').fadeIn(200);
      updateIntroHistoryBadge();
    } else if (stageName === 'question') {
      $('#stageQuestion').fadeIn(200);
      renderCurrentQuestion();
    } else if (stageName === 'result') {
      $('#stageResult').fadeIn(200);
      renderResultScreen();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  let autoAdvanceTimer = null;

  function clearPendingAdvance() {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
  }

  function goToQuestion(targetIndex) {
    clearPendingAdvance();
    if (targetIndex < 0 || targetIndex >= QUESTIONS.length) return;

    state.currentQuestionIndex = targetIndex;
    renderCurrentQuestion();
  }

  /* ========================================================
     질문 렌더링 & 세션 저장
     ======================================================== */
  function renderCurrentQuestion() {
    clearPendingAdvance();

    const qIndex = state.currentQuestionIndex;
    const q = QUESTIONS[qIndex];
    if (!q) return;

    const progressPct = Math.round(((qIndex + 1) / QUESTIONS.length) * 100);
    $('#qNumberPill').text(`QUESTION ${String(qIndex + 1).padStart(2, '0')} / ${QUESTIONS.length}`);
    $('#qProgressPercent').text(`${progressPct}%`);
    $('#qProgressBar').css('width', `${progressPct}%`);

    // 24문항 미니 인디케이터 도트바 렌더링
    const $dots = $('#qDotsStrip');
    if ($dots.length) {
      $dots.empty();
      QUESTIONS.forEach((quest, idx) => {
        const isCurrent = idx === qIndex;
        const isAnswered = typeof state.answers[quest.id] === 'number';
        let cls = 'q-dot-item';
        if (isCurrent) cls += ' current';
        else if (isAnswered) cls += ' answered';

        $dots.append(`
          <button type="button" class="${cls}" data-qindex="${idx}" title="${idx + 1}번 문항: ${isAnswered ? '응답 완료' : '미응답'}">
            ${idx + 1}
          </button>
        `);
      });
    }

    $('#qCategoryHint').text(`문항 ${qIndex + 1}`);
    $('#qStatementText').text(`"${q.text}"`);

    // 선택된 답변 상태 렌더링
    const savedScore = state.answers[q.id];
    $('.likert-btn').removeClass('selected');
    if (typeof savedScore === 'number') {
      $(`.likert-btn[data-score="${savedScore}"]`).addClass('selected');
    }

    // 이전 버튼 활성화 여부
    $('#btnPrevQuestion').prop('disabled', qIndex === 0);
    if (qIndex === QUESTIONS.length - 1) {
      const isAnswered = typeof savedScore === 'number';
      $('#btnNextQuestion')
        .toggleClass('btn-primary', isAnswered)
        .toggleClass('btn-outline', !isAnswered);
      $('#btnNextQuestion span').text('결과 확인하기 →');
    } else {
      $('#btnNextQuestion')
        .removeClass('btn-primary')
        .addClass('btn-outline');
      $('#btnNextQuestion span').text('다음 질문 ▶');
    }

    // 세션 자동 임시 저장
    try {
      sessionStorage.setItem(SESSION_KEY_PROGRESS, JSON.stringify({
        qIndex: state.currentQuestionIndex,
        answers: state.answers
      }));
    } catch (e) {}
  }

  function handleSelectAnswer(score) {
    clearPendingAdvance();

    const q = QUESTIONS[state.currentQuestionIndex];
    if (!q) return;

    // 답변 즉각 저장 (빠르게 연타하거나 변경해도 정확히 현재 문항에 기록)
    state.answers[q.id] = score;

    // UI 즉시 선택 표시
    $('.likert-btn').removeClass('selected');
    $(`.likert-btn[data-score="${score}"]`).addClass('selected');

    // 도트 즉각 응답 완료 표시
    $(`.q-dot-item[data-qindex="${state.currentQuestionIndex}"]`).addClass('answered');

    // 세션 동기화
    try {
      sessionStorage.setItem(SESSION_KEY_PROGRESS, JSON.stringify({
        qIndex: state.currentQuestionIndex,
        answers: state.answers
      }));
    } catch (e) {}

    // 마지막 24번 문항일 경우
    if (state.currentQuestionIndex === QUESTIONS.length - 1) {
      $('#btnNextQuestion').removeClass('btn-outline').addClass('btn-primary');
      $('#btnNextQuestion span').text('결과 확인하기 →');

      autoAdvanceTimer = setTimeout(() => {
        autoAdvanceTimer = null;
        finishTestAndShowResult();
      }, 240);
      return;
    }

    // 일반 문항일 경우 220ms 후 부드럽게 다음 질문으로 이동
    autoAdvanceTimer = setTimeout(() => {
      autoAdvanceTimer = null;
      goToQuestion(state.currentQuestionIndex + 1);
    }, 220);
  }

  function finishTestAndShowResult() {
    clearPendingAdvance();

    // 24개 문항 전체 응답 여부 검증
    const missingIndex = QUESTIONS.findIndex(q => typeof state.answers[q.id] !== 'number');
    if (missingIndex !== -1) {
      goToQuestion(missingIndex);
      alert(`아직 답변하지 않은 문항(${missingIndex + 1}번)이 있어 해당 질문으로 이동합니다.`);
      return;
    }

    state.calculatedResult = calculateEmotionScores(state.answers);
    showStage('result');

    // 임시 세션 정리
    try { sessionStorage.removeItem(SESSION_KEY_PROGRESS); } catch (e) {}
  }

  /* ========================================================
     결과 화면 렌더링
     ======================================================== */
  function renderResultScreen() {
    const res = state.calculatedResult;
    if (!res) return;

    const todayStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    $('#resAnalysisDate').text(`분석 기준일: ${todayStr}`);

    if (res.isAllZero) {
      $('#allZeroNoticeBox').show();
      $('#normalResultWrap').hide();
      return;
    }

    $('#allZeroNoticeBox').hide();
    $('#normalResultWrap').show();

    // 1. 도넛 차트 및 센터 텍스트
    const top1 = res.topEmotions[0];
    $('#donutCenterEmotion').text(top1.name).css('color', top1.color);
    $('#donutCenterPercent').text(`${top1.percent}%`);

    // CSS Conic-Gradient 생성 (합계 100%)
    let gradientStops = [];
    let currentPct = 0;
    res.rankedList.forEach(item => {
      if (item.percent > 0) {
        const nextPct = currentPct + item.percent;
        gradientStops.push(`${item.color} ${currentPct}% ${nextPct}%`);
        currentPct = nextPct;
      }
    });

    if (gradientStops.length > 0) {
      $('#donutConicBox').css('background', `conic-gradient(${gradientStops.join(', ')})`);
    }

    // 도넛 차트 범례 8개 생성
    const $legendGrid = $('#donutLegendGrid');
    $legendGrid.empty();
    res.rankedList.forEach(item => {
      const chip = `
        <div class="legend-chip">
          <div class="lc-left">
            <span class="lc-dot" style="background: ${item.color};"></span>
            <span>${item.name}</span>
          </div>
          <span class="lc-pct" style="color: ${item.color};">${item.percent}%</span>
        </div>
      `;
      $legendGrid.append(chip);
    });

    // 2. TOP 3 렌더링
    const $top3List = $('#top3ListContainer');
    $top3List.empty();
    const medals = ['🥇 1위', '🥈 2위', '🥉 3위'];

    res.topEmotions.forEach((item, idx) => {
      const topHtml = `
        <div class="top3-item rank-${idx + 1}">
          <div class="t3-left">
            <span class="t3-medal">${medals[idx]}</span>
            <div class="t3-name-group">
              <strong>${item.name} (${item.keywords})</strong>
              <span>원점수 ${item.raw}점 / 12점 만점</span>
            </div>
          </div>
          <span class="t3-pct" style="color: ${item.color};">${item.percent}%</span>
        </div>
      `;
      $top3List.append(topHtml);
    });

    // 감정 조합 28종 해설
    if (res.pairKey && PAIR_COMBINATIONS[res.pairKey]) {
      const top1Name = res.topEmotions[0].name;
      const top2Name = res.topEmotions[1].name;
      $('#pairTitle').text(`${top1Name} + ${top2Name}`);
      $('#pairDescText').text(PAIR_COMBINATIONS[res.pairKey]);
      $('#pairAnalysisBox').show();
    } else {
      $('#pairAnalysisBox').hide();
    }

    // 3. 가로 막대 그래프 렌더링
    const $hbarList = $('#horizontalBarsList');
    $hbarList.empty();
    res.rankedList.forEach(item => {
      const row = `
        <div class="hbar-row">
          <div class="hbar-header">
            <div class="hbar-name-wrap">
              <span>${item.icon}</span>
              <span>${item.name}</span>
            </div>
            <div class="hbar-score-wrap">
              <span class="hbar-raw">${item.raw}점</span>
              <span class="hbar-pct" style="color: ${item.color};">${item.percent}%</span>
            </div>
          </div>
          <div class="hbar-track">
            <div class="hbar-fill" style="width: ${item.percent}%; background: ${item.color};"></div>
          </div>
        </div>
      `;
      $hbarList.append(row);
    });

    // 4. 8가지 감정 탭 & 상세 패널
    renderEmotionDetailTabs(res.topEmotions[0].key);

    // 5. 자기 돌봄 실천 요약 문구 반영
    const selfCareAdvice = EMOTIONS_MASTER[top1.key].action;
    $('#selfCareSummaryText').text(
      `가장 두드러진 '${top1.name}' 감정을 위해: "${selfCareAdvice}" 지금 이 순간 나만의 호흡으로 마음을 가볍게 정돈해보세요.`
    );
  }

  function renderEmotionDetailTabs(activeKey) {
    const res = state.calculatedResult;
    const $tabs = $('#emotionTabsBar');
    $tabs.empty();

    EMOTION_KEYS.forEach(key => {
      const emo = EMOTIONS_MASTER[key];
      const btn = `
        <button type="button" class="etab-btn ${key === activeKey ? 'active' : ''}" data-key="${key}">
          <span>${emo.icon} ${emo.name}</span>
        </button>
      `;
      $tabs.append(btn);
    });

    showEmotionDetailPanel(activeKey);
  }

  function showEmotionDetailPanel(key) {
    const emo = EMOTIONS_MASTER[key];
    const res = state.calculatedResult;
    if (!emo || !res) return;

    $('#edIcon').text(emo.icon);
    $('#edName').text(`${emo.name} (${emo.keywords})`);

    const raw = res.rawScores[key] || 0;
    const pct = res.percents[key] || 0;
    const rank = res.rankedList ? (res.rankedList.findIndex(item => item.key === key) + 1) : '-';

    $('#edMeta').text(`내 점수: ${raw}점 / 12점 만점 (${pct}%) · 순위: ${rank}위`);
    $('#edDesc').text(emo.desc);
    $('#edQuestion').text(emo.question);
    $('#edAction').text(emo.action);
  }

  /* ========================================================
     1080×1350 PNG 결과 카드 캔버스 생성기
     ======================================================== */
  function drawResultCardCanvas() {
    const canvas = document.getElementById('emotionCardCanvas');
    if (!canvas || !state.calculatedResult) return;

    const ctx = canvas.getContext('2d');
    const width = 1080;
    const height = 1350;
    const res = state.calculatedResult;

    // 1. 다크 인디고 배경 그라데이션
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.5, '#111827');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 카드 외곽선
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // 상단 엠블럼 & 타이틀
    ctx.fillStyle = '#8b5cf6';
    ctx.font = '700 26px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ 1-MIN CHALLENGE · EMOTION RATIO TEST', 540, 130);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px "Noto Sans KR", sans-serif';
    ctx.fillText('지금 내 마음의 감정 지도', 540, 205);

    const nowStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 24px "Noto Sans KR", sans-serif';
    ctx.fillText(`분석일자: ${nowStr}`, 540, 260);

    // 2. 캔버스 도넛 차트 렌더링 (중앙 반경 180, 구멍 반경 100)
    const centerX = 540;
    const centerY = 500;
    const radius = 170;
    const holeRadius = 95;

    let startAngle = -Math.PI / 2;
    res.rankedList.forEach(item => {
      if (item.percent > 0) {
        const sliceAngle = (item.percent / 100) * (Math.PI * 2);
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.arc(centerX, centerY, holeRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();

        startAngle = endAngle;
      }
    });

    // 도넛 구멍 채우기
    ctx.beginPath();
    ctx.arc(centerX, centerY, holeRadius - 2, 0, Math.PI * 2);
    ctx.fillStyle = '#111827';
    ctx.fill();

    // 도넛 중앙 텍스트
    const top1 = res.topEmotions[0];
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 22px "Noto Sans KR", sans-serif';
    ctx.fillText('가장 두드러진 감정', centerX, centerY - 25);

    ctx.fillStyle = top1 ? top1.color : '#ffffff';
    ctx.font = '900 42px "Noto Sans KR", sans-serif';
    ctx.fillText(top1 ? top1.name : '평온함', centerX, centerY + 22);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 28px "Montserrat", sans-serif';
    ctx.fillText(top1 ? `${top1.percent}%` : '0%', centerX, centerY + 62);

    // 3. TOP 3 감정 표시 박스
    const boxY = 740;
    const boxW = 880;
    const boxH = 340;
    const boxX = (width - boxW) / 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 20);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 28px "Noto Sans KR", sans-serif';
    ctx.fillText('🏆 주요 감정 TOP 3', boxX + 50, boxY + 60);

    const medals = ['🥇 1위', '🥈 2위', '🥉 3위'];
    res.topEmotions.slice(0, 3).forEach((item, idx) => {
      const itemY = boxY + 120 + (idx * 60);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '700 24px "Noto Sans KR", sans-serif';
      ctx.fillText(`${medals[idx]}  ${item.name}`, boxX + 60, itemY);

      ctx.fillStyle = item.color;
      ctx.font = '800 26px "Montserrat", sans-serif';
      ctx.fillText(`${item.percent}% (${item.raw}점)`, boxX + 320, itemY);
    });

    // 4. 감정 조합 요약 한 줄
    if (res.pairKey && PAIR_COMBINATIONS[res.pairKey]) {
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '500 22px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      const pairText = `✨ 감정 조합: "${PAIR_COMBINATIONS[res.pairKey]}"`;
      wrapText(ctx, pairText, 540, 1140, 860, 34);
    }

    // 5. 하단 워터마크 및 안내 문구
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '400 20px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('※ 본 테스트는 자기성찰용 도구이며 의학적 진단을 제공하지 않습니다.', 540, 1240);
    ctx.fillText('https://ad-site-piyd.vercel.app · 1-Min Challenge', 540, 1275);
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  function downloadCanvasAsPng() {
    const canvas = document.getElementById('emotionCardCanvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `emotion_ratio_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* ========================================================
     이전 검사 기록 (History) 및 추이 차트
     ======================================================== */
  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (raw) {
        state.history = JSON.parse(raw) || [];
      }
    } catch (e) {
      state.history = [];
    }
    updateIntroHistoryBadge();
  }

  function updateIntroHistoryBadge() {
    if (state.history.length > 0) {
      $('#historyCountBadge').text(state.history.length);
      $('#btnViewHistoryFromIntro').show();
    } else {
      $('#btnViewHistoryFromIntro').hide();
    }
  }

  function saveCurrentResultToHistory() {
    if (!state.calculatedResult) return;

    // 이미 동일 세션이 저장되어 있는지 확인
    const nowIso = new Date().toISOString();
    const historyItem = {
      id: 'emh_' + Date.now(),
      date: nowIso,
      dateLabel: new Date().toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      percents: state.calculatedResult.percents,
      rawScores: state.calculatedResult.rawScores,
      topEmotions: state.calculatedResult.topEmotions.map(t => ({ key: t.key, name: t.name, percent: t.percent })),
      pairKey: state.calculatedResult.pairKey
    };

    // 최대 30개 보관
    state.history.unshift(historyItem);
    if (state.history.length > 30) state.history.pop();

    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(state.history));
      alert('이번 감정 분석 결과가 안전하게 저장되었습니다!');
      updateIntroHistoryBadge();
      renderHistorySection();
    } catch (e) {
      alert('로컬 저장 용량 한계로 저장하지 못했습니다.');
    }
  }

  function clearHistory() {
    if (!confirm('저장된 감정 분석 기록을 모두 삭제하시겠습니까?')) return;
    state.history = [];
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    updateIntroHistoryBadge();
    renderHistorySection();
    alert('모든 이전 기록이 삭제되었습니다.');
  }

  function renderHistorySection() {
    const $grid = $('#historyCardsGrid');
    $grid.empty();

    if (state.history.length === 0) {
      $grid.html('<p class="text-muted text-center" style="grid-column: 1 / -1; padding: 2rem 0;">저장된 이전 검사 기록이 없습니다.</p>');
      renderTrendChart();
      return;
    }

    state.history.forEach(h => {
      const pills = h.topEmotions.map(t => `<span class="h-pill">${t.name} ${t.percent}%</span>`).join('');
      const card = `
        <div class="h-card">
          <div class="h-card-top">
            <span>📅 ${h.dateLabel}</span>
            <span>TOP 1: ${h.topEmotions[0] ? h.topEmotions[0].name : '-'}</span>
          </div>
          <h5>${h.topEmotions.map(t => t.name).join(' · ')}</h5>
          <div class="h-card-pills">${pills}</div>
        </div>
      `;
      $grid.append(card);
    });

    renderTrendFilterBar();
    renderTrendChart();
  }

  function renderTrendFilterBar() {
    const $bar = $('#trendFilterBar');
    $bar.empty();
    EMOTION_KEYS.forEach(key => {
      const emo = EMOTIONS_MASTER[key];
      const chip = `
        <button type="button" class="trend-chip ${key === state.selectedTrendEmotion ? 'active' : ''}" data-key="${key}">
          <span>${emo.icon} ${emo.name}</span>
        </button>
      `;
      $bar.append(chip);
    });
  }

  function renderTrendChart() {
    const key = state.selectedTrendEmotion || 'peace';
    const emo = EMOTIONS_MASTER[key];
    $('#trendChartTitle').text(`${emo.icon} ${emo.name} 변화 추이`);

    const $container = $('#trendBarsContainer');
    $container.empty();

    if (state.history.length === 0) {
      $container.html('<span class="text-muted" style="margin: auto;">기록이 2회 이상 쌓이면 변화 그래프가 표시됩니다.</span>');
      return;
    }

    // 시간 오름차순으로 최근 10개 표시
    const recent = state.history.slice(0, 10).reverse();

    recent.forEach(h => {
      const pct = (h.percents && h.percents[key]) || 0;
      const raw = (h.rawScores && h.rawScores[key]) || 0;
      const height = Math.max(6, pct);

      const col = `
        <div class="tb-col" title="${h.dateLabel}: ${pct}% (원점수 ${raw}/12점)">
          <span class="tb-val">${pct}%</span>
          <div class="tb-bar" style="height: ${height}%; background: ${emo.color};"></div>
          <span class="tb-date">${h.dateLabel.split(' ')[0]}</span>
        </div>
      `;
      $container.append(col);
    });
  }

  /* ========================================================
     이벤트 초기화 및 세션 복원
     ======================================================== */
  function initEvents() {
    // 1. 인트로에서 시작하기
    $('#btnStartTest').on('click', function() {
      state.currentQuestionIndex = 0;
      state.answers = {};
      showStage('question');
    });

    // 인트로에서 이전 기록 보기
    $('#btnViewHistoryFromIntro').on('click', function() {
      showStage('result');
      $('#historyAnalyticsSection').slideDown(200);
      renderHistorySection();
    });

    // 2. 5단계 선택지 클릭
    $(document).on('click', '.likert-btn', function() {
      const score = parseInt($(this).data('score'), 10);
      handleSelectAnswer(score);
    });

    // 2-1. 24문항 도트 인디케이터 직접 클릭 이동
    $(document).on('click', '.q-dot-item', function() {
      const targetIdx = parseInt($(this).data('qindex'), 10);
      if (!isNaN(targetIdx)) {
        goToQuestion(targetIdx);
      }
    });

    // 3. 이전 질문 버튼
    $('#btnPrevQuestion').on('click', function(e) {
      e.preventDefault();
      clearPendingAdvance();
      if (state.currentQuestionIndex > 0) {
        goToQuestion(state.currentQuestionIndex - 1);
      }
    });

    // 4. 다음 질문 버튼
    $('#btnNextQuestion').on('click', function(e) {
      e.preventDefault();
      clearPendingAdvance();
      const q = QUESTIONS[state.currentQuestionIndex];
      if (typeof state.answers[q.id] !== 'number') {
        alert('현재 문항의 응답을 먼저 선택해주세요.');
        return;
      }
      if (state.currentQuestionIndex < QUESTIONS.length - 1) {
        goToQuestion(state.currentQuestionIndex + 1);
      } else {
        finishTestAndShowResult();
      }
    });

    // 5. 다시 테스트하기
    $('#btnRetakeTest').on('click', function() {
      if (!confirm('테스트를 처음부터 다시 시작하시겠습니까?\n기존에 저장된 검사 기록은 유지됩니다.')) return;
      state.currentQuestionIndex = 0;
      state.answers = {};
      state.calculatedResult = null;
      try { sessionStorage.removeItem(SESSION_KEY_PROGRESS); } catch (e) {}
      showStage('question');
    });

    // 6. 결과 기록 저장
    $('#btnSaveHistory').on('click', saveCurrentResultToHistory);

    // 7. 감정 변화 추이 토글
    $('#btnToggleHistory').on('click', function() {
      $('#historyAnalyticsSection').slideToggle(200);
      renderHistorySection();
    });

    // 8. 기록 삭제
    $('#btnClearHistory').on('click', clearHistory);

    // 9. 감정 상세 탭 전환
    $(document).on('click', '.etab-btn', function() {
      $('.etab-btn').removeClass('active');
      $(this).addClass('active');
      const key = $(this).data('key');
      showEmotionDetailPanel(key);
    });

    // 10. 추이 차트 감정 필터 칩 전환
    $(document).on('click', '.trend-chip', function() {
      $('.trend-chip').removeClass('active');
      $(this).addClass('active');
      state.selectedTrendEmotion = $(this).data('key');
      renderTrendChart();
    });

    // 11. 결과 이미지 저장 모달
    $('#btnOpenSaveImageModal').on('click', function() {
      drawResultCardCanvas();
      $('#modalSaveImage').fadeIn(150);
    });

    $('[data-close]').on('click', function() {
      const modalId = $(this).data('close');
      $('#' + modalId).fadeOut(150);
    });

    $('#btnDownloadPng').on('click', downloadCanvasAsPng);

    // 12. 세션 임시 복원 확인
    try {
      const savedSession = sessionStorage.getItem(SESSION_KEY_PROGRESS);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.answers && Object.keys(parsed.answers).length > 0) {
          state.currentQuestionIndex = parsed.qIndex || 0;
          state.answers = parsed.answers || {};
        }
      }
    } catch (e) {}
  }

  /* ========================================================
     문서 로드 초기화
     ======================================================== */
  $(document).ready(function() {
    loadHistory();
    initEvents();
    showStage('intro');
  });

})(jQuery);
