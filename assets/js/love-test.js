/**
 * 1-Min Challenge - 나의 연애 성향 테스트 로직 스크립트
 * (20문항, 4대 성향 분석, 8가지 결과 유형, 64개 궁합 시스템, Canvas PNG 다운로드, 로컬 저장소 기록)
 */

(function ($) {
  'use strict';

  // ==========================================================================
  // 1. 테스트 질문 데이터 (Q1 ~ Q20 기획안 원문 100% 매핑)
  // A: 불안형, B: 안정형, C: 적극 표현형, D: 회피형
  // ==========================================================================
  const QUESTIONS = [
    {
      id: 1,
      title: "좋아하는 사람이 생겼을 때 나는?",
      options: [
        { trait: "A", text: "상대도 나에게 호감이 있는지 계속 궁금하다." },
        { trait: "B", text: "자연스럽게 알아가며 관계를 발전시킨다." },
        { trait: "C", text: "먼저 연락하고 적극적으로 다가간다." },
        { trait: "D", text: "호감이 있어도 감정을 쉽게 드러내지 않는다." }
      ]
    },
    {
      id: 2,
      title: "연인이 평소보다 연락이 늦어진다면?",
      options: [
        { trait: "A", text: "혹시 마음이 변한 건 아닌지 걱정된다." },
        { trait: "B", text: "바쁜 일이 있을 수 있다고 생각한다." },
        { trait: "C", text: "먼저 연락해서 무슨 일인지 확인한다." },
        { trait: "D", text: "연락에 크게 신경 쓰지 않고 내 시간을 보낸다." }
      ]
    },
    {
      id: 3,
      title: "연인과 다툼이 생겼을 때 나는?",
      options: [
        { trait: "A", text: "갈등이 이별로 이어질까 봐 불안하다." },
        { trait: "B", text: "감정을 정리한 뒤 대화로 해결한다." },
        { trait: "C", text: "문제를 빠르게 해결하기 위해 먼저 대화한다." },
        { trait: "D", text: "혼자 생각할 시간이 필요해 잠시 거리를 둔다." }
      ]
    },
    {
      id: 4,
      title: "연인이 혼자만의 시간을 갖고 싶다고 하면?",
      options: [
        { trait: "A", text: "내가 잘못한 일이 있는지 고민한다." },
        { trait: "B", text: "개인 시간이 필요할 수 있다고 이해한다." },
        { trait: "C", text: "서운하다면 솔직하게 이야기한다." },
        { trait: "D", text: "나도 혼자 보내는 시간이 편하다." }
      ]
    },
    {
      id: 5,
      title: "연애를 시작할 때 가장 중요한 것은?",
      options: [
        { trait: "A", text: "상대방이 나를 좋아한다는 확신" },
        { trait: "B", text: "서로에 대한 신뢰와 존중" },
        { trait: "C", text: "설렘과 적극적인 애정 표현" },
        { trait: "D", text: "서로의 자유와 개인적인 공간" }
      ]
    },
    {
      id: 6,
      title: "연인이 애정 표현을 자주 하지 않는다면?",
      options: [
        { trait: "A", text: "나를 충분히 사랑하는지 궁금해진다." },
        { trait: "B", text: "표현 방식이 다를 수 있다고 생각한다." },
        { trait: "C", text: "내가 먼저 표현하며 분위기를 만든다." },
        { trait: "D", text: "말보다 행동이 중요하다고 생각한다." }
      ]
    },
    {
      id: 7,
      title: "연인에게 서운한 일이 생기면?",
      options: [
        { trait: "A", text: "상대의 말과 행동을 반복해서 생각한다." },
        { trait: "B", text: "감정을 정리한 뒤 솔직하게 전달한다." },
        { trait: "C", text: "서운한 점을 바로 이야기한다." },
        { trait: "D", text: "시간이 필요해서 잠시 혼자 있으려 한다." }
      ]
    },
    {
      id: 8,
      title: "가장 편안한 연애 관계는?",
      options: [
        { trait: "A", text: "서로의 마음을 자주 확인하는 관계" },
        { trait: "B", text: "믿고 의지하면서도 서로 존중하는 관계" },
        { trait: "C", text: "적극적으로 사랑을 표현하는 관계" },
        { trait: "D", text: "서로에게 지나치게 의존하지 않는 관계" }
      ]
    },
    {
      id: 9,
      title: "데이트 약속이 갑자기 취소된다면?",
      options: [
        { trait: "A", text: "나와 만나는 것이 중요하지 않은 건지 걱정된다." },
        { trait: "B", text: "상황을 이해하고 다음 약속을 잡는다." },
        { trait: "C", text: "다른 일정이나 데이트를 바로 제안한다." },
        { trait: "D", text: "생긴 시간을 혼자 보내며 즐긴다." }
      ]
    },
    {
      id: 10,
      title: "연인과 더 가까워지고 싶을 때 나는?",
      options: [
        { trait: "A", text: "상대방의 마음을 계속 확인하고 싶다." },
        { trait: "B", text: "진솔한 대화를 통해 친밀감을 쌓는다." },
        { trait: "C", text: "특별한 데이트나 이벤트를 준비한다." },
        { trait: "D", text: "서두르지 않고 천천히 가까워진다." }
      ]
    },
    {
      id: 11,
      title: "연인과 크게 싸운 후 나는?",
      options: [
        { trait: "A", text: "관계가 끝날까 봐 마음이 불안하다." },
        { trait: "B", text: "차분하게 대화할 방법을 생각한다." },
        { trait: "C", text: "먼저 연락해서 화해하려고 한다." },
        { trait: "D", text: "감정이 진정될 때까지 연락을 줄이고 싶다." }
      ]
    },
    {
      id: 12,
      title: "연인이 다른 사람과 친하게 지낸다면?",
      options: [
        { trait: "A", text: "나보다 그 사람을 더 좋아할까 봐 신경 쓰인다." },
        { trait: "B", text: "서로 신뢰한다면 괜찮다고 생각한다." },
        { trait: "C", text: "불편한 점이 있다면 솔직하게 말한다." },
        { trait: "D", text: "각자의 인간관계는 존중해야 한다고 생각한다." }
      ]
    },
    {
      id: 13,
      title: "사랑한다는 말을 얼마나 자주 하는가?",
      options: [
        { trait: "A", text: "자주 듣고 싶고 확인받고 싶다." },
        { trait: "B", text: "진심이 느껴질 때 자연스럽게 말한다." },
        { trait: "C", text: "좋아하는 감정이 생기면 바로 표현한다." },
        { trait: "D", text: "말보다는 행동으로 보여주는 편이다." }
      ]
    },
    {
      id: 14,
      title: "연인이 힘든 일을 겪고 있다면?",
      options: [
        { trait: "A", text: "내가 충분한 도움이 되지 못할까 걱정된다." },
        { trait: "B", text: "이야기를 들어주고 필요한 도움을 준다." },
        { trait: "C", text: "기분을 풀어주기 위해 적극적으로 행동한다." },
        { trait: "D", text: "상대가 원할 때까지 기다려주는 편이다." }
      ]
    },
    {
      id: 15,
      title: "연애 중 가장 불편한 상황은?",
      options: [
        { trait: "A", text: "상대방의 마음을 알 수 없을 때" },
        { trait: "B", text: "서로 솔직하게 대화하지 못할 때" },
        { trait: "C", text: "관계에 설렘과 표현이 부족할 때" },
        { trait: "D", text: "나만의 시간이 존중받지 못할 때" }
      ]
    },
    {
      id: 16,
      title: "연인과 미래에 대해 이야기한다면?",
      options: [
        { trait: "A", text: "우리의 관계가 오래갈지 확인하고 싶다." },
        { trait: "B", text: "현실적인 계획을 함께 세우고 싶다." },
        { trait: "C", text: "앞으로 함께할 일을 적극적으로 계획한다." },
        { trait: "D", text: "각자의 목표도 유지하고 싶다." }
      ]
    },
    {
      id: 17,
      title: "상대가 갑자기 깊은 애정을 표현한다면?",
      options: [
        { trait: "A", text: "기쁘지만 그 마음이 변하지 않을지 생각한다." },
        { trait: "B", text: "고맙게 받아들이고 내 마음도 표현한다." },
        { trait: "C", text: "나도 적극적으로 애정을 표현한다." },
        { trait: "D", text: "갑작스러운 친밀감이 조금 부담스러울 수 있다." }
      ]
    },
    {
      id: 18,
      title: "연인과 연락하는 가장 편안한 방식은?",
      options: [
        { trait: "A", text: "자주 연락하며 서로의 마음을 확인한다." },
        { trait: "B", text: "부담 없이 일상을 공유한다." },
        { trait: "C", text: "생각날 때마다 적극적으로 연락한다." },
        { trait: "D", text: "각자의 시간에 맞춰 자유롭게 연락한다." }
      ]
    },
    {
      id: 19,
      title: "연애에서 가장 걱정되는 것은?",
      options: [
        { trait: "A", text: "상대방이 나를 떠나는 것" },
        { trait: "B", text: "서로의 신뢰가 무너지는 것" },
        { trait: "C", text: "관계의 설렘과 열정이 사라지는 것" },
        { trait: "D", text: "관계 때문에 내 자유를 잃는 것" }
      ]
    },
    {
      id: 20,
      title: "내가 바라는 사랑의 모습은?",
      options: [
        { trait: "A", text: "언제나 서로의 사랑을 확인할 수 있는 관계" },
        { trait: "B", text: "편안하고 믿음직하게 오래가는 관계" },
        { trait: "C", text: "설렘과 적극적인 표현이 가득한 관계" },
        { trait: "D", text: "개인의 자유와 거리를 존중하는 관계" }
      ]
    }
  ];

  // ==========================================================================
  // 2. 8가지 연애 성향 상세 데이터 (섹션 6, 11 규격)
  // 각 유형 상세 설명은 250자 이상으로 정성스럽게 작성됨
  // ==========================================================================
  const RESULT_TYPES = {
    TYPE_01: {
      id: "TYPE_01",
      code: "TYPE 01",
      name: "불안형 · 사랑 확인형",
      shortName: "사랑 확인형",
      tag: "불안형 경향 중심",
      badgeColor: "#ec4899",
      icon: "💌",
      quote: "사랑을 확인할 때 마음이 놓이는 사람",
      keywords: ["애정 확인", "섬세함", "적극적인 표현"],
      description: "상대방의 관심과 애정 표현을 누구보다 중요하게 생각하는 유형입니다. 좋아하는 사람과 깊어질수록 서로의 마음을 자주 확인하고 싶어 하며, 작은 말 한마디나 메신저 답장의 미세한 뉘앙스에서도 감정의 변화를 빠르게 알아차립니다. 관계에 온 마음과 진심을 다하기에 상대를 극진히 아끼고 정성을 쏟지만, 상대의 반응이 평소와 다르거나 불확실할 때는 혼자서 부정적인 걱정을 키우기도 합니다. 상대방이 변함없는 애정과 확신을 꾸준히 전달해 줄 때 가장 편안하고 헌신적인 사랑꾼으로 피어납니다.",
      expressionStyle: "다정한 말과 눈빛으로 상대를 향한 사랑을 끊임없이 표현하며, 기념일이나 둘만의 소중한 순간을 정성스럽게 챙깁니다.",
      conflictStyle: "갈등이 발생하면 이별이나 소외로 이어질까 봐 초조해하며, 즉각적인 대화와 애정 확인을 통해 관계의 안전을 회복하고 싶어 합니다.",
      strengths: [
        "애정 표현이 풍부하고 따뜻하며 정서적 교감이 깊습니다.",
        "상대방의 감정 변화와 필요를 세심하게 살피고 챙깁니다.",
        "관계를 가볍게 여기지 않고 온 마음을 다해 소중히 여깁니다."
      ],
      weaknesses: [
        "상대의 사소한 표정이나 말투 변화를 부정적으로 확대 해석할 수 있습니다.",
        "불안한 마음에 상대의 반응과 애정을 반복적으로 확인하려 할 수 있습니다.",
        "관계의 불확실성이 커지면 혼자만의 생각에 갇혀 마음이 쉽게 지칠 수 있습니다."
      ],
      advice: "상대방의 마음을 확인하는 것만큼 스스로 관계를 신뢰하는 연습도 중요해요. 상대의 잠시 동안의 침묵이나 혼자만의 시간이 결코 당신을 향한 사랑이 식었음을 뜻하지 않는다는 것을 기억해 보세요.",
      bestMatches: ["평온한 균형형", "다정한 리더형"],
      carefulMatches: ["속마음 잠금형", "독립적인 연애형"],
      // 5가지 특성값 (0~10)
      traits: { expression: 8, confirmation: 10, space: 2, dialogue: 7, stability: 8 }
    },
    TYPE_02: {
      id: "TYPE_02",
      code: "TYPE 02",
      name: "불안형 · 마음 과몰입형",
      shortName: "마음 과몰입형",
      tag: "불안형 경향 중심",
      badgeColor: "#f43f5e",
      icon: "💭",
      quote: "좋아할수록 생각이 많아지는 사람",
      keywords: ["몰입", "진심", "감정 민감성"],
      description: "좋아하는 사람과의 관계를 누구보다 깊이 생각하고 고뇌하는 유형입니다. 상대방의 사소한 행동과 말을 오랫동안 마음에 담아두며, 과거의 대화나 순간들에 수많은 의미를 부여하곤 합니다. 관계에서 피상적인 만남보다는 영혼이 닿는 깊은 정서적 교감을 추구하며, 상대방에게 깊은 정성과 정서적 에너지를 아낌없이 쏟아붓습니다. 그러나 생각의 꼬리를 물다 보면 아직 일어나지도 않은 가상의 시나리오로 스스로를 지치게 만들 수 있으므로, 때로는 생각의 스위치를 끄고 단순하게 받아들이는 쉼이 필요합니다.",
      expressionStyle: "상대방의 사소한 취향과 스쳐 지나간 말 한마디까지 세심하게 기억해 두었다가 깊은 배려와 마음이 담긴 선물로 감동을 전합니다.",
      conflictStyle: "다툼이 생기면 상대의 말을 곱씹으며 속상함과 자책을 오가고, 감정을 정리하고 다시 안정되기까지 많은 시간이 소요됩니다.",
      strengths: [
        "상대방의 작은 변화와 감정의 결을 누구보다 예리하게 포착합니다.",
        "거짓 없는 깊고 진솔한 정서적 교감을 진심을 다해 추구합니다.",
        "연인과의 관계에 자신의 시간과 정성을 아낌없이 헌신합니다."
      ],
      weaknesses: [
        "지나친 고민과 생각의 과부하로 인해 정서적 에너지가 소진되기 쉽습니다.",
        "상대방의 일상적인 무심함에도 복잡한 숨은 의미를 부여해 자괴감에 빠질 수 있습니다.",
        "자신의 감정이나 현실적인 필요보다 상대의 반응을 지나치게 우선시할 수 있습니다."
      ],
      advice: "모든 행동의 의미를 찾기보다 지금 함께하는 순간을 편안하게 즐겨보세요. 연애는 정답을 찾아야 하는 복잡한 시험이 아니라, 서로의 온기를 느끼며 나란히 걷는 산책입니다.",
      bestMatches: ["다정한 리더형", "평온한 균형형"],
      carefulMatches: ["불꽃 직진형", "속마음 잠금형"],
      traits: { expression: 6, confirmation: 9, space: 3, dialogue: 6, stability: 7 }
    },
    TYPE_03: {
      id: "TYPE_03",
      code: "TYPE 03",
      name: "안정형 · 다정한 리더형",
      shortName: "다정한 리더형",
      tag: "안정형 경향 중심",
      badgeColor: "#6366f1",
      icon: "🌟",
      quote: "다정함과 적극성을 모두 가진 사람",
      keywords: ["배려", "적극성", "신뢰"],
      description: "상대방을 따뜻하게 배려하면서도 관계의 방향을 건강하고 적극적으로 이끄는 유형입니다. 상호 신뢰와 진솔한 대화를 최우선 가치로 여기며, 상대의 의견과 감정을 온전히 존중하면서도 행동으로 자신의 마음을 명확하게 표현합니다. 감정의 기복이 적어 연인에게 언제 찾아가도 기댈 수 있는 든든한 나무가 되어주며, 갈등 상황에서도 회피하거나 격양되지 않고 문제를 건설적으로 해결하기 위해 먼저 차분하게 대화를 제안합니다.",
      expressionStyle: "진심 어린 칭찬과 솔직한 사랑의 고백, 그리고 연인의 일상을 편안하게 챙겨주는 듬직한 실천으로 마음을 표현합니다.",
      conflictStyle: "감정에 매몰되지 않고 상황을 객관적으로 조망하며, 상대방의 입장을 경청한 뒤 서로가 납득할 수 있는 성숙한 합의점을 찾습니다.",
      strengths: [
        "갈등이 생겼을 때 차분하고 성숙한 태도로 적극 대화해 해결합니다.",
        "자연스럽고 솔직한 애정 표현으로 상대를 불안하지 않게 합니다.",
        "상대방에게 깊은 정서적 안정감과 든든한 지지대를 제공합니다."
      ],
      weaknesses: [
        "관계의 모든 갈등과 책임을 혼자 짊어지려다 남모르게 지칠 수 있습니다.",
        "배려하려는 마음이 앞서 상대방의 선택과 속도를 대신 결정해버릴 수 있습니다.",
        "상대를 챙기느라 정작 자신의 지친 감정이나 서운함을 뒤로 미룰 수 있습니다."
      ],
      advice: "항상 관계를 완벽히 이끌려고 하지 않아도 괜찮아요. 때로는 상대방의 품에 기대어 서로에게 주도권을 나누고 약한 모습도 편하게 보여주세요.",
      bestMatches: ["사랑 확인형", "마음 과몰입형"],
      carefulMatches: ["불꽃 직진형", "독립적인 연애형"],
      traits: { expression: 9, confirmation: 5, space: 6, dialogue: 9, stability: 9 }
    },
    TYPE_04: {
      id: "TYPE_04",
      code: "TYPE 04",
      name: "안정형 · 평온한 균형형",
      shortName: "평온한 균형형",
      tag: "안정형 경향 중심",
      badgeColor: "#059669",
      icon: "🍃",
      quote: "함께할수록 편안해지는 사람",
      keywords: ["신뢰", "안정", "균형"],
      description: "연애에서 굳건한 신뢰와 안정적인 소통, 그리고 삶의 균형을 가장 중시하는 유형입니다. 감정의 급격한 파도에 휩쓸려 충동적으로 반응하기보다는 차분하게 상황을 이해하고 대화로 풀어나가려 노력합니다. 서로 깊이 사랑하고 함께하는 시간만큼이나 각자의 개인적인 시간과 프라이버시를 존중하며, 구속이나 불안 없는 오래 지속되는 관계를 지향합니다. 잔잔한 호수처럼 상대방에게 늘 평온한 안식처를 선물합니다.",
      expressionStyle: "매일매일의 소소한 일상 공유, 꾸준한 경청, 곁에서 묵묵히 지켜봐 주는 안정적인 존재감으로 깊은 신뢰를 전합니다.",
      conflictStyle: "감정의 온도가 가라앉을 때까지 잠시 여유를 둔 후, 논리적이고 차분하게 서로의 입장 차이를 명확하게 조율합니다.",
      strengths: [
        "감정을 차분하게 전달하며 상대방의 생각과 입장을 온전히 존중합니다.",
        "흔들리지 않는 단단한 신뢰를 바탕으로 오랫동안 변함없는 관계를 유지합니다.",
        "관계 속에서도 서로의 개인적 성장과 자유로운 공간을 지켜줍니다."
      ],
      weaknesses: [
        "설렘이나 뜨거운 감정 표현의 크기가 다소 적게 느껴질 수 있습니다.",
        "심각한 갈등 상황에서도 너무 무난하게 넘어가려 해 근본적 해결이 늦어질 수 있습니다.",
        "감정 표현이 절제되어 상대방에게 때때로 무덤덤하거나 무관심하게 비칠 수 있습니다."
      ],
      advice: "편안한 관계 속에서도 가끔은 가슴 뛰는 적극적인 애정 표현으로 마음을 전달해보세요. 익숙함 속에 더해지는 깜짝 고백이나 특별한 이벤트는 관계의 활력소가 됩니다.",
      bestMatches: ["사랑 확인형", "독립적인 연애형"],
      carefulMatches: ["불꽃 직진형", "속마음 잠금형"],
      traits: { expression: 5, confirmation: 4, space: 7, dialogue: 8, stability: 10 }
    },
    TYPE_05: {
      id: "TYPE_05",
      code: "TYPE 05",
      name: "적극 표현형 · 로맨틱 직진형",
      shortName: "로맨틱 직진형",
      tag: "적극 표현 스타일 중심",
      badgeColor: "#d946ef",
      icon: "💐",
      quote: "좋아하는 마음을 숨기지 않는 사람",
      keywords: ["로맨틱", "표현력", "다정함"],
      description: "좋아하는 마음을 가슴속에 숨겨두지 않고 온 세상이 알도록 적극적으로 표현하는 로맨티시스트입니다. 연인을 위해 특별한 기념일을 챙기거나 서프라이즈 이벤트를 준비하는 과정 자체에서 커다란 행복과 설렘을 느낍니다. 연애에서 따뜻한 설렘과 풍부한 정서적 교감을 가장 중요하게 여기며, 밀당 없이 솔직하고 직관적으로 사랑을 쏟아냅니다. 함께 있는 모든 순간을 영화 속 한 장면처럼 로맨틱하고 특별하게 빚어내는 매력적인 사람입니다.",
      expressionStyle: "달콤한 칭찬, 깜짝 선물, 손편지, 감동적인 데이트 플랜 등 눈에 보이고 느껴지는 온갖 적극적인 방법으로 사랑을 쏟아냅니다.",
      conflictStyle: "답답한 마음에 즉시 오해를 풀고 싶어 하며, 다정하게 대화를 시도해 연인의 기분을 빠르게 회복시키려 온 정성을 다합니다.",
      strengths: [
        "솔직하고 다정한 애정 표현이 마르지 않고 언제나 넘쳐납니다.",
        "둘만의 특별한 추억과 로맨틱한 분위기를 주도적으로 만들어갑니다.",
        "계산하거나 재지 않고 자신의 진심을 투명하고 솔직하게 전달합니다."
      ],
      weaknesses: [
        "상대방의 감정 페이스보다 빠르게 앞서 나가 상대에게 부담을 줄 수 있습니다.",
        "자신이 표현하고 쏟은 만큼 상대방도 즉각적인 리액션을 보여주길 기대할 수 있습니다.",
        "화려한 이벤트에 몰두하다가 잔잔하고 사소한 일상 소통의 무게를 놓칠 수 있습니다."
      ],
      advice: "큰 이벤트뿐 아니라 평범한 일상 속 작은 배려도 소중한 애정 표현이에요. 감정의 속도가 다른 상대방의 조심스러운 걸음걸이에도 발을 맞추어주세요.",
      bestMatches: ["불꽃 직진형", "평온한 균형형"],
      carefulMatches: ["속마음 잠금형", "독립적인 연애형"],
      traits: { expression: 10, confirmation: 7, space: 4, dialogue: 8, stability: 7 }
    },
    TYPE_06: {
      id: "TYPE_06",
      code: "TYPE 06",
      name: "적극 표현형 · 불꽃 직진형",
      shortName: "불꽃 직진형",
      tag: "적극 표현 스타일 중심",
      badgeColor: "#ea580c",
      icon: "🔥",
      quote: "설레는 순간에는 망설이지 않는 사람",
      keywords: ["열정", "추진력", "솔직함"],
      description: "연애에서 자신의 감정에 100% 솔직하고 언제나 당당하게 행동하는 열정파입니다. 마음에 드는 상대가 생기거나 번뜩이는 데이트 아이디어가 떠오르면 망설이거나 주저하지 않고 곧바로 실행에 옮기며, 관계에 뜨거운 에너지와 설렘을 불어넣습니다. 감정이 솔직하고 직관적이어서 밀당을 답답해하며, 좋으면 좋다, 서운하면 서운하다고 군더더기 없이 표현합니다. 반복되는 지루한 일상도 단숨에 신나는 모험으로 바꾸는 강력한 추진력을 지녔습니다.",
      expressionStyle: "망설임 없는 솔직한 스킨십, 깜짝 데이트 제안, 시원시원한 사랑 고백으로 상대의 마음을 거침없이 두드립니다.",
      conflictStyle: "불필요한 감정 소모를 질색하여 그 자리에서 문제를 시원하게 털어놓고 즉각적인 해결과 화해를 원합니다.",
      strengths: [
        "자신의 솔직한 마음과 의사를 망설임 없이 명확하게 행동으로 옮깁니다.",
        "관계가 지루할 틈이 없도록 활기차고 역동적인 에너지를 불어넣습니다.",
        "문제가 생기면 뒤로 미루지 않고 적극적이고 시원하게 돌파합니다."
      ],
      weaknesses: [
        "상대방이 마음을 열고 따라오는 속도를 충분히 살피지 못할 수 있습니다.",
        "감정과 직관이 앞서 중요한 결정을 성급하게 내려버릴 수 있습니다.",
        "초기의 뜨거운 불꽃이 잦아들고 평범한 일상이 되면 쉽게 권태감을 느낄 수 있습니다."
      ],
      advice: "열정적인 표현과 함께 상대의 감정과 속도를 살피는 여유를 가져보세요. 빠르게 타오르는 불꽃 뒤에 남는 은은한 숯불의 온기처럼, 잔잔한 지속력의 아름다움도 발견해 보세요.",
      bestMatches: ["로맨틱 직진형", "독립적인 연애형"],
      carefulMatches: ["마음 과몰입형", "평온한 균형형"],
      traits: { expression: 10, confirmation: 5, space: 6, dialogue: 7, stability: 6 }
    },
    TYPE_07: {
      id: "TYPE_07",
      code: "TYPE 07",
      name: "회피형 · 독립적인 연애형",
      shortName: "독립적인 연애형",
      tag: "회피형 경향 중심",
      badgeColor: "#0284c7",
      icon: "🧭",
      quote: "사랑해도 나만의 세계가 필요한 사람",
      keywords: ["독립성", "존중", "자기관리"],
      description: "깊은 사랑 속에서도 자신의 온전한 삶과 독립적인 영역을 소중히 지키는 자립적인 유형입니다. 연인과 함께하는 시간의 소중함을 분명히 알지만, 동시에 혼자만의 시간을 가지며 에너지를 충전하고 개인적 목표를 추구하는 것 역시 연애만큼 중요하다고 믿습니다. 상대방을 구속하거나 집착하지 않으며, 단단한 신뢰가 형성되면 서로의 자유와 영역을 온전히 보장해 주는 성숙하고 쿨한 파트너가 되어줍니다.",
      expressionStyle: "간섭하지 않는 묵묵한 응원, 상대방의 자유를 인정해 주는 신뢰, 약속을 빈틈없이 지키는 행동으로 사랑을 증명합니다.",
      conflictStyle: "감정이 격해지면 대화를 일단 중단하고 혼자만의 공간으로 물러나 생각을 정리한 뒤 이성적으로 소통하려 합니다.",
      strengths: [
        "상대방의 사생활과 개인적인 자유를 누구보다 깊이 존중하고 지켜줍니다.",
        "연애에 과도하게 매몰되지 않고 자신의 일과 라이프스타일을 훌륭하게 관리합니다.",
        "불필요한 집착이나 감정적인 간섭 없이 담백하고 쾌적한 관계를 유지합니다."
      ],
      weaknesses: [
        "지나친 경계선 긋기로 인해 상대방에게 차가운 거리감이 느껴질 수 있습니다.",
        "상대가 꼭 필요로 하는 따뜻한 공감과 애정 표현의 결정적 타이밍을 놓칠 수 있습니다.",
        "서운하거나 갈등이 생겼을 때 대화를 닫고 혼자서 삭이려 해 소통 단절을 부를 수 있습니다."
      ],
      advice: "개인적인 시간을 존중하면서도 상대가 충분히 사랑받고 있다고 느끼도록 표현해보세요. 가끔은 당신의 마음의 문을 먼저 열고 혼자만의 세계로 연인을 초대해 보세요.",
      bestMatches: ["평온한 균형형", "불꽃 직진형"],
      carefulMatches: ["사랑 확인형", "로맨틱 직진형"],
      traits: { expression: 4, confirmation: 2, space: 10, dialogue: 5, stability: 7 }
    },
    TYPE_08: {
      id: "TYPE_08",
      code: "TYPE 08",
      name: "회피형 · 속마음 잠금형",
      shortName: "속마음 잠금형",
      tag: "회피형 경향 중심",
      badgeColor: "#475569",
      icon: "🗝️",
      quote: "쉽게 표현하지 않지만 마음은 깊은 사람",
      keywords: ["신중함", "깊은 신뢰", "감정 표현의 조심스러움"],
      description: "자신의 감정을 겉으로 쉽게 드러내지 않지만 마음속 깊은 곳에는 깊은 진심을 품고 있는 신중한 유형입니다. 관계를 섣불리 시작하기보다 충분한 시간과 일상적 대화를 거치며 상대방을 조심스럽게 관찰하고 알아갑니다. 겉으로는 무뚝뚝하거나 감정 표현이 서툴러 보일 수 있지만, 일단 깊은 신뢰가 형성되면 그 누구보다 변함없이 곁을 지키며 묵묵히 헌신합니다. 서툰 표현 뒤에 따뜻하고 섬세한 속마음이 숨겨져 있는 볼수록 진국인 사람입니다.",
      expressionStyle: "화려한 말 대신 조용한 실질적 배려, 상대의 안부를 챙기는 짤막한 메시지, 묵묵한 도움으로 마음을 전달합니다.",
      conflictStyle: "감정적 압박을 느끼면 동굴 속으로 들어가 대화를 피하려 하며, 감정이 완전히 가라앉을 때까지 오랜 시간이 필요합니다.",
      strengths: [
        "관계에 있어 결코 가볍지 않고 매우 진중하며 신뢰를 생명처럼 여깁니다.",
        "자신의 내면을 깊이 돌아보며 충동적인 언행이나 실수를 하지 않습니다.",
        "한번 믿음을 준 사람에게는 주변의 어떤 흔들림에도 변함없는 애정을 보입니다."
      ],
      weaknesses: [
        "마음을 잘 표현하지 않아 상대방이 사랑을 확신하기 어렵고 외로움을 느낄 수 있습니다.",
        "갈등이나 서운함이 생겼을 때 대화를 기피하고 침묵에 빠질 수 있습니다.",
        "감정적인 어려움을 연인과 나누지 않고 혼자서만 끙끙 앓다 지칠 수 있습니다."
      ],
      advice: "마음이 완전히 정리되지 않았더라도 지금 느끼는 감정을 조금씩 전달해보세요. 서툰 한마디의 표현이라도 상대에게는 커다란 안도감과 감동이 됩니다.",
      bestMatches: ["독립적인 연애형", "평온한 균형형"],
      carefulMatches: ["사랑 확인형", "마음 과몰입형"],
      traits: { expression: 3, confirmation: 3, space: 9, dialogue: 4, stability: 8 }
    }
  };

  // ==========================================================================
  // 3. 4대 애착 및 행동 성향 기본 해설 텍스트 (섹션 8 규격)
  // ==========================================================================
  const TRAIT_EXPLANATIONS = {
    A: {
      name: "불안형 경향",
      tag: "애정 확인 / 관계 민감성",
      icon: "💓",
      desc: "관계에서 애정과 확신을 중요하게 여기는 편이에요. 상대방의 반응에 민감해질 때는 혼자 추측하기보다 솔직하게 대화해보는 것이 도움이 될 수 있어요."
    },
    B: {
      name: "안정형 경향",
      tag: "신뢰 / 정서적 안정",
      icon: "🌿",
      desc: "친밀감과 개인 시간을 균형 있게 받아들이고 서로를 신뢰하며 관계를 유지하려는 편이에요. 감정과 생각을 편안하게 나누는 태도가 강점이 될 수 있어요."
    },
    C: {
      name: "적극 표현 경향",
      tag: "적극성 / 로맨틱 표현",
      icon: "✨",
      desc: "좋아하는 마음을 직접 표현하고 관계를 적극적으로 이끄는 편이에요. 상대방의 속도와 표현 방식을 함께 존중하면 더욱 편안한 관계를 만들 수 있어요."
    },
    D: {
      name: "회피형 경향",
      tag: "독립성 / 개인 공간",
      icon: "🛡️",
      desc: "개인적인 시간과 독립성을 중요하게 생각하는 편이에요. 친밀감이 부담스럽게 느껴질 때는 무조건 거리를 두기보다 자신의 감정과 필요한 시간을 상대방에게 설명해보는 것이 도움이 될 수 있어요."
    }
  };

  // ==========================================================================
  // 4. 상태 관리 변수 (State)
  // ==========================================================================
  let currentQuestionIndex = 0;
  let userAnswers = new Array(20).fill(null); // 각 인덱스: 'A' | 'B' | 'C' | 'D'
  let currentResult = null; // 계산된 결과 캐시

  const STORAGE_KEY_HISTORY = 'challenge_1min_love_test_history';
  const STORAGE_KEY_PROGRESS = 'challenge_1min_love_test_progress';

  // ==========================================================================
  // 5. 점수 계산 알고리즘 (기획안 섹션 5 엄격 준수)
  // - 20문항 합산 총점 20점
  // - 동점 우선순위: B → C → A → D
  // - 결과 분류 규칙:
  //   * 주성향 A + 보조성향 C -> TYPE 01
  //   * 주성향 A + 기타       -> TYPE 02
  //   * 주성향 B + 보조성향 C -> TYPE 03
  //   * 주성향 B + 기타       -> TYPE 04
  //   * 주성향 C + 보조성향 B -> TYPE 05
  //   * 주성향 C + 기타       -> TYPE 06
  //   * 주성향 D + 보조성향 B -> TYPE 07
  //   * 주성향 D + 기타       -> TYPE 08
  // ==========================================================================
  function calculateResult(answers) {
    const scores = { A: 0, B: 0, C: 0, D: 0 };
    answers.forEach(trait => {
      if (trait && scores[trait] !== undefined) {
        scores[trait] += 1;
      }
    });

    // 동점 우선순위 가중치: B(4) > C(3) > A(2) > D(1)
    const tiePriority = { B: 4, C: 3, A: 2, D: 1 };

    const sortedTraits = ['A', 'B', 'C', 'D'].sort((x, y) => {
      if (scores[y] !== scores[x]) {
        return scores[y] - scores[x];
      }
      return tiePriority[y] - tiePriority[x];
    });

    const primary = sortedTraits[0];
    const secondary = sortedTraits[1];

    let resultTypeId = 'TYPE_02';

    if (primary === 'A') {
      resultTypeId = (secondary === 'C') ? 'TYPE_01' : 'TYPE_02';
    } else if (primary === 'B') {
      resultTypeId = (secondary === 'C') ? 'TYPE_03' : 'TYPE_04';
    } else if (primary === 'C') {
      resultTypeId = (secondary === 'B') ? 'TYPE_05' : 'TYPE_06';
    } else if (primary === 'D') {
      resultTypeId = (secondary === 'B') ? 'TYPE_07' : 'TYPE_08';
    }

    // 4가지 성향 점수 비율 (%)
    const percentages = {
      A: Math.round((scores.A / 20) * 100),
      B: Math.round((scores.B / 20) * 100),
      C: Math.round((scores.C / 20) * 100),
      D: Math.round((scores.D / 20) * 100)
    };

    // 반올림 오차로 100% 보정 (합계가 100이 되도록)
    const sum = percentages.A + percentages.B + percentages.C + percentages.D;
    if (sum !== 100) {
      percentages[primary] += (100 - sum);
    }

    return {
      typeId: resultTypeId,
      typeData: RESULT_TYPES[resultTypeId],
      scores: scores,
      percentages: percentages,
      primaryTrait: primary,
      secondaryTrait: secondary,
      answers: [...answers],
      timestamp: new Date().toISOString()
    };
  }

  // ==========================================================================
  // 6. 64가지 연애 궁합 계산 엔진 (섹션 10 명시적 공식 및 대칭성 보장)
  // - A와 B 순서를 바꾸어도 궁합 점수는 100% 동일함: Score(A, B) === Score(B, A)
  // - 0~100점 범위의 명확한 특성 거리 기반 점수 산출
  // - 동일 유형끼리도 정상 점수 산출
  // ==========================================================================
  function getCompatibility(typeId1, typeId2) {
    const t1 = RESULT_TYPES[typeId1];
    const t2 = RESULT_TYPES[typeId2];

    if (!t1 || !t2) return null;

    // 기획안 추천 테이블 기반 상호 보너스 매핑
    const isRecommended = (t1.bestMatches.includes(t2.shortName) || t2.bestMatches.includes(t1.shortName));
    const isCareful = (t1.carefulMatches.includes(t2.shortName) || t2.carefulMatches.includes(t1.shortName));

    // 5대 고정 특성값 거리 계산 (대칭)
    const diffExpr = Math.abs(t1.traits.expression - t2.traits.expression);
    const diffConf = Math.abs(t1.traits.confirmation - t2.traits.confirmation);
    const diffSpace = Math.abs(t1.traits.space - t2.traits.space);
    const diffDial = Math.abs(t1.traits.dialogue - t2.traits.dialogue);
    const diffStab = Math.abs(t1.traits.stability - t2.traits.stability);

    // 가중 거리 합계 (최대 약 45~50)
    const weightedDiff = (diffExpr * 1.0) + (diffConf * 1.5) + (diffSpace * 1.8) + (diffDial * 1.0) + (diffStab * 0.8);

    // 기본 점수 (100 - 가중거리 * 1.25)
    let score = Math.round(98 - (weightedDiff * 1.05));

    if (isRecommended) score += 8;
    if (isCareful) score -= 8;

    // 동일 유형인 경우 기본 친밀 보정
    if (typeId1 === typeId2) {
      score = Math.max(score, 88);
    }

    // 60 ~ 98점 사이로 안전 클리핑
    score = Math.min(98, Math.max(60, score));

    // 관계 핵심 특징 분석
    let headline = "";
    let goodPoints = [];
    let carefulPoints = [];
    let advices = [];

    if (score >= 90) {
      headline = "서로의 빈틈을 따뜻하게 채워주는 환상의 찰떡궁합";
      goodPoints = [
        "애정 표현과 관계에 대한 지향점이 조화롭게 맞아떨어집니다.",
        "서로의 감정적 속도를 깊이 이해하고 편안하게 지지해 줍니다."
      ];
      carefulPoints = [
        "사이가 너무 좋아 서운한 점을 굳이 말하지 않고 넘기려 할 수 있습니다.",
        "때로는 익숙함에 젖어 상대방에 대한 감사 표현을 잊지 않도록 하세요."
      ];
      advices = [
        "지금처럼 솔직한 대화와 소소한 감동을 꾸준히 공유해 보세요.",
        "서로의 장점을 자주 칭찬해 줄수록 신뢰가 더욱 단단해집니다."
      ];
    } else if (score >= 80) {
      headline = "서로에게 든든한 안정감과 긍정적인 자극을 주는 관계";
      goodPoints = [
        "갈등이 생겼을 때 대화를 통해 성숙하게 타협할 수 있는 기반이 있습니다.",
        "함께하는 즐거움과 각자의 일상 모두를 건강하게 응원합니다."
      ];
      carefulPoints = [
        "표현 방식의 사소한 차이로 인해 초기에는 작은 오해가 생길 수 있습니다.",
        "상대의 침묵이나 혼자만의 시간을 거절로 느끼지 않도록 주의하세요."
      ];
      advices = [
        "서운한 감정이 들 때는 혼자 생각하기보다 가볍게 이야기해 보세요.",
        "주말에는 둘만의 새로운 데이트를 통해 신선한 에너지를 채워보세요."
      ];
    } else if (score >= 70) {
      headline = "서로 다른 매력으로 배울 점이 많은 성장형 관계";
      goodPoints = [
        "자신에게 없는 상대방의 장점을 통해 새로운 시야를 배울 수 있습니다.",
        "익숙하지 않은 방식의 연애를 경험하며 더 깊은 유대감을 형성합니다."
      ];
      carefulPoints = [
        "애정 확인을 원하는 빈도와 개인 공간을 요구하는 크기의 차이가 있을 수 있습니다.",
        "갈등 상황에서 한 사람은 대화를 서두르고, 한 사람은 시간을 필요로 할 수 있습니다."
      ];
      advices = [
        "상대의 반응 속도가 나와 다르더라도 그 사람만의 표현 방식을 인정해 주세요.",
        "다툼이 생겼을 땐 '지금 30분만 생각하고 이야기하자'처럼 명확한 시간을 정해보세요."
      ];
    } else {
      headline = "서로의 영역과 표현 방식을 깊이 존중해야 하는 배려형 관계";
      goodPoints = [
        "다르기 때문에 더 조심스럽고 정성을 다해 서로를 대하게 됩니다.",
        "상대방의 가치관과 독립성을 존중하는 성숙한 사랑을 훈련할 수 있습니다."
      ];
      carefulPoints = [
        "친밀감의 욕구와 혼자만의 시간 욕구가 충돌해 서운함이 생기기 쉽습니다.",
        "말하지 않아도 상대가 알아줄 것이라는 기대는 오해를 키울 수 있습니다."
      ];
      advices = [
        "마음속 기대를 당연하게 여기지 말고 나의 필요를 솔직하고 담담하게 말해보세요.",
        "상대방이 나를 밀어내는 것이 아니라 충전하는 시간임을 신뢰해 주세요."
      ];
    }

    return {
      type1: t1,
      type2: t2,
      score: score,
      headline: headline,
      goodPoints: goodPoints,
      carefulPoints: carefulPoints,
      advices: advices
    };
  }

  // ==========================================================================
  // 7. UI 화면 렌더링 & 질문 제어 함수
  // ==========================================================================
  function showStage(stageName) {
    $('.test-stage-section').removeClass('active').hide();
    $(`#stage-${stageName}`).addClass('active').fadeIn(200);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderQuestion(index) {
    if (index < 0 || index >= QUESTIONS.length) return;

    currentQuestionIndex = index;
    const q = QUESTIONS[index];
    const qNum = index + 1;
    const progressPercent = Math.round((qNum / QUESTIONS.length) * 100);

    // 상단 진행 상태 갱신
    $('#questionCounter').text(`QUESTION ${String(qNum).padStart(2, '0')} / 20`);
    $('#progressPercent').text(`${progressPercent}%`);
    $('#testProgressBar').css('width', `${progressPercent}%`);

    // 질문 텍스트
    $('#questionTitle').text(q.title);

    // 선택지 생성
    const $optionsList = $('#optionsList');
    $optionsList.empty();

    const currentAnswer = userAnswers[index];

    q.options.forEach((opt, idx) => {
      const isSelected = (currentAnswer === opt.trait);
      const optLetter = String.fromCharCode(65 + idx); // A, B, C, D (표시용 라벨)

      const $btn = $(`
        <button type="button" class="option-btn ${isSelected ? 'selected' : ''}" data-trait="${opt.trait}">
          <span class="option-marker">${optLetter}</span>
          <span class="option-text">${opt.text}</span>
          <span class="option-check">${isSelected ? '✓' : ''}</span>
        </button>
      `);

      $optionsList.append($btn);
    });

    // 이전 버튼 활성화/비활성화
    if (index === 0) {
      $('#prevQuestionBtn').prop('disabled', true).addClass('opacity-50');
    } else {
      $('#prevQuestionBtn').prop('disabled', false).removeClass('opacity-50');
    }

    // 다음/결과보기 버튼 텍스트
    if (index === QUESTIONS.length - 1) {
      $('#nextQuestionBtn').html('<span>결과 분석하기 ✨</span>');
    } else {
      $('#nextQuestionBtn').html('<span>다음 질문 →</span>');
    }

    // 현재 답변이 없으면 다음 버튼 비활성화
    if (!currentAnswer) {
      $('#nextQuestionBtn').prop('disabled', true).addClass('opacity-50');
    } else {
      $('#nextQuestionBtn').prop('disabled', false).removeClass('opacity-50');
    }

    // 로컬 세션에 진행 상태 저장 (새로고침 복원용)
    saveProgress();
  }

  function handleSelectOption(trait) {
    userAnswers[currentQuestionIndex] = trait;

    // 사운드 효과
    if (window.SoundFX && typeof window.SoundFX.cardFlip === 'function') {
      window.SoundFX.cardFlip();
    }

    // 버튼 선택 상태 UI 즉시 갱신
    $('#optionsList .option-btn').removeClass('selected').find('.option-check').text('');
    const $selected = $(`#optionsList .option-btn[data-trait="${trait}"]`);
    $selected.addClass('selected').find('.option-check').text('✓');

    $('#nextQuestionBtn').prop('disabled', false).removeClass('opacity-50');

    // 0.25초 후 자동 다음 문제 진행 (마지막 문제가 아닐 때)
    setTimeout(() => {
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        renderQuestion(currentQuestionIndex + 1);
      } else {
        // 마지막 문제 완료 -> 결과 계산
        finishTest();
      }
    }, 240);
  }

  function finishTest() {
    // 모든 문항이 답변되었는지 확인
    const unansweredIndex = userAnswers.findIndex(a => a === null);
    if (unansweredIndex !== -1) {
      alert(`아직 ${unansweredIndex + 1}번 질문에 답변하지 않았습니다.`);
      renderQuestion(unansweredIndex);
      return;
    }

    const result = calculateResult(userAnswers);
    currentResult = result;

    // 진행 상태 세션 삭제
    clearProgress();

    // 로컬스토리지에 최근 기록 저장 (최대 10개)
    saveHistory(result);

    // 사운드 효과
    if (window.SoundFX && typeof window.SoundFX.correctAnswer === 'function') {
      window.SoundFX.correctAnswer();
    }

    // 결과 화면 렌더링
    renderResultView(result);
    showStage('result');
  }

  // ==========================================================================
  // 8. 결과 화면 렌더링 함수 (기획안 섹션 11 규격 준수)
  // ==========================================================================
  function renderResultView(result) {
    const t = result.typeData;

    // ① 최종 결과 헤더
    $('#resultTypeCode').text(t.code);
    $('#resultTypeName').text(t.name);
    $('#resultQuote').text(`"${t.quote}"`);
    $('#resultBadgeIcon').text(t.icon);

    // 핵심 키워드 태그
    const $keywordsWrap = $('#resultKeywords');
    $keywordsWrap.empty();
    t.keywords.forEach(kw => {
      $keywordsWrap.append(`<span class="keyword-tag">#${kw}</span>`);
    });

    // ② 나의 연애 성격 상세 설명
    $('#resultDescription').text(t.description);

    // ③ 애정 표현 방식
    $('#resultExpressionStyle').text(t.expressionStyle);

    // ④ 갈등 상황에서의 행동
    $('#resultConflictStyle').text(t.conflictStyle);

    // ⑤ 연애 강점 (3가지)
    const $strengthsList = $('#resultStrengths');
    $strengthsList.empty();
    t.strengths.forEach(st => {
      $strengthsList.append(`<li><span class="bullet-check">✓</span> ${st}</li>`);
    });

    // ⑥ 주의할 점 (3가지)
    const $weaknessesList = $('#resultWeaknesses');
    $weaknessesList.empty();
    t.weaknesses.forEach(wk => {
      $weaknessesList.append(`<li><span class="bullet-warn">!</span> ${wk}</li>`);
    });

    // ⑦ 관계를 위한 조언
    $('#resultAdvice').text(t.advice);

    // ⑧ 4대 성향 점수 그래프 (가로 진행률 바, 합계 100%)
    $('#scorePercentA').text(`${result.percentages.A}%`);
    $('#scoreBarA').css('width', `${result.percentages.A}%`);
    $('#scoreRawA').text(`${result.scores.A}/20점`);

    $('#scorePercentB').text(`${result.percentages.B}%`);
    $('#scoreBarB').css('width', `${result.percentages.B}%`);
    $('#scoreRawB').text(`${result.scores.B}/20점`);

    $('#scorePercentC').text(`${result.percentages.C}%`);
    $('#scoreBarC').css('width', `${result.percentages.C}%`);
    $('#scoreRawC').text(`${result.scores.C}/20점`);

    $('#scorePercentD').text(`${result.percentages.D}%`);
    $('#scoreBarD').css('width', `${result.percentages.D}%`);
    $('#scoreRawD').text(`${result.scores.D}/20점`);

    // 주성향 & 보조성향 해설 렌더링
    renderTraitExplanations(result.primaryTrait, result.secondaryTrait);

    // ⑨ 잘 맞는 연애 유형 & ⑩ 서로 배려가 필요한 유형
    const $bestList = $('#resultBestMatches').empty();
    t.bestMatches.forEach(name => {
      $bestList.append(`<div class="match-badge match-good">💖 ${name}</div>`);
    });

    const $carefulList = $('#resultCarefulMatches').empty();
    t.carefulMatches.forEach(name => {
      $carefulList.append(`<div class="match-badge match-careful">⚠️ ${name}</div>`);
    });

    // ⑪ 두 사람의 연애 궁합 비교 폼 초기화 (내 유형 자동 선택)
    initCompatibilitySection(result.typeId);
  }

  // 4대 성향 해설 렌더링 (주성향/보조성향 강조)
  function renderTraitExplanations(primary, secondary) {
    const $container = $('#traitExplanationsList').empty();
    const traits = ['A', 'B', 'C', 'D'];

    // 주성향, 보조성향 먼저 배치
    traits.sort((x, y) => {
      if (x === primary) return -1;
      if (y === primary) return 1;
      if (x === secondary) return -1;
      if (y === secondary) return 1;
      return 0;
    });

    traits.forEach(k => {
      const info = TRAIT_EXPLANATIONS[k];
      const isPrimary = (k === primary);
      const isSecondary = (k === secondary);

      let badgeHtml = '';
      if (isPrimary) {
        badgeHtml = '<span class="badge badge-primary">주성향 (1순위)</span>';
      } else if (isSecondary) {
        badgeHtml = '<span class="badge badge-secondary">보조성향 (2순위)</span>';
      }

      const card = $(`
        <div class="trait-card ${isPrimary ? 'highlight-primary' : ''} ${isSecondary ? 'highlight-secondary' : ''}">
          <div class="trait-header">
            <span class="trait-icon">${info.icon}</span>
            <div class="trait-title-wrap">
              <strong class="trait-title">${info.name}</strong>
              <span class="trait-tag">${info.tag}</span>
            </div>
            ${badgeHtml}
          </div>
          <p class="trait-desc">${info.desc}</p>
        </div>
      `);
      $container.append(card);
    });
  }

  // ==========================================================================
  // 9. 연애 궁합 비교 섹션 인터랙티브
  // ==========================================================================
  function initCompatibilitySection(defaultMyTypeId) {
    const $selectMy = $('#compareMyType');
    const $selectPartner = $('#comparePartnerType');

    $selectMy.empty();
    $selectPartner.empty();

    Object.keys(RESULT_TYPES).forEach(key => {
      const item = RESULT_TYPES[key];
      const opt1 = `<option value="${key}">${item.code} - ${item.shortName}</option>`;
      const opt2 = `<option value="${key}">${item.code} - ${item.shortName}</option>`;
      $selectMy.append(opt1);
      $selectPartner.append(opt2);
    });

    if (defaultMyTypeId) {
      $selectMy.val(defaultMyTypeId);
      // 상대방 기본값은 내 유형의 첫 번째 추천 궁합으로 센스있게 자동 선택
      const recShortName = RESULT_TYPES[defaultMyTypeId].bestMatches[0];
      const partnerKey = Object.keys(RESULT_TYPES).find(k => RESULT_TYPES[k].shortName === recShortName) || 'TYPE_04';
      $selectPartner.val(partnerKey);
    }

    // 초기 궁합 1회 자동 계산
    runCompatibilityCheck();
  }

  function runCompatibilityCheck() {
    const myTypeId = $('#compareMyType').val();
    const partnerTypeId = $('#comparePartnerType').val();

    const comp = getCompatibility(myTypeId, partnerTypeId);
    if (!comp) return;

    $('#compatScore').text(`${comp.score}점`);
    $('#compatScoreBar').css('width', `${comp.score}%`);
    $('#compatHeadline').text(comp.headline);

    $('#compatType1Name').text(`${comp.type1.code} ${comp.type1.shortName}`);
    $('#compatType2Name').text(`${comp.type2.code} ${comp.type2.shortName}`);

    const $goodList = $('#compatGoodPoints').empty();
    comp.goodPoints.forEach(p => $goodList.append(`<li>${p}</li>`));

    const $careList = $('#compatCarefulPoints').empty();
    comp.carefulPoints.forEach(p => $careList.append(`<li>${p}</li>`));

    const $advList = $('#compatAdvices').empty();
    comp.advices.forEach(p => $advList.append(`<li>${p}</li>`));

    $('#compatibilityResultCard').hide().fadeIn(300);
  }

  // ==========================================================================
  // 10. Canvas API 기반 1080x1350px 고해상도 결과 PNG 이미지 저장 (섹션 12)
  // ==========================================================================
  function downloadResultImage() {
    if (!currentResult) {
      alert('저장할 검사 결과가 없습니다.');
      return;
    }

    const t = currentResult.typeData;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');

    // 1) 배경 그라데이션 (프리미엄 딥 다크/인디고 그라데이션)
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e1b4b');
    bgGrad.addColorStop(1, '#0b0f19');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1350);

    // 2) 장식용 배경 원형 글로우
    const glow1 = ctx.createRadialGradient(250, 200, 10, 250, 200, 350);
    glow1.addColorStop(0, 'rgba(236, 72, 153, 0.25)');
    glow1.addColorStop(1, 'rgba(236, 72, 153, 0)');
    ctx.fillStyle = glow1;
    ctx.beginPath();
    ctx.arc(250, 200, 350, 0, Math.PI * 2);
    ctx.fill();

    const glow2 = ctx.createRadialGradient(850, 700, 10, 850, 700, 400);
    glow2.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
    glow2.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = glow2;
    ctx.beginPath();
    ctx.arc(850, 700, 400, 0, Math.PI * 2);
    ctx.fill();

    // 3) 카드 외곽 프레임
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    roundRect(ctx, 60, 60, 960, 1230, 32, true, true);

    // 상단 서비스 라벨 & 아이콘
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('💖 1-MIN CHALLENGE · 연애 성향 테스트', 540, 130);

    ctx.font = '36px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('나의 연애 성향은?', 540, 185);

    // 이모지 & 유형 코드
    ctx.font = '80px sans-serif';
    ctx.fillText(t.icon, 540, 290);

    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#a5b4fc';
    ctx.fillText(t.code, 540, 345);

    // 메인 유형 타이틀
    ctx.font = 'bold 54px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(t.name, 540, 420);

    // 대표 한 줄 문구 박스
    ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 140, 460, 800, 64, 16, true, true);

    ctx.font = '500 28px sans-serif';
    ctx.fillStyle = '#fca5a5';
    ctx.fillText(`"${t.quote}"`, 540, 502);

    // 핵심 키워드 뱃지 3개
    const tagY = 570;
    const tagSpacing = 240;
    const tagStartX = 540 - tagSpacing;
    t.keywords.forEach((kw, i) => {
      const cx = tagStartX + (i * tagSpacing);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      roundRect(ctx, cx - 105, tagY, 210, 46, 23, true, false);
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`# ${kw}`, cx, tagY + 31);
    });

    // 상세 성격 설명 박스 (단락 줄바꿈 처리)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    roundRect(ctx, 110, 650, 860, 210, 20, true, true);

    ctx.textAlign = 'left';
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    wrapText(ctx, t.description, 140, 695, 800, 34);

    // 4대 성향 점수 요약 섹션
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('📊 성향 점수 요약 (20문항 비율)', 540, 905);

    const traitsY = 940;
    const barWidth = 190;
    const traitItems = [
      { name: '불안형', val: currentResult.percentages.A, color: '#ec4899' },
      { name: '안정형', val: currentResult.percentages.B, color: '#6366f1' },
      { name: '적극표현', val: currentResult.percentages.C, color: '#ea580c' },
      { name: '회피형', val: currentResult.percentages.D, color: '#0284c7' }
    ];

    traitItems.forEach((tr, i) => {
      const startX = 120 + (i * 215);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      roundRect(ctx, startX, traitsY, barWidth, 100, 14, true, false);

      ctx.textAlign = 'center';
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(tr.name, startX + (barWidth / 2), traitsY + 32);

      ctx.font = 'bold 30px sans-serif';
      ctx.fillStyle = tr.color;
      ctx.fillText(`${tr.val}%`, startX + (barWidth / 2), traitsY + 70);

      // 하단 바
      ctx.fillStyle = tr.color;
      const progressW = (barWidth * (tr.val / 100));
      roundRect(ctx, startX + 15, traitsY + 84, Math.max(8, progressW - 30), 6, 3, true, false);
    });

    // 연애 조언 박스
    ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    roundRect(ctx, 110, 1070, 860, 110, 18, true, true);

    ctx.textAlign = 'left';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#a5b4fc';
    ctx.fillText('💡 연애 꿀팁 조언', 140, 1105);

    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#e2e8f0';
    wrapText(ctx, t.advice, 140, 1140, 800, 28);

    // 하단 푸터 워터마크
    ctx.textAlign = 'center';
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('1-Min Challenge Lab · https://github.com/shiftup03/ad-site', 540, 1240);

    // 실제 다운로드 실행
    try {
      const link = document.createElement('a');
      link.download = `연애성향테스트_${t.shortName}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert('이미지 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  // 캔버스 라운드 사각형 헬퍼
  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // 캔버스 긴 텍스트 자동 줄바꿈 헬퍼
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split('');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  // ==========================================================================
  // 11. 로컬스토리지 이전 결과 보관 & 복원 기능 (섹션 13)
  // ==========================================================================
  function getHistoryList() {
    try {
      const json = localStorage.getItem(STORAGE_KEY_HISTORY);
      return json ? JSON.parse(json) : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(result) {
    try {
      const list = getHistoryList();
      const historyItem = {
        id: Date.now(),
        date: new Date().toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        typeId: result.typeId,
        typeName: result.typeData.name,
        shortName: result.typeData.shortName,
        icon: result.typeData.icon,
        scores: result.scores,
        percentages: result.percentages,
        answers: result.answers
      };

      list.unshift(historyItem);
      // 최대 10개 유지
      if (list.length > 10) {
        list.splice(10);
      }

      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(list));
      updateHistoryBadge();
    } catch (e) {
      console.warn('기록 저장 실패:', e);
    }
  }

  function deleteHistory() {
    if (confirm('저장된 이전 검사 기록을 모두 삭제하시겠습니까?\n삭제 후에는 복원할 수 없습니다.')) {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      renderHistoryModal();
      updateHistoryBadge();
      alert('이전 결과 기록이 모두 삭제되었습니다.');
    }
  }

  function updateHistoryBadge() {
    const list = getHistoryList();
    const count = list.length;
    if (count > 0) {
      $('#historyCountBadge').text(count).show();
    } else {
      $('#historyCountBadge').hide();
    }
  }

  function renderHistoryModal() {
    const list = getHistoryList();
    const $listWrap = $('#historyListWrapper').empty();

    if (list.length === 0) {
      $listWrap.html(`
        <div class="empty-history-notice">
          <p class="empty-icon">📂</p>
          <p class="empty-text">저장된 이전 검사 결과가 없습니다.</p>
          <p class="empty-sub">테스트를 완료하면 최근 10개까지 자동으로 이곳에 보관됩니다.</p>
        </div>
      `);
      $('#clearHistoryBtn').hide();
      return;
    }

    $('#clearHistoryBtn').show();

    list.forEach((item, idx) => {
      const $card = $(`
        <div class="history-item-card" data-history-id="${item.id}">
          <div class="history-card-header">
            <span class="history-card-icon">${item.icon}</span>
            <div class="history-card-info">
              <strong class="history-type-title">${item.typeName}</strong>
              <span class="history-date">${item.date}</span>
            </div>
            <button type="button" class="btn btn-outline btn-xs view-history-btn" data-index="${idx}">
              상세보기 →
            </button>
          </div>
          <div class="history-mini-scores">
            <span>불안 ${item.percentages.A}%</span>
            <span>안정 ${item.percentages.B}%</span>
            <span>적극 ${item.percentages.C}%</span>
            <span>회피 ${item.percentages.D}%</span>
          </div>
        </div>
      `);
      $listWrap.append($card);
    });
  }

  function viewHistoryItem(index) {
    const list = getHistoryList();
    const item = list[index];
    if (!item) return;

    // 해당 답변으로 결과 재구성
    const result = calculateResult(item.answers);
    currentResult = result;

    $('#historyModal').fadeOut(200);
    renderResultView(result);
    showStage('result');
  }

  // ==========================================================================
  // 12. 테스트 이어하기 (새로고침 복원용 임시 저장)
  // ==========================================================================
  function saveProgress() {
    try {
      const progressData = {
        currentIndex: currentQuestionIndex,
        answers: userAnswers,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progressData));
    } catch (e) {}
  }

  function clearProgress() {
    localStorage.removeItem(STORAGE_KEY_PROGRESS);
  }

  function checkResumeProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (!raw) return;

      const data = JSON.parse(raw);
      // 유효한 진행 데이터인지 확인 (최소 1개 이상 답변)
      const answeredCount = data.answers.filter(a => a !== null).length;
      if (answeredCount > 0 && answeredCount < 20) {
        $('#resumeBanner').fadeIn(300);
        $('#resumeNoticeText').text(`이전에 ${answeredCount}번 질문까지 풀던 기록이 있습니다.`);
      }
    } catch (e) {}
  }

  function resumeTest() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (!raw) return;
      const data = JSON.parse(raw);
      userAnswers = data.answers || new Array(20).fill(null);
      const nextIdx = Math.min(19, data.currentIndex || 0);

      $('#resumeBanner').hide();
      showStage('quiz');
      renderQuestion(nextIdx);
    } catch (e) {
      startNewTest();
    }
  }

  function startNewTest() {
    clearProgress();
    $('#resumeBanner').hide();
    currentQuestionIndex = 0;
    userAnswers = new Array(20).fill(null);
    currentResult = null;
    showStage('quiz');
    renderQuestion(0);
  }

  // ==========================================================================
  // 13. 이벤트 바인딩 및 DOM 초기화
  // ==========================================================================
  function initEvents() {
    // [테스트 시작하기]
    $(document).on('click', '#startTestBtn', function () {
      startNewTest();
    });

    // 이어하기 배너 버튼
    $(document).on('click', '#resumeTestBtn', function () {
      resumeTest();
    });
    $(document).on('click', '#dismissResumeBtn', function () {
      clearProgress();
      $('#resumeBanner').fadeOut(200);
    });

    // 선택지 클릭
    $(document).on('click', '.option-btn', function () {
      const trait = $(this).data('trait');
      handleSelectOption(trait);
    });

    // [이전 질문]
    $(document).on('click', '#prevQuestionBtn', function () {
      if (currentQuestionIndex > 0) {
        renderQuestion(currentQuestionIndex - 1);
      }
    });

    // [다음 질문 / 분석하기]
    $(document).on('click', '#nextQuestionBtn', function () {
      if (!userAnswers[currentQuestionIndex]) {
        alert('선택지를 골라주세요.');
        return;
      }
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        renderQuestion(currentQuestionIndex + 1);
      } else {
        finishTest();
      }
    });

    // [다시 테스트하기]
    $(document).on('click', '.restart-test-btn', function () {
      if (confirm('테스트를 처음부터 다시 시작하시겠습니까?')) {
        startNewTest();
      }
    });

    // [결과 이미지 저장] (Canvas PNG)
    $(document).on('click', '#downloadImageBtn', function () {
      downloadResultImage();
    });

    // [우리 궁합 알아보기]
    $(document).on('click', '#runCompatBtn', function () {
      runCompatibilityCheck();
    });

    // 궁합 셀렉트박스 변경 시 즉시 재계산
    $(document).on('change', '#compareMyType, #comparePartnerType', function () {
      runCompatibilityCheck();
    });

    // [이전 결과 모달 열기]
    $(document).on('click', '#openHistoryBtn, #openHistoryFromIntroBtn', function () {
      renderHistoryModal();
      $('#historyModal').fadeIn(200);
    });

    // [이전 결과 모달 닫기]
    $(document).on('click', '#closeHistoryModalBtn, .modal-backdrop-close', function () {
      $('#historyModal').fadeOut(200);
    });

    // 이전 결과 항목 상세보기 클릭
    $(document).on('click', '.view-history-btn', function () {
      const idx = $(this).data('index');
      viewHistoryItem(idx);
    });

    // 이전 결과 전체 삭제
    $(document).on('click', '#clearHistoryBtn', function () {
      deleteHistory();
    });
  }

  // ==========================================================================
  // 14. 페이지 로드 초기화
  // ==========================================================================
  $(document).ready(function () {
    initEvents();
    updateHistoryBadge();
    checkResumeProgress();
  });

})(jQuery);
