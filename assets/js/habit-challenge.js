/**
 * ========================================================
 * 무료 습관 챌린지 자바스크립트 엔진 (habit-challenge.js)
 * 작은 습관부터, 매일 하나씩 - 1-Min Challenge
 * ========================================================
 */

(function($) {
  'use strict';

  // 로컬 스토리지 키
  const STORAGE_KEY_HABITS = 'challenge_1min_habits';
  const STORAGE_KEY_BADGES = 'challenge_1min_badges';

  // 24개 대표 이모지
  const PRESET_ICONS = [
    '🌱', '💧', '🏃', '🚶', '🧘', '📖', '🔤', '📝',
    '🎯', '🕯️', '🧹', '🛏️', '💰', '📚', '💡', '🙏',
    '🎨', '📵', '✍️', '📷', '📞', '🥗', '☕', '🛌'
  ];

  // 8개 테마 컬러
  const PRESET_COLORS = [
    '#4f46e5', '#10b981', '#0ea5e9', '#f59e0b',
    '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6'
  ];

  // 20종 추천 습관 템플릿
  const PRESET_TEMPLATES = [
    { name: '하루 물 8잔 마시기', category: 'health', goalType: 'quantity', targetQty: 8, unit: '잔', icon: '💧', color: '#0ea5e9', desc: '기상 직후 한 잔, 식간 틈틈이 건강한 수분 보충' },
    { name: '하루 30분 산책하기', category: 'health', goalType: 'quantity', targetQty: 30, unit: '분', icon: '🚶', color: '#10b981', desc: '햇볕을 쬐며 가볍게 걷고 기분 전환하기' },
    { name: '매일 20분 운동하기', category: 'health', goalType: 'quantity', targetQty: 20, unit: '분', icon: '🏃', color: '#ef4444', desc: '홈트레이닝, 러닝 등 활기찬 땀 흘리기' },
    { name: '잠들기 전 스트레칭하기', category: 'health', goalType: 'check', targetQty: 1, unit: '회', icon: '🧘', color: '#8b5cf6', desc: '뭉친 어깨와 목, 다리를 부드럽게 이완하기' },
    { name: '하루 10페이지 독서하기', category: 'study', goalType: 'quantity', targetQty: 10, unit: '페이지', icon: '📖', color: '#6366f1', desc: '작은 분량이라도 매일 꾸준히 책 읽는 습관' },
    { name: '영어 단어 10개 외우기', category: 'study', goalType: 'quantity', targetQty: 10, unit: '개', icon: '🔤', color: '#f59e0b', desc: '하루 10단어씩 꾸준히 어휘력 늘리기' },
    { name: '매일 일기 쓰기', category: 'life', goalType: 'check', targetQty: 1, unit: '회', icon: '📝', color: '#ec4899', desc: '오늘 하루의 소중한 순간과 감정 기록하기' },
    { name: '오늘 할 일 3개 완료하기', category: 'life', goalType: 'quantity', targetQty: 3, unit: '개', icon: '🎯', color: '#14b8a6', desc: '핵심 과제 3가지에 집중하여 성취하기' },
    { name: '하루 10분 명상하기', category: 'selfcare', goalType: 'quantity', targetQty: 10, unit: '분', icon: '🕯️', color: '#a855f7', desc: '조용히 숨을 고르며 마음의 평온 찾기' },
    { name: '매일 방 정리하기', category: 'life', goalType: 'check', targetQty: 1, unit: '회', icon: '🧹', color: '#06b6d4', desc: '머문 자리를 깨끗하게 정돈하여 쾌적함 유지' },
    { name: '아침에 침대 정리하기', category: 'life', goalType: 'check', targetQty: 1, unit: '회', icon: '🛏️', color: '#3b82f6', desc: '작은 성공으로 하루를 상쾌하게 시작하기' },
    { name: '하루 지출 기록하기', category: 'life', goalType: 'check', targetQty: 1, unit: '회', icon: '💰', color: '#10b981', desc: '가계부에 소비 내역을 꼼꼼히 정리하기' },
    { name: '하루 30분 공부하기', category: 'study', goalType: 'quantity', targetQty: 30, unit: '분', icon: '📚', color: '#f97316', desc: '원하는 자격증이나 관심 분야 지식 쌓기' },
    { name: '새로운 단어 5개 익히기', category: 'study', goalType: 'quantity', targetQty: 5, unit: '개', icon: '💡', color: '#84cc16', desc: '외국어 표현이나 교양 단어 매일 학습' },
    { name: '매일 감사한 일 하나 적기', category: 'selfcare', goalType: 'check', targetQty: 1, unit: '회', icon: '🙏', color: '#ec4899', desc: '일상의 소소한 행복과 감사한 순간 떠올리기' },
    { name: '하루 20분 취미 즐기기', category: 'selfcare', goalType: 'quantity', targetQty: 20, unit: '분', icon: '🎨', color: '#8b5cf6', desc: '그림 그리기, 악기 연주 등 나를 위한 시간' },
    { name: '자기 전 휴대폰 사용 줄이기', category: 'selfcare', goalType: 'check', targetQty: 1, unit: '회', icon: '📵', color: '#64748b', desc: '취침 30분 전 스크린을 멀리하고 숙면 취하기' },
    { name: '하루 15분 글쓰기', category: 'selfcare', goalType: 'quantity', targetQty: 15, unit: '분', icon: '✍️', color: '#f59e0b', desc: '자유로운 생각과 영감을 글로 표현하기' },
    { name: '매일 사진 한 장 남기기', category: 'life', goalType: 'check', targetQty: 1, unit: '장', icon: '📷', color: '#0ea5e9', desc: '오늘 하늘, 맛있는 음식 등 순간 포착하기' },
    { name: '가족이나 친구에게 연락하기', category: 'life', goalType: 'check', targetQty: 1, unit: '회', icon: '📞', color: '#10b981', desc: '소중한 사람에게 따뜻한 안부 전하기' }
  ];

  // 10종 배지 마스터 정의
  const BADGES_MASTER = [
    { id: 'first_step', icon: '🌱', name: '첫걸음 배지', desc: '첫 챌린지 생성 완료', check: (h, stats) => h.length >= 1 },
    { id: 'first_success', icon: '⭐', name: '첫 성공 배지', desc: '하루 목표 처음 완료', check: (h, stats) => stats.totalCompletedDays >= 1 },
    { id: 'streak_3', icon: '🔥', name: '3일 연속 배지', desc: '3일 연속 실천 달성', check: (h, stats) => stats.maxStreak >= 3 },
    { id: 'streak_7', icon: '🥉', name: '7일 연속 배지', desc: '7일 연속 실천 달성', check: (h, stats) => stats.maxStreak >= 7 },
    { id: 'streak_14', icon: '🥈', name: '14일 연속 배지', desc: '14일 연속 실천 달성', check: (h, stats) => stats.maxStreak >= 14 },
    { id: 'streak_21', icon: '🥇', name: '21일 연속 배지', desc: '21일 연속 실천 달성', check: (h, stats) => stats.maxStreak >= 21 },
    { id: 'streak_30', icon: '👑', name: '30일 연속 배지', desc: '30일 연속 실천 달성', check: (h, stats) => stats.maxStreak >= 30 },
    { id: 'perfect_finish', icon: '💎', name: '완벽 달성 배지', desc: '챌린지 전 기간 100% 완료', check: (h, stats) => stats.perfectChallenges >= 1 },
    { id: 'total_50', icon: '🌟', name: '꾸준한 실천 배지', desc: '누적 완료 일수 50일 돌파', check: (h, stats) => stats.totalCompletedDays >= 50 },
    { id: 'habit_master', icon: '🏆', name: '습관 마스터 배지', desc: '완벽 달성 챌린지 3개 이상', check: (h, stats) => stats.perfectChallenges >= 3 }
  ];

  // 전역 상태 관리 객체
  const state = {
    habits: [],
    filterStatus: 'all',     // 'all' | 'active' | 'completed' | 'paused'
    filterCategory: 'all',   // 'all' | 'health' | 'study' | 'life' | 'selfcare' | 'other'
    sortBy: 'latest',        // 'latest' | 'rateDesc' | 'streakDesc' | 'name'
    selectedChallengeId: null,
    calendarYearMonth: { year: 2026, month: 10 }, // 1-indexed month
    calendarSelectedDate: null
  };

  /* ========================================================
     날짜 안전 헬퍼 함수군 (로컬 타임존 기준 YYYY-MM-DD)
     ======================================================== */
  function getLocalDateString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseLocalDate(dateStr) {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function addDays(dateStr, days) {
    const d = parseLocalDate(dateStr);
    d.setDate(d.getDate() + days);
    return getLocalDateString(d);
  }

  function getDaysDiff(dateStr1, dateStr2) {
    const d1 = parseLocalDate(dateStr1);
    const d2 = parseLocalDate(dateStr2);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  function formatKoreanDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const dateObj = parseLocalDate(dateStr);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[dateObj.getDay()];
    return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일 (${dayName})`;
  }

  /* ========================================================
     연속 성공 일수 (Streak) & 달성률 정밀 계산 알고리즘
     ======================================================== */
  function calculateHabitMetrics(habit) {
    const todayStr = getLocalDateString();
    const { startDate, endDate, duration, records = {} } = habit;
    
    // 1. 기간 경과 일수 계산
    let elapsedDays = 0;
    if (todayStr >= startDate) {
      if (todayStr <= endDate) {
        elapsedDays = getDaysDiff(startDate, todayStr) + 1;
      } else {
        elapsedDays = duration;
      }
    }

    // 2. 완료 일수 계산
    let completedCount = 0;
    let curr = startDate;
    while (curr <= endDate) {
      if (records[curr] && records[curr].completed) {
        completedCount++;
      }
      curr = addDays(curr, 1);
    }

    // 3. 연속 성공 일수 (Current Streak & Max Streak)
    // 규칙: 오늘은 아직 지나지 않았으므로 오늘 미완료라도 어제까지의 연속 기록 유지
    let currentStreak = 0;
    let checkDate = todayStr > endDate ? endDate : todayStr;

    // 만약 checkDate가 startDate보다 이전이면 0
    if (checkDate >= startDate) {
      // 오늘 완료 여부 확인
      const isTodayCompleted = records[checkDate] && records[checkDate].completed;
      if (isTodayCompleted) {
        currentStreak++;
        let prevDate = addDays(checkDate, -1);
        while (prevDate >= startDate && records[prevDate] && records[prevDate].completed) {
          currentStreak++;
          prevDate = addDays(prevDate, -1);
        }
      } else {
        // 오늘은 아직 미완료: 어제부터 역산
        let prevDate = addDays(checkDate, -1);
        while (prevDate >= startDate && records[prevDate] && records[prevDate].completed) {
          currentStreak++;
          prevDate = addDays(prevDate, -1);
        }
      }
    }

    // 최장 연속 성공 계산 (전체 기간 순회)
    let maxStreak = 0;
    let tempStreak = 0;
    const limitDate = todayStr > endDate ? endDate : todayStr;
    curr = startDate;
    while (curr <= limitDate) {
      if (records[curr] && records[curr].completed) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
      curr = addDays(curr, 1);
    }

    // 4. 비율 계산
    const periodProgressRate = duration > 0 ? Math.min(100, Math.round((elapsedDays / duration) * 100)) : 0;
    const overallRate = duration > 0 ? Math.min(100, Math.round((completedCount / duration) * 100)) : 0;
    const currentPracticeRate = elapsedDays > 0 ? Math.min(100, Math.round((completedCount / elapsedDays) * 100)) : 0;

    // 5. 챌린지 상태 자동 판정
    let computedStatus = habit.status;
    if (habit.status !== 'paused') {
      if (todayStr > endDate) {
        computedStatus = 'completed';
      } else if (todayStr < startDate) {
        computedStatus = 'upcoming';
      } else {
        computedStatus = 'active';
      }
    }

    return {
      elapsedDays,
      completedCount,
      currentStreak,
      maxStreak,
      periodProgressRate,
      overallRate,
      currentPracticeRate,
      computedStatus,
      isPerfect: completedCount === duration
    };
  }

  /* ========================================================
     데이터 로드 및 저장
     ======================================================== */
  function loadHabits() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HABITS);
      if (raw) {
        state.habits = JSON.parse(raw);
      } else {
        // 최초 방문 시 사용자에게 2개의 샘플 실천 챌린지 제공
        initInitialSampleHabits();
      }
    } catch (e) {
      console.error('습관 데이터 로드 실패:', e);
      state.habits = [];
    }
  }

  function initInitialSampleHabits() {
    const today = getLocalDateString();
    const sample1 = {
      id: 'hab_' + Date.now() + '_1',
      name: '매일 물 8잔 마시기',
      desc: '기상 직후 한 잔, 식간 틈틈이 건강한 수분 보충',
      category: 'health',
      duration: 7,
      startDate: today,
      endDate: addDays(today, 6),
      goalType: 'quantity',
      targetQty: 8,
      unit: '잔',
      icon: '💧',
      color: '#0ea5e9',
      status: 'active',
      records: {
        [today]: { completed: true, quantity: 8, note: '오늘 아침부터 8잔 달성 완료!' }
      },
      createdAt: new Date().toISOString()
    };

    const sample2 = {
      id: 'hab_' + Date.now() + '_2',
      name: '하루 10페이지 독서하기',
      desc: '잠들기 전 스마트폰 대신 책 10장 읽기',
      category: 'study',
      duration: 21,
      startDate: addDays(today, -2),
      endDate: addDays(today, 18),
      goalType: 'quantity',
      targetQty: 10,
      unit: '페이지',
      icon: '📖',
      color: '#6366f1',
      status: 'active',
      records: {
        [addDays(today, -2)]: { completed: true, quantity: 10, note: '첫 챕터 시작' },
        [addDays(today, -1)]: { completed: true, quantity: 12, note: '흥미진진한 내용' }
      },
      createdAt: new Date().toISOString()
    };

    state.habits = [sample1, sample2];
    saveHabits();
  }

  function saveHabits() {
    try {
      localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(state.habits));
    } catch (e) {
      alert('로컬 저장 용량이 초과되었거나 저장이 차단되었습니다.');
    }
  }

  /* ========================================================
     전체 통계 및 배지 평가 엔진
     ======================================================== */
  function computeGlobalStats() {
    const todayStr = getLocalDateString();
    let totalCompletedDays = 0;
    let maxStreak = 0;
    let perfectChallenges = 0;
    let activeCount = 0;
    let completedCount = 0;
    let pausedCount = 0;
    let totalRates = 0;

    // 오늘의 과제 집계
    let todayHabits = [];

    state.habits.forEach(h => {
      const metrics = calculateHabitMetrics(h);
      totalCompletedDays += metrics.completedCount;
      if (metrics.maxStreak > maxStreak) maxStreak = metrics.maxStreak;
      if (metrics.isPerfect) perfectChallenges++;
      totalRates += metrics.overallRate;

      if (metrics.computedStatus === 'active') activeCount++;
      if (metrics.computedStatus === 'completed') completedCount++;
      if (metrics.computedStatus === 'paused') pausedCount++;

      // 오늘 진행 대상인지 확인
      if (todayStr >= h.startDate && todayStr <= h.endDate && h.status !== 'paused') {
        const isTodayDone = h.records && h.records[todayStr] && h.records[todayStr].completed;
        todayHabits.push({ habit: h, isDone: !!isTodayDone, metrics });
      }
    });

    const avgRate = state.habits.length > 0 ? Math.round(totalRates / state.habits.length) : 0;
    const todayTotal = todayHabits.length;
    const todayDone = todayHabits.filter(t => t.isDone).length;
    const todayRemaining = todayTotal - todayDone;
    const todayRate = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

    return {
      todayHabits,
      todayTotal,
      todayDone,
      todayRemaining,
      todayRate,
      activeCount,
      completedCount,
      pausedCount,
      totalCompletedDays,
      maxStreak,
      perfectChallenges,
      avgRate
    };
  }

  function evaluateBadges(stats) {
    const unlocked = [];
    BADGES_MASTER.forEach(badge => {
      if (badge.check(state.habits, stats)) {
        unlocked.push(badge.id);
      }
    });
    localStorage.setItem(STORAGE_KEY_BADGES, JSON.stringify(unlocked));
    return unlocked;
  }

  /* ========================================================
     UI 렌더링 함수군
     ======================================================== */
  function renderAll() {
    const stats = computeGlobalStats();
    const unlockedBadges = evaluateBadges(stats);

    renderHeroAndMetrics(stats);
    renderTodayHabits(stats);
    renderChallengeCards();
    renderStatsAndCharts(stats);
    renderBadges(unlockedBadges);
  }

  // 1. 헤더 & 오늘의 메트릭
  function renderHeroAndMetrics(stats) {
    const todayStr = getLocalDateString();
    const d = parseLocalDate(todayStr);
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const badgeText = `📅 ${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${dayNames[d.getDay()]}`;
    $('#heroTodayDateBadge span').text(badgeText);

    // 동적 응원 문구
    if (stats.todayTotal === 0) {
      $('#dailyCheerTitle').text('새로운 도전을 기다려요');
      $('#dailyCheerMsg').text('오늘 예정된 습관이 없습니다. [새 챌린지 만들기]로 나만의 루틴을 시작해보세요!');
    } else if (stats.todayDone === stats.todayTotal) {
      $('#dailyCheerTitle').text('완벽한 하루 달성! 🎉');
      $('#dailyCheerMsg').text('오늘의 모든 습관을 100% 실천하셨습니다! 멋진 성취에 박수를 보냅니다.');
    } else if (stats.todayDone > 0) {
      $('#dailyCheerTitle').text('순조로운 실천 중이에요 💪');
      $('#dailyCheerMsg').text(`오늘 실천할 습관 중 ${stats.todayDone}개를 완료하셨습니다. 남은 과제도 힘내보세요!`);
    } else {
      $('#dailyCheerTitle').text('작은 습관부터, 매일 하나씩 🌱');
      $('#dailyCheerMsg').text('하루 한 번의 실천이 쌓여 나만의 기록이 됩니다. 오늘의 첫 습관을 체크해보세요!');
    }

    // 메트릭 숫자 반영
    $('#mTodayTotal').text(`${stats.todayTotal}개`);
    $('#mTodayDone').text(`${stats.todayDone}개`);
    $('#mTodayRemaining').text(`${stats.todayRemaining}개`);
    $('#mTodayRate').text(`${stats.todayRate}%`);
    $('#mActiveChallenges').text(`${stats.activeCount}개`);

    // 종합 통계 숫자 반영
    $('#statTotalCompletedDays').text(`${stats.totalCompletedDays}일`);
    $('#statAvgRate').text(`${stats.avgRate}%`);
    $('#statMaxStreak').text(`${stats.maxStreak}일`);
    $('#statPerfectChallenges').text(`${stats.perfectChallenges}개`);
  }

  // 2. 오늘의 습관 체크리스트 렌더링
  function renderTodayHabits(stats) {
    const $container = $('#todayHabitsList');
    const $empty = $('#emptyTodayNotice');
    $container.empty();

    if (stats.todayHabits.length === 0) {
      $container.hide();
      $empty.show();
      return;
    }

    $empty.hide();
    $container.show();

    const todayStr = getLocalDateString();

    stats.todayHabits.forEach(item => {
      const h = item.habit;
      const metrics = item.metrics;
      const record = (h.records && h.records[todayStr]) || { completed: false, quantity: 0, note: '' };
      const isCompleted = record.completed;

      let goalControlHtml = '';
      if (h.goalType === 'quantity') {
        goalControlHtml = `
          <div class="qty-stepper-wrap">
            <button type="button" class="qty-step-btn btn-qty-minus" data-id="${h.id}">−</button>
            <input type="number" class="qty-input-field" data-id="${h.id}" value="${record.quantity || 0}" min="0">
            <button type="button" class="qty-step-btn btn-qty-plus" data-id="${h.id}">+</button>
          </div>
        `;
      }

      const cardHtml = `
        <div class="today-habit-card ${isCompleted ? 'is-completed' : ''}" style="border-left-color: ${h.color};">
          <div class="th-card-head">
            <div class="th-info-wrap">
              <div class="th-icon-box" style="background: ${h.color}15; color: ${h.color};">${h.icon}</div>
              <div class="th-title-group">
                <h4>${escapeHtml(h.name)}</h4>
                <div class="th-meta-row">
                  <span class="th-day-badge">Day ${metrics.elapsedDays} / ${h.duration}일</span>
                  <span class="th-streak-tag">🔥 연속 ${metrics.currentStreak}일</span>
                </div>
              </div>
            </div>
            <button type="button" class="btn btn-outline btn-xs btn-open-detail" data-id="${h.id}" title="캘린더 및 상세">캘린더</button>
          </div>

          <div class="th-goal-box">
            <div class="th-goal-target">
              ${h.goalType === 'quantity' ? `목표: <strong>${h.targetQty} ${h.unit}</strong>` : `목표: <strong>1회 체크 완료</strong>`}
            </div>
            <div class="th-goal-status ${isCompleted ? 'done' : ''}">
              ${h.goalType === 'quantity' 
                ? `현재: <strong>${record.quantity || 0}</strong> / ${h.targetQty} ${h.unit}` 
                : (isCompleted ? '✅ 오늘 완료' : '⏳ 미완료')}
            </div>
          </div>

          ${h.goalType === 'quantity' ? goalControlHtml : ''}

          <button type="button" class="th-check-btn ${isCompleted ? 'checked' : ''}" data-id="${h.id}">
            <span>${isCompleted ? '✓ 오늘 실천 완료!' : '오늘 실천 완료하기'}</span>
          </button>

          <div class="th-progress-bar-wrap">
            <div class="th-progress-labels">
              <span>전체 달성률: <strong>${metrics.overallRate}%</strong></span>
              <span>${metrics.completedCount} / ${h.duration}일 성공</span>
            </div>
            <div class="th-progress-track">
              <div class="th-progress-fill ${isCompleted ? 'success' : ''}" style="width: ${metrics.overallRate}%;"></div>
            </div>
          </div>
        </div>
      `;

      $container.append(cardHtml);
    });
  }

  // 3. 내 습관 챌린지 전체 목록 그리드
  function renderChallengeCards() {
    const $grid = $('#allChallengesGrid');
    $grid.empty();

    let filtered = state.habits.slice();

    // 상태 필터링
    if (state.filterStatus !== 'all') {
      filtered = filtered.filter(h => {
        const m = calculateHabitMetrics(h);
        return m.computedStatus === state.filterStatus;
      });
    }

    // 카테고리 필터링
    if (state.filterCategory !== 'all') {
      filtered = filtered.filter(h => h.category === state.filterCategory);
    }

    // 정렬
    filtered.sort((a, b) => {
      const ma = calculateHabitMetrics(a);
      const mb = calculateHabitMetrics(b);
      if (state.sortBy === 'rateDesc') return mb.overallRate - ma.overallRate;
      if (state.sortBy === 'streakDesc') return mb.currentStreak - ma.currentStreak;
      if (state.sortBy === 'name') return a.name.localeCompare(b.name, 'ko');
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (filtered.length === 0) {
      $grid.html(`
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">🔍 조건에 맞는 습관 챌린지가 없습니다.</p>
          <span style="font-size: 0.85rem;">필터 조건을 변경하거나 새로운 챌린지를 만들어보세요.</span>
        </div>
      `);
      return;
    }

    filtered.forEach(h => {
      const m = calculateHabitMetrics(h);
      let statusTag = '';
      if (m.computedStatus === 'active') statusTag = '<span class="ch-badge-status active">진행 중</span>';
      else if (m.computedStatus === 'completed') statusTag = '<span class="ch-badge-status completed">완료됨</span>';
      else if (m.computedStatus === 'paused') statusTag = '<span class="ch-badge-status paused">중도 종료</span>';
      else statusTag = '<span class="ch-badge-status">예정</span>';

      const card = `
        <div class="challenge-card" data-id="${h.id}">
          <div class="ch-card-top">
            <div class="ch-title-wrap">
              <div class="ch-icon-box" style="background: ${h.color}15; color: ${h.color};">${h.icon}</div>
              <div>
                <h4>${escapeHtml(h.name)}</h4>
                <div class="ch-date-range">
                  <span>📅 ${h.startDate} ~ ${h.endDate} (${h.duration}일)</span>
                </div>
              </div>
            </div>
            ${statusTag}
          </div>

          ${h.desc ? `<p class="ch-desc-text">${escapeHtml(h.desc)}</p>` : ''}

          <div class="ch-metrics-row">
            <div class="ch-metric-item">
              <span>전체 달성률</span>
              <strong style="color: var(--primary);">${m.overallRate}%</strong>
            </div>
            <div class="ch-metric-item">
              <span>실천 일수</span>
              <strong style="color: var(--success);">${m.completedCount} / ${h.duration}일</strong>
            </div>
            <div class="ch-metric-item">
              <span>현재 스트릭</span>
              <strong style="color: #f59e0b;">🔥 ${m.currentStreak}일</strong>
            </div>
          </div>

          <div class="th-progress-bar-wrap">
            <div class="th-progress-labels">
              <span>기간 진행: <strong>${m.periodProgressRate}%</strong></span>
              <span>목표: ${h.goalType === 'quantity' ? `${h.targetQty} ${h.unit}` : '1회 완료'}</span>
            </div>
            <div class="th-progress-track">
              <div class="th-progress-fill" style="width: ${m.periodProgressRate}%; background: ${h.color};"></div>
            </div>
          </div>

          <div class="ch-card-actions">
            <div class="ch-btn-group-left">
              <button type="button" class="btn btn-outline btn-xs btn-open-detail" data-id="${h.id}">캘린더 / 상세</button>
              <button type="button" class="btn btn-outline btn-xs btn-edit-habit" data-id="${h.id}">수정</button>
            </div>
            ${m.computedStatus !== 'active' ? `<button type="button" class="btn btn-primary btn-xs btn-retry-habit" data-id="${h.id}">다시 도전</button>` : ''}
          </div>
        </div>
      `;
      $grid.append(card);
    });
  }

  // 4. 통계 시각화 차트 (CSS 막대 차트 + 30일 잔디)
  function renderStatsAndCharts(stats) {
    const todayStr = getLocalDateString();

    // 1) 최근 7일 CSS 바 차트
    const $barChart = $('#weeklyBarChart');
    $barChart.empty();

    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      past7Days.push(addDays(todayStr, -i));
    }

    const counts = past7Days.map(dateStr => {
      let count = 0;
      state.habits.forEach(h => {
        if (h.records && h.records[dateStr] && h.records[dateStr].completed) {
          count++;
        }
      });
      return count;
    });

    const maxCount = Math.max(1, ...counts);
    const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];

    past7Days.forEach((dateStr, idx) => {
      const count = counts[idx];
      const dateObj = parseLocalDate(dateStr);
      const dayName = dayLabels[dateObj.getDay()];
      const isToday = dateStr === todayStr;
      const heightPercent = Math.max(8, Math.round((count / maxCount) * 100));

      const colHtml = `
        <div class="wb-col ${isToday ? 'is-today' : ''}" title="${dateStr}: ${count}개 완료">
          <span class="wb-count-label">${count}</span>
          <div class="wb-bar" style="height: ${heightPercent}%;"></div>
          <span class="wb-day-label">${dayName}</span>
        </div>
      `;
      $barChart.append(colHtml);
    });

    // 2) 최근 30일 잔디 활동 그리드
    const $grassGrid = $('#activityGrassGrid');
    $grassGrid.empty();

    const past30Days = [];
    for (let i = 29; i >= 0; i--) {
      past30Days.push(addDays(todayStr, -i));
    }

    past30Days.forEach(dateStr => {
      let count = 0;
      state.habits.forEach(h => {
        if (h.records && h.records[dateStr] && h.records[dateStr].completed) {
          count++;
        }
      });

      let lvlClass = 'lvl-0';
      if (count >= 5) lvlClass = 'lvl-3';
      else if (count >= 3) lvlClass = 'lvl-2';
      else if (count >= 1) lvlClass = 'lvl-1';

      const tile = `<div class="grass-tile ${lvlClass}" title="${dateStr}: ${count}개 실천"></div>`;
      $grassGrid.append(tile);
    });
  }

  // 5. 10종 배지 보관함 렌더링
  function renderBadges(unlockedIds) {
    const $grid = $('#badgesGrid');
    $grid.empty();
    $('#badgeUnlockedCountPill').text(`${unlockedIds.length} / 10 획득`);

    BADGES_MASTER.forEach(b => {
      const isUnlocked = unlockedIds.includes(b.id);
      const card = `
        <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="badge-icon-wrap">${b.icon}</div>
          <h4>${escapeHtml(b.name)}</h4>
          <p class="badge-condition">${escapeHtml(b.desc)}</p>
          <span class="badge-status-tag">${isUnlocked ? '획득 완료 ✨' : '도전 중 🔒'}</span>
        </div>
      `;
      $grid.append(card);
    });
  }

  /* ========================================================
     캘린더 상세 모달 렌더링 엔진
     ======================================================== */
  function openChallengeDetailModal(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    state.selectedChallengeId = habitId;
    const todayStr = getLocalDateString();
    state.calendarSelectedDate = todayStr;

    // 모달 헤더 채우기
    $('#detailModalIcon').text(habit.icon);
    $('#detailModalName').text(habit.name);
    $('#detailModalDates').text(`${habit.startDate} ~ ${habit.endDate} (${habit.duration}일 챌린지)`);

    // 캘린더 기준 월 설정
    const [y, m] = habit.startDate.split('-').map(Number);
    state.calendarYearMonth = { year: y, month: m };

    // 하단 종료/재도전 버튼 토글
    const metrics = calculateHabitMetrics(habit);
    if (metrics.computedStatus === 'paused') {
      $('#btnDetailPause').hide();
      $('#btnDetailRetry').show();
    } else if (metrics.computedStatus === 'completed') {
      $('#btnDetailPause').hide();
      $('#btnDetailRetry').show();
    } else {
      $('#btnDetailPause').show();
      $('#btnDetailRetry').hide();
    }

    renderDetailStats();
    renderMonthCalendar();
    renderDateRecordPanel();

    $('#modalChallengeDetail').fadeIn(150);
  }

  function renderDetailStats() {
    const habit = state.habits.find(h => h.id === state.selectedChallengeId);
    if (!habit) return;
    const m = calculateHabitMetrics(habit);

    $('#dstatOverallRate').text(`${m.overallRate}%`);
    $('#dstatCompletedDays').text(`${m.completedCount} / ${habit.duration}일`);
    $('#dstatCurrentStreak').text(`${m.currentStreak}일`);
    $('#dstatMaxStreak').text(`${m.maxStreak}일`);
  }

  function renderMonthCalendar() {
    const habit = state.habits.find(h => h.id === state.selectedChallengeId);
    if (!habit) return;

    const { year, month } = state.calendarYearMonth;
    $('#calCurrentMonthDisplay').text(`${year}년 ${month}월`);

    const $grid = $('#monthCalendarGrid');
    $grid.empty();

    // 요일 헤더
    const daysHeader = ['일', '월', '화', '수', '목', '금', '토'];
    daysHeader.forEach(dh => {
      $grid.append(`<div class="cal-cell-header">${dh}</div>`);
    });

    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const todayStr = getLocalDateString();

    // 1일 이전 빈칸
    for (let i = 0; i < firstDay; i++) {
      $grid.append('<div class="cal-day-cell empty"></div>');
    }

    // 날짜 셀 렌더링
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isRange = dateStr >= habit.startDate && dateStr <= habit.endDate;
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === state.calendarSelectedDate;

      const record = (habit.records && habit.records[dateStr]);
      const isDone = record && record.completed;

      let dotHtml = '';
      if (isRange) {
        if (isDone) {
          dotHtml = '<span class="cal-cell-dot done" title="완료"></span>';
        } else if (dateStr < todayStr) {
          dotHtml = '<span class="cal-cell-dot missed" title="미완료"></span>';
        }
      }

      const cellHtml = `
        <div class="cal-day-cell ${isRange ? 'is-range' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'selected' : ''}" data-date="${dateStr}">
          <span>${day}</span>
          ${dotHtml}
        </div>
      `;
      $grid.append(cellHtml);
    }
  }

  function renderDateRecordPanel() {
    const habit = state.habits.find(h => h.id === state.selectedChallengeId);
    if (!habit) return;

    const selectedDate = state.calendarSelectedDate || getLocalDateString();
    const todayStr = getLocalDateString();
    const isRange = selectedDate >= habit.startDate && selectedDate <= habit.endDate;
    const isFuture = selectedDate > todayStr;
    const isBeforeStart = selectedDate < habit.startDate;

    $('#recordSelectedDateText').text(`${formatKoreanDate(selectedDate)} 실천 기록`);

    const record = (habit.records && habit.records[selectedDate]) || { completed: false, quantity: 0, note: '' };
    const isDone = record.completed;

    if (isDone) {
      $('#recordStatusPill').text('완료됨').addClass('done');
    } else {
      $('#recordStatusPill').text('미완료').removeClass('done');
    }

    const $actionWrap = $('#recordActionWrap');
    $actionWrap.empty();

    if (!isRange) {
      $actionWrap.html('<span class="text-muted" style="font-size: 0.85rem;">챌린지 기간(시작일~종료일) 외부의 날짜는 수정할 수 없습니다.</span>');
      $('#inputDailyNote').val(record.note || '').prop('disabled', true);
      $('#btnSaveDailyNote').prop('disabled', true);
      return;
    }

    if (isFuture) {
      $actionWrap.html('<span class="text-warning" style="font-size: 0.85rem;">미래 날짜는 미리 완료 처리할 수 없습니다.</span>');
      $('#inputDailyNote').val(record.note || '').prop('disabled', true);
      $('#btnSaveDailyNote').prop('disabled', true);
      return;
    }

    $('#inputDailyNote').val(record.note || '').prop('disabled', false);
    $('#btnSaveDailyNote').prop('disabled', false);

    // 액션 컨트롤러 생성
    if (habit.goalType === 'quantity') {
      const controlHtml = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span>기록 수량:</span>
            <div class="qty-stepper-wrap">
              <button type="button" class="qty-step-btn btn-cal-qty-minus">−</button>
              <input type="number" class="qty-input-field" id="inputCalQty" value="${record.quantity || 0}" min="0">
              <button type="button" class="qty-step-btn btn-cal-qty-plus">+</button>
            </div>
            <span>/ ${habit.targetQty} ${habit.unit}</span>
          </div>
          <button type="button" class="btn ${isDone ? 'btn-success' : 'btn-outline'} btn-sm" id="btnToggleCalDone">
            ${isDone ? '✓ 목표 달성 완료' : '미달성'}
          </button>
        </div>
      `;
      $actionWrap.html(controlHtml);
    } else {
      const toggleHtml = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <span>실천 여부:</span>
          <button type="button" class="btn ${isDone ? 'btn-success' : 'btn-outline'} btn-sm" id="btnToggleCalDone">
            ${isDone ? '✓ 오늘 실천 완료!' : '완료 체크하기'}
          </button>
        </div>
      `;
      $actionWrap.html(toggleHtml);
    }
  }

  /* ========================================================
     이벤트 바인딩
     ======================================================== */
  function initEvents() {
    // 1. 새 챌린지 모달 열기
    $('#btnOpenNewChallengeModal, #btnEmptyCreate').on('click', function() {
      openCreateModal();
    });

    // 2. 모달 닫기 공통
    $('[data-close]').on('click', function() {
      const modalId = $(this).data('close');
      $('#' + modalId).fadeOut(150);
    });

    // 3. 챌린지 기간 라디오 변경 시 예상 종료일 즉시 계산
    $('input[name="challengePeriodRadio"]').on('change', function() {
      $('.period-card').removeClass('active');
      $(this).closest('.period-card').addClass('active');
      updateCalculatedEndDate();
    });

    $('#inputStartDate').on('change', function() {
      updateCalculatedEndDate();
    });

    // 4. 목표 형태 라디오 변경 (체크형 vs 수량형)
    $('input[name="goalTypeRadio"]').on('change', function() {
      $('.gtype-card').removeClass('active');
      $(this).closest('.gtype-card').addClass('active');
      const val = $(this).val();
      if (val === 'quantity') {
        $('#quantityGoalWrap').slideDown(150);
      } else {
        $('#quantityGoalWrap').slideUp(150);
      }
    });

    // 5. 20개 추천 프리셋 렌더링 & 선택
    renderPresetTemplates();
    $(document).on('click', '.preset-chip-btn', function() {
      const idx = $(this).data('index');
      const template = PRESET_TEMPLATES[idx];
      if (!template) return;

      $('#inputHabitName').val(template.name);
      $('#inputHabitDesc').val(template.desc);
      $('#selectHabitCategory').val(template.category);

      // 목표 형태 및 수량
      if (template.goalType === 'quantity') {
        $(`input[name="goalTypeRadio"][value="quantity"]`).prop('checked', true).trigger('change');
        $('#inputTargetQty').val(template.targetQty);
        $('#inputTargetUnit').val(template.unit);
      } else {
        $(`input[name="goalTypeRadio"][value="check"]`).prop('checked', true).trigger('change');
      }

      // 아이콘 및 컬러 선택
      selectIcon(template.icon);
      selectColor(template.color);
    });

    // 6. 아이콘 및 컬러 피커 렌더링
    renderIconAndColorPickers();

    // 7. 챌린지 생성/수정 제출
    $('#btnSubmitChallengeForm').on('click', handleSaveChallengeForm);

    // 8. 오늘의 체크리스트 체크/해제
    $(document).on('click', '.th-check-btn', function() {
      const habitId = $(this).data('id');
      toggleTodayCheck(habitId);
    });

    // 9. 오늘의 수량 증감 버튼
    $(document).on('click', '.btn-qty-plus', function() {
      const habitId = $(this).data('id');
      changeTodayQuantity(habitId, 1);
    });

    $(document).on('click', '.btn-qty-minus', function() {
      const habitId = $(this).data('id');
      changeTodayQuantity(habitId, -1);
    });

    $(document).on('change', '.qty-input-field', function() {
      const habitId = $(this).data('id');
      const val = parseInt($(this).val(), 10) || 0;
      setTodayQuantity(habitId, val);
    });

    // 10. 상태 필터 및 카테고리 필터 클릭
    $('#statusFilterControl .seg-btn').on('click', function() {
      $('#statusFilterControl .seg-btn').removeClass('active');
      $(this).addClass('active');
      state.filterStatus = $(this).data('status');
      renderChallengeCards();
    });

    $('#categoryFilterBar .cat-chip').on('click', function() {
      $('#categoryFilterBar .cat-chip').removeClass('active');
      $(this).addClass('active');
      state.filterCategory = $(this).data('category');
      renderChallengeCards();
    });

    $('#sortChallengesSelect').on('change', function() {
      state.sortBy = $(this).val();
      renderChallengeCards();
    });

    // 11. 챌린지 상세 및 캘린더 모달 열기
    $(document).on('click', '.btn-open-detail', function() {
      const habitId = $(this).data('id');
      openChallengeDetailModal(habitId);
    });

    // 12. 캘린더 월 이동
    $('#btnCalPrevMonth').on('click', function() {
      let { year, month } = state.calendarYearMonth;
      month--;
      if (month < 1) { month = 12; year--; }
      state.calendarYearMonth = { year, month };
      renderMonthCalendar();
    });

    $('#btnCalNextMonth').on('click', function() {
      let { year, month } = state.calendarYearMonth;
      month++;
      if (month > 12) { month = 1; year++; }
      state.calendarYearMonth = { year, month };
      renderMonthCalendar();
    });

    // 13. 캘린더 날짜 셀 클릭
    $(document).on('click', '.cal-day-cell:not(.empty)', function() {
      const dateStr = $(this).data('date');
      state.calendarSelectedDate = dateStr;
      $('.cal-day-cell').removeClass('selected');
      $(this).addClass('selected');
      renderDateRecordPanel();
    });

    // 14. 캘린더 날짜 상세 패널에서 완료 토글 및 수량 조절
    $(document).on('click', '#btnToggleCalDone', function() {
      toggleSelectedDateRecord();
    });

    $(document).on('click', '.btn-cal-qty-plus', function() {
      changeSelectedDateQty(1);
    });

    $(document).on('click', '.btn-cal-qty-minus', function() {
      changeSelectedDateQty(-1);
    });

    $(document).on('change', '#inputCalQty', function() {
      const val = parseInt($(this).val(), 10) || 0;
      setSelectedDateQty(val);
    });

    // 15. 일일 메모 저장
    $('#btnSaveDailyNote').on('click', function() {
      saveSelectedDateNote();
    });

    // 16. 챌린지 삭제
    $('#btnDetailDelete').on('click', function() {
      if (!confirm('이 챌린지를 삭제하시겠습니까?\n삭제된 기록과 메모는 복구할 수 없습니다.')) return;
      state.habits = state.habits.filter(h => h.id !== state.selectedChallengeId);
      saveHabits();
      $('#modalChallengeDetail').fadeOut(150);
      renderAll();
    });

    // 17. 챌린지 중도 종료
    $('#btnDetailPause').on('click', function() {
      if (!confirm('챌린지를 중도 종료하시겠습니까?\n기존에 실천한 일수와 통계 기록은 그대로 유지됩니다.')) return;
      const habit = state.habits.find(h => h.id === state.selectedChallengeId);
      if (habit) {
        habit.status = 'paused';
        saveHabits();
        $('#modalChallengeDetail').fadeOut(150);
        renderAll();
      }
    });

    // 18. 챌린지 재도전
    $(document).on('click', '.btn-retry-habit, #btnDetailRetry', function() {
      const habitId = $(this).data('id') || state.selectedChallengeId;
      retryChallenge(habitId);
    });

    // 19. 챌린지 수정 버튼
    $(document).on('click', '.btn-edit-habit', function() {
      const habitId = $(this).data('id');
      openEditModal(habitId);
    });

    // 20. JSON 내보내기 & 가져오기
    $('#btnExportHabitsJson').on('click', exportHabitsJson);
    $('#importHabitsJsonInput').on('change', importHabitsJson);
  }

  /* ========================================================
     모달 보조 함수군
     ======================================================== */
  function openCreateModal() {
    $('#modalChallengeTitle').text('새로운 습관 챌린지 만들기');
    $('#editChallengeId').val('');
    $('#createChallengeForm')[0].reset();

    const todayStr = getLocalDateString();
    $('#inputStartDate').val(todayStr);
    $(`input[name="challengePeriodRadio"][value="7"]`).prop('checked', true).trigger('change');
    $(`input[name="goalTypeRadio"][value="check"]`).prop('checked', true).trigger('change');

    selectIcon('🌱');
    selectColor('#4f46e5');
    updateCalculatedEndDate();

    $('#modalCreateChallenge').fadeIn(150);
  }

  function openEditModal(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    $('#modalChallengeTitle').text('습관 챌린지 정보 수정');
    $('#editChallengeId').val(habit.id);
    $('#inputHabitName').val(habit.name);
    $('#inputHabitDesc').val(habit.desc || '');
    $('#selectHabitCategory').val(habit.category);

    $(`input[name="challengePeriodRadio"][value="${habit.duration}"]`).prop('checked', true).trigger('change');
    $('#inputStartDate').val(habit.startDate);

    if (habit.goalType === 'quantity') {
      $(`input[name="goalTypeRadio"][value="quantity"]`).prop('checked', true).trigger('change');
      $('#inputTargetQty').val(habit.targetQty);
      $('#inputTargetUnit').val(habit.unit);
    } else {
      $(`input[name="goalTypeRadio"][value="check"]`).prop('checked', true).trigger('change');
    }

    selectIcon(habit.icon);
    selectColor(habit.color);
    updateCalculatedEndDate();

    $('#modalCreateChallenge').fadeIn(150);
  }

  function updateCalculatedEndDate() {
    const startDate = $('#inputStartDate').val() || getLocalDateString();
    const duration = parseInt($('input[name="challengePeriodRadio"]:checked').val(), 10) || 7;
    const endDate = addDays(startDate, duration - 1);
    $('#calculatedEndDateDisplay').text(`${endDate} (${duration}일간)`);
  }

  function renderPresetTemplates() {
    const $grid = $('#presetTemplatesGrid');
    $grid.empty();
    PRESET_TEMPLATES.forEach((tpl, idx) => {
      const chip = `<button type="button" class="preset-chip-btn" data-index="${idx}">${tpl.icon} ${escapeHtml(tpl.name)}</button>`;
      $grid.append(chip);
    });
  }

  function renderIconAndColorPickers() {
    const $iconGrid = $('#iconPickerGrid');
    $iconGrid.empty();
    PRESET_ICONS.forEach(icon => {
      const btn = `<button type="button" class="icon-pick-btn" data-icon="${icon}">${icon}</button>`;
      $iconGrid.append(btn);
    });

    const $colorGrid = $('#colorPickerGrid');
    $colorGrid.empty();
    PRESET_COLORS.forEach(color => {
      const btn = `<button type="button" class="color-swatch-btn" data-color="${color}" style="background: ${color};"></button>`;
      $colorGrid.append(btn);
    });

    $(document).on('click', '.icon-pick-btn', function() {
      selectIcon($(this).data('icon'));
    });

    $(document).on('click', '.color-swatch-btn', function() {
      selectColor($(this).data('color'));
    });
  }

  function selectIcon(icon) {
    $('.icon-pick-btn').removeClass('selected');
    $(`.icon-pick-btn[data-icon="${icon}"]`).addClass('selected');
    $('#createChallengeForm').data('selected-icon', icon);
  }

  function selectColor(color) {
    $('.color-swatch-btn').removeClass('selected');
    $(`.color-swatch-btn[data-color="${color}"]`).addClass('selected');
    $('#createChallengeForm').data('selected-color', color);
  }

  function handleSaveChallengeForm() {
    const editId = $('#editChallengeId').val();
    const name = $.trim($('#inputHabitName').val());
    if (!name) {
      alert('습관 이름을 입력해주세요.');
      $('#inputHabitName').focus();
      return;
    }

    const desc = $.trim($('#inputHabitDesc').val());
    const category = $('#selectHabitCategory').val();
    const duration = parseInt($('input[name="challengePeriodRadio"]:checked').val(), 10) || 7;
    const startDate = $('#inputStartDate').val() || getLocalDateString();
    const endDate = addDays(startDate, duration - 1);

    const goalType = $('input[name="goalTypeRadio"]:checked').val();
    let targetQty = 1;
    let unit = '회';

    if (goalType === 'quantity') {
      targetQty = parseInt($('#inputTargetQty').val(), 10) || 1;
      if (targetQty <= 0) {
        alert('목표 수량은 1 이상이어야 합니다.');
        return;
      }
      unit = $.trim($('#inputTargetUnit').val()) || '개';
    }

    const icon = $('#createChallengeForm').data('selected-icon') || '🌱';
    const color = $('#createChallengeForm').data('selected-color') || '#4f46e5';

    if (editId) {
      // 기존 챌린지 수정
      const habit = state.habits.find(h => h.id === editId);
      if (habit) {
        habit.name = name;
        habit.desc = desc;
        habit.category = category;
        habit.icon = icon;
        habit.color = color;
        habit.goalType = goalType;
        habit.targetQty = targetQty;
        habit.unit = unit;

        // 기간이나 시작일 변경 시 재계산
        if (habit.duration !== duration || habit.startDate !== startDate) {
          habit.duration = duration;
          habit.startDate = startDate;
          habit.endDate = endDate;
        }

        saveHabits();
        $('#modalCreateChallenge').fadeOut(150);
        renderAll();
      }
    } else {
      // 신규 챌린지 생성
      const newHabit = {
        id: 'hab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name,
        desc,
        category,
        duration,
        startDate,
        endDate,
        goalType,
        targetQty,
        unit,
        icon,
        color,
        status: 'active',
        records: {},
        createdAt: new Date().toISOString()
      };

      state.habits.unshift(newHabit);
      saveHabits();
      $('#modalCreateChallenge').fadeOut(150);
      renderAll();
    }
  }

  /* ========================================================
     기록 조작 (오늘 완료 & 캘린더 날짜 수정)
     ======================================================== */
  function toggleTodayCheck(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    const todayStr = getLocalDateString();
    if (!habit.records) habit.records = {};
    const curr = habit.records[todayStr] || { completed: false, quantity: 0, note: '' };

    if (curr.completed) {
      // 완료 취소
      curr.completed = false;
      if (habit.goalType === 'quantity') {
        curr.quantity = 0;
      }
    } else {
      // 완료
      curr.completed = true;
      if (habit.goalType === 'quantity') {
        curr.quantity = habit.targetQty;
      }
    }

    habit.records[todayStr] = curr;
    saveHabits();
    renderAll();
  }

  function changeTodayQuantity(habitId, delta) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    const todayStr = getLocalDateString();
    if (!habit.records) habit.records = {};
    const curr = habit.records[todayStr] || { completed: false, quantity: 0, note: '' };

    let newQty = (curr.quantity || 0) + delta;
    if (newQty < 0) newQty = 0;

    curr.quantity = newQty;
    curr.completed = newQty >= habit.targetQty;

    habit.records[todayStr] = curr;
    saveHabits();
    renderAll();
  }

  function setTodayQuantity(habitId, val) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    const todayStr = getLocalDateString();
    if (!habit.records) habit.records = {};
    const curr = habit.records[todayStr] || { completed: false, quantity: 0, note: '' };

    let newQty = val < 0 ? 0 : val;
    curr.quantity = newQty;
    curr.completed = newQty >= habit.targetQty;

    habit.records[todayStr] = curr;
    saveHabits();
    renderAll();
  }

  // 캘린더 내 특정 날짜 수정
  function toggleSelectedDateRecord() {
    const habit = state.habits.find(h => h.id === state.selectedChallengeId);
    if (!habit) return;

    const dateStr = state.calendarSelectedDate;
    if (!dateStr) return;

    if (!habit.records) habit.records = {};
    const curr = habit.records[dateStr] || { completed: false, quantity: 0, note: '' };

    if (curr.completed) {
      curr.completed = false;
      if (habit.goalType === 'quantity') curr.quantity = 0;
    } else {
      curr.completed = true;
      if (habit.goalType === 'quantity') curr.quantity = habit.targetQty;
    }

    habit.records[dateStr] = curr;
    saveHabits();
    renderDetailStats();
    renderMonthCalendar();
    renderDateRecordPanel();
    renderAll();
  }

  function changeSelectedDateQty(delta) {
    const habit = state.habits.find(h => h.id === state.selectedChallengeId);
    if (!habit) return;
    const dateStr = state.calendarSelectedDate;
    if (!dateStr) return;

    if (!habit.records) habit.records = {};
    const curr = habit.records[dateStr] || { completed: false, quantity: 0, note: '' };

    let newQty = (curr.quantity || 0) + delta;
    if (newQty < 0) newQty = 0;

    curr.quantity = newQty;
    curr.completed = newQty >= habit.targetQty;

    habit.records[dateStr] = curr;
    saveHabits();
    renderDetailStats();
    renderMonthCalendar();
    renderDateRecordPanel();
    renderAll();
  }

  function setSelectedDateQty(val) {
    const habit = state.habits.find(h => h.id === state.selectedChallengeId);
    if (!habit) return;
    const dateStr = state.calendarSelectedDate;
    if (!dateStr) return;

    if (!habit.records) habit.records = {};
    const curr = habit.records[dateStr] || { completed: false, quantity: 0, note: '' };

    let newQty = val < 0 ? 0 : val;
    curr.quantity = newQty;
    curr.completed = newQty >= habit.targetQty;

    habit.records[dateStr] = curr;
    saveHabits();
    renderDetailStats();
    renderMonthCalendar();
    renderDateRecordPanel();
    renderAll();
  }

  function saveSelectedDateNote() {
    const habit = state.habits.find(h => h.id === state.selectedChallengeId);
    if (!habit) return;
    const dateStr = state.calendarSelectedDate;
    if (!dateStr) return;

    const note = $.trim($('#inputDailyNote').val());
    if (!habit.records) habit.records = {};
    const curr = habit.records[dateStr] || { completed: false, quantity: 0, note: '' };
    curr.note = note;
    habit.records[dateStr] = curr;

    saveHabits();
    alert('메모가 안전하게 저장되었습니다.');
  }

  // 재도전: 기존 습관 데이터 복사 후 새로운 챌린지 인스턴스 시작
  function retryChallenge(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    const todayStr = getLocalDateString();
    openCreateModal();

    $('#inputHabitName').val(habit.name);
    $('#inputHabitDesc').val(habit.desc || '');
    $('#selectHabitCategory').val(habit.category);
    $(`input[name="challengePeriodRadio"][value="${habit.duration}"]`).prop('checked', true).trigger('change');
    $('#inputStartDate').val(todayStr);

    if (habit.goalType === 'quantity') {
      $(`input[name="goalTypeRadio"][value="quantity"]`).prop('checked', true).trigger('change');
      $('#inputTargetQty').val(habit.targetQty);
      $('#inputTargetUnit').val(habit.unit);
    } else {
      $(`input[name="goalTypeRadio"][value="check"]`).prop('checked', true).trigger('change');
    }

    selectIcon(habit.icon);
    selectColor(habit.color);
    updateCalculatedEndDate();

    $('#modalChallengeDetail').fadeOut(100);
  }

  /* ========================================================
     JSON 백업 및 복원 엔진
     ======================================================== */
  function exportHabitsJson() {
    const dataToExport = {
      app: '1-min-challenge',
      service: 'habit-challenge',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      habits: state.habits
    };

    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `habits_backup_${getLocalDateString()}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  }

  function importHabitsJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const imported = JSON.parse(evt.target.result);
        if (!imported.habits || !Array.isArray(imported.habits)) {
          alert('올바른 습관 챌린지 백업 JSON 파일이 아닙니다.');
          return;
        }

        const isMerge = confirm('기존 기록에 합치시겠습니까?\n[확인]을 누르면 기존 기록에 병합되고, [취소]를 누르면 새 데이터로 완전히 교체됩니다.');

        if (isMerge) {
          // 병합: 고유 ID 중복 방지
          const existingIds = new Set(state.habits.map(h => h.id));
          imported.habits.forEach(h => {
            if (existingIds.has(h.id)) {
              h.id = 'hab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            }
            state.habits.push(h);
          });
        } else {
          state.habits = imported.habits;
        }

        saveHabits();
        renderAll();
        alert('성공적으로 습관 기록을 불러왔습니다!');
      } catch (err) {
        alert('JSON 파일 형식이 올바르지 않거나 손상되었습니다.');
      }
      // 파일 인풋 초기화
      $('#importHabitsJsonInput').val('');
    };
    reader.readAsText(file);
  }

  /* ========================================================
     HTML 특수문자 이스케이프 유틸
     ======================================================== */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ========================================================
     문서 준비 시 초기화 실행
     ======================================================== */
  $(document).ready(function() {
    loadHabits();
    initEvents();
    renderAll();

    // 자정이 지나 날짜가 변경되었는지 1분마다 검사
    let currentCheckDate = getLocalDateString();
    setInterval(function() {
      const nowStr = getLocalDateString();
      if (nowStr !== currentCheckDate) {
        currentCheckDate = nowStr;
        renderAll();
      }
    }, 60000);
  });

})(jQuery);
