/**
 * ========================================================
 * 무료 이력서 및 자기소개서 스마트 빌더 (resume-builder.js)
 * 실시간 A4 미리보기, 한국어 맞춤법·반복표현 검사, PDF 인쇄 엔진
 * ========================================================
 */

(function ($) {
  'use strict';

  // 1. 저장소 키
  const STORAGE_KEYS = {
    AUTOSAVE: 'challenge_1min_resume_autosave',
    DOCUMENTS: 'challenge_1min_resume_documents'
  };

  // 2. 전역 애플리케이션 상태 (Global State)
  const appState = {
    mode: 'resume', // 'resume' | 'cover-letter'
    zoom: 1.0,

    // 서식 설정
    format: {
      fontFamily: "'Noto Sans KR', sans-serif",
      fontSize: '11pt',
      lineHeight: '1.6',
      margin: 'normal' // 'compact' | 'normal' | 'wide'
    },

    // 이력서 데이터
    resume: {
      template: 't1', // 't1' ~ 't5'
      info: {
        name: '김민수',
        nameEn: 'MINSU KIM',
        targetField: 'IT 서비스 / 프로덕트 디자인',
        targetRole: 'UI/UX 디자이너 & 기획자',
        email: 'minsu.kim@example.com',
        phone: '010-1234-5678',
        address: '서울특별시 강남구 테헤란로 152',
        portfolio: 'https://minsu-portfolio.com',
        website: 'https://github.com/minsu-design',
        photoDataUrl: null
      },
      education: [
        {
          id: 'edu_1',
          school: '한국대학교',
          major: '시각디자인학과 / 컴퓨터공학 부전공',
          degree: '대학교(4년제)',
          startDate: '2019.03',
          endDate: '2023.02',
          status: '졸업',
          gpa: '3.92 / 4.5',
          notes: '우등 졸업'
        }
      ],
      experience: [
        {
          id: 'exp_1',
          company: '넥스트 크리에이티브',
          dept: '디자인 혁신팀',
          role: 'UI/UX 디자이너 (선임)',
          startDate: '2023.03',
          endDate: '',
          isCurrent: true,
          tasks: 'B2B SaaS 프로덕트 웹/앱 디자인 시스템 구축\n사용자 인터뷰 및 정량적 데이터 기반 UX 흐름 개선',
          achievements: '온보딩 완료율 28% 개선 달성\n디자인 컴포넌트 라이브러리 제작으로 프론트 협업 속도 40% 단축'
        }
      ],
      projects: [
        {
          id: 'proj_1',
          title: '스마트 업무 협업 플랫폼 UX 리디자인',
          period: '2023.08 ~ 2024.01',
          role: 'UI/UX 디자인 총괄 리드',
          tech: 'Figma, HTML5, CSS3, Google Analytics',
          desc: '기존 복잡한 메뉴 구조를 단순화하고 직관적인 대시보드 위젯 시스템을 신규 설계했습니다.',
          achievements: '월간 활성 사용자(MAU) 35% 증가\n사용자 작업 도달 클릭 수 평균 5.2회에서 2.8회로 단축',
          link: 'https://minsu-portfolio.com/project-saas'
        }
      ],
      certs: [
        {
          id: 'cert_1',
          name: '정보처리기사',
          issuer: '한국산업인력공단',
          date: '2023.06',
          certNo: '23201004123'
        },
        {
          id: 'cert_2',
          name: '웹디자인기능사',
          issuer: '한국산업인력공단',
          date: '2022.09',
          certNo: '22401005871'
        }
      ],
      languages: [
        {
          id: 'lang_1',
          language: '영어',
          testName: 'TOEIC',
          score: '915점',
          date: '2024.03'
        },
        {
          id: 'lang_2',
          language: '영어',
          testName: 'TOEIC Speaking',
          score: 'AL (Advanced Low)',
          date: '2024.04'
        }
      ],
      skills: [
        { id: 'sk_1', name: 'Figma / UI Design' },
        { id: 'sk_2', name: 'HTML5 & CSS3' },
        { id: 'sk_3', name: 'JavaScript & jQuery' },
        { id: 'sk_4', name: '디자인 시스템 구축' },
        { id: 'sk_5', name: '사용자 데이터 분석 (GA)' },
        { id: 'sk_6', name: '애자일 협업 (Jira)' }
      ]
    },

    // 자기소개서 데이터
    coverLetter: {
      template: 't1', // 't1' ~ 't3'
      docTitle: '[UI/UX 디자이너] 김민수 입사지원 자기소개서',
      authorName: '김민수',
      items: [
        {
          id: 'cl_item_1',
          title: '1. 지원동기',
          targetLimit: 700,
          content: '사용자의 일상에 실질적인 가치를 더하는 디지털 프로덕트를 만드는 것이 제 오랜 목표였습니다. 귀사는 혁신적인 기술력과 사용자 중심의 사고를 바탕으로 업계를 선도해 왔으며, 최근 출시한 서비스에서 보여준 세심한 인터랙션과 직관적인 정보 구조는 깊은 인상을 주었습니다.\n\n저는 이전 프로젝트에서 디자인 시스템을 구축하고 온보딩 전환율을 28% 개선하며, 디자인이 단순한 시각적 요소를 넘어 비즈니스 지표를 견인하는 핵심 동력임을 입증했습니다. 제가 쌓아온 데이터 기반 UX 설계 역량과 프론트엔드에 대한 높은 이해도를 바탕으로 귀사의 서비스가 글로벌 사용자에게 최고의 사용 경험을 전달할 수 있도록 기여하고자 지원했습니다.',
          guide: '회사와 직무에 관심을 갖게 된 계기, 관련 경험, 해당 직무에서 기여할 수 있는 부분을 중심으로 작성해보세요.'
        },
        {
          id: 'cl_item_2',
          title: '2. 직무 관련 핵심 역량 및 주요 성과',
          targetLimit: 800,
          content: '제 가장 큰 경쟁력은 "데이터와 사용자 관점에서 문제를 정의하고 해결하는 문제 해결 역량"입니다.\n\n협업 플랫폼 UX 리디자인 프로젝트 당시, 사용자들이 복잡한 메뉴 단계로 인해 핵심 기능 도달 전 이탈하는 문제점을 발견했습니다. 이를 해결하기 위해 총 24회의 사용자 인터뷰와 퍼널 분석을 진행하여 주요 병목 구간을 수치화했습니다. 이후 3단계로 분산되어 있던 결제 및 업무 등록 동선을 단일 모달 위젯으로 개편했습니다.\n\n그 결과 월간 활성 사용자(MAU)가 35% 증가하고, 목표 작업 도달 클릭 수를 5.2회에서 2.8회로 대폭 단축하는 성과를 거두었습니다. 저는 주관적인 느낌이 아닌 검증 가능한 성과로 말하는 디자이너입니다.',
          guide: '해당 직무에 필요한 기술과 역량을 어떤 구체적 경험과 정량적 성과를 통해 쌓았는지 작성해보세요.'
        },
        {
          id: 'cl_item_3',
          title: '3. 협업 및 갈등 해결 경험',
          targetLimit: 700,
          content: '새로운 디자인 시스템을 도입하는 과정에서 개발팀과의 우선순위 충돌이 발생한 적이 있습니다. 개발팀은 기존 레거시 코드 개편의 부담을 이유로 도입 연기를 원했고, 디자인팀은 컴포넌트 일관성을 위해 즉각 적용을 요구했습니다.\n\n저는 양측의 입장을 조율하기 위해 "단계적 점진 도입 로드맵"을 제안했습니다. 가장 사용 빈도가 높고 구현 난이도가 낮은 버튼 및 입력 폼 컴포넌트 15종을 1단계 파일럿으로 선정하여 우선 적용했습니다. 이를 통해 개발팀의 작업 공수가 실제로 2주 만에 30% 절감되는 효과를 증명했고, 개발진의 자발적인 참여를 이끌어내어 최종적으로 80여 개 컴포넌트 전환을 성공적으로 마쳤습니다.',
          guide: '함께 해결해야 했던 문제, 자신의 역할, 협업 과정, 결과를 중심으로 작성해보세요.'
        },
        {
          id: 'cl_item_4',
          title: '4. 입사 후 포부 및 성장 로드맵',
          targetLimit: 600,
          content: '입사 후 1년 차에는 귀사의 기존 프로덕트 구조와 디자인 시스템을 완벽히 숙지하고, 스프린트 업무에 기여하며 디자인 부채(Design Debt)를 0으로 만드는 데 집중하겠습니다.\n\n3년 차에는 신규 기능 론칭 시 A/B 테스트와 정량 데이터 분석을 디자인 프로세스에 완전히 정착시켜, 직관이 아닌 데이터에 기반한 고효율 디자인 문화를 팀 내에 확산시키겠습니다. 궁극적으로는 귀사 프로덕트가 아시아를 넘어 글로벌 무대에서도 "가장 쓰기 편한 표준 서비스"로 인정받는 데 중추적인 역할을 하겠습니다.',
          guide: '입사 후 수행하고 싶은 역할과 현실적인 성장 목표를 구체적으로 작성해보세요.'
        }
      ]
    }
  };

  // 3. 한국어 실시간 맞춤법 및 문법 검사 사전 데이터 (브라우저 로컬 엔진)
  const PROOFREAD_RULES = [
    // [맞춤법] 혼동하기 쉬운 대표 어휘
    { pattern: /몇\s*일/g, replacement: '며칠', desc: "'몇 일'은 없는 말이며 '며칠'이 올바른 표준어입니다.", type: 'spell' },
    { pattern: /금새/g, replacement: '금세', desc: "'금시에'가 줄어든 말이므로 '금세'가 맞습니다.", type: 'spell' },
    { pattern: /안\s*되요/g, replacement: '안 돼요', desc: "'되-' 뒤에 '-어'가 결합한 형태는 '돼'가 올바릅니다.", type: 'spell' },
    { pattern: /되서/g, replacement: '돼서', desc: "'되어서'의 준말은 '돼서'입니다.", type: 'spell' },
    { pattern: /되야/g, replacement: '돼야', desc: "'되어야'의 준말은 '돼야'입니다.", type: 'spell' },
    { pattern: /않\s*하고/g, replacement: '안 하고', desc: "'아니'의 준말인 부사는 '안'입니다.", type: 'spell' },
    { pattern: /하지\s*안[고는은]/g, replacement: '하지 않', desc: "'아니하다'의 보조용언 준말은 '않'입니다.", type: 'spell' },
    { pattern: /왠일/g, replacement: '웬일', desc: "'어찌 된 일'의 뜻을 가진 관형사는 '웬일'입니다.", type: 'spell' },
    { pattern: /왠만/g, replacement: '웬만', desc: "'정도나 형편이 표준에 가깝다'는 '웬만하다'입니다.", type: 'spell' },
    { pattern: /어의\s*없/g, replacement: '어이없', desc: "'어처구니가 없다'의 표준어는 '어이없다'입니다.", type: 'spell' },
    { pattern: /문안\s*하/g, replacement: '무난하', desc: "'별다른 흠이나 어려움이 없다'는 '무난하다'입니다.", type: 'spell' },
    { pattern: /희안\s*하/g, replacement: '희한하', desc: "'매우 드물거나 신기하다'는 '희한하다'입니다.", type: 'spell' },
    { pattern: /일부려/g, replacement: '일부러', desc: "'일부러'가 표준어입니다.", type: 'spell' },
    { pattern: /통채로/g, replacement: '통째로', desc: "'나누지 않고 덩어리째'는 '통째로'가 맞습니다.", type: 'spell' },
    { pattern: /설레임/g, replacement: '설렘', desc: "'설레다'의 명사형은 '설렘'입니다.", type: 'spell' },
    { pattern: /바램/g, replacement: '바람', desc: "'바라다'의 명사형은 '바람'입니다.", type: 'spell' },
    { pattern: /인권비/g, replacement: '인건비', desc: "'사람을 쓰는 데 드는 비용'은 '인건비'입니다.", type: 'spell' },
    { pattern: /역활/g, replacement: '역할', desc: "'자기가 마땅히 하여야 할 직책'은 '역할'입니다.", type: 'spell' },
    { pattern: /어떻해/g, replacement: '어떡해', desc: "'어떻게 해'의 준말은 '어떡해'입니다.", type: 'spell' },
    { pattern: /서류를\s*결제/g, replacement: '서류를 결재', desc: "상사에게 안건을 승인받을 때는 '결재'를 씁니다.", type: 'spell' },
    { pattern: /대금을\s*결재/g, replacement: '대금을 결제', desc: "대금을 치르거나 지불할 때는 '결제'를 씁니다.", type: 'spell' },
    { pattern: /정답을\s*맞추/g, replacement: '정답을 맞히', desc: "답이나 문제를 옳게 알아맞힐 때는 '맞히다'가 맞습니다.", type: 'spell' },

    // [띄어쓰기 & 공백]
    { pattern: /[ ]{2,}/g, replacement: ' ', desc: '불필요한 연속 공백이 있습니다. 1칸 띄어쓰기로 정돈하세요.', type: 'space' },
    { pattern: /\.\.{2,}/g, replacement: '...', desc: '말줄임표는 마침표 3개(...)를 사용하는 것이 정돈되어 보입니다.', type: 'space' },
    { pattern: /[!]{2,}/g, replacement: '!', desc: '공식 입사지원서에서 과도한 느낌표 중복은 지양하는 것이 좋습니다.', type: 'space' },
    { pattern: /[?]{2,}/g, replacement: '?', desc: '물음표 중복은 지양하는 것이 좋습니다.', type: 'space' },
    { pattern: /~{2,}/g, replacement: '~', desc: '공식 문서에서 물결표 중복은 정돈된 느낌을 해칩니다.', type: 'space' }
  ];

  // 자주 반복되는 자소서 상투어 목록
  const REPETITION_KEYWORDS = [
    { word: '저는', limit: 3, advice: "'저는'으로 시작하는 문장이 많으면 산만해 보입니다. 주어를 생략하고 서술해보세요." },
    { word: '노력했습니다', limit: 3, advice: "'노력했습니다'가 자주 반복됩니다. '구축했습니다', '분석했습니다' 등 구체적 행동 동사로 바꿔보세요." },
    { word: '다양한', limit: 3, advice: "'다양한' 수식어 대신 구체적인 개수나 분야 명칭을 적어 신뢰도를 높이세요." },
    { word: '경험을 통해', limit: 2, advice: "'경험을 통해' 대신 어떤 상황과 과제였는지 구체적으로 명시해보세요." },
    { word: '성장했습니다', limit: 3, advice: "'성장했습니다' 대신 어떤 역량을 어떻게 발휘할 수 있게 되었는지 성과로 표현해보세요." },
    { word: '열심히', limit: 3, advice: "'열심히'라는 추상적 부사보다 투입한 시간, 기간, 방법론을 서술하세요." },
    { word: '최선을 다해', limit: 2, advice: "'최선을 다해' 대신 실제 실행한 업무 절차나 개선 방안을 서술해보세요." },
    { word: '많은 것을', limit: 2, advice: "'많은 것'이 구체적으로 어떤 실무 지식이나 교훈인지 명시하세요." }
  ];

  // 4. 글자수 및 바이트 계산기
  function calculateTextStats(text) {
    if (!text) text = '';
    const charWithSpace = text.length;
    const charNoSpace = text.replace(/\s/g, '').length;
    const utf8Bytes = new Blob([text]).size;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    return {
      charWithSpace,
      charNoSpace,
      utf8Bytes,
      words
    };
  }

  // 한글 자모 합성 헬퍼 (분리된 자음/모음 오타 복원용)
  const HANGUL_CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const HANGUL_JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const HANGUL_JONG = ['', 'ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

  function composeJamos(str) {
    const jamos = str.replace(/\s+/g, '');
    let result = '';
    let i = 0;
    let composedAny = false;
    while (i < jamos.length) {
      const c1 = jamos[i];
      const c2 = jamos[i + 1];
      const c3 = jamos[i + 2];
      const c4 = jamos[i + 3];

      const l = HANGUL_CHO.indexOf(c1);
      const v = HANGUL_JUNG.indexOf(c2);

      if (l !== -1 && v !== -1) {
        let t = 0;
        let advance = 2;
        if (c3 && HANGUL_JONG.indexOf(c3) !== -1) {
          if (c4 && HANGUL_JUNG.indexOf(c4) !== -1) {
            t = 0;
            advance = 2;
          } else {
            t = HANGUL_JONG.indexOf(c3);
            advance = 3;
          }
        }
        result += String.fromCharCode(0xAC00 + (l * 21 + v) * 28 + t);
        composedAny = true;
        i += advance;
      } else {
        result += c1;
        i++;
      }
    }
    return { composedText: result, composedAny };
  }

  // 5. 한국어 문장 검사 실행기
  function checkTextProofread(text) {
    if (!text || text.trim() === '') return [];
    const issues = [];

    // 1) 사전 기반 규칙 검사
    PROOFREAD_RULES.forEach((rule) => {
      let match;
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      while ((match = regex.exec(text)) !== null) {
        issues.push({
          type: rule.type,
          original: match[0],
          replacement: rule.replacement,
          desc: rule.desc,
          index: match.index
        });
      }
    });

    // 2) 중복 단어 검사 (예: "저는 저는", "프로젝트를 프로젝트를")
    const dupWordRegex = /(?:^|[\s,.\n])([가-힣a-zA-Z0-9]+)\s+\1(?=[\s,.\n]|$)/g;
    let dupMatch;
    while ((dupMatch = dupWordRegex.exec(text)) !== null) {
      const fullMatch = dupMatch[0].trim();
      issues.push({
        type: 'repeat',
        original: fullMatch,
        replacement: dupMatch[1],
        desc: `'${dupMatch[1]}' 단어가 연속으로 중복 입력되었습니다.`,
        index: dupMatch.index
      });
    }

    // 3) 상투어 반복 검사
    REPETITION_KEYWORDS.forEach((item) => {
      const occurrences = (text.match(new RegExp(item.word, 'g')) || []).length;
      if (occurrences >= item.limit) {
        issues.push({
          type: 'repeat',
          original: `'${item.word}' (${occurrences}회 등장)`,
          replacement: '표현 다양화 권장',
          desc: item.advice,
          isAdvisory: true
        });
      }
    });

    // 4) 분리된 자음/모음 오타 검사 (예: ㄱ, ㅏ, ㄴ, ㅕ 또는 ㄱ ㅏ ㄴ ㅕ, ㄷ ㅏ 등)
    const jamoRegex = /[ㄱ-ㅎㅏ-ㅣ]+(?:\s+[ㄱ-ㅎㅏ-ㅣ]+)*/g;
    let jamoMatch;
    while ((jamoMatch = jamoRegex.exec(text)) !== null) {
      const matchedJamo = jamoMatch[0];
      const { composedText, composedAny } = composeJamos(matchedJamo);
      const replacement = composedAny ? composedText : '';
      const desc = composedAny
        ? `'${matchedJamo}' 분리된 자음/모음 오타가 감지되었습니다. 완성형 글자 '${composedText}'(으)로 결합하세요.`
        : `'${matchedJamo}' 불필요한 단독 자음/모음 오타가 감지되었습니다. 올바른 글자로 수정하거나 삭제하세요.`;

      issues.push({
        type: 'spell',
        original: matchedJamo,
        replacement: replacement,
        desc: desc,
        index: jamoMatch.index,
        isAdvisory: false
      });
    }

    // 5) 지나치게 긴 문장 검사 (120자 초과)
    const sentences = text.split(/(?<=[.!?\n])\s+/);
    sentences.forEach((sent) => {
      const trimmed = sent.trim();
      if (trimmed.length > 130) {
        issues.push({
          type: 'long',
          original: trimmed.substring(0, 35) + '...',
          replacement: '2개 이상의 문장으로 분할',
          desc: `한 문장의 길이가 ${trimmed.length}자로 너무 깁니다. 접속사를 활용해 호흡을 나누면 가독성이 대폭 향상됩니다.`,
          isAdvisory: true
        });
      }
    });

    return issues;
  }

  // 6. 실시간 A4 미리보기 렌더링 엔진
  let renderTimer = null;

  function renderPreview() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => {
      const $target = $('#renderedDocContent');
      if (!$target.length) return;

      if (appState.mode === 'resume') {
        $target.html(generateResumeHtml());
      } else {
        $target.html(generateCoverLetterHtml());
      }

      applyFormatStyles();
      checkA4PageOverflow();
      triggerAutoSave();
    }, 25);
  }

  // 이력서 HTML 생성기 (5종 템플릿 대응)
  function generateResumeHtml() {
    const r = appState.resume;
    const info = r.info;
    const tpl = r.template || 't1';

    let photoHtml = '';
    if (info.photoDataUrl) {
      photoHtml = `<img src="${info.photoDataUrl}" alt="${escapeHtml(info.name)} 증명사진">`;
    }

    // 학력 HTML
    let eduHtml = '';
    if (r.education && r.education.length > 0) {
      eduHtml = `
      <section class="res-section">
        <div class="res-sec-head">학력 사항</div>
        <div class="res-sec-body">
          ${r.education.map(e => `
            <div class="res-entry-block">
              <div class="res-entry-head">
                <span>${escapeHtml(e.school || '')} ${escapeHtml(e.major ? '(' + e.major + ')' : '')}</span>
                <span>${escapeHtml(e.startDate || '')} ~ ${escapeHtml(e.endDate || '')} [${escapeHtml(e.status || '')}]</span>
              </div>
              ${e.gpa || e.notes ? `<div class="res-entry-sub">학점: ${escapeHtml(e.gpa || '-')} ${e.notes ? '| ' + escapeHtml(e.notes) : ''}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </section>`;
    }

    // 경력 HTML
    let expHtml = '';
    if (r.experience && r.experience.length > 0) {
      expHtml = `
      <section class="res-section">
        <div class="res-sec-head">경력 사항</div>
        <div class="res-sec-body">
          ${r.experience.map(exp => `
            <div class="res-entry-block">
              <div class="res-entry-head">
                <span><strong>${escapeHtml(exp.company || '')}</strong> ${exp.dept ? '· ' + escapeHtml(exp.dept) : ''} [${escapeHtml(exp.role || '')}]</span>
                <span>${escapeHtml(exp.startDate || '')} ~ ${exp.isCurrent ? '재직 중' : escapeHtml(exp.endDate || '')}</span>
              </div>
              ${exp.tasks ? `<div class="res-entry-desc"><strong>담당 업무:</strong>\n${escapeHtml(exp.tasks)}</div>` : ''}
              ${exp.achievements ? `<div class="res-entry-desc" style="margin-top:4px;"><strong>주요 성과:</strong>\n${escapeHtml(exp.achievements)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </section>`;
    }

    // 프로젝트 HTML
    let projHtml = '';
    if (r.projects && r.projects.length > 0) {
      projHtml = `
      <section class="res-section">
        <div class="res-sec-head">프로젝트 및 활동 경험</div>
        <div class="res-sec-body">
          ${r.projects.map(p => `
            <div class="res-entry-block">
              <div class="res-entry-head">
                <span><strong>${escapeHtml(p.title || '')}</strong> ${p.role ? '(' + escapeHtml(p.role) + ')' : ''}</span>
                <span>${escapeHtml(p.period || '')}</span>
              </div>
              ${p.tech ? `<div class="res-entry-sub">기술스택/도구: ${escapeHtml(p.tech)}</div>` : ''}
              ${p.desc ? `<div class="res-entry-desc">${escapeHtml(p.desc)}</div>` : ''}
              ${p.achievements ? `<div class="res-entry-desc" style="margin-top:4px;">${escapeHtml(p.achievements)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </section>`;
    }

    // 자격증 & 어학 HTML
    let certLangHtml = '';
    const hasCerts = r.certs && r.certs.length > 0;
    const hasLangs = r.languages && r.languages.length > 0;
    if (hasCerts || hasLangs) {
      certLangHtml = `
      <section class="res-section">
        <div class="res-sec-head">자격증 및 어학 능력</div>
        <div class="res-sec-body">
          <table class="res-data-table">
            <tbody>
              ${hasCerts ? r.certs.map(c => `
                <tr>
                  <th>자격증</th>
                  <td><strong>${escapeHtml(c.name)}</strong> (${escapeHtml(c.issuer || '-')})</td>
                  <td style="text-align:right;">${escapeHtml(c.date || '')}</td>
                </tr>
              `).join('') : ''}
              ${hasLangs ? r.languages.map(l => `
                <tr>
                  <th>어학</th>
                  <td><strong>${escapeHtml(l.language)}: ${escapeHtml(l.testName)}</strong> (${escapeHtml(l.score)})</td>
                  <td style="text-align:right;">${escapeHtml(l.date || '')}</td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>
        </div>
      </section>`;
    }

    // 기술 역량 HTML
    let skillsHtml = '';
    if (r.skills && r.skills.length > 0) {
      skillsHtml = `
      <section class="res-section">
        <div class="res-sec-head">기술 및 핵심 역량</div>
        <div class="res-sec-body" style="display:flex; flex-wrap:wrap; gap:6px;">
          ${r.skills.map(s => `<span class="pill-chip" style="font-size:9pt; background:#f1f5f9; padding:2px 8px;">${escapeHtml(s.name)}</span>`).join('')}
        </div>
      </section>`;
    }

    // 템플릿별 래퍼 조립
    if (tpl === 't2') {
      // T2: 모던 사이드바형
      return `
      <div class="res-tpl-t2">
        <aside class="res-sidebar">
          ${photoHtml ? `<div class="res-sidebar-photo">${photoHtml}</div>` : ''}
          <div class="sidebar-sec-title">연락처</div>
          <div style="font-size:9pt; line-height:1.6; color:#334155;">
            <div>📞 ${escapeHtml(info.phone || '')}</div>
            <div>✉️ ${escapeHtml(info.email || '')}</div>
            <div>📍 ${escapeHtml(info.address || '')}</div>
            ${info.portfolio ? `<div>🌐 <a href="${escapeHtml(info.portfolio)}" target="_blank" style="color:#2563eb;">포트폴리오</a></div>` : ''}
          </div>
          ${skillsHtml}
        </aside>
        <main class="res-main-col">
          <div class="res-main-head">
            <h1>${escapeHtml(info.name)} <small style="font-size:12pt; color:#64748b;">${escapeHtml(info.nameEn || '')}</small></h1>
            <div class="target-role-badge">${escapeHtml(info.targetRole || info.targetField || '입사지원자')}</div>
          </div>
          ${expHtml}
          ${projHtml}
          ${eduHtml}
          ${certLangHtml}
        </main>
      </div>`;
    }

    // T1, T3, T4, T5 (표준/경력/신입/미니멀)
    return `
    <div class="res-tpl-t1 res-tpl-${tpl}">
      <table class="res-header-table">
        <tr>
          ${photoHtml ? `<td class="res-photo-cell">${photoHtml}</td>` : ''}
          <td class="res-title-cell">
            <h1>${escapeHtml(info.name)} <span class="res-en">${escapeHtml(info.nameEn || '')}</span></h1>
            <div style="font-size:12pt; font-weight:700; color:#2563eb; margin-top:2px;">
              ${escapeHtml(info.targetField || '')} ${info.targetRole ? ' · ' + escapeHtml(info.targetRole) : ''}
            </div>
            <div class="res-meta-line">
              연락처: ${escapeHtml(info.phone || '')} | 이메일: ${escapeHtml(info.email || '')} | 주소: ${escapeHtml(info.address || '')}
              ${info.portfolio ? `<br>포트폴리오: <a href="${escapeHtml(info.portfolio)}" target="_blank" style="color:#2563eb;">${escapeHtml(info.portfolio)}</a>` : ''}
            </div>
          </td>
        </tr>
      </table>

      ${tpl === 't4' ? eduHtml + projHtml + expHtml : expHtml + projHtml + eduHtml}
      ${certLangHtml}
      ${skillsHtml}
    </div>`;
  }

  // 자기소개서 HTML 생성기 (3종 템플릿 대응)
  function generateCoverLetterHtml() {
    const cl = appState.coverLetter;
    const tpl = cl.template || 't1';

    return `
    <div class="cl-tpl-${tpl}">
      <header class="cl-doc-header">
        <h1>${escapeHtml(cl.docTitle || '자기소개서')}</h1>
        <div class="cl-author-info">
          작성자: <strong>${escapeHtml(cl.authorName || '지원자')}</strong> | 제출일: ${new Date().toLocaleDateString('ko-KR')}
        </div>
      </header>

      <main class="cl-doc-body">
        ${cl.items.map(item => `
          <section class="cl-section">
            <h3 class="cl-section-q">${escapeHtml(item.title)}</h3>
            <div class="cl-section-a">${escapeHtml(item.content || '')}</div>
          </section>
        `).join('')}
      </main>
    </div>`;
  }

  // 서식 스타일 (글꼴, 글자크기, 줄간격, 여백) 주입
  function applyFormatStyles() {
    const $sheet = $('#a4Sheet');
    const f = appState.format;

    $sheet.css({
      fontFamily: f.fontFamily,
      fontSize: f.fontSize,
      lineHeight: f.lineHeight
    });

    // 자기소개서 본문 답변 문단에 폰트 크기 및 줄간격 직접 반영
    $('.cl-section-a').css({
      fontSize: f.fontSize,
      lineHeight: f.lineHeight
    });

    // 자기소개서 작성 편집창 텍스트에어리어에도 글자크기 연동 반영
    $('.cl-textarea').css({
      fontSize: f.fontSize,
      lineHeight: f.lineHeight
    });

    if (f.margin === 'compact') {
      $sheet.css('padding', '10mm 12mm');
    } else if (f.margin === 'wide') {
      $sheet.css('padding', '20mm 22mm');
    } else {
      $sheet.css('padding', '18mm 18mm');
    }
  }

  // A4 높이 초과 여부 측정 및 페이지 카운터 업데이트
  function checkA4PageOverflow() {
    const sheetEl = document.getElementById('a4Sheet');
    if (!sheetEl) return;

    // 297mm는 96DPI 기준 약 1122.5px
    const a4HeightPx = 1122;
    const scrollH = sheetEl.scrollHeight;
    const pages = Math.ceil(scrollH / a4HeightPx);

    $('#docPageCounter').text(`A4 약 ${pages}페이지 분량`);
  }

  // 7. 실시간 문장 검사기 UI 렌더링
  function runProofreadingForItem(itemId) {
    const item = appState.coverLetter.items.find(it => it.id === itemId);
    if (!item) return;

    const $box = $(`#proofreadBox_${itemId}`);
    if (!$box.length) return;

    const issues = checkTextProofread(item.content);
    const count = issues.length;

    // 카운트 배지
    const $countPill = $box.find('.proofread-count-pill');
    if (count > 0) {
      $countPill.removeClass('count-pill-clean').addClass('count-pill-has-issues').text(`확인할 항목 ${count}개`);
    } else {
      $countPill.removeClass('count-pill-has-issues').addClass('count-pill-clean').text('✓ 현재 규칙에서 발견된 문제 없음');
    }

    // 이슈 카드 리스트 주입
    const $list = $box.find('.proofread-issues-list');
    $list.empty();

    if (count === 0) {
      $list.html('<p class="text-muted" style="font-size:0.78rem; margin:0.3rem 0 0;">맞춤법 오류나 반복 표현이 감지되지 않았습니다. 매끄럽게 작성되고 있습니다.</p>');
      return;
    }

    issues.forEach((issue, idx) => {
      const typeBadges = {
        spell: '<span class="issue-badge badge-spell">맞춤법</span>',
        repeat: '<span class="issue-badge badge-repeat">반복 표현</span>',
        space: '<span class="issue-badge badge-space">공백/기호</span>',
        long: '<span class="issue-badge badge-long">긴 문장</span>'
      };

      const $card = $(`
        <div class="issue-item-card issue-type-${issue.type}">
          <div class="issue-main-info">
            <div>
              ${typeBadges[issue.type] || ''}
              <span class="issue-diff-text">
                <span class="diff-target">${escapeHtml(issue.original)}</span>
                <span class="diff-arrow">→</span>
                <span class="diff-replacement">${escapeHtml(issue.replacement)}</span>
              </span>
            </div>
            <div class="issue-explanation">${escapeHtml(issue.desc)}</div>
          </div>
          <div class="issue-actions">
            ${!issue.isAdvisory ? `<button type="button" class="btn btn-primary btn-xs btn-apply-fix" data-item-id="${itemId}" data-orig="${escapeAttr(issue.original)}" data-repl="${escapeAttr(issue.replacement)}">수정 적용</button>` : ''}
            <button type="button" class="btn btn-outline btn-xs btn-dismiss-fix">무시</button>
          </div>
        </div>
      `);

      $list.append($card);
    });
  }

  // 8. 자소서 개별 문항 폼 렌더러
  function renderCoverLetterItems() {
    const $container = $('#clItemsContainer');
    $container.empty();

    appState.coverLetter.items.forEach((item, index) => {
      const stats = calculateTextStats(item.content);
      const isOver = item.targetLimit && stats.charWithSpace > item.targetLimit;

      const $itemBox = $(`
        <div class="cl-item-box" data-item-id="${item.id}">
          <div class="cl-item-top">
            <input type="text" class="form-control form-control-sm cl-title-input" value="${escapeAttr(item.title)}" placeholder="문항 제목을 입력하세요">
            <select class="select-sm cl-limit-select">
              <option value="500" ${item.targetLimit === 500 ? 'selected' : ''}>500자 기준</option>
              <option value="700" ${item.targetLimit === 700 ? 'selected' : ''}>700자 기준</option>
              <option value="800" ${item.targetLimit === 800 ? 'selected' : ''}>800자 기준</option>
              <option value="1000" ${item.targetLimit === 1000 ? 'selected' : ''}>1,000자 기준</option>
              <option value="1500" ${item.targetLimit === 1500 ? 'selected' : ''}>1,500자 기준</option>
              <option value="0" ${!item.targetLimit ? 'selected' : ''}>제한 없음</option>
            </select>
            <div class="item-card-tools">
              <button type="button" class="btn-item-tool btn-move-up" title="위로">▲</button>
              <button type="button" class="btn-item-tool btn-move-down" title="아래로">▼</button>
              <button type="button" class="btn-item-tool text-danger btn-del-cl-item" title="문항 삭제">✕</button>
            </div>
          </div>

          <!-- 작성 가이드 아코디언 -->
          ${item.guide ? `
          <details class="cl-guide-collapsible">
            <summary class="cl-guide-summary">💡 작성 팁 보기 (인사담당자 평가 포인트)</summary>
            <div class="cl-guide-content">${escapeHtml(item.guide)}</div>
          </details>` : ''}

          <!-- 본문 작성 텍스트에리어 -->
          <textarea class="cl-textarea" placeholder="여기에 내용을 작성하세요..." style="font-size: ${appState.format.fontSize}; line-height: ${appState.format.lineHeight};">${escapeHtml(item.content || '')}</textarea>

          <!-- 실시간 글자수 & 바이트수 카운터 -->
          <div class="cl-counter-bar">
            <div class="counter-values">
              <span>공백 포함: <strong class="cnt-char-with">${stats.charWithSpace.toLocaleString()}</strong>자</span>
              <span>공백 제외: <strong class="cnt-char-no">${stats.charNoSpace.toLocaleString()}</strong>자</span>
              <span>UTF-8: <strong class="cnt-bytes">${stats.utf8Bytes.toLocaleString()}</strong>bytes</span>
              <span>단어: <strong class="cnt-words">${stats.words}</strong>개</span>
            </div>
            ${isOver ? `<span class="over-limit-badge">⚠️ 설정한 글자수(${item.targetLimit}자)를 초과했습니다.</span>` : ''}
          </div>

          <!-- 실시간 문장 검사 결과 박스 -->
          <div class="proofread-box" id="proofreadBox_${item.id}">
            <div class="proofread-head">
              <span class="proofread-title">🔍 실시간 문장 검사 (오타·맞춤법·반복표현)</span>
              <span class="proofread-count-pill count-pill-clean">검사 대기중</span>
            </div>
            <div class="proofread-issues-list"></div>
          </div>
        </div>
      `);

      $container.append($itemBox);

      // 초기 검사 실행
      runProofreadingForItem(item.id);
    });
  }

  // 9. 이력서 동적 목록들 (학력, 경력, 프로젝트, 자격증, 어학, 스킬) 렌더러
  function renderResumeDynamicLists() {
    // 학력
    const $edu = $('#educationList');
    $edu.empty();
    appState.resume.education.forEach((e, idx) => {
      $edu.append(`
        <div class="dynamic-item-card" data-edu-id="${e.id}">
          <div class="item-card-header">
            <span class="item-index-badge">학력 ${idx + 1}</span>
            <div class="item-card-tools">
              <button type="button" class="btn-item-tool btn-del-edu text-danger">삭제</button>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>학교명</label>
              <input type="text" class="form-control form-control-sm edu-school" value="${escapeAttr(e.school || '')}">
            </div>
            <div class="form-group flex-1">
              <label>전공</label>
              <input type="text" class="form-control form-control-sm edu-major" value="${escapeAttr(e.major || '')}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>학위구분</label>
              <input type="text" class="form-control form-control-sm edu-degree" value="${escapeAttr(e.degree || '대학교(4년제)')}">
            </div>
            <div class="form-group flex-1">
              <label>기간 (입학~졸업)</label>
              <div style="display:flex; gap:4px;">
                <input type="text" class="form-control form-control-sm edu-start" placeholder="2019.03" value="${escapeAttr(e.startDate || '')}">
                <input type="text" class="form-control form-control-sm edu-end" placeholder="2023.02" value="${escapeAttr(e.endDate || '')}">
              </div>
            </div>
            <div class="form-group" style="width:100px;">
              <label>상태</label>
              <select class="form-control form-control-sm edu-status">
                <option value="졸업" ${e.status === '졸업' ? 'selected' : ''}>졸업</option>
                <option value="재학중" ${e.status === '재학중' ? 'selected' : ''}>재학중</option>
                <option value="휴학" ${e.status === '휴학' ? 'selected' : ''}>휴학</option>
                <option value="중퇴" ${e.status === '중퇴' ? 'selected' : ''}>중퇴</option>
              </select>
            </div>
          </div>
        </div>
      `);
    });

    // 경력
    const $exp = $('#experienceList');
    $exp.empty();
    appState.resume.experience.forEach((exp, idx) => {
      $exp.append(`
        <div class="dynamic-item-card" data-exp-id="${exp.id}">
          <div class="item-card-header">
            <span class="item-index-badge">경력 ${idx + 1}</span>
            <div class="item-card-tools">
              <button type="button" class="btn-item-tool btn-del-exp text-danger">삭제</button>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>회사명</label>
              <input type="text" class="form-control form-control-sm exp-company" value="${escapeAttr(exp.company || '')}">
            </div>
            <div class="form-group flex-1">
              <label>부서 및 직책</label>
              <input type="text" class="form-control form-control-sm exp-role" value="${escapeAttr(exp.role || '')}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>근무 기간</label>
              <div style="display:flex; gap:4px; align-items:center;">
                <input type="text" class="form-control form-control-sm exp-start" placeholder="2023.03" value="${escapeAttr(exp.startDate || '')}">
                <span>~</span>
                <input type="text" class="form-control form-control-sm exp-end" placeholder="현재" value="${escapeAttr(exp.endDate || '')}" ${exp.isCurrent ? 'disabled' : ''}>
                <label style="font-size:0.75rem; white-space:nowrap; margin-left:4px;">
                  <input type="checkbox" class="exp-current" ${exp.isCurrent ? 'checked' : ''}> 재직중
                </label>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>담당 업무</label>
            <textarea class="form-control form-control-sm exp-tasks" rows="2">${escapeHtml(exp.tasks || '')}</textarea>
          </div>
          <div class="form-group">
            <label>주요 성과 (수치 중심)</label>
            <textarea class="form-control form-control-sm exp-achievements" rows="2">${escapeHtml(exp.achievements || '')}</textarea>
          </div>
        </div>
      `);
    });

    // 프로젝트
    const $proj = $('#projectList');
    $proj.empty();
    appState.resume.projects.forEach((p, idx) => {
      $proj.append(`
        <div class="dynamic-item-card" data-proj-id="${p.id}">
          <div class="item-card-header">
            <span class="item-index-badge">프로젝트 ${idx + 1}</span>
            <div class="item-card-tools">
              <button type="button" class="btn-item-tool btn-del-proj text-danger">삭제</button>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-2">
              <label>프로젝트명</label>
              <input type="text" class="form-control form-control-sm proj-title" value="${escapeAttr(p.title || '')}">
            </div>
            <div class="form-group flex-1">
              <label>수행 기간</label>
              <input type="text" class="form-control form-control-sm proj-period" placeholder="2023.08 ~ 2024.01" value="${escapeAttr(p.period || '')}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>수행 역할</label>
              <input type="text" class="form-control form-control-sm proj-role" placeholder="UI/UX 리드" value="${escapeAttr(p.role || '')}">
            </div>
            <div class="form-group flex-1">
              <label>사용 기술/도구</label>
              <input type="text" class="form-control form-control-sm proj-tech" placeholder="Figma, React" value="${escapeAttr(p.tech || '')}">
            </div>
          </div>
          <div class="form-group">
            <label>프로젝트 설명 및 성과</label>
            <textarea class="form-control form-control-sm proj-desc" rows="2">${escapeHtml(p.desc || '')}</textarea>
          </div>
        </div>
      `);
    });

    // 자격증
    const $cert = $('#certList');
    $cert.empty();
    appState.resume.certs.forEach((c) => {
      $cert.append(`
        <div class="dynamic-item-card" data-cert-id="${c.id}" style="padding:0.5rem;">
          <div style="display:flex; justify-content:space-between;">
            <input type="text" class="form-control form-control-sm cert-name" placeholder="자격증명" value="${escapeAttr(c.name)}" style="width:60%;">
            <input type="text" class="form-control form-control-sm cert-date" placeholder="취득일" value="${escapeAttr(c.date)}" style="width:30%;">
            <button type="button" class="btn-item-tool btn-del-cert text-danger" style="margin-left:4px;">✕</button>
          </div>
        </div>
      `);
    });

    // 어학
    const $lang = $('#langList');
    $lang.empty();
    appState.resume.languages.forEach((l) => {
      $lang.append(`
        <div class="dynamic-item-card" data-lang-id="${l.id}" style="padding:0.5rem;">
          <div style="display:flex; justify-content:space-between;">
            <input type="text" class="form-control form-control-sm lang-name" placeholder="언어/시험" value="${escapeAttr(l.language)}: ${escapeAttr(l.testName)}" style="width:55%;">
            <input type="text" class="form-control form-control-sm lang-score" placeholder="점수/등급" value="${escapeAttr(l.score)}" style="width:35%;">
            <button type="button" class="btn-item-tool btn-del-lang text-danger" style="margin-left:4px;">✕</button>
          </div>
        </div>
      `);
    });

    // 기술 태그
    const $skills = $('#skillsTagList');
    $skills.empty();
    appState.resume.skills.forEach((s) => {
      $skills.append(`
        <span class="skill-tag-item" data-skill-id="${s.id}">
          <span>${escapeHtml(s.name)}</span>
          <button type="button" class="btn-remove-skill" title="삭제">✕</button>
        </span>
      `);
    });
  }

  // 10. 이벤트 리스너 바인딩 (실시간 입력 처리 & 문장 검사)
  function initEventListeners() {
    // 1) 모드 전환 (이력서 vs 자기소개서)
    $('#tabBtnResume, #tabBtnCoverLetter').on('click', function () {
      const isResume = $(this).attr('id') === 'tabBtnResume';
      appState.mode = isResume ? 'resume' : 'cover-letter';

      $('.mode-tab-btn').removeClass('active').attr('aria-selected', 'false');
      $(this).addClass('active').attr('aria-selected', 'true');

      $('#paneResumeForm').toggleClass('active', isResume);
      $('#paneCoverLetterForm').toggleClass('active', !isResume);

      $('#btnDownloadTxt').toggle(!isResume);

      renderPreview();
    });

    // 모바일 작성 / 미리보기 화면 토글
    $('#btnMobileEditView').on('click', function () {
      $(this).addClass('active').siblings().removeClass('active');
      $('.resume-workspace-split').removeClass('mobile-preview-active').addClass('mobile-edit-active');
    });

    $('#btnMobilePreviewView').on('click', function () {
      $(this).addClass('active').siblings().removeClass('active');
      $('.resume-workspace-split').removeClass('mobile-edit-active').addClass('mobile-preview-active');
      renderPreview();
    });

    // 2) 이력서 인적사항 입력 실시간 바인딩
    $('#resName, #resNameEn, #resTargetField, #resTargetRole, #resEmail, #resPhone, #resAddress, #resPortfolio, #resWebsite').on('input', function () {
      const info = appState.resume.info;
      info.name = $('#resName').val();
      info.nameEn = $('#resNameEn').val();
      info.targetField = $('#resTargetField').val();
      info.targetRole = $('#resTargetRole').val();
      info.email = $('#resEmail').val();
      info.phone = $('#resPhone').val();
      info.address = $('#resAddress').val();
      info.portfolio = $('#resPortfolio').val();
      info.website = $('#resWebsite').val();

      renderPreview();
    });

    // 3) 프로필 사진 업로드 & 삭제
    $('#photoFileInput').on('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert('사진 파일 크기는 최대 5MB까지만 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onload = function (evt) {
        const dataUrl = evt.target.result;
        appState.resume.info.photoDataUrl = dataUrl;
        $('#resumePhotoImg').attr('src', dataUrl).show();
        $('.photo-placeholder-icon').hide();
        $('#btnDeletePhoto').show();
        $('#labelAddPhoto span').text('사진 변경');
        renderPreview();
      };
      reader.readAsDataURL(file);
      $(this).val('');
    });

    $('#btnDeletePhoto').on('click', function () {
      appState.resume.info.photoDataUrl = null;
      $('#resumePhotoImg').attr('src', '').hide();
      $('.photo-placeholder-icon').show();
      $(this).hide();
      $('#labelAddPhoto span').text('사진 추가');
      renderPreview();
    });

    // 4) 템플릿 변경
    $('input[name="resumeTemplate"]').on('change', function () {
      appState.resume.template = $(this).val();
      $('.tpl-radio-group .tpl-chip').removeClass('active');
      $(this).closest('.tpl-chip').addClass('active');
      renderPreview();
    });

    $('input[name="clTemplate"]').on('change', function () {
      appState.coverLetter.template = $(this).val();
      $('.tpl-radio-group .tpl-chip').removeClass('active');
      $(this).closest('.tpl-chip').addClass('active');
      renderPreview();
    });

    // 5) 서식 설정 변경 (글꼴, 글자크기, 줄간격, 여백)
    $('#docFontFamily').on('change', function () {
      appState.format.fontFamily = $(this).val();
      renderPreview();
    });

    $('#docFontSize').on('change', function () {
      appState.format.fontSize = $(this).val();
      renderPreview();
    });

    $('#docLineHeight').on('change', function () {
      appState.format.lineHeight = $(this).val();
      renderPreview();
    });

    $('#docMargin').on('change', function () {
      appState.format.margin = $(this).val();
      renderPreview();
    });

    // 6) 줌 컨트롤
    $('#btnZoomIn').on('click', function () {
      appState.zoom = Math.min(1.5, appState.zoom + 0.1);
      applyZoom();
    });

    $('#btnZoomOut').on('click', function () {
      appState.zoom = Math.max(0.5, appState.zoom - 0.1);
      applyZoom();
    });

    $('#btnZoomFit').on('click', function () {
      appState.zoom = 1.0;
      applyZoom();
    });

    function applyZoom() {
      $('#previewZoomDisplay').text(`${Math.round(appState.zoom * 100)}%`);
      $('#a4Stage').css('transform', `scale(${appState.zoom})`);
    }

    // 7) 자소서 입력 실시간 처리 & 맞춤법 디바운싱 검사
    let proofreadDebounceTimer = null;

    $('#clDocTitle').on('input', function () {
      appState.coverLetter.docTitle = $(this).val();
      renderPreview();
    });

    $('#clAuthorName').on('input', function () {
      appState.coverLetter.authorName = $(this).val();
      renderPreview();
    });

    $(document).on('input', '.cl-title-input', function () {
      const $box = $(this).closest('.cl-item-box');
      const itemId = $box.data('item-id');
      const item = appState.coverLetter.items.find(it => it.id === itemId);
      if (item) {
        item.title = $(this).val();
        renderPreview();
      }
    });

    $(document).on('change', '.cl-limit-select', function () {
      const $box = $(this).closest('.cl-item-box');
      const itemId = $box.data('item-id');
      const item = appState.coverLetter.items.find(it => it.id === itemId);
      if (item) {
        item.targetLimit = Number($(this).val());
        updateClItemCounter($box, item);
      }
    });

    $(document).on('input', '.cl-textarea', function () {
      const $box = $(this).closest('.cl-item-box');
      const itemId = $box.data('item-id');
      const item = appState.coverLetter.items.find(it => it.id === itemId);
      if (!item) return;

      item.content = $(this).val();
      updateClItemCounter($box, item);
      renderPreview();

      // 디바운싱 300ms 후 실시간 문장 검사
      clearTimeout(proofreadDebounceTimer);
      proofreadDebounceTimer = setTimeout(() => {
        runProofreadingForItem(itemId);
      }, 300);
    });

    // 카운터 갱신 헬퍼
    function updateClItemCounter($box, item) {
      const stats = calculateTextStats(item.content);
      $box.find('.cnt-char-with').text(stats.charWithSpace.toLocaleString());
      $box.find('.cnt-char-no').text(stats.charNoSpace.toLocaleString());
      $box.find('.cnt-bytes').text(stats.utf8Bytes.toLocaleString());
      $box.find('.cnt-words').text(stats.words);

      const isOver = item.targetLimit && stats.charWithSpace > item.targetLimit;
      if (isOver) {
        if (!$box.find('.over-limit-badge').length) {
          $box.find('.cl-counter-bar').append(`<span class="over-limit-badge">⚠️ 설정한 글자수(${item.targetLimit}자)를 초과했습니다.</span>`);
        }
      } else {
        $box.find('.over-limit-badge').remove();
      }
    }

    // 문장 검사 수정 적용 버튼 (원클릭 치환)
    $(document).on('click', '.btn-apply-fix', function () {
      const itemId = $(this).data('item-id');
      const orig = $(this).data('orig');
      const repl = $(this).data('repl');

      const item = appState.coverLetter.items.find(it => it.id === itemId);
      if (!item) return;

      const $box = $(`[data-item-id="${itemId}"]`);
      const $textarea = $box.find('.cl-textarea');

      // 단 한 번의 정확한 치환
      if (item.content.includes(orig)) {
        item.content = item.content.replace(orig, repl);
        $textarea.val(item.content);

        updateClItemCounter($box, item);
        renderPreview();
        runProofreadingForItem(itemId);
      }
    });

    // 문장 검사 무시 버튼
    $(document).on('click', '.btn-dismiss-fix', function () {
      $(this).closest('.issue-item-card').slideUp(150, function () {
        $(this).remove();
      });
    });

    // 자소서 문항 순서 변경 및 삭제
    $(document).on('click', '.btn-move-up', function () {
      const $box = $(this).closest('.cl-item-box');
      const itemId = $box.data('item-id');
      const idx = appState.coverLetter.items.findIndex(it => it.id === itemId);
      if (idx > 0) {
        const item = appState.coverLetter.items.splice(idx, 1)[0];
        appState.coverLetter.items.splice(idx - 1, 0, item);
        renderCoverLetterItems();
        renderPreview();
      }
    });

    $(document).on('click', '.btn-move-down', function () {
      const $box = $(this).closest('.cl-item-box');
      const itemId = $box.data('item-id');
      const idx = appState.coverLetter.items.findIndex(it => it.id === itemId);
      if (idx !== -1 && idx < appState.coverLetter.items.length - 1) {
        const item = appState.coverLetter.items.splice(idx, 1)[0];
        appState.coverLetter.items.splice(idx + 1, 0, item);
        renderCoverLetterItems();
        renderPreview();
      }
    });

    $(document).on('click', '.btn-del-cl-item', function () {
      if (appState.coverLetter.items.length <= 1) {
        alert('자기소개서 문항은 최소 1개 이상 유지되어야 합니다.');
        return;
      }
      if (confirm('이 자기소개서 문항을 삭제하시겠습니까?')) {
        const $box = $(this).closest('.cl-item-box');
        const itemId = $box.data('item-id');
        appState.coverLetter.items = appState.coverLetter.items.filter(it => it.id !== itemId);
        renderCoverLetterItems();
        renderPreview();
      }
    });

    $('#btnAddClItem').on('click', function () {
      const newNum = appState.coverLetter.items.length + 1;
      const newItem = {
        id: 'cl_item_' + Date.now(),
        title: `${newNum}. 직무 관련 경험 및 역량`,
        targetLimit: 700,
        content: '',
        guide: '직무와 관련된 본인의 핵심 경험을 STAR 기법(상황-과제-행동-결과)으로 서술해보세요.'
      };
      appState.coverLetter.items.push(newItem);
      renderCoverLetterItems();
      renderPreview();
    });

    // 8) 이력서 동적 항목 추가/수정/삭제 이벤트
    // 학력
    $('#btnAddEducation').on('click', function () {
      appState.resume.education.push({
        id: 'edu_' + Date.now(),
        school: '',
        major: '',
        degree: '대학교(4년제)',
        startDate: '',
        endDate: '',
        status: '졸업',
        gpa: '',
        notes: ''
      });
      renderResumeDynamicLists();
      renderPreview();
    });

    $(document).on('click', '.btn-del-edu', function () {
      const id = $(this).closest('.dynamic-item-card').data('edu-id');
      appState.resume.education = appState.resume.education.filter(e => e.id !== id);
      renderResumeDynamicLists();
      renderPreview();
    });

    $(document).on('input change', '#educationList input, #educationList select', function () {
      const $card = $(this).closest('.dynamic-item-card');
      const id = $card.data('edu-id');
      const item = appState.resume.education.find(e => e.id === id);
      if (item) {
        item.school = $card.find('.edu-school').val();
        item.major = $card.find('.edu-major').val();
        item.degree = $card.find('.edu-degree').val();
        item.startDate = $card.find('.edu-start').val();
        item.endDate = $card.find('.edu-end').val();
        item.status = $card.find('.edu-status').val();
        renderPreview();
      }
    });

    // 경력
    $('#btnAddExperience').on('click', function () {
      appState.resume.experience.push({
        id: 'exp_' + Date.now(),
        company: '',
        dept: '',
        role: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        tasks: '',
        achievements: ''
      });
      renderResumeDynamicLists();
      renderPreview();
    });

    $(document).on('click', '.btn-del-exp', function () {
      const id = $(this).closest('.dynamic-item-card').data('exp-id');
      appState.resume.experience = appState.resume.experience.filter(e => e.id !== id);
      renderResumeDynamicLists();
      renderPreview();
    });

    $(document).on('input change', '#experienceList input, #experienceList textarea', function () {
      const $card = $(this).closest('.dynamic-item-card');
      const id = $card.data('exp-id');
      const item = appState.resume.experience.find(e => e.id === id);
      if (item) {
        item.company = $card.find('.exp-company').val();
        item.role = $card.find('.exp-role').val();
        item.startDate = $card.find('.exp-start').val();
        item.endDate = $card.find('.exp-end').val();
        item.isCurrent = $card.find('.exp-current').is(':checked');
        item.tasks = $card.find('.exp-tasks').val();
        item.achievements = $card.find('.exp-achievements').val();

        $card.find('.exp-end').prop('disabled', item.isCurrent);
        renderPreview();
      }
    });

    // 프로젝트
    $('#btnAddProject').on('click', function () {
      appState.resume.projects.push({
        id: 'proj_' + Date.now(),
        title: '',
        period: '',
        role: '',
        tech: '',
        desc: '',
        achievements: '',
        link: ''
      });
      renderResumeDynamicLists();
      renderPreview();
    });

    $(document).on('click', '.btn-del-proj', function () {
      const id = $(this).closest('.dynamic-item-card').data('proj-id');
      appState.resume.projects = appState.resume.projects.filter(p => p.id !== id);
      renderResumeDynamicLists();
      renderPreview();
    });

    $(document).on('input change', '#projectList input, #projectList textarea', function () {
      const $card = $(this).closest('.dynamic-item-card');
      const id = $card.data('proj-id');
      const item = appState.resume.projects.find(p => p.id === id);
      if (item) {
        item.title = $card.find('.proj-title').val();
        item.period = $card.find('.proj-period').val();
        item.role = $card.find('.proj-role').val();
        item.tech = $card.find('.proj-tech').val();
        item.desc = $card.find('.proj-desc').val();
        renderPreview();
      }
    });

    // 자격증 & 어학 추가
    $('#btnAddCert').on('click', function () {
      appState.resume.certs.push({
        id: 'cert_' + Date.now(),
        name: '자격증명',
        issuer: '발급기관',
        date: '2024.01'
      });
      renderResumeDynamicLists();
      renderPreview();
    });

    $(document).on('click', '.btn-del-cert', function () {
      const id = $(this).closest('.dynamic-item-card').data('cert-id');
      appState.resume.certs = appState.resume.certs.filter(c => c.id !== id);
      renderResumeDynamicLists();
      renderPreview();
    });

    $(document).on('input', '#certList input', function () {
      const $card = $(this).closest('.dynamic-item-card');
      const id = $card.data('cert-id');
      const item = appState.resume.certs.find(c => c.id === id);
      if (item) {
        item.name = $card.find('.cert-name').val();
        item.date = $card.find('.cert-date').val();
        renderPreview();
      }
    });

    $('#btnAddLang').on('click', function () {
      appState.resume.languages.push({
        id: 'lang_' + Date.now(),
        language: '영어',
        testName: 'TOEIC',
        score: '850점',
        date: '2024.01'
      });
      renderResumeDynamicLists();
      renderPreview();
    });

    $(document).on('click', '.btn-del-lang', function () {
      const id = $(this).closest('.dynamic-item-card').data('lang-id');
      appState.resume.languages = appState.resume.languages.filter(l => l.id !== id);
      renderResumeDynamicLists();
      renderPreview();
    });

    $(document).on('input', '#langList input', function () {
      const $card = $(this).closest('.dynamic-item-card');
      const id = $card.data('lang-id');
      const item = appState.resume.languages.find(l => l.id === id);
      if (item) {
        const parts = ($card.find('.lang-name').val() || '').split(':');
        item.language = parts[0] ? parts[0].trim() : '어학';
        item.testName = parts[1] ? parts[1].trim() : '';
        item.score = $card.find('.lang-score').val();
        renderPreview();
      }
    });

    // 기술 역량 태그
    $('#btnAddSkill').on('click', function () {
      const skillName = prompt('추가할 기술 또는 핵심 역량을 입력하세요:', 'JavaScript');
      if (skillName && skillName.trim()) {
        appState.resume.skills.push({
          id: 'sk_' + Date.now(),
          name: skillName.trim()
        });
        renderResumeDynamicLists();
        renderPreview();
      }
    });

    $(document).on('click', '.btn-remove-skill', function () {
      const id = $(this).closest('.skill-tag-item').data('skill-id');
      appState.resume.skills = appState.resume.skills.filter(s => s.id !== id);
      renderResumeDynamicLists();
      renderPreview();
    });

    // 9) 샘플 데이터 채우기 버튼
    $('#btnFillSampleData').on('click', function () {
      if (confirm('기본 예시 샘플 데이터로 내용을 채우시겠습니까?')) {
        location.reload();
      }
    });

    // 전체 초기화
    $('#btnResetDocument').on('click', function () {
      if (confirm('현재 작성 중인 모든 이력서 및 자기소개서 내용을 초기화하시겠습니까?')) {
        localStorage.removeItem(STORAGE_KEYS.AUTOSAVE);
        location.reload();
      }
    });
  }

  // 11. PDF 인쇄 및 저장 엔진
  function initPrintAndExports() {
    $('#btnPrintPdf').on('click', function () {
      $('#modalPrintNotice').fadeIn(150);
    });

    $('#btnExecuteRealPrint').on('click', function () {
      $('#modalPrintNotice').fadeOut(100);

      // 인쇄 전용 컨테이너 주입
      const $printContainer = $('#printDocumentContainer');
      const contentHtml = $('#renderedDocContent').html();
      const formatStyles = `
        font-family: ${appState.format.fontFamily};
        font-size: ${appState.format.fontSize};
        line-height: ${appState.format.lineHeight};
      `;

      $printContainer.html(`
        <div class="a4-sheet" style="${formatStyles}">
          ${contentHtml}
        </div>
      `);

      setTimeout(() => {
        window.print();
      }, 50);
    });

    // 자소서 TXT 다운로드
    $('#btnDownloadTxt').on('click', function () {
      let txtContent = `${appState.coverLetter.docTitle}\n`;
      txtContent += `작성자: ${appState.coverLetter.authorName}\n`;
      txtContent += `작성일: ${new Date().toLocaleDateString('ko-KR')}\n\n`;
      txtContent += '==================================================\n\n';

      appState.coverLetter.items.forEach((item) => {
        txtContent += `[${item.title}]\n\n`;
        txtContent += `${item.content}\n\n`;
        txtContent += '--------------------------------------------------\n\n';
      });

      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `자기소개서_${appState.coverLetter.authorName || '작성본'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    // JSON 백업 내보내기
    $('#btnExportJson').on('click', function () {
      const exportData = {
        app: '1-Min-Challenge-Resume-Builder',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        state: appState
      };

      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `취업서류_백업_${appState.resume.info.name || 'document'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    // JSON 불러오기
    $('#jsonFileInput').on('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (evt) {
        try {
          const imported = JSON.parse(evt.target.result);
          if (!imported.state || !imported.state.resume || !imported.state.coverLetter) {
            alert('올바른 취업 서류 백업 JSON 파일이 아닙니다.');
            return;
          }

          $.extend(true, appState, imported.state);

          syncInputFieldsFromState();
          renderResumeDynamicLists();
          renderCoverLetterItems();
          renderPreview();

          alert('문서가 성공적으로 복원되었습니다!');
        } catch (err) {
          alert('JSON 파일을 분석하는 도중 오류가 발생했습니다: ' + err.message);
        }
      };
      reader.readAsText(file);
      $(this).val('');
    });

    // 모달 닫기
    $(document).on('click', '[data-close]', function () {
      const modalId = $(this).data('close');
      $(`#${modalId}`).fadeOut(150);
    });
  }

  // 12. 문서 보관함 및 로컬 저장소
  function initDocumentStorage() {
    updateSavedDocCount();

    // 문서 수동 저장
    $('#btnSaveDocument').on('click', function () {
      const docTitle = prompt('저장할 문서 제목을 입력하세요:', `${appState.resume.info.name}의 ${appState.mode === 'resume' ? '이력서' : '자기소개서'}`);
      if (!docTitle) return;

      const docs = getSavedDocuments();
      if (docs.length >= 20) {
        alert('최대 20개까지만 문서를 저장할 수 있습니다. 기존 문서를 삭제 후 시도하세요.');
        return;
      }

      const newDoc = {
        id: 'doc_' + Date.now(),
        title: docTitle,
        mode: appState.mode,
        date: new Date().toLocaleDateString('ko-KR'),
        stateSnapshot: JSON.parse(JSON.stringify(appState))
      };

      docs.unshift(newDoc);
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
      updateSavedDocCount();
      alert(`'${docTitle}' 문서가 브라우저에 안전하게 저장되었습니다.`);
    });

    // 보관함 모달 열기
    $('#btnOpenDocList').on('click', function () {
      renderSavedDocsModal();
      $('#modalSavedDocs').fadeIn(150);
    });
  }

  function getSavedDocuments() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function updateSavedDocCount() {
    const count = getSavedDocuments().length;
    $('#savedDocCount').text(count);
    $('#modalDocCount').text(count);
  }

  function renderSavedDocsModal() {
    const docs = getSavedDocuments();
    const $grid = $('#savedDocsGrid');
    $grid.empty();

    if (docs.length === 0) {
      $grid.html('<p class="text-muted text-center" style="grid-column: 1/-1; padding: 2rem;">저장된 문서가 없습니다. [문서 저장] 버튼을 눌러 작성본을 보관하세요.</p>');
      return;
    }

    docs.forEach(doc => {
      const $card = $(`
        <div class="saved-doc-card" data-doc-id="${doc.id}">
          <div class="saved-doc-info">
            <strong>${escapeHtml(doc.title)}</strong>
            <span>종류: ${doc.mode === 'resume' ? '이력서' : '자기소개서'} | ${doc.date}</span>
          </div>
          <div class="saved-doc-btns">
            <button type="button" class="btn btn-primary btn-xs flex-1 btn-load-doc">불러오기</button>
            <button type="button" class="btn btn-outline btn-xs btn-dup-doc" title="복제">복제</button>
            <button type="button" class="btn btn-outline btn-xs text-danger btn-del-doc" title="삭제">✕</button>
          </div>
        </div>
      `);

      $card.find('.btn-load-doc').on('click', function () {
        if (confirm(`'${doc.title}' 문서를 불러오시겠습니까? 현재 작성 중인 내용은 덮어씌워집니다.`)) {
          $.extend(true, appState, doc.stateSnapshot);
          syncInputFieldsFromState();
          renderResumeDynamicLists();
          renderCoverLetterItems();
          renderPreview();
          $('#modalSavedDocs').fadeOut(150);
        }
      });

      $card.find('.btn-dup-doc').on('click', function () {
        const copy = JSON.parse(JSON.stringify(doc));
        copy.id = 'doc_' + Date.now();
        copy.title = `${doc.title} (사본)`;
        copy.date = new Date().toLocaleDateString('ko-KR');

        const curDocs = getSavedDocuments();
        curDocs.unshift(copy);
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(curDocs));
        updateSavedDocCount();
        renderSavedDocsModal();
      });

      $card.find('.btn-del-doc').on('click', function () {
        if (confirm(`'${doc.title}' 문서를 정말 삭제하시겠습니까?`)) {
          let curDocs = getSavedDocuments();
          curDocs = curDocs.filter(d => d.id !== doc.id);
          localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(curDocs));
          updateSavedDocCount();
          renderSavedDocsModal();
        }
      });

      $grid.append($card);
    });
  }

  // 13. 자동 저장 & 복원
  let autoSaveTimeout = null;

  function triggerAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.AUTOSAVE, JSON.stringify(appState));
        $('#autoSaveStatusText').text('모든 변경사항 자동 저장됨');
      } catch (e) {}
    }, 1200);
  }

  function checkAutosaveOnLoad() {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEYS.AUTOSAVE);
      if (!dataStr) return;
      const saved = JSON.parse(dataStr);
      if (!saved || !saved.resume) return;

      $('#autosaveBanner').show();

      $('#btnResumeAutosave').on('click', function () {
        $.extend(true, appState, saved);
        syncInputFieldsFromState();
        renderResumeDynamicLists();
        renderCoverLetterItems();
        renderPreview();
        $('#autosaveBanner').slideUp(200);
      });

      $('#btnDiscardAutosave').on('click', function () {
        localStorage.removeItem(STORAGE_KEYS.AUTOSAVE);
        $('#autosaveBanner').slideUp(200);
      });
    } catch (e) {}
  }

  function syncInputFieldsFromState() {
    const info = appState.resume.info;
    $('#resName').val(info.name || '');
    $('#resNameEn').val(info.nameEn || '');
    $('#resTargetField').val(info.targetField || '');
    $('#resTargetRole').val(info.targetRole || '');
    $('#resEmail').val(info.email || '');
    $('#resPhone').val(info.phone || '');
    $('#resAddress').val(info.address || '');
    $('#resPortfolio').val(info.portfolio || '');
    $('#resWebsite').val(info.website || '');

    if (info.photoDataUrl) {
      $('#resumePhotoImg').attr('src', info.photoDataUrl).show();
      $('.photo-placeholder-icon').hide();
      $('#btnDeletePhoto').show();
      $('#labelAddPhoto span').text('사진 변경');
    } else {
      $('#resumePhotoImg').attr('src', '').hide();
      $('.photo-placeholder-icon').show();
      $('#btnDeletePhoto').hide();
      $('#labelAddPhoto span').text('사진 추가');
    }

    $(`input[name="resumeTemplate"][value="${appState.resume.template || 't1'}"]`).prop('checked', true).trigger('change');
    $(`input[name="clTemplate"][value="${appState.coverLetter.template || 't1'}"]`).prop('checked', true).trigger('change');

    $('#clDocTitle').val(appState.coverLetter.docTitle || '');
    $('#clAuthorName').val(appState.coverLetter.authorName || '');

    $('#docFontFamily').val(appState.format.fontFamily);
    $('#docFontSize').val(appState.format.fontSize);
    $('#docLineHeight').val(appState.format.lineHeight);
    $('#docMargin').val(appState.format.margin);
  }

  // 유틸리티
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }

  // 14. 초기화 실행
  $(document).ready(function () {
    renderResumeDynamicLists();
    renderCoverLetterItems();
    initEventListeners();
    initPrintAndExports();
    initDocumentStorage();

    // 초기 미리보기 생성
    renderPreview();

    // 자동 저장 데이터 복원 검사
    checkAutosaveOnLoad();
  });

})(jQuery);
