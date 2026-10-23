/**
 * 1-Min Challenge - 1분 반응 속도 테스트 (reaction-speed.js)
 * 60초 제한시간, 무작위 대기(1~4초), performance.now() 및 requestAnimationFrame 기반 고정밀 측정,
 * 성급한 클릭(False start) 판정, 6대 등급 시스템, 로컬 기록 대시보드 및 CSS 막대 차트
 */

(function ($) {
  'use strict';

  // ==========================================================================
  // 1. 상태 및 상수 정의 (State Machine)
  // 상태: 'ready' | 'countdown' | 'waiting' | 'signal' | 'feedback' | 'false-start' | 'finished'
  // ==========================================================================
  const state = {
    currentStatus: 'ready',

    // 테스트 시간 제어
    testDurationSeconds: 60.0,
    testStartTime: null,
    testTimerInterval: null,
    countdownInterval: null,
    remainingSeconds: 60.0,

    // 라운드 제어
    currentRound: 0,
    waitingTimeout: null,
    feedbackTimeout: null,
    signalStartTime: null,

    // 측정 데이터
    validReactionTimes: [], // 정상 반응 시간(ms) 배열
    falseStartCount: 0, // 성급한 클릭 횟수
    currentInstantCpm: null,

    // 환경 설정
    soundEnabled: false
  };

  const STORAGE_KEY_RECORDS = 'challenge_1min_reaction_records';

  // ==========================================================================
  // 2. 사운드 효과 (Web Audio API)
  // 측정 공정성을 위해 신호(초록색) 자체에는 소리가 나지 않으며, 피드백 시에만 재생
  // ==========================================================================
  function playSuccessFeedbackSound() {
    if (!state.soundEnabled) return;
    try {
      if (window.SoundFX && typeof window.SoundFX.correctAnswer === 'function') {
        window.SoundFX.correctAnswer();
      }
    } catch (e) {}
  }

  function playFalseStartSound() {
    if (!state.soundEnabled) return;
    try {
      if (window.SoundFX && typeof window.SoundFX.wrongAnswer === 'function') {
        window.SoundFX.wrongAnswer();
      }
    } catch (e) {}
  }

  function playCountdownTickSound() {
    if (!state.soundEnabled) return;
    try {
      if (window.SoundFX && typeof window.SoundFX.countdownTick === 'function') {
        window.SoundFX.countdownTick();
      }
    } catch (e) {}
  }

  function playFinishSound() {
    if (!state.soundEnabled) return;
    try {
      if (window.SoundFX && typeof window.SoundFX.gameOver === 'function') {
        window.SoundFX.gameOver();
      }
    } catch (e) {}
  }

  // ==========================================================================
  // 3. 반응 영역 시각 상태 전환 (State UI Renderer)
  // - ready: 회색
  // - waiting: 빨간색
  // - signal: 초록색
  // - feedback: 파란색
  // - false-start: 주황색
  // ==========================================================================
  function setStageStatus(newStatus, extraData) {
    state.currentStatus = newStatus;
    const $stage = $('#reactionStage');
    const $icon = $('#stageIcon');
    const $title = $('#stageTitle');
    const $sub = $('#stageSub');

    // 클래스 초기화
    $stage.removeClass('status-ready status-waiting status-signal status-feedback status-false-start status-finished');
    $stage.addClass(`status-${newStatus}`);

    switch (newStatus) {
      case 'ready':
        $icon.text('⚡');
        $title.text('화면을 클릭(터치)하여 시작하세요');
        $sub.text('화면을 누르거나 상단 시작 버튼을 클릭하면 3초 준비 후 측정이 시작됩니다.');
        break;

      case 'countdown':
        $icon.text('⏳');
        $title.text(extraData ? extraData.count : '3');
        $sub.text('마음의 준비를 하세요!');
        break;

      case 'waiting':
        $icon.text('🛑');
        $title.text('아직 클릭하지 마세요');
        $sub.text('초록색으로 바뀌는 순간 최대한 빠르게 클릭하세요!');
        break;

      case 'signal':
        $icon.text('🟢');
        $title.text('지금 클릭!');
        $sub.text('화면을 터치하거나 마우스를 클릭하세요!');
        break;

      case 'feedback':
        $icon.text('⚡');
        $title.text(`${extraData.reactionTime} ms`);
        $sub.text(getShortEncouragement(extraData.reactionTime));
        break;

      case 'false-start':
        $icon.text('⚠️');
        $title.text('너무 빨리 클릭했어요!');
        $sub.text('색상이 바뀐 뒤에 클릭해야 정상 기록으로 인정됩니다.');
        break;

      case 'finished':
        $icon.text('🏁');
        $title.text('60초 테스트 완료!');
        $sub.text('결과를 분석하고 있습니다...');
        break;
    }
  }

  function getShortEncouragement(ms) {
    if (ms < 200) return '번개처럼 놀라운 반응이에요! ⚡';
    if (ms < 250) return '정말 빠른 반응이에요! 🚀';
    if (ms < 300) return '좋은 반응 속도입니다! 👍';
    if (ms < 400) return '안정적인 반응이에요. 🙂';
    return '조금 더 집중해볼까요? 다음 라운드 준비!';
  }

  // ==========================================================================
  // 4. 테스트 시작 및 3초 카운트다운 (섹션 3 & 9)
  // ==========================================================================
  function startTestWorkflow() {
    resetAllTimers();
    resetMetrics();

    $('#startTestBtn').hide();
    $('#stopTestBtn').show();
    $('#restartTestBtn').show();

    // 3초 준비 카운트다운 (60초 테스트 시간에 미포함)
    let countdown = 3;
    setStageStatus('countdown', { count: countdown });
    playCountdownTickSound();

    state.countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        setStageStatus('countdown', { count: countdown });
        playCountdownTickSound();
      } else {
        clearInterval(state.countdownInterval);
        state.countdownInterval = null;
        beginActual60sTest();
      }
    }, 1000);
  }

  function beginActual60sTest() {
    state.testStartTime = performance.now();
    state.remainingSeconds = state.testDurationSeconds;
    updateLiveStats();

    // 60초 타이머 루프 가동 (실제 경과 시간 기반 정밀 제어)
    state.testTimerInterval = setInterval(() => {
      const elapsedMs = performance.now() - state.testStartTime;
      const remaining = Math.max(0, state.testDurationSeconds - (elapsedMs / 1000));
      state.remainingSeconds = remaining;

      // 상단 타이머 및 진행률 바 갱신
      $('#liveTimer').text(`${remaining.toFixed(1)}s`);
      const progressPercent = Math.min(100, Math.round(((state.testDurationSeconds - remaining) / state.testDurationSeconds) * 100));
      $('#timerProgressBar').css('width', `${progressPercent}%`);

      if (remaining <= 0) {
        finishTest();
      }
    }, 50);

    // 첫 라운드 시작
    startNewRound();
  }

  // ==========================================================================
  // 5. 라운드 진행 및 무작위 색상 변경 (섹션 5 & 6)
  // 무작위 대기 시간: 1,000ms ~ 4,000ms
  // requestAnimationFrame 기반 화면 갱신 동기화
  // ==========================================================================
  function startNewRound() {
    if (state.currentStatus === 'finished') return;

    state.currentRound++;
    $('#liveRound').text(state.currentRound);

    // 대기 상태(빨간색)로 전환
    setStageStatus('waiting');

    // 1,000 ~ 4,000ms 무작위 대기 시간 생성
    const randomDelay = Math.floor(Math.random() * 3001) + 1000;

    state.waitingTimeout = setTimeout(() => {
      // 60초가 이미 끝났거나 상태가 변경되었으면 중단
      if (state.currentStatus !== 'waiting') return;

      // requestAnimationFrame을 활용하여 브라우저 화면 페인팅 직후 시간 기록
      requestAnimationFrame(() => {
        setStageStatus('signal');
        state.signalStartTime = performance.now();
      });
    }, randomDelay);
  }

  // ==========================================================================
  // 6. 클릭 / 터치 / 키보드 입력 핸들러 (섹션 7 & 8)
  // Pointer Events API로 모바일/PC 중복 이벤트 원천 차단
  // ==========================================================================
  function handleReactionInput(e) {
    if (e && e.type === 'pointerdown') {
      // 마우스 우클릭 제외 (기본 좌클릭/터치만 허용)
      if (e.button !== undefined && e.button !== 0) return;
    }

    const current = state.currentStatus;

    // 0) 준비 상태(ready)에서 화면 클릭 / 터치 시 테스트 시작!
    if (current === 'ready') {
      startTestWorkflow();
      return;
    }

    // 1) 카운트다운, 피드백, 성급한 클릭 피드백, 완료 중 입력은 무시
    if (current === 'countdown' || current === 'feedback' || current === 'false-start' || current === 'finished') {
      return;
    }

    // 2) 대기 상태(waiting)에서 클릭 -> 성급한 클릭(False start)
    if (current === 'waiting') {
      handleFalseStart();
      return;
    }

    // 3) 신호 상태(signal)에서 클릭 -> 정상 반응
    if (current === 'signal') {
      handleValidReaction();
      return;
    }
  }

  // 성급한 클릭 처리
  function handleFalseStart() {
    if (state.waitingTimeout) {
      clearTimeout(state.waitingTimeout);
      state.waitingTimeout = null;
    }

    state.falseStartCount++;
    $('#liveFalseStarts').text(state.falseStartCount);
    playFalseStartSound();

    setStageStatus('false-start');

    // 600ms 피드백 후 60초가 남아있으면 다음 라운드
    state.feedbackTimeout = setTimeout(() => {
      if (state.currentStatus !== 'finished') {
        startNewRound();
      }
    }, 600);
  }

  // 정상 반응 처리
  function handleValidReaction() {
    const clickTime = performance.now();
    const reactionTime = Math.max(1, Math.round(clickTime - state.signalStartTime));

    state.validReactionTimes.push(reactionTime);
    playSuccessFeedbackSound();

    updateLiveStats();

    setStageStatus('feedback', { reactionTime: reactionTime });

    // 500ms 피드백 후 다음 라운드 진행 (남은 시간 고려)
    state.feedbackTimeout = setTimeout(() => {
      if (state.currentStatus !== 'finished') {
        startNewRound();
      }
    }, 500);
  }

  // 실시간 통계 업데이트
  function updateLiveStats() {
    const list = state.validReactionTimes;
    const count = list.length;
    $('#liveSuccessCount').text(count);

    if (count > 0) {
      const sum = list.reduce((a, b) => a + b, 0);
      const avg = Math.round(sum / count);
      const best = Math.min(...list);

      $('#liveAvgTime').text(`${avg}ms`);
      $('#liveBestTime').text(`${best}ms`);
    } else {
      $('#liveAvgTime').text('-');
      $('#liveBestTime').text('-');
    }
  }

  // ==========================================================================
  // 7. 60초 종료 및 결과 계산 (섹션 12, 13, 14, 15)
  // ==========================================================================
  function finishTest() {
    resetAllTimers();
    setStageStatus('finished');
    playFinishSound();

    $('#liveTimer').text('0.0s');
    $('#timerProgressBar').css('width', '100%');

    $('#startTestBtn').show();
    $('#stopTestBtn').hide();
    $('#restartTestBtn').hide();

    const list = state.validReactionTimes;
    const count = list.length;
    const falseCount = state.falseStartCount;

    let avg = 0;
    let best = 0;
    let worst = 0;
    let grade = '측정 횟수 부족';
    let isValid = false;

    if (count >= 3) {
      isValid = true;
      const sum = list.reduce((a, b) => a + b, 0);
      avg = Math.round(sum / count);
      best = Math.min(...list);
      worst = Math.max(...list);

      // 등급 부여 (섹션 13)
      if (avg < 200) grade = '번개 반응 ⚡';
      else if (avg < 250) grade = '매우 빠름 🚀';
      else if (avg < 300) grade = '빠른 편 🏃';
      else if (avg < 400) grade = '보통 🚶';
      else if (avg < 500) grade = '조금 여유로운 반응 🐢';
      else grade = '차근차근 연습형 ☕';
    } else if (count > 0) {
      const sum = list.reduce((a, b) => a + b, 0);
      avg = Math.round(sum / count);
      best = Math.min(...list);
      worst = Math.max(...list);
      grade = '측정 횟수 부족 (최소 3회 필요)';
    }

    // 이전 최고 기록과 비교
    const previousBest = getPersonalBestRecord();
    let isNewRecord = false;
    if (isValid) {
      if (!previousBest || avg < previousBest.avgTime) {
        isNewRecord = true;
      }
    }

    const resultRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      avgTime: avg,
      bestTime: best,
      worstTime: worst,
      successCount: count,
      falseCount: falseCount,
      grade: grade,
      isValid: isValid
    };

    // 로컬스토리지 저장 (유효 테스트인 경우에만 최고 기록 비교 포함)
    saveRecord(resultRecord);

    // 결과 모달 렌더링
    renderResultModal(resultRecord, isNewRecord);
  }

  function renderResultModal(record, isNewRecord) {
    $('#resAvgTime').text(record.successCount > 0 ? `${record.avgTime} ms` : '-');
    $('#resBestTime').text(record.successCount > 0 ? `${record.bestTime} ms` : '-');
    $('#resWorstTime').text(record.successCount > 0 ? `${record.worstTime} ms` : '-');
    $('#resSuccessCount').text(`${record.successCount}회`);
    $('#resFalseCount').text(`${record.falseCount}회`);
    $('#resGrade').text(record.grade);

    if (isNewRecord) {
      $('#newRecordBadge').show();
      $('#resHeadline').text('🎉 축하합니다! 새로운 개인 최고 기록을 달성했어요!');
    } else {
      $('#newRecordBadge').hide();
      $('#resHeadline').text('60초 동안의 반응 속도 측정이 완료되었습니다.');
    }

    $('#resultModal').fadeIn(200);
  }

  // 결과 이미지 저장 (Canvas PNG)
  function handleDownloadResultImage() {
    const avg = $('#resAvgTime').text() || '-';
    const grade = $('#resGrade').text() || '반응 속도 측정 완료';
    const best = $('#resBestTime').text() || '-';
    const worst = $('#resWorstTime').text() || '-';
    const successCount = $('#resSuccessCount').text() || '0회';
    const falseCount = $('#resFalseCount').text() || '0회';

    if (typeof window.downloadGameResultImage === 'function') {
      window.downloadGameResultImage({
        title: '1분 반응 속도 테스트',
        category: 'REFLEX CHALLENGE',
        rankBadge: '⚡',
        grade: '[ REFLEX TEST ]',
        gradeDesc: grade,
        stats: [
          { label: '평균 반응 속도', value: avg, color: '#0284c7' },
          { label: '최고 반응 속도', value: best, color: '#059669' },
          { label: '정상 반응 횟수', value: successCount, color: '#db2777' },
          { label: '성급한 클릭', value: falseCount, color: '#ef4444' }
        ],
        filename: '1분반응속도_결과'
      });
    } else {
      alert('결과 이미지 생성 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    }
  }

  // ==========================================================================
  // 8. 개인 최고 기록 및 대시보드 (섹션 15 & 16)
  // ==========================================================================
  function getRecords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function getPersonalBestRecord() {
    const validRecords = getRecords().filter(r => r.isValid && r.successCount >= 3);
    if (validRecords.length === 0) return null;
    return validRecords.reduce((best, curr) => (curr.avgTime < best.avgTime ? curr : best), validRecords[0]);
  }

  function saveRecord(record) {
    try {
      const records = getRecords();
      records.unshift(record);
      if (records.length > 30) records.splice(30); // 최대 30개 보관
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
      updateDashboard();
    } catch (e) {}
  }

  function updateDashboard() {
    const records = getRecords();
    const best = getPersonalBestRecord();

    $('#dashBestAvg').text(best ? `${best.avgTime} ms` : '-');
    $('#dashBestDate').text(best ? best.date : '-');

    const recentRecords = records.filter(r => r.isValid).slice(0, 5);
    if (recentRecords.length > 0) {
      const avg = Math.round(recentRecords.reduce((sum, r) => sum + r.avgTime, 0) / recentRecords.length);
      $('#dashRecentAvg').text(`${avg} ms`);
    } else {
      $('#dashRecentAvg').text('-');
    }

    $('#dashTotalTests').text(`${records.length}회`);
    const totalSuccess = records.reduce((sum, r) => sum + (r.successCount || 0), 0);
    $('#dashTotalSuccess').text(`${totalSuccess}회`);

    // 테이블 렌더링
    renderRecordTable(records);
    // 막대 차트 렌더링
    renderBarChart(records);
  }

  function renderRecordTable(records) {
    const $tbody = $('#recordTableBody').empty();

    if (records.length === 0) {
      $tbody.html('<tr><td colspan="6" class="text-center py-4 text-muted">저장된 반응 속도 테스트 기록이 없습니다.</td></tr>');
      return;
    }

    records.slice(0, 15).forEach((r) => {
      $tbody.append(`
        <tr>
          <td>${r.date}</td>
          <td class="font-bold text-primary">${r.avgTime > 0 ? r.avgTime + 'ms' : '-'}</td>
          <td>${r.bestTime > 0 ? r.bestTime + 'ms' : '-'}</td>
          <td>${r.successCount}회 / <span class="text-danger">${r.falseCount}회</span></td>
          <td><span class="badge ${r.isValid ? 'badge-success' : 'badge-warning'}">${r.grade}</span></td>
        </tr>
      `);
    });
  }

  function renderBarChart(records) {
    const $chart = $('#chartBarsWrapper').empty();
    const validOnly = records.filter(r => r.isValid).slice(0, 10).reverse();

    if (validOnly.length === 0) {
      $chart.html('<div class="empty-chart">유효한 테스트 기록(정상 3회 이상)이 없습니다.</div>');
      return;
    }

    // 반응 시간은 낮을수록 좋으므로, 차트는 100~500ms 범위에서 스케일링
    const maxVal = Math.max(500, ...validOnly.map(r => r.avgTime));

    validOnly.forEach((d) => {
      // 0ms 기준이 아닌 높이 백분율 계산
      const heightPercent = Math.max(15, Math.round((d.avgTime / maxVal) * 100));
      $chart.append(`
        <div class="chart-bar-item" title="${d.date} - 평균 ${d.avgTime}ms">
          <div class="chart-bar-value">${d.avgTime}ms</div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="height: ${heightPercent}%;"></div>
          </div>
          <div class="chart-bar-label">${d.successCount}회</div>
        </div>
      `);
    });
  }

  function clearAllRecords() {
    if (confirm('저장된 1분 반응 속도 기록을 모두 삭제하시겠습니까?\n삭제 후에는 복원할 수 없습니다.')) {
      localStorage.removeItem(STORAGE_KEY_RECORDS);
      updateDashboard();
      alert('반응 속도 테스트 기록이 모두 삭제되었습니다.');
    }
  }

  // ==========================================================================
  // 9. 리셋 및 타이머 정리
  // ==========================================================================
  function resetAllTimers() {
    if (state.testTimerInterval) {
      clearInterval(state.testTimerInterval);
      state.testTimerInterval = null;
    }
    if (state.countdownInterval) {
      clearInterval(state.countdownInterval);
      state.countdownInterval = null;
    }
    if (state.waitingTimeout) {
      clearTimeout(state.waitingTimeout);
      state.waitingTimeout = null;
    }
    if (state.feedbackTimeout) {
      clearTimeout(state.feedbackTimeout);
      state.feedbackTimeout = null;
    }
  }

  function resetMetrics() {
    state.currentRound = 0;
    state.validReactionTimes = [];
    state.falseStartCount = 0;
    state.remainingSeconds = state.testDurationSeconds;
    state.signalStartTime = null;

    $('#liveTimer').text('60.0s');
    $('#timerProgressBar').css('width', '0%');
    $('#liveRound').text('0');
    $('#liveSuccessCount').text('0');
    $('#liveFalseStarts').text('0');
    $('#liveAvgTime').text('-');
    $('#liveBestTime').text('-');
  }

  function stopTestUserInterrupted() {
    if (confirm('진행 중인 테스트를 중단하시겠습니까? (중단된 테스트는 기록에 저장되지 않습니다.)')) {
      resetAllTimers();
      resetMetrics();
      setStageStatus('ready');
      $('#startTestBtn').show();
      $('#stopTestBtn').hide();
      $('#restartTestBtn').hide();
    }
  }

  // ==========================================================================
  // 10. 이벤트 바인딩 및 브라우저 비활성화 대응 (섹션 7, 9, 21)
  // ==========================================================================
  function initEvents() {
    const $stage = $('#reactionStage');

    // 1) 마우스 및 모바일 터치 이벤트 (Pointer Events로 통일)
    $stage.on('pointerdown', function (e) {
      e.preventDefault();
      handleReactionInput(e);
    });

    // 2) 키보드 Space 및 Enter 키 지원
    $(document).on('keydown', function (e) {
      if (e.code === 'Space' || e.code === 'Enter') {
        // 인풋이나 텍스트에어리어에 포커스가 있으면 기본 타이핑 허용
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

        // Space 키 스크롤 방지
        if (e.code === 'Space') {
          e.preventDefault();
        }

        // 키 꾹 누름(repeat) 방지
        if (e.repeat) return;

        handleReactionInput(e);
      }
    });

    // 3) 컨트롤 버튼
    $('#startTestBtn, #restartTestBtn, #modalRestartBtn').on('click', function () {
      $('#resultModal').fadeOut(150);
      startTestWorkflow();
    });

    $('#stopTestBtn').on('click', function () {
      stopTestUserInterrupted();
    });

    $('#closeResultModalBtn').on('click', function () {
      $('#resultModal').fadeOut(150);
      resetAllTimers();
      resetMetrics();
      setStageStatus('ready');
    });

    $('#downloadResultImgBtn').on('click', handleDownloadResultImage);

    // 4) 기록 삭제
    $('#clearRecordsBtn').on('click', function () {
      clearAllRecords();
    });

    // 5) 효과음 토글
    $('#soundToggleBtn').on('click', function () {
      state.soundEnabled = !state.soundEnabled;
      $(this).toggleClass('active', state.soundEnabled);
      $(this).find('.sound-status').text(state.soundEnabled ? 'ON' : 'OFF');
      if (state.soundEnabled) playSuccessFeedbackSound();
    });

    // 6) 브라우저 탭 비활성화 처리 (섹션 9 & 21)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && state.testTimerInterval) {
        // 탭이 백그라운드로 전환되었을 때 경과 시간 체크
        const elapsed = (performance.now() - state.testStartTime) / 1000;
        if (elapsed >= state.testDurationSeconds) {
          finishTest();
        }
      }
    });
  }

  // ==========================================================================
  // 11. 초기화 실행
  // ==========================================================================
  $(document).ready(function () {
    initEvents();
    setStageStatus('ready');
    updateDashboard();
  });

})(jQuery);
