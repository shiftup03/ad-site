/**
 * 1분 스피드 암산왕 (Speed Math Challenge) 로직
 */

(function ($) {
  'use strict';

  const TOTAL_TIME = 60; // 60초 (1분)

  // 게임 상태 변수
  let timeLeft = TOTAL_TIME;
  let timerInterval = null;
  let isGameActive = false;

  let currentProblem = null;
  let score = 0;
  let solvedCount = 0;
  let totalAttempted = 0;
  let currentCombo = 0;
  let maxCombo = 0;

  // 로컬 스토리지 키
  const STORAGE_KEY_MATH_SCORE = 'challenge_1min_math_best_score';
  const STORAGE_KEY_MATH_SOLVED = 'challenge_1min_math_best_solved';

  // 사운드 재생 헬퍼
  const playSound = (name, arg) => {
    if (window.SoundFX && typeof window.SoundFX[name] === 'function') {
      window.SoundFX[name](arg);
    }
  };

  // 로컬 최고 기록 불러오기
  function loadBestRecords() {
    const bestScore = localStorage.getItem(STORAGE_KEY_MATH_SCORE) || 0;
    const bestSolved = localStorage.getItem(STORAGE_KEY_MATH_SOLVED) || 0;
    $('#bestMathScoreDisplay').text(Number(bestScore).toLocaleString() + '점');
    $('#bestMathSolvedDisplay').text(bestSolved + '개');
  }

  // 최고 기록 갱신 확인
  function checkAndUpdateBestRecord(finalScore, finalSolved) {
    const oldBestScore = parseInt(localStorage.getItem(STORAGE_KEY_MATH_SCORE) || '0', 10);
    const oldBestSolved = parseInt(localStorage.getItem(STORAGE_KEY_MATH_SOLVED) || '0', 10);

    let isNewBest = false;
    if (finalScore > oldBestScore) {
      localStorage.setItem(STORAGE_KEY_MATH_SCORE, finalScore);
      isNewBest = true;
    }
    if (finalSolved > oldBestSolved) {
      localStorage.setItem(STORAGE_KEY_MATH_SOLVED, finalSolved);
    }
    loadBestRecords();
    return isNewBest;
  }

  /**
   * 랜덤 사칙연산 문제 생성 (+, -, *, /)
   * 난이도는 맞춘 문제 수(solvedCount)에 따라 점진적으로 상승
   */
  function generateProblem() {
    const operators = ['+', '-', '×', '÷'];
    const op = operators[Math.floor(Math.random() * operators.length)];

    let num1 = 0;
    let num2 = 0;
    let answer = 0;

    // 난이도 단계 (1단계: 초급, 2단계: 중급, 3단계: 고급)
    const level = solvedCount < 6 ? 1 : (solvedCount < 16 ? 2 : 3);

    switch (op) {
      case '+': // 덧셈
        if (level === 1) {
          num1 = Math.floor(Math.random() * 9) + 1; // 1~9
          num2 = Math.floor(Math.random() * 9) + 1; // 1~9
        } else if (level === 2) {
          num1 = Math.floor(Math.random() * 40) + 10; // 10~49
          num2 = Math.floor(Math.random() * 20) + 5;  // 5~24
        } else {
          num1 = Math.floor(Math.random() * 60) + 20; // 20~79
          num2 = Math.floor(Math.random() * 60) + 20; // 20~79
        }
        answer = num1 + num2;
        break;

      case '-': // 뺄셈 (항상 결과가 0 이상이 되도록 보장)
        if (level === 1) {
          num1 = Math.floor(Math.random() * 15) + 3; // 3~17
          num2 = Math.floor(Math.random() * num1) + 1;
        } else if (level === 2) {
          num1 = Math.floor(Math.random() * 50) + 20; // 20~69
          num2 = Math.floor(Math.random() * 30) + 5;
          if (num2 > num1) [num1, num2] = [num2, num1];
        } else {
          num1 = Math.floor(Math.random() * 90) + 30; // 30~119
          num2 = Math.floor(Math.random() * 60) + 10;
          if (num2 > num1) [num1, num2] = [num2, num1];
        }
        answer = num1 - num2;
        break;

      case '×': // 곱셈
        if (level === 1) {
          num1 = Math.floor(Math.random() * 8) + 2; // 2~9
          num2 = Math.floor(Math.random() * 8) + 2; // 2~9
        } else if (level === 2) {
          num1 = Math.floor(Math.random() * 12) + 2; // 2~13
          num2 = Math.floor(Math.random() * 9) + 2;  // 2~10
        } else {
          num1 = Math.floor(Math.random() * 19) + 5; // 5~23
          num2 = Math.floor(Math.random() * 9) + 3;  // 3~11
        }
        answer = num1 * num2;
        break;

      case '÷': // 나눗셈 (깔끔하게 나누어떨어지는 정수 보장)
        let divisor, quotient;
        if (level === 1) {
          divisor = Math.floor(Math.random() * 8) + 2; // 2~9
          quotient = Math.floor(Math.random() * 8) + 2; // 2~9
        } else if (level === 2) {
          divisor = Math.floor(Math.random() * 9) + 2; // 2~10
          quotient = Math.floor(Math.random() * 15) + 3; // 3~17
        } else {
          divisor = Math.floor(Math.random() * 12) + 3; // 3~14
          quotient = Math.floor(Math.random() * 20) + 5; // 5~24
        }
        num1 = divisor * quotient; // 피제수
        num2 = divisor;           // 제수
        answer = quotient;        // 몫
        break;
    }

    return {
      num1: num1,
      num2: num2,
      operator: op,
      answer: answer,
      expression: `${num1} ${op} ${num2}`
    };
  }

  // 화면에 새 문제 표시
  function renderNewProblem() {
    currentProblem = generateProblem();

    const equationHtml = `
      <span>${currentProblem.num1}</span>
      <span class="operator-tag">${currentProblem.operator}</span>
      <span>${currentProblem.num2}</span>
      <span style="color: var(--text-dim); margin-left: 0.2rem;">=</span>
      <span style="color: var(--primary);">?</span>
    `;

    $('#equationBox').removeClass('shake correct-pop').html(equationHtml);
    $('#answerInput').val('').focus();

    // 난이도 뱃지
    const levelText = solvedCount < 6 ? 'LEVEL 1 · 워밍업' : (solvedCount < 16 ? 'LEVEL 2 · 스피드 UP' : 'LEVEL 3 · 극한 집중');
    $('#levelBadge').text(levelText);
  }

  // 상단 대시보드 UI 업데이트
  function updateDashboard() {
    $('#scoreDisplay').text(score.toLocaleString());
    $('#solvedDisplay').text(solvedCount);
    $('#comboDisplay').text(`x${currentCombo}`);
    $('#timeDisplay').text(timeLeft);

    const percentage = Math.max(0, (timeLeft / TOTAL_TIME) * 100);
    $('#timerBar').css('width', `${percentage}%`);

    if (timeLeft <= 10) {
      $('#timerBox').addClass('hurry');
      $('#timerBar').addClass('danger');
    } else {
      $('#timerBox').removeClass('hurry');
      $('#timerBar').removeClass('danger');
    }
  }

  // 플로팅 텍스트 피드백 (+점수 / 콤보)
  function showFloatingFeedback(text, color = '#10b981') {
    const $target = $('#equationBox');
    const offset = $target.offset();
    const width = $target.outerWidth();
    const height = $target.outerHeight();

    const $float = $('<div class="floating-text"></div>')
      .text(text)
      .css({
        left: offset.left + width / 2,
        top: offset.top + height / 4,
        color: color
      })
      .appendTo('body');

    setTimeout(() => {
      $float.remove();
    }, 850);
  }

  // 정답 제출 검사
  function submitAnswer() {
    if (!isGameActive || !currentProblem) return;

    const rawInput = $('#answerInput').val().trim();
    if (rawInput === '') return;

    const userAnswer = parseInt(rawInput, 10);
    totalAttempted++;

    if (userAnswer === currentProblem.answer) {
      // 정답!
      solvedCount++;
      currentCombo++;
      if (currentCombo > maxCombo) maxCombo = currentCombo;

      // 점수 계산: 기본 100점 + 콤보 보너스
      const comboBonus = Math.round(100 * (1 + (currentCombo - 1) * 0.3));
      score += comboBonus;

      playSound('correctAnswer');
      if (currentCombo > 1) {
        setTimeout(() => playSound('combo', currentCombo), 90);
      }

      $('#equationBox').addClass('correct-pop');
      showFloatingFeedback(`+${comboBonus}점! ${currentCombo > 1 ? `(${currentCombo} COMBO!)` : ''}`, '#059669');

      updateDashboard();
      setTimeout(renderNewProblem, 120);
    } else {
      // 오답!
      currentCombo = 0;
      playSound('wrongAnswer');

      $('#equationBox').addClass('shake');
      $('#answerInput').val('');

      showFloatingFeedback(`오답! 정답은 ${currentProblem.answer}`, '#dc2626');

      updateDashboard();
      setTimeout(renderNewProblem, 400);
    }
  }

  // 문제 패스/스킵
  function skipProblem() {
    if (!isGameActive || !currentProblem) return;
    currentCombo = 0;
    totalAttempted++;
    playSound('wrongAnswer');

    showFloatingFeedback(`패스! (정답: ${currentProblem.answer})`, '#d97706');
    updateDashboard();
    renderNewProblem();
  }

  // 키패드 입력 핸들러
  function handleKeypadInput(key) {
    if (!isGameActive) return;
    playSound('keyClick');

    const $input = $('#answerInput');
    let currentVal = $input.val();

    if (key === 'clear') {
      $input.val(currentVal.slice(0, -1));
    } else if (key === 'submit') {
      submitAnswer();
    } else {
      // 최대 5자리까지 입력 제한
      if (currentVal.length < 5) {
        $input.val(currentVal + key);
      }
    }
    $input.focus();
  }

  // 게임 시작
  function startGame() {
    timeLeft = TOTAL_TIME;
    score = 0;
    solvedCount = 0;
    totalAttempted = 0;
    currentCombo = 0;
    maxCombo = 0;
    isGameActive = true;

    $('#readyOverlay').fadeOut(200);
    $('#resultModalBackdrop').removeClass('show');

    updateDashboard();
    renderNewProblem();

    clearInterval(timerInterval);
    timerInterval = setInterval(function () {
      timeLeft--;
      updateDashboard();

      if (timeLeft <= 10 && timeLeft > 0) {
        playSound('countdownTick');
      }

      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  }

  // 게임 종료
  function endGame() {
    clearInterval(timerInterval);
    isGameActive = false;
    timeLeft = 0;
    updateDashboard();

    playSound('gameOver');

    // 통계 계산
    const accuracy = totalAttempted > 0 ? Math.round((solvedCount / totalAttempted) * 100) : 0;

    // 랭크 등급 및 칭호
    let rank = 'C';
    let rankBadge = '🥉';
    let title = '암산 꿈나무';

    if (solvedCount >= 35 || score >= 5500) {
      rank = 'S+';
      rankBadge = '👑';
      title = '살아있는 인간 계산기 / 수학의 신';
    } else if (solvedCount >= 25 || score >= 3800) {
      rank = 'S';
      rankBadge = '💎';
      title = '스피드 암산 마스터';
    } else if (solvedCount >= 18 || score >= 2400) {
      rank = 'A';
      rankBadge = '🥇';
      title = '두뇌 회전 쾌속 질주자';
    } else if (solvedCount >= 10 || score >= 1200) {
      rank = 'B';
      rankBadge = '🥈';
      title = '날카로운 계산 본능';
    }

    const isNewRecord = checkAndUpdateBestRecord(score, solvedCount);

    // 모달 데이터 렌더링
    $('#resultBadge').text(rankBadge);
    $('#resultGrade').text(`[ Rank ${rank} ] - ${title}`);
    $('#finalScore').text(score.toLocaleString() + '점');
    $('#finalSolved').text(solvedCount + '문제');
    $('#finalCombo').text(maxCombo + '회');
    $('#finalAccuracy').text(accuracy + '%');

    if (isNewRecord) {
      $('#newRecordAlert').show();
    } else {
      $('#newRecordAlert').hide();
    }

    setTimeout(() => {
      $('#resultModalBackdrop').addClass('show');
    }, 500);
  }

  // 결과 이미지 저장 (Canvas PNG)
  function handleDownloadResultImage() {
    const accuracy = totalAttempts > 0 ? Math.round((solvedCount / totalAttempts) * 100) : 0;
    const gradeFull = $('#resultGrade').text() || '[ Rank S ] - 빛의 연산 마스터';
    const parts = gradeFull.split(' - ');
    const gradeTag = parts[0] || '[ Rank S ]';
    const gradeDesc = parts[1] || '빛의 연산 마스터';
    const badgeText = $('#resultBadge').text() || '👑';

    if (typeof window.downloadGameResultImage === 'function') {
      window.downloadGameResultImage({
        title: '1분 스피드 암산왕',
        category: 'MATH CHALLENGE',
        rankBadge: badgeText,
        grade: gradeTag,
        gradeDesc: gradeDesc,
        stats: [
          { label: '최종 점수', value: score.toLocaleString() + '점', color: '#db2777' },
          { label: '맞춘 문제', value: solvedCount + '문제', color: '#059669' },
          { label: '최대 콤보', value: maxCombo + '회', color: '#d97706' },
          { label: '계산 정답률', value: accuracy + '%', color: '#0284c7' }
        ],
        filename: '1분스피드암산_결과'
      });
    } else {
      alert('결과 이미지 생성 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    }
  }

  // 이벤트 등록
  $(document).ready(function () {
    loadBestRecords();

    // 시작 버튼
    $('#startBtn, #restartBtn, #modalRestartBtn').on('click', function () {
      startGame();
    });

    // 온스크린 키패드 클릭
    $('.keypad-btn').on('click', function () {
      const key = $(this).data('key');
      handleKeypadInput(key);
    });

    // 스킵 버튼
    $('#skipBtn').on('click', function () {
      skipProblem();
    });

    // PC 키보드 입력 지원
    $(document).on('keydown', function (e) {
      if (!isGameActive) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        submitAnswer();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        skipProblem();
      }
    });

    // 모달 결과 이미지 저장
    $('#downloadResultImgBtn').on('click', handleDownloadResultImage);
  });

})(jQuery);
