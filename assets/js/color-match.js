/**
 * 1분 카드 매칭 챌린지 (Color Match Challenge) 로직
 */

(function ($) {
  'use strict';

  // 카드 테마 정의 (8종 컬러 & 이모지)
  const CARD_ITEMS = [
    { id: 'ruby', name: '루비 레드', color: 'linear-gradient(135deg, #ef4444, #b91c1c)', icon: '🍓' },
    { id: 'emerald', name: '에메랄드 그린', color: 'linear-gradient(135deg, #10b981, #047857)', icon: '🥑' },
    { id: 'ocean', name: '오션 블루', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', icon: '🐬' },
    { id: 'amber', name: '앰버 옐로우', color: 'linear-gradient(135deg, #f59e0b, #b45309)', icon: '🍋' },
    { id: 'violet', name: '네온 바이올렛', color: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', icon: '🍇' },
    { id: 'pink', name: '플라밍고 핑크', color: 'linear-gradient(135deg, #ec4899, #be185d)', icon: '🦩' },
    { id: 'cyan', name: '아쿠아 시안', color: 'linear-gradient(135deg, #06b6d4, #0e7490)', icon: '🧊' },
    { id: 'orange', name: '선셋 오렌지', color: 'linear-gradient(135deg, #f97316, #c2410c)', icon: '🍊' }
  ];

  const TOTAL_TIME = 60; // 1분 (60초)

  // 게임 상태 변수
  let timeLeft = TOTAL_TIME;
  let timerInterval = null;
  let isGameActive = false;
  let flippedCards = [];
  let isChecking = false;

  let score = 0;
  let matchedPairs = 0;
  let totalClicks = 0;
  let successfulMatches = 0;
  let currentCombo = 0;
  let maxCombo = 0;
  let stageRound = 1;

  // 사운드 재생 헬퍼
  const playSound = (name, arg) => {
    if (window.SoundFX && typeof window.SoundFX[name] === 'function') {
      window.SoundFX[name](arg);
    }
  };

  // 로컬 스토리지 키
  const STORAGE_KEY_SCORE = 'challenge_1min_color_best_score';
  const STORAGE_KEY_PAIRS = 'challenge_1min_color_best_pairs';

  // 로컬 최고 기록 불러오기
  function loadBestRecords() {
    const bestScore = localStorage.getItem(STORAGE_KEY_SCORE) || 0;
    const bestPairs = localStorage.getItem(STORAGE_KEY_PAIRS) || 0;
    $('#bestScoreDisplay').text(Number(bestScore).toLocaleString());
    $('#bestPairsDisplay').text(bestPairs + '쌍');
  }

  // 최고 기록 갱신 확인
  function checkAndUpdateBestRecord(finalScore, finalPairs) {
    const oldBestScore = parseInt(localStorage.getItem(STORAGE_KEY_SCORE) || '0', 10);
    const oldBestPairs = parseInt(localStorage.getItem(STORAGE_KEY_PAIRS) || '0', 10);

    let isNewBest = false;
    if (finalScore > oldBestScore) {
      localStorage.setItem(STORAGE_KEY_SCORE, finalScore);
      isNewBest = true;
    }
    if (finalPairs > oldBestPairs) {
      localStorage.setItem(STORAGE_KEY_PAIRS, finalPairs);
    }
    loadBestRecords();
    return isNewBest;
  }

  // 카드 덱 생성 및 셔플 (8쌍 = 16장)
  function createDeck() {
    const deck = [];
    CARD_ITEMS.forEach((item, index) => {
      // 각 아이템마다 2장씩 추가
      deck.push({ ...item, uid: `${item.id}_a_${index}` });
      deck.push({ ...item, uid: `${item.id}_b_${index}` });
    });

    // Fisher-Yates 셔플 알고리즘
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }

  // 카드 그리드 렌더링
  function renderCards() {
    const $grid = $('#cardsGrid');
    $grid.empty();

    const deck = createDeck();
    deck.forEach((card, idx) => {
      const cardHtml = `
        <div class="flip-card" data-card-id="${card.id}" data-card-idx="${idx}">
          <div class="flip-card-inner">
            <div class="flip-card-front">
              <span class="card-pattern">❓</span>
            </div>
            <div class="flip-card-back" style="background: ${card.color};">
              <span class="card-icon">${card.icon}</span>
            </div>
          </div>
        </div>
      `;
      $grid.append(cardHtml);
    });
  }

  // 상태 대시보드 UI 업데이트
  function updateDashboard() {
    $('#scoreDisplay').text(score.toLocaleString());
    $('#matchedDisplay').text(matchedPairs);
    $('#comboDisplay').text(`x${currentCombo}`);
    $('#timeDisplay').text(timeLeft);

    // 프로그레스 바 계산 (60초 기준)
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

  // 플로팅 피드백 텍스트 효과 (+점수 / 콤보)
  function showFloatingText($target, text, color = '#f59e0b') {
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

  // 게임 시작
  function startGame() {
    // 상태 초기화
    timeLeft = TOTAL_TIME;
    score = 0;
    matchedPairs = 0;
    totalClicks = 0;
    successfulMatches = 0;
    currentCombo = 0;
    maxCombo = 0;
    stageRound = 1;
    flippedCards = [];
    isChecking = false;
    isGameActive = true;

    // UI 정리
    $('#readyOverlay').fadeOut(200);
    $('#resultModalBackdrop').removeClass('show');
    $('#stageClearBanner').removeClass('show');

    renderCards();
    updateDashboard();

    // 타이머 인터벌 시작 (1초 단위)
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

  // 카드 클릭 이벤트 핸들러
  function onCardClick() {
    if (!isGameActive || isChecking) return;

    const $card = $(this);

    // 이미 뒤집혀있거나 맞춘 카드는 무시
    if ($card.hasClass('flipped') || $card.hasClass('matched')) {
      return;
    }

    playSound('cardFlip');
    $card.addClass('flipped');
    flippedCards.push($card);
    totalClicks++;

    if (flippedCards.length === 2) {
      checkMatch();
    }
  }

  // 두 카드가 일치하는지 판별
  function checkMatch() {
    isChecking = true;
    const [$card1, $card2] = flippedCards;
    const id1 = $card1.data('card-id');
    const id2 = $card2.data('card-id');

    if (id1 === id2) {
      // 짝 맞춤 성공!
      handleMatchSuccess($card1, $card2);
    } else {
      // 짝 맞춤 실패
      handleMatchFail($card1, $card2);
    }
  }

  // 매치 성공 처리
  function handleMatchSuccess($card1, $card2) {
    matchedPairs++;
    successfulMatches++;
    currentCombo++;
    if (currentCombo > maxCombo) maxCombo = currentCombo;

    // 점수 계산: 기본 100점 + 콤보 보너스
    const comboBonus = Math.round(100 * (1 + (currentCombo - 1) * 0.35));
    score += comboBonus;

    playSound('matchSuccess');
    if (currentCombo > 1) {
      setTimeout(() => playSound('combo', currentCombo), 100);
    }

    $card1.addClass('matched');
    $card2.addClass('matched');

    showFloatingText($card2, `+${comboBonus}점! ${currentCombo > 1 ? `(${currentCombo} COMBO!)` : ''}`, '#10b981');

    flippedCards = [];
    isChecking = false;
    updateDashboard();

    // 한 라운드(8쌍 16장 모두 매칭) 완료 확인
    const totalRemaining = $('.flip-card:not(.matched)').length;
    if (totalRemaining === 0) {
      handleStageClear();
    }
  }

  // 매치 실패 처리
  function handleMatchFail($card1, $card2) {
    currentCombo = 0; // 콤보 리셋
    playSound('matchFail');

    setTimeout(() => {
      $card1.removeClass('flipped');
      $card2.removeClass('flipped');
      flippedCards = [];
      isChecking = false;
      updateDashboard();
    }, 700);
  }

  // 8쌍 모두 클리어 시 다음 라운드 리필 (+보너스 타임 5초)
  function handleStageClear() {
    stageRound++;
    const bonusTime = 5;
    timeLeft = Math.min(TOTAL_TIME, timeLeft + bonusTime); // 최대 60초까지 보너스 증정

    $('#stageClearBanner')
      .text(`ROUND ${stageRound} START! ⏰ +${bonusTime}초 보너스!`)
      .addClass('show');

    setTimeout(() => {
      $('#stageClearBanner').removeClass('show');
      renderCards();
      updateDashboard();
    }, 1100);
  }

  // 게임 종료
  function endGame() {
    clearInterval(timerInterval);
    isGameActive = false;
    timeLeft = 0;
    updateDashboard();

    playSound('gameOver');

    // 통계 계산
    const totalAttempts = totalClicks > 0 ? Math.floor(totalClicks / 2) : 0;
    const accuracy = totalAttempts > 0 ? Math.round((successfulMatches / totalAttempts) * 100) : 0;

    // 등급 산출
    let rank = 'C';
    let rankBadge = '🥉';
    let title = '초보 탐험가';

    if (matchedPairs >= 20 || score >= 4000) {
      rank = 'S+';
      rankBadge = '👑';
      title = '신의 손가락 / 초감각 기억력 마스터';
    } else if (matchedPairs >= 15 || score >= 2800) {
      rank = 'S';
      rankBadge = '💎';
      title = '순간 기억력의 달인';
    } else if (matchedPairs >= 10 || score >= 1800) {
      rank = 'A';
      rankBadge = '🥇';
      title = '스피드 색채 헌터';
    } else if (matchedPairs >= 6 || score >= 1000) {
      rank = 'B';
      rankBadge = '🥈';
      title = '번뜩이는 집중력';
    }

    const isNewRecord = checkAndUpdateBestRecord(score, matchedPairs);

    // 모달 데이터 렌더링
    $('#resultBadge').text(rankBadge);
    $('#resultGrade').text(`[ Rank ${rank} ] - ${title}`);
    $('#finalScore').text(score.toLocaleString() + '점');
    $('#finalPairs').text(matchedPairs + '쌍');
    $('#finalCombo').text(maxCombo + '회');
    $('#finalAccuracy').text(accuracy + '%');

    if (isNewRecord) {
      $('#newRecordAlert').show();
    } else {
      $('#newRecordAlert').hide();
    }

    setTimeout(() => {
      $('#resultModalBackdrop').addClass('show');
    }, 600);
  }

  // 결과 클립보드 복사
  function copyResultToClipboard() {
    const text = `⚡ [1분 챌린지 - 카드 매칭 결과]\n` +
      `🏆 최종 점수: ${score.toLocaleString()}점\n` +
      `🎯 맞춘 짝: ${matchedPairs}쌍\n` +
      `🔥 최대 콤보: ${maxCombo}회\n` +
      `지금 1분 챌린지에서 두뇌 피지컬을 시험해보세요!`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('🎉 결과가 클립보드에 복사되었습니다! 친구들에게 공유해보세요.');
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const $temp = $('<textarea>');
    $('body').append($temp);
    $temp.val(text).select();
    document.execCommand('copy');
    $temp.remove();
    alert('🎉 결과가 클립보드에 복사되었습니다!');
  }

  // 이벤트 바인딩
  $(document).ready(function () {
    loadBestRecords();

    // 시작 버튼
    $('#startBtn, #restartBtn').on('click', function () {
      startGame();
    });

    // 모달 닫기 및 재도전
    $('#modalRestartBtn').on('click', function () {
      $('#resultModalBackdrop').removeClass('show');
      startGame();
    });

    // 카드 클릭 이벤트 위임
    $(document).on('click', '.flip-card', onCardClick);

    // 결과 복사 버튼
    $('#shareBtn').on('click', copyResultToClipboard);
  });

})(jQuery);
