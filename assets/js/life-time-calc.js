/**
 * ========================================================
 * 살아온 시간 계산기 자바스크립트 엔진 (life-time-calc.js)
 * 나는 지금까지 얼마나 많은 시간을 살아왔을까? - 1-Min Challenge
 * ========================================================
 */

(function($) {
  'use strict';

  // 로컬 스토리지 키
  const STORAGE_KEY_USER_DATA = 'challenge_1min_lifetime_data';
  const STORAGE_KEY_ANNIVS = 'challenge_1min_lifetime_anniversaries';

  // 기본 마일스톤 일수 목록
  const MILESTONE_DAYS = [100, 500, 1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000, 25000, 30000];

  // 개인 기념일 기본 아이콘
  const ANNIV_PRESET_ICONS = ['🎒', '🎓', '💼', '✈️', '💍', '🎯', '🏠', '🚗', '🏆', '🐾', '❤️', '⭐'];

  // 상태 관리 객체
  const state = {
    birthDateStr: '',    // 'YYYY-MM-DD'
    birthTimeStr: '00:00',// 'HH:mm'
    birthDate: null,     // Date 객체
    hasTimeInput: false,
    saveConsent: false,
    timerInterval: null,
    personalAnniversaries: [],
    selectedAnnivIcon: '⭐'
  };

  /* ========================================================
     날짜 안전 헬퍼 함수군
     ======================================================== */
  function getTodayLocalDateString() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function parseLocalDate(dateStr) {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function formatKoreanDate(dateObj) {
    if (!dateObj || isNaN(dateObj.getTime())) return '';
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth() + 1;
    const d = dateObj.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[dateObj.getDay()];
    return `${y}년 ${m}월 ${d}일 (${dayName})`;
  }

  function formatYMD(dateObj) {
    if (!dateObj || isNaN(dateObj.getTime())) return '';
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  function addCommas(num) {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // 띠 계산
  function getZodiacAnimal(year) {
    const animals = ['원숭이띠 🐒', '닭띠 🐓', '개띠 🐕', '돼지띠 🐖', '쥐띠 🐀', '소띠 🐂', '호랑이띠 🐅', '토끼띠 🐇', '용띠 🐉', '뱀띠 🐍', '말띠 🐎', '양띠 🐑'];
    return animals[year % 12];
  }

  // 별자리 계산
  function getConstellation(month, day) {
    const constellations = [
      { name: '염소자리 ♑', start: [1, 1], end: [1, 19] },
      { name: '물병자리 ♒', start: [1, 20], end: [2, 18] },
      { name: '물고기자리 ♓', start: [2, 19], end: [3, 20] },
      { name: '양자리 ♈', start: [3, 21], end: [4, 19] },
      { name: '황소자리 ♉', start: [4, 20], end: [5, 20] },
      { name: '쌍둥이자리 ♊', start: [5, 21], end: [6, 21] },
      { name: '게자리 ♋', start: [6, 22], end: [7, 22] },
      { name: '사자자리 ♌', start: [7, 23], end: [8, 22] },
      { name: '처녀자리 ♍', start: [8, 23], end: [9, 22] },
      { name: '천칭자리 ♎', start: [9, 23], end: [10, 22] },
      { name: '전갈자리 ♏', start: [10, 23], end: [11, 21] },
      { name: '사수자리 ♐', start: [11, 22], end: [12, 21] },
      { name: '염소자리 ♑', start: [12, 22], end: [12, 31] }
    ];

    for (let c of constellations) {
      const [sm, sd] = c.start;
      const [em, ed] = c.end;
      if (
        (month === sm && day >= sd) ||
        (month === em && day <= ed)
      ) {
        return c.name;
      }
    }
    return '염소자리 ♑';
  }

  /* ========================================================
     유효성 검사
     ======================================================== */
  function validateBirthDate(dateStr, timeStr) {
    if (!dateStr) {
      return { valid: false, message: '생년월일을 입력해주세요.' };
    }

    const todayStr = getTodayLocalDateString();
    if (dateStr > todayStr) {
      return { valid: false, message: '오늘 이후의 날짜는 생년월일로 입력할 수 없어요.' };
    }

    const [y, m, d] = dateStr.split('-').map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d) || y < 1900 || m < 1 || m > 12 || d < 1 || d > 31) {
      return { valid: false, message: '올바른 생년월일을 입력해주세요.' };
    }

    // 실제 존재하는 달력 날짜인지 검증 (2월 30일 등 방지)
    const testDate = new Date(y, m - 1, d);
    if (testDate.getFullYear() !== y || testDate.getMonth() !== m - 1 || testDate.getDate() !== d) {
      return { valid: false, message: '달력에 존재하지 않는 잘못된 날짜입니다.' };
    }

    return { valid: true };
  }

  /* ========================================================
     핵심 계산 엔진
     ======================================================== */
  function updateCalculations() {
    if (!state.birthDate) return;

    const now = new Date();
    const diffMs = now.getTime() - state.birthDate.getTime();

    if (diffMs < 0) return;

    // 1. 살아온 총 일수 (만 24시간 단위 경과 일수)
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // 2. 달력상 몇 일 차인지 (태어난 날 = 1일 차)
    const bYear = state.birthDate.getFullYear();
    const bMonth = state.birthDate.getMonth();
    const bDay = state.birthDate.getDate();
    const bZeroDate = new Date(bYear, bMonth, bDay, 0, 0, 0, 0);
    const nowZeroDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const calendarDaysDiff = Math.round((nowZeroDate.getTime() - bZeroDate.getTime()) / (1000 * 60 * 60 * 24));
    const calendarDayN = calendarDaysDiff + 1;

    // 3. 실시간 총 시간, 분, 초
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalSeconds = Math.floor(diffMs / 1000);

    // 4. 복합 시간 (일, 시, 분, 초)
    const remMs = diffMs % (1000 * 60 * 60 * 24);
    const cHours = Math.floor(remMs / (1000 * 60 * 60));
    const cMinutes = Math.floor((remMs % (1000 * 60 * 60)) / (1000 * 60));
    const cSeconds = Math.floor((remMs % (1000 * 60)) / 1000);

    // DOM 실시간 반영 (초단위 지터 방지)
    $('#cDays').text(addCommas(totalDays));
    $('#cHours').text(String(cHours).padStart(2, '0'));
    $('#cMinutes').text(String(cMinutes).padStart(2, '0'));
    $('#cSeconds').text(String(cSeconds).padStart(2, '0'));

    $('#resTotalHours').text(`${addCommas(totalHours)}시간`);
    $('#resTotalMinutes').text(`${addCommas(totalMinutes)}분`);
    $('#resTotalSeconds').text(`${addCommas(totalSeconds)}초`);

    // 5. 다음 생일 카운트다운
    updateNextBirthdayCountdown(now);
  }

  // 정적 통계 및 나이/기념일/타임라인 렌더링 (입력 시 1회)
  function renderStaticResults() {
    if (!state.birthDate) return;

    const now = new Date();
    const bYear = state.birthDate.getFullYear();
    const bMonth = state.birthDate.getMonth() + 1; // 1-indexed
    const bDay = state.birthDate.getDate();

    // 1. 총 살아온 일수 카운트업
    const diffMs = now.getTime() - state.birthDate.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    animateCountUp($('#resTotalDaysNum'), totalDays);

    // 달력상 일차
    const bZeroDate = new Date(bYear, bMonth - 1, bDay, 0, 0, 0, 0);
    const nowZeroDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const calendarDaysDiff = Math.round((nowZeroDate.getTime() - bZeroDate.getTime()) / (1000 * 60 * 60 * 24));
    const calendarDayN = calendarDaysDiff + 1;
    $('#resCalendarDaysBadge').html(`<span>태어난 날을 1일 차로 계산하면 오늘은 <strong>${addCommas(calendarDayN)}일 차</strong>예요.</span>`);

    // 2. 만 나이 계산
    let age = now.getFullYear() - bYear;
    const isBirthdayPassedThisYear = (now.getMonth() + 1 > bMonth) ||
      (now.getMonth() + 1 === bMonth && now.getDate() >= bDay);
    if (!isBirthdayPassedThisYear) {
      age--;
    }
    $('#resManAge').text(`만 ${age}세`);
    $('#resBirthYearDetail').text(`${bYear}년생`);

    // 3. 달력 기준 실제 경과 연·월·일
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    const curDay = now.getDate();

    let yDiff = curYear - bYear;
    let mDiff = curMonth - bMonth;
    let dDiff = curDay - bDay;

    if (dDiff < 0) {
      const prevMonthLastDay = new Date(curYear, curMonth - 1, 0).getDate();
      dDiff += prevMonthLastDay;
      mDiff--;
    }
    if (mDiff < 0) {
      mDiff += 12;
      yDiff--;
    }
    $('#resCalendarDuration').text(`${yDiff}년 ${mDiff}개월 ${dDiff}일`);

    // 4. 생일 트리비아 칩스
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    $('#chipDayOfWeek').text(`📅 ${dayNames[state.birthDate.getDay()]} 출생`);
    $('#chipZodiac').text(getZodiacAnimal(bYear));
    $('#chipConstellation').text(getConstellation(bMonth, bDay));

    // 2월 29일 윤달 체크
    if (bMonth === 2 && bDay === 29) {
      $('#leapYearNotice').show();
    } else {
      $('#leapYearNotice').hide();
    }

    // 5. 오늘이 생일인지 확인
    if (now.getMonth() + 1 === bMonth && now.getDate() === bDay) {
      $('#birthdayBanner').slideDown(200);
    } else {
      $('#birthdayBanner').hide();
    }

    // 6. 누적 기념일 목록 및 가장 가까운 기념일 렌더링
    renderMilestones();

    // 7. 타임라인 렌더링
    renderLifeTimeline();

    // 8. 개인 기념일 그리드 렌더링
    renderPersonalAnniversaries();

    // 9. 사용자 지정 날짜 계산기 초기값 세팅
    $('#inputCustomDays').val(15000);
    calculateCustomDays(15000);

    const defaultTarget = new Date(now.getFullYear() + 5, 0, 1);
    $('#inputTargetDate').val(formatYMD(defaultTarget));
    calculateTargetDate(formatYMD(defaultTarget));

    // 컨테이너 표시
    $('#resultsContainer').fadeIn(250);
  }

  // 다음 생일 카운트다운 엔진
  function updateNextBirthdayCountdown(now) {
    const bMonth = state.birthDate.getMonth();
    const bDay = state.birthDate.getDate();
    const bHour = state.birthDate.getHours();
    const bMin = state.birthDate.getMinutes();

    let targetYear = now.getFullYear();
    let nextBday = new Date(targetYear, bMonth, bDay, bHour, bMin, 0, 0);

    // 2월 29일 윤달 출생자: 평년에는 2월 28일 적용
    if (bMonth === 1 && bDay === 29 && !isLeapYear(targetYear)) {
      nextBday = new Date(targetYear, 1, 28, bHour, bMin, 0, 0);
    }

    if (now > nextBday && !(now.getFullYear() === targetYear && now.getMonth() === bMonth && now.getDate() === bDay)) {
      targetYear++;
      nextBday = new Date(targetYear, bMonth, bDay, bHour, bMin, 0, 0);
      if (bMonth === 1 && bDay === 29 && !isLeapYear(targetYear)) {
        nextBday = new Date(targetYear, 1, 28, bHour, bMin, 0, 0);
      }
    }

    $('#nextBirthdayDateText').text(formatKoreanDate(nextBday));

    const nextAge = targetYear - state.birthDate.getFullYear();
    $('#nextAgeText').text(`만 ${nextAge}세`);

    const diff = nextBday.getTime() - now.getTime();
    if (diff <= 0) {
      $('#nbDays').text('0');
      $('#nbHours').text('00');
      $('#nbMins').text('00');
      $('#nbSecs').text('00');
      return;
    }

    const nbDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const rem = diff % (1000 * 60 * 60 * 24);
    const nbHours = Math.floor(rem / (1000 * 60 * 60));
    const nbMins = Math.floor((rem % (1000 * 60 * 60)) / (1000 * 60));
    const nbSecs = Math.floor((rem % (1000 * 60)) / 1000);

    $('#nbDays').text(nbDays);
    $('#nbHours').text(String(nbHours).padStart(2, '0'));
    $('#nbMins').text(String(nbMins).padStart(2, '0'));
    $('#nbSecs').text(String(nbSecs).padStart(2, '0'));
  }

  // 누적 일수 기념일 렌더링
  function renderMilestones() {
    const $grid = $('#milestonesGrid');
    $grid.empty();

    const now = new Date();
    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    let nearestMilestone = null;
    let minFutureDiff = Infinity;

    MILESTONE_DAYS.forEach(days => {
      const msDate = new Date(state.birthDate.getTime() + days * 86400000);
      const msDateZero = new Date(msDate.getFullYear(), msDate.getMonth(), msDate.getDate()).getTime();

      const isPassed = todayZero > msDateZero;
      const isToday = todayZero === msDateZero;
      const dayDiff = Math.round((msDateZero - todayZero) / 86400000);

      // 기념일 당시의 나이 계산
      let ageAtMs = msDate.getFullYear() - state.birthDate.getFullYear();
      if (
        (msDate.getMonth() < state.birthDate.getMonth()) ||
        (msDate.getMonth() === state.birthDate.getMonth() && msDate.getDate() < state.birthDate.getDate())
      ) {
        ageAtMs--;
      }

      // 가장 가까운 미래 기념일 탐색
      if (!isPassed && dayDiff >= 0 && dayDiff < minFutureDiff) {
        minFutureDiff = dayDiff;
        nearestMilestone = { days, date: msDate, dayDiff, isToday, ageAtMs };
      }

      let ddayText = '';
      if (isToday) {
        ddayText = '<strong class="ms-dday upcoming">오늘 (D-Day) 🎉</strong>';
      } else if (isPassed) {
        ddayText = `<span class="ms-dday">${addCommas(Math.abs(dayDiff))}일 전</span>`;
      } else {
        ddayText = `<strong class="ms-dday upcoming">D-${addCommas(dayDiff)}</strong>`;
      }

      const card = `
        <div class="milestone-card ${isPassed ? 'passed' : 'upcoming'}">
          <div class="ms-head">
            <h4 class="ms-title">태어난 지 ${addCommas(days)}일</h4>
            <span class="ms-badge ${isPassed ? 'passed' : 'upcoming'}">${isToday ? '오늘!' : (isPassed ? '지남' : '다가옴')}</span>
          </div>
          <div class="ms-date">📅 ${formatYMD(msDate)}</div>
          <div class="ms-foot">
            <span>만 ${ageAtMs}세</span>
            ${ddayText}
          </div>
        </div>
      `;
      $grid.append(card);
    });

    // 가장 가까운 특별한 기념일 배너 세팅
    if (nearestMilestone) {
      $('#nmTitle').text(`태어난 지 ${addCommas(nearestMilestone.days)}일`);
      $('#nmDate').text(formatKoreanDate(nearestMilestone.date));
      if (nearestMilestone.isToday) {
        $('#nmDdayBadge').html('<strong>D-DAY!</strong><span>오늘은 태어난 지 ' + addCommas(nearestMilestone.days) + '일 되는 날이에요! 🎉</span>');
      } else {
        $('#nmDdayBadge').html(`<strong>D-${nearestMilestone.dayDiff}</strong><span>앞으로 ${nearestMilestone.dayDiff}일 남았어요</span>`);
      }
      $('#nearestMilestoneBanner').show();
    } else {
      $('#nearestMilestoneBanner').hide();
    }
  }

  // 인생 타임라인 렌더링
  function renderLifeTimeline() {
    const $container = $('#lifeTimelineContainer');
    $container.empty();

    const now = new Date();
    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const nodes = [];

    // 1. 출생일
    nodes.push({
      date: new Date(state.birthDate),
      icon: '🌱',
      title: '세상에 첫 발을 내딛은 날 (출생)',
      desc: `${formatKoreanDate(state.birthDate)} 세상에 태어났습니다.`
    });

    // 2. 1번째 생일
    const firstBday = new Date(state.birthDate.getFullYear() + 1, state.birthDate.getMonth(), state.birthDate.getDate());
    nodes.push({
      date: firstBday,
      icon: '🎂',
      title: '첫 번째 생일 (만 1세)',
      desc: '첫 돌을 맞이하여 한 살이 되었습니다.'
    });

    // 3. 주요 마일스톤 (1000, 5000, 10000, 20000일)
    [1000, 5000, 10000, 20000].forEach(d => {
      const msDate = new Date(state.birthDate.getTime() + d * 86400000);
      nodes.push({
        date: msDate,
        icon: '💎',
        title: `태어난 지 ${addCommas(d)}일`,
        desc: `${addCommas(d)}일 동안 성실하게 살아온 소중한 인생 마일스톤`
      });
    });

    // 4. 개인 등록 기념일 병합
    state.personalAnniversaries.forEach(anniv => {
      const aDate = parseLocalDate(anniv.date);
      const daysLived = Math.floor((aDate.getTime() - state.birthDate.getTime()) / 86400000);
      nodes.push({
        date: aDate,
        icon: anniv.icon || '⭐',
        title: anniv.name,
        desc: `${anniv.note ? anniv.note + ' · ' : ''}태어난 지 ${addCommas(daysLived)}일째`
      });
    });

    // 5. 오늘 (현재 시점) 노드 추가
    nodes.push({
      date: now,
      icon: '📍',
      title: '오늘, 지금 이 순간',
      desc: `태어난 지 ${addCommas(Math.floor((now.getTime() - state.birthDate.getTime()) / 86400000))}일째 실시간으로 살아가는 중`,
      isTodayNode: true
    });

    // 날짜 오름차순 정렬
    nodes.sort((a, b) => a.date.getTime() - b.date.getTime());

    nodes.forEach(node => {
      const nodeZero = new Date(node.date.getFullYear(), node.date.getMonth(), node.date.getDate()).getTime();
      const isToday = node.isTodayNode || (todayZero === nodeZero);
      const isFuture = nodeZero > todayZero;
      const dayDiff = Math.round((nodeZero - todayZero) / 86400000);

      let ddayBadge = '';
      if (isToday) {
        ddayBadge = '<span class="tl-dday today">오늘</span>';
      } else if (isFuture) {
        ddayBadge = `<span class="tl-dday future">D-${dayDiff}</span>`;
      } else {
        ddayBadge = `<span class="tl-dday passed">${Math.abs(dayDiff)}일 전</span>`;
      }

      const nodeHtml = `
        <div class="timeline-node ${isToday ? 'is-today' : ''} ${isFuture ? 'is-future' : ''}">
          <div class="tl-marker">${node.icon}</div>
          <div class="tl-content">
            <div class="tl-date-row">
              <span class="tl-date">${formatYMD(node.date)}</span>
              ${ddayBadge}
            </div>
            <h4 class="tl-title">${escapeHtml(node.title)}</h4>
            <p class="tl-desc">${escapeHtml(node.desc)}</p>
          </div>
        </div>
      `;
      $container.append(nodeHtml);
    });
  }

  // 개인 기념일 관리 렌더링
  function renderPersonalAnniversaries() {
    const $grid = $('#anniversariesGrid');
    const $empty = $('#emptyAnnivNotice');
    $grid.empty();

    if (state.personalAnniversaries.length === 0) {
      $grid.hide();
      $empty.show();
      return;
    }

    $empty.hide();
    $grid.show();

    const now = new Date();
    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    state.personalAnniversaries.forEach(anniv => {
      const aDate = parseLocalDate(anniv.date);
      const aDateZero = new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate()).getTime();

      const daysLived = Math.floor((aDate.getTime() - state.birthDate.getTime()) / 86400000);
      const dayDiff = Math.round((aDateZero - todayZero) / 86400000);
      const isPassed = dayDiff < 0;
      const isToday = dayDiff === 0;

      let ddayText = '';
      if (isToday) ddayText = '<strong class="text-primary">오늘 (D-Day)</strong>';
      else if (isPassed) ddayText = `<span>${Math.abs(dayDiff)}일 지남</span>`;
      else ddayText = `<strong class="text-success">D-${dayDiff}</strong>`;

      const card = `
        <div class="anniv-card" data-id="${anniv.id}">
          <div class="anniv-top">
            <div class="anniv-title-wrap">
              <span class="anniv-icon">${anniv.icon || '⭐'}</span>
              <div>
                <h4>${escapeHtml(anniv.name)}</h4>
                <div class="anniv-date">📅 ${anniv.date}</div>
              </div>
            </div>
          </div>
          ${anniv.note ? `<p class="anniv-note">${escapeHtml(anniv.note)}</p>` : ''}
          <div class="anniv-foot">
            <div>
              <span>태어난 지 ${addCommas(daysLived)}일째</span> · ${ddayText}
            </div>
            <div class="anniv-actions">
              <button type="button" class="btn btn-outline btn-xs btn-edit-anniv" data-id="${anniv.id}">수정</button>
              <button type="button" class="btn btn-outline btn-xs text-danger btn-del-anniv" data-id="${anniv.id}">삭제</button>
            </div>
          </div>
        </div>
      `;
      $grid.append(card);
    });
  }

  /* ========================================================
     원하는 일수 계산 & 특정 날짜 계산
     ======================================================== */
  function calculateCustomDays(days) {
    if (!state.birthDate) return;
    const daysNum = parseInt(days, 10);
    if (isNaN(daysNum) || daysNum < 1) return;

    const target = new Date(state.birthDate.getTime() + daysNum * 86400000);
    const now = new Date();
    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetZero = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    const diff = Math.round((targetZero - todayZero) / 86400000);

    let age = target.getFullYear() - state.birthDate.getFullYear();
    if (
      (target.getMonth() < state.birthDate.getMonth()) ||
      (target.getMonth() === state.birthDate.getMonth() && target.getDate() < state.birthDate.getDate())
    ) {
      age--;
    }

    $('#resCustomDaysDate').text(formatKoreanDate(target));
    if (diff === 0) {
      $('#resCustomDaysDday').text('오늘 도래! 🎉');
    } else if (diff > 0) {
      $('#resCustomDaysDday').text(`앞으로 ${addCommas(diff)}일 남음 (D-${diff})`);
    } else {
      $('#resCustomDaysDday').text(`${addCommas(Math.abs(diff))}일 전에 지남`);
    }
    $('#resCustomDaysAge').text(`당시 만 ${age}세`);
  }

  function calculateTargetDate(targetDateStr) {
    if (!state.birthDate || !targetDateStr) return;

    const targetDate = parseLocalDate(targetDateStr);
    const bDateZero = new Date(state.birthDate.getFullYear(), state.birthDate.getMonth(), state.birthDate.getDate());

    if (targetDate.getTime() < bDateZero.getTime()) {
      alert('출생일 이후의 날짜를 선택해주세요.');
      return;
    }

    const daysDiff = Math.floor((targetDate.getTime() - bDateZero.getTime()) / 86400000);
    const now = new Date();
    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetZero = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
    const diffFromToday = Math.round((targetZero - todayZero) / 86400000);

    let age = targetDate.getFullYear() - state.birthDate.getFullYear();
    if (
      (targetDate.getMonth() < state.birthDate.getMonth()) ||
      (targetDate.getMonth() === state.birthDate.getMonth() && targetDate.getDate() < state.birthDate.getDate())
    ) {
      age--;
    }

    $('#resTargetDateDays').text(`태어난 지 ${addCommas(daysDiff)}일`);
    if (diffFromToday === 0) {
      $('#resTargetDateDiff').text('오늘 날짜');
    } else if (diffFromToday > 0) {
      $('#resTargetDateDiff').text(`오늘로부터 ${addCommas(diffFromToday)}일 후`);
    } else {
      $('#resTargetDateDiff').text(`오늘로부터 ${addCommas(Math.abs(diffFromToday))}일 전`);
    }
    $('#resTargetDateAge').text(`당시 만 ${age}세`);
  }

  /* ========================================================
     숫자 카운트업 애니메이션
     ======================================================== */
  function animateCountUp($el, targetValue) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || targetValue <= 0) {
      $el.text(addCommas(targetValue));
      return;
    }

    const duration = 1200; // ms
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(ease * targetValue);

      $el.text(addCommas(current));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        $el.text(addCommas(targetValue));
      }
    }

    requestAnimationFrame(step);
  }

  /* ========================================================
     1080×1350 PNG 결과 이미지 캔버스 생성기
     ======================================================== */
  function drawResultCardCanvas() {
    const canvas = document.getElementById('resultCardCanvas');
    if (!canvas || !state.birthDate) return;

    const ctx = canvas.getContext('2d');
    const width = 1080;
    const height = 1350;

    // 1. 세련된 딥 다크 그라데이션 배경
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0b0f19');
    bgGrad.addColorStop(0.5, '#111827');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 은은한 장식 원형 조명
    const radial = ctx.createRadialGradient(540, 480, 50, 540, 480, 500);
    radial.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
    radial.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // 카드 외곽선 테두리
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // 2. 상단 브랜드 헤더
    ctx.fillStyle = 'rgba(99, 102, 241, 0.85)';
    ctx.font = '700 28px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ 1-MIN CHALLENGE · LIFE TIME CALCULATOR', 540, 130);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px "Noto Sans KR", sans-serif';
    ctx.fillText('내가 지금까지 살아온 시간', 540, 210);

    // 3. 중앙 메인 타이틀: 살아온 총 일수
    const now = new Date();
    const diffMs = now.getTime() - state.birthDate.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 32px "Noto Sans KR", sans-serif';
    ctx.fillText('당신이 지금까지 살아온 날은', 540, 360);

    // 큰 숫자
    ctx.fillStyle = '#6366f1';
    ctx.font = '900 130px "Montserrat", sans-serif';
    ctx.fillText(addCommas(totalDays), 540, 500);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 44px "Noto Sans KR", sans-serif';
    ctx.fillText('일입니다.', 540, 580);

    // 달력상 일차
    const bYear = state.birthDate.getFullYear();
    const bMonth = state.birthDate.getMonth();
    const bDay = state.birthDate.getDate();
    const bZeroDate = new Date(bYear, bMonth, bDay, 0, 0, 0, 0);
    const nowZeroDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const calDiff = Math.round((nowZeroDate.getTime() - bZeroDate.getTime()) / (1000 * 60 * 60 * 24));
    
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 28px "Noto Sans KR", sans-serif';
    ctx.fillText(`(태어난 날을 1일 차로 계산하면 오늘은 ${addCommas(calDiff + 1)}일 차)`, 540, 640);

    // 4. 정보 박스 영역 (만 나이, 총 시간, 다음 생일)
    const boxY = 720;
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

    // 4분할 데이터
    let age = now.getFullYear() - bYear;
    if (now.getMonth() < bMonth || (now.getMonth() === bMonth && now.getDate() < bDay)) age--;

    const totalHours = Math.floor(diffMs / 3600000);
    const totalMinutes = Math.floor(diffMs / 60000);

    // 1행 좌: 만 나이
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 24px "Noto Sans KR", sans-serif';
    ctx.fillText('현재 나이', boxX + 60, boxY + 70);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 42px "Noto Sans KR", sans-serif';
    ctx.fillText(`만 ${age}세`, boxX + 60, boxY + 125);

    // 1행 우: 총 시간
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 24px "Noto Sans KR", sans-serif';
    ctx.fillText('총 살아온 시간', boxX + 480, boxY + 70);
    ctx.fillStyle = '#a855f7';
    ctx.font = '800 36px "Montserrat", sans-serif';
    ctx.fillText(`${addCommas(totalHours)} 시간`, boxX + 480, boxY + 125);

    // 분리선
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(boxX + 50, boxY + 170);
    ctx.lineTo(boxX + boxW - 50, boxY + 170);
    ctx.stroke();

    // 2행 좌: 다음 생일 카운트다운
    let targetYear = now.getFullYear();
    let nextBday = new Date(targetYear, bMonth, bDay, 0, 0, 0);
    if (now > nextBday) nextBday = new Date(targetYear + 1, bMonth, bDay, 0, 0, 0);
    const bdayRemDays = Math.ceil((nextBday.getTime() - now.getTime()) / 86400000);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 24px "Noto Sans KR", sans-serif';
    ctx.fillText('다음 생일까지', boxX + 60, boxY + 230);
    ctx.fillStyle = '#f43f5e';
    ctx.font = '800 36px "Noto Sans KR", sans-serif';
    ctx.fillText(`${bdayRemDays}일 남음`, boxX + 60, boxY + 285);

    // 2행 우: 다음 마일스톤
    let nextMsText = '30,000일 돌파!';
    for (let d of MILESTONE_DAYS) {
      if (d > totalDays) {
        const dday = d - totalDays;
        nextMsText = `${addCommas(d)}일 (D-${dday})`;
        break;
      }
    }
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 24px "Noto Sans KR", sans-serif';
    ctx.fillText('다음 특별한 마일스톤', boxX + 480, boxY + 230);
    ctx.fillStyle = '#34d399';
    ctx.font = '800 36px "Montserrat", sans-serif';
    ctx.fillText(nextMsText, boxX + 480, boxY + 285);

    // 5. 하단 생년월일 표시 여부 옵션
    ctx.textAlign = 'center';
    const isIncludeBirth = $('#checkIncludeBirthdateInImage').is(':checked');
    if (isIncludeBirth) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 26px "Noto Sans KR", sans-serif';
      ctx.fillText(`출생: ${formatYMD(state.birthDate)} (${state.birthTimeStr})`, 540, 1140);
    }

    // 6. 기준 시각 및 워터마크
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '400 22px "Noto Sans KR", sans-serif';
    ctx.fillText(`기록 일시: ${formatKoreanDate(now)}`, 540, 1220);
    ctx.fillText('https://ad-site-piyd.vercel.app · 100% 무료 시간 계산기', 540, 1260);
  }

  function downloadCanvasAsPng() {
    const canvas = document.getElementById('resultCardCanvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `lifetime_card_${getTodayLocalDateString()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* ========================================================
     로컬 스토리지 데이터 복원 및 관리
     ======================================================== */
  function loadSavedData() {
    try {
      const rawUser = localStorage.getItem(STORAGE_KEY_USER_DATA);
      if (rawUser) {
        const userData = JSON.parse(rawUser);
        if (userData && userData.birthDateStr) {
          $('#inputBirthDate').val(userData.birthDateStr);
          $('#inputBirthDateNative').val(userData.birthDateStr);
          if (userData.birthTimeStr) {
            $('#inputBirthTime').val(userData.birthTimeStr);
            $('#inputBirthTimeNative').val(userData.birthTimeStr);
          }
          $('#checkSaveConsent').prop('checked', true);
          $('#btnClearSavedData').show();
          executeCalculate();
        }
      }

      const rawAnnivs = localStorage.getItem(STORAGE_KEY_ANNIVS);
      if (rawAnnivs) {
        state.personalAnniversaries = JSON.parse(rawAnnivs) || [];
      }
    } catch (e) {
      console.error('데이터 복원 실패:', e);
    }
  }

  function saveUserDataIfConsented() {
    if ($('#checkSaveConsent').is(':checked')) {
      const userData = {
        birthDateStr: state.birthDateStr,
        birthTimeStr: state.birthTimeStr,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_USER_DATA, JSON.stringify(userData));
      $('#btnClearSavedData').show();
    }
  }

  function clearSavedUserData() {
    if (!confirm('브라우저에 저장된 생년월일 정보를 완전히 삭제하시겠습니까?')) return;
    localStorage.removeItem(STORAGE_KEY_USER_DATA);
    $('#checkSaveConsent').prop('checked', false);
    $('#btnClearSavedData').hide();
    alert('저장된 생년월일 정보가 안전하게 삭제되었습니다.');
  }

  function resetFormAndResults() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    $('#lifeCalcForm')[0].reset();
    $('#inputBirthDate').val('');
    $('#inputBirthDateNative').val('');
    $('#inputBirthTime').val('00:00');
    $('#inputBirthTimeNative').val('00:00');
    $('#calcErrorBox').hide().text('');
    $('#resultsContainer').fadeOut(150);
    state.birthDate = null;
    state.birthDateStr = '';
    state.birthTimeStr = '00:00';
  }

  /* ========================================================
     계산 실행
     ======================================================== */
  function executeCalculate() {
    let dateStr = ($('#inputBirthDate').val() || '').trim();
    let timeStr = ($('#inputBirthTime').val() || '').trim() || '00:00';

    // 8자리 연속 숫자 입력(예: 19980515) 자동 포맷팅
    if (/^\d{8}$/.test(dateStr)) {
      dateStr = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
      $('#inputBirthDate').val(dateStr);
    }
    $('#inputBirthDateNative').val(dateStr);

    // 4자리 연속 숫자 시각(예: 1430) 자동 포맷팅
    if (/^\d{4}$/.test(timeStr)) {
      timeStr = `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}`;
      $('#inputBirthTime').val(timeStr);
    }
    $('#inputBirthTimeNative').val(timeStr);

    const validation = validateBirthDate(dateStr, timeStr);
    if (!validation.valid) {
      $('#calcErrorBox').text(validation.message).slideDown(150);
      return;
    }
    $('#calcErrorBox').hide().text('');

    state.birthDateStr = dateStr;
    state.birthTimeStr = timeStr;

    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm] = timeStr.split(':').map(Number);
    state.birthDate = new Date(y, m - 1, d, hh, mm, 0, 0);

    // 출생 시각 입력 여부 확인
    if (timeStr === '00:00' || !timeStr) {
      $('#timeNoticeAlert').show();
    } else {
      $('#timeNoticeAlert').hide();
    }

    // 동의한 경우 저장
    saveUserDataIfConsented();

    // 정적 결과 렌더링
    renderStaticResults();

    // 실시간 타이머 시작 (1초 간격)
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }
    updateCalculations();
    state.timerInterval = setInterval(updateCalculations, 1000);
  }

  /* ========================================================
     개인 기념일 모달 및 아이콘 피커
     ======================================================== */
  function renderAnnivIconGrid() {
    const $grid = $('#annivIconGrid');
    $grid.empty();
    ANNIV_PRESET_ICONS.forEach(icon => {
      const btn = `<button type="button" class="anniv-icon-btn ${icon === state.selectedAnnivIcon ? 'selected' : ''}" data-icon="${icon}">${icon}</button>`;
      $grid.append(btn);
    });
  }

  function openAddAnnivModal(editId = null) {
    renderAnnivIconGrid();
    if (editId) {
      const anniv = state.personalAnniversaries.find(a => a.id === editId);
      if (!anniv) return;
      $('#modalAnnivTitle').text('개인 기념일 수정');
      $('#editAnnivId').val(anniv.id);
      $('#inputAnnivName').val(anniv.name);
      $('#inputAnnivDate').val(anniv.date);
      $('#inputAnnivNote').val(anniv.note || '');
      state.selectedAnnivIcon = anniv.icon || '⭐';
      renderAnnivIconGrid();
    } else {
      $('#modalAnnivTitle').text('개인 기념일 추가');
      $('#editAnnivId').val('');
      $('#annivForm')[0].reset();
      state.selectedAnnivIcon = '⭐';
      renderAnnivIconGrid();
    }
    $('#modalAddAnniversary').fadeIn(150);
  }

  function handleSaveAnniversary() {
    const editId = $('#editAnnivId').val();
    const name = $.trim($('#inputAnnivName').val());
    const date = $('#inputAnnivDate').val();
    const note = $.trim($('#inputAnnivNote').val());
    const icon = state.selectedAnnivIcon || '⭐';

    if (!name) {
      alert('기념일 이름을 입력해주세요.');
      $('#inputAnnivName').focus();
      return;
    }
    if (!date) {
      alert('기념일 날짜를 선택해주세요.');
      return;
    }

    if (editId) {
      const anniv = state.personalAnniversaries.find(a => a.id === editId);
      if (anniv) {
        anniv.name = name;
        anniv.date = date;
        anniv.note = note;
        anniv.icon = icon;
      }
    } else {
      if (state.personalAnniversaries.length >= 30) {
        alert('개인 기념일은 최대 30개까지 등록할 수 있습니다.');
        return;
      }
      const newAnniv = {
        id: 'anniv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name,
        date,
        note,
        icon
      };
      state.personalAnniversaries.push(newAnniv);
    }

    localStorage.setItem(STORAGE_KEY_ANNIVS, JSON.stringify(state.personalAnniversaries));
    $('#modalAddAnniversary').fadeOut(150);
    renderPersonalAnniversaries();
    renderLifeTimeline();
  }

  /* ========================================================
     이벤트 초기화
     ======================================================== */
  function initEvents() {
    // 1. 계산 버튼 클릭
    $('#btnCalculate').on('click', executeCalculate);

    // 날짜 입력 타이핑(커서 입력) 및 자동 포맷팅
    $('#inputBirthDate').on('input', function() {
      let val = $(this).val().replace(/[^\d-]/g, '');
      // 8자리 입력 시 자동 YYYY-MM-DD 변환
      if (val.length === 8 && !val.includes('-')) {
        val = `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`;
        $(this).val(val);
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        $('#inputBirthDateNative').val(val);
        const todayStr = getTodayLocalDateString();
        if (val <= todayStr) {
          executeCalculate();
        }
      }
    });

    $('#inputBirthDate').on('change blur', function() {
      let val = $(this).val().trim();
      if (/^\d{8}$/.test(val)) {
        val = `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`;
        $(this).val(val);
      }
      if (val && val <= getTodayLocalDateString()) {
        $('#inputBirthDateNative').val(val);
        executeCalculate();
      }
    });

    // 출생 시각 타이핑(커서 입력) 및 자동 포맷팅
    $('#inputBirthTime').on('input', function() {
      let val = $(this).val().replace(/[^\d:]/g, '');
      if (val.length === 4 && !val.includes(':')) {
        val = `${val.slice(0, 2)}:${val.slice(2, 4)}`;
        $(this).val(val);
      }
      if (/^\d{2}:\d{2}$/.test(val)) {
        $('#inputBirthTimeNative').val(val);
        if (state.birthDate) {
          executeCalculate();
        }
      }
    });

    $('#inputBirthTime').on('change blur', function() {
      let val = $(this).val().trim();
      if (/^\d{4}$/.test(val)) {
        val = `${val.slice(0, 2)}:${val.slice(2, 4)}`;
        $(this).val(val);
      }
      if (state.birthDate) {
        $('#inputBirthTimeNative').val(val || '00:00');
        executeCalculate();
      }
    });

    // 네이티브 달력 팝업에서 선택 시 동기화
    $('#inputBirthDateNative').on('change', function() {
      const val = $(this).val();
      if (val) {
        $('#inputBirthDate').val(val);
        executeCalculate();
      }
    });

    // 네이티브 시각 팝업에서 선택 시 동기화
    $('#inputBirthTimeNative').on('change', function() {
      const val = $(this).val();
      if (val) {
        $('#inputBirthTime').val(val);
        if (state.birthDate) {
          executeCalculate();
        }
      }
    });

    // 달력/시각 버튼 클릭 시 피커 열기
    $('#btnDatePick').on('click', function(e) {
      e.preventDefault();
      const el = document.getElementById('inputBirthDateNative');
      if (el && typeof el.showPicker === 'function') {
        try { el.showPicker(); } catch (err) { el.focus(); }
      }
    });

    $('#btnTimePick').on('click', function(e) {
      e.preventDefault();
      const el = document.getElementById('inputBirthTimeNative');
      if (el && typeof el.showPicker === 'function') {
        try { el.showPicker(); } catch (err) { el.focus(); }
      }
    });

    // 2. 초기화 버튼
    $('#btnResetInput').on('click', resetFormAndResults);

    // 3. 저장 정보 삭제 버튼
    $('#btnClearSavedData').on('click', clearSavedUserData);

    // 4. 모달 닫기 공통
    $('[data-close]').on('click', function() {
      const modalId = $(this).data('close');
      $('#' + modalId).fadeOut(150);
    });

    // 5. 결과 이미지 모달 열기 & 렌더링
    $('#btnOpenSaveImageModal').on('click', function() {
      drawResultCardCanvas();
      $('#modalSaveImage').fadeIn(150);
    });

    $('#checkIncludeBirthdateInImage').on('change', function() {
      drawResultCardCanvas();
    });

    $('#btnDownloadPng').on('click', downloadCanvasAsPng);

    // 6. 원하는 일수 계산기
    $('#btnCalcCustomDays').on('click', function() {
      const days = $('#inputCustomDays').val();
      calculateCustomDays(days);
    });

    $('#inputCustomDays').on('input', function() {
      const days = $(this).val();
      calculateCustomDays(days);
    });

    // 7. 특정 날짜 계산기
    $('#btnCalcTargetDate').on('click', function() {
      const targetDate = $('#inputTargetDate').val();
      calculateTargetDate(targetDate);
    });

    $('#inputTargetDate').on('change', function() {
      const targetDate = $(this).val();
      calculateTargetDate(targetDate);
    });

    // 8. 개인 기념일 모달 열기 & 저장
    $('#btnOpenAddAnnivModal').on('click', function() {
      openAddAnnivModal();
    });

    $(document).on('click', '.anniv-icon-btn', function() {
      $('.anniv-icon-btn').removeClass('selected');
      $(this).addClass('selected');
      state.selectedAnnivIcon = $(this).data('icon');
    });

    $('#btnSaveAnniversary').on('click', handleSaveAnniversary);

    // 9. 개인 기념일 수정 & 삭제
    $(document).on('click', '.btn-edit-anniv', function() {
      const id = $(this).data('id');
      openAddAnnivModal(id);
    });

    $(document).on('click', '.btn-del-anniv', function() {
      const id = $(this).data('id');
      if (!confirm('이 기념일을 삭제하시겠습니까?')) return;
      state.personalAnniversaries = state.personalAnniversaries.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY_ANNIVS, JSON.stringify(state.personalAnniversaries));
      renderPersonalAnniversaries();
      renderLifeTimeline();
    });

    // 10. 동의 체크박스 상태 변경 시 즉시 반영
    $('#checkSaveConsent').on('change', function() {
      if ($(this).is(':checked') && state.birthDate) {
        saveUserDataIfConsented();
      }
    });
  }

  // HTML 이스케이프 유틸
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
     문서 로드 시 초기화
     ======================================================== */
  $(document).ready(function() {
    initEvents();
    loadSavedData();
  });

})(jQuery);
