/**
 * 1-Min Challenge - 햄버거 탑 쌓기 (burger-stack.js)
 * Vanilla JavaScript ES6+ (Core Logic & Physics) + jQuery (UI/DOM) + GSAP (Animations)
 */

(function ($) {
  'use strict';

  // ==========================================================================
  // 1. 상수 및 재료 정의 (10종 햄버거 재료)
  // ==========================================================================
  const STORAGE_KEY_RECORDS = 'burger_stack_records_v1';
  const STORAGE_KEY_SETTINGS = 'burger_stack_settings_v1';

  const INGREDIENTS = [
    { id: 'bun-bottom', name: '아랫빵', width: 220, height: 32, cssClass: 'ing-bun-bottom', isBun: true },
    { id: 'beef-patty', name: '소고기 패티', width: 216, height: 28, cssClass: 'ing-beef-patty' },
    { id: 'cheese', name: '체다 치즈', width: 224, height: 16, cssClass: 'ing-cheese' },
    { id: 'lettuce', name: '양상추', width: 228, height: 22, cssClass: 'ing-lettuce' },
    { id: 'tomato', name: '토마토', width: 212, height: 24, cssClass: 'ing-tomato' },
    { id: 'onion', name: '적양파', width: 208, height: 18, cssClass: 'ing-onion' },
    { id: 'bacon', name: '베이컨', width: 224, height: 18, cssClass: 'ing-bacon' },
    { id: 'pickle', name: '피클', width: 204, height: 16, cssClass: 'ing-pickle' },
    { id: 'egg', name: '달걀 후라이', width: 216, height: 22, cssClass: 'ing-egg' },
    { id: 'bun-top', name: '윗빵', width: 218, height: 44, cssClass: 'ing-bun-top', isTopBun: true }
  ];

  // 표준 등장 시퀀스 (층수별 큐)
  const SEQUENCE_PATTERN = [
    'beef-patty',
    'cheese',
    'lettuce',
    'tomato',
    'onion',
    'bacon',
    'cheese',
    'pickle',
    'egg',
    'bun-top' // 10층 달성 시 윗빵 보너스
  ];

  // ==========================================================================
  // 2. Web Audio API 사운드 시스템 (무저작권 신시사이저 사운드)
  // ==========================================================================
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.enabled = false;
      this.loadSettings();
    }

    initCtx() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    loadSettings() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.enabled = !!parsed.soundEnabled;
        } else {
          this.enabled = false; // 기본 꺼짐
        }
      } catch (e) {
        this.enabled = false;
      }
    }

    saveSettings() {
      try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify({
          soundEnabled: this.enabled
        }));
      } catch (e) {}
    }

    toggle() {
      this.enabled = !this.enabled;
      this.saveSettings();
      if (this.enabled) {
        this.initCtx();
        this.playClick();
      }
      return this.enabled;
    }

    playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.18, freqEnd = null) {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (freqEnd !== null) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(10, freqEnd), now + duration);
        }

        gain.gain.setValueAtTime(gainVal, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {}
    }

    playClick() {
      this.playTone(600, 'sine', 0.05, 0.12, 400);
    }

    playDrop() {
      this.playTone(450, 'triangle', 0.16, 0.15, 180);
    }

    playLandNormal() {
      this.playTone(180, 'triangle', 0.14, 0.22, 90);
    }

    playLandGood() {
      if (!this.enabled) return;
      this.initCtx();
      this.playTone(320, 'sine', 0.18, 0.2, 480);
    }

    playLandPerfect() {
      if (!this.enabled) return;
      this.initCtx();
      // 화사한 아르페지오 (C6 -> E6 -> G6)
      this.playTone(523.25, 'sine', 0.2, 0.2);
      setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.2), 40);
      setTimeout(() => this.playTone(783.99, 'sine', 0.25, 0.25), 80);
    }

    playCombo(combo) {
      if (!this.enabled) return;
      const baseFreq = Math.min(1000, 440 + combo * 40);
      this.playTone(baseFreq, 'sine', 0.25, 0.22, baseFreq * 1.5);
    }

    playBurgerComplete() {
      if (!this.enabled) return;
      // 윗빵 완성 보너스 팡파르
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.3, 0.22), i * 70);
      });
    }

    playMiss() {
      this.playTone(280, 'sawtooth', 0.35, 0.2, 90);
    }

    playGameOver() {
      if (!this.enabled) return;
      [240, 210, 180, 140].forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'sawtooth', 0.3, 0.18), i * 110);
      });
    }
  }

  const sound = new SoundManager();

  // ==========================================================================
  // 3. 기록 관리 (LocalStorage)
  // ==========================================================================
  class RecordsManager {
    constructor() {
      this.data = {
        bestScore: 0,
        bestFloor: 0,
        totalPlays: 0,
        totalIngredients: 0,
        recentRecords: []
      };
      this.load();
    }

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.data = Object.assign(this.data, parsed);
          if (!Array.isArray(this.data.recentRecords)) {
            this.data.recentRecords = [];
          }
        }
      } catch (e) {
        console.warn('Failed to load burger records:', e);
      }
    }

    save() {
      try {
        localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(this.data));
      } catch (e) {
        console.warn('Failed to save burger records:', e);
      }
    }

    addRecord(record) {
      const isNewBestScore = record.score > this.data.bestScore;
      const isNewBestFloor = record.floor > this.data.bestFloor;

      if (isNewBestScore) this.data.bestScore = record.score;
      if (isNewBestFloor) this.data.bestFloor = record.floor;

      this.data.totalPlays += 1;
      this.data.totalIngredients += record.floor;

      this.data.recentRecords.unshift(record);
      if (this.data.recentRecords.length > 30) {
        this.data.recentRecords = this.data.recentRecords.slice(0, 30);
      }

      this.save();
      return { isNewBestScore, isNewBestFloor };
    }

    clearRecords() {
      this.data = {
        bestScore: 0,
        bestFloor: 0,
        totalPlays: 0,
        totalIngredients: 0,
        recentRecords: []
      };
      this.save();
    }
  }

  const records = new RecordsManager();

  // ==========================================================================
  // 4. 게임 엔진 클래스
  // ==========================================================================
  class BurgerGame {
    constructor() {
      // DOM 캐시
      this.$stage = $('#burgerStage');
      this.$world = $('#burgerWorld');
      this.$stackGroup = $('#burgerStackGroup');
      this.$movingLayer = $('#burgerMovingLayer');
      this.$popupLayer = $('#burgerPopupLayer');
      this.$plate = $('#burgerPlate');

      // 오버레이 및 모달
      this.$startOverlay = $('#startOverlay');
      this.$countdownOverlay = $('#countdownOverlay');
      this.$pauseOverlay = $('#pauseOverlay');
      this.$countdownNum = $('#countdownNumber');

      this.$resultModal = $('#resultModal');
      this.$historyModal = $('#historyModal');

      // HUD 엘리먼트
      this.$curScore = $('#curScore');
      this.$curFloor = $('#curFloor');
      this.$curCombo = $('#curCombo');
      this.$bestRecord = $('#bestRecord');
      this.$hudComboCard = $('#hudComboCard');

      // 게임 상태 변수
      this.state = 'ready'; // ready, countdown, moving, dropping, landing, camera-moving, paused, gameover
      this.score = 0;
      this.floor = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.perfectCount = 0;
      this.goodCount = 0;
      this.normalCount = 0;
      this.startTime = 0;

      // 물리 및 카메라 변수
      this.placedStack = []; // [{ type, x, y, width, height, $el }]
      this.currentIngredient = null; // { def, width, height, x, y, direction }
      this.$currentMovingEl = null;
      this.movingTween = null;
      this.dropTween = null;
      this.cameraOffsetY = 0;

      // 설정
      this.spawnDirection = 1; // 1: left -> right, -1: right -> left

      this.initEvents();
      this.updateHud();
      this.updateSoundBtn();
      this.initBottomBun(); // 페이지 로드 시 바닥 아랫빵 바로 표시
    }

    // ------------------------------------------------------------------------
    // 이벤트 바인딩
    // ------------------------------------------------------------------------
    initEvents() {
      const self = this;

      // 1. 스테이지 클릭 / 모바일 터치 (Pointerdown API)
      this.$stage.on('pointerdown', function (e) {
        // UI 버튼 클릭 시 드롭 방지
        if ($(e.target).closest('button, .stage-overlay, .modal-card, a').length) {
          return;
        }
        e.preventDefault();
        self.handleActionDrop();
      });

      // 2. 키보드 Spacebar 입력
      $(window).on('keydown', function (e) {
        if (e.code === 'Space') {
          // 인풋 필드나 폼에 포커스된 경우 제외
          if ($(e.target).is('input, textarea, select')) return;
          e.preventDefault();
          if (e.originalEvent.repeat) return; // 반복 입력 방지
          self.handleActionDrop();
        }
      });

      // 3. 툴바 버튼 이벤트
      $('#btnStartGame').on('click', function (e) {
        e.stopPropagation();
        sound.playClick();
        self.startCountdown();
      });

      $('#btnPause').on('click', function (e) {
        e.stopPropagation();
        sound.playClick();
        self.togglePause();
      });

      $('#btnResume').on('click', function (e) {
        e.stopPropagation();
        sound.playClick();
        self.resumeGame();
      });

      $('#btnRestart').on('click', function (e) {
        e.stopPropagation();
        sound.playClick();
        self.confirmRestart();
      });

      $('#btnRestartFromPause').on('click', function (e) {
        e.stopPropagation();
        sound.playClick();
        self.$pauseOverlay.addClass('hidden');
        self.startCountdown();
      });

      $('#btnSoundToggle').on('click', function (e) {
        e.stopPropagation();
        const enabled = sound.toggle();
        self.updateSoundBtn();
      });

      $('#btnOpenHistory').on('click', function (e) {
        e.stopPropagation();
        sound.playClick();
        self.openHistoryModal();
      });

      // 모달 버튼
      $('#modalRestartBtn').on('click', function (e) {
        e.stopPropagation();
        sound.playClick();
        self.closeResultModal();
        self.startCountdown();
      });

      $('#modalViewHistoryBtn').on('click', function (e) {
        e.stopPropagation();
        sound.playClick();
        self.closeResultModal();
        self.openHistoryModal();
      });

      $('#closeResultModalBtn, #modalTopCloseResultBtn').on('click', function (e) {
        e.stopPropagation();
        sound.playClick();
        self.closeResultModal();
      });

      $('#closeHistoryModalBtn, #modalTopCloseHistoryBtn').on('click', function (e) {
        e.stopPropagation();
        sound.playClick();
        self.closeHistoryModal();
      });

      // 모달 바깥 배경 클릭 시 닫기
      this.$resultModal.on('click', function (e) {
        if ($(e.target).is('#resultModal')) {
          self.closeResultModal();
        }
      });

      this.$historyModal.on('click', function (e) {
        if ($(e.target).is('#historyModal')) {
          self.closeHistoryModal();
        }
      });

      // ESC 키 입력 시 열려있는 모달 닫기
      $(window).on('keydown', function (e) {
        if (e.key === 'Escape' || e.code === 'Escape') {
          if (!self.$historyModal.hasClass('hidden')) {
            self.closeHistoryModal();
          } else if (!self.$resultModal.hasClass('hidden')) {
            self.closeResultModal();
          }
        }
      });

      $('#btnClearHistoryBtn').on('click', function (e) {
        e.stopPropagation();
        if (confirm('햄버거 탑 쌓기 기록을 모두 삭제하시겠습니까?\n(기존 다른 게임의 기록은 보존됩니다)')) {
          sound.playClick();
          records.clearRecords();
          self.renderHistoryTable();
          self.updateHud();
        }
      });

      // 4. 창 크기 변경 시 재정렬
      let resizeTimer = null;
      $(window).on('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          self.handleResize();
        }, 150);
      });

      // 5. 탭 전환 시 자동 일시정지
      document.addEventListener('visibilitychange', function () {
        if (document.hidden && (self.state === 'moving' || self.state === 'dropping')) {
          self.pauseGame();
        }
      });
    }

    updateSoundBtn() {
      const $btn = $('#btnSoundToggle');
      if (sound.enabled) {
        $btn.html('<span>🔊</span> <span class="btn-text">소리 켬</span>').addClass('active');
      } else {
        $btn.html('<span>🔇</span> <span class="btn-text">소리 끔</span>').removeClass('active');
      }
    }

    // ------------------------------------------------------------------------
    // 게임 시작 및 카운트다운
    // ------------------------------------------------------------------------
    startCountdown() {
      if (this.state === 'countdown') return;

      this.resetGameData();
      this.$startOverlay.addClass('hidden');
      this.$pauseOverlay.addClass('hidden');
      this.$countdownOverlay.removeClass('hidden');

      this.state = 'countdown';

      const countSequence = ['3', '2', '1', 'START!'];
      let idx = 0;

      const runCount = () => {
        if (idx >= countSequence.length) {
          gsap.to(this.$countdownOverlay, {
            opacity: 0,
            duration: 0.25,
            onComplete: () => {
              this.$countdownOverlay.addClass('hidden').css('opacity', 1);
              this.startGamePlay();
            }
          });
          return;
        }

        const txt = countSequence[idx];
        this.$countdownNum.text(txt);
        sound.playClick();

        gsap.fromTo(this.$countdownNum, 
          { scale: 0.4, opacity: 0 },
          { scale: 1.1, opacity: 1, duration: 0.45, ease: "back.out(2)", onComplete: () => {
            gsap.to(this.$countdownNum, {
              scale: 0.9,
              opacity: 0.8,
              duration: 0.35,
              onComplete: () => {
                idx++;
                runCount();
              }
            });
          }}
        );
      };

      runCount();
    }

    resetGameData() {
      // 진행 중인 모든 GSAP Tween 정리
      if (this.movingTween) { this.movingTween.kill(); this.movingTween = null; }
      if (this.dropTween) { this.dropTween.kill(); this.dropTween = null; }

      this.score = 0;
      this.floor = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.perfectCount = 0;
      this.goodCount = 0;
      this.normalCount = 0;
      this.startTime = Date.now();
      this.cameraOffsetY = 0;
      this.spawnDirection = 1;

      // 월드 및 스택 초기화
      this.$stackGroup.empty();
      this.$movingLayer.empty();
      this.$popupLayer.empty();
      gsap.set(this.$world, { y: 0 });

      this.placedStack = [];

      // 아랫빵 초기 배치 (Floor 0)
      this.initBottomBun();
      this.updateHud();
    }

    initBottomBun() {
      this.$stackGroup.empty();
      this.placedStack = [];

      const bottomDef = INGREDIENTS[0]; // bun-bottom
      const stageW = this.$stage.width() || 480;
      const bunW = bottomDef.width;
      const bunH = bottomDef.height;
      const centerX = stageW / 2;
      const leftX = centerX - bunW / 2;

      // 아랫빵 DOM 생성
      const $bunEl = $(`<div class="burger-ingredient ${bottomDef.cssClass}" style="width: ${bunW}px; height: ${bunH}px; left: ${leftX}px; bottom: 0;"></div>`);
      this.$stackGroup.append($bunEl);

      // 스택 데이터 등록 (y는 누적 높이)
      this.placedStack.push({
        def: bottomDef,
        width: bunW,
        height: bunH,
        centerX: centerX,
        bottomY: 0,
        topY: bunH,
        $el: $bunEl
      });

      // 등장 애니메이션
      gsap.fromTo($bunEl, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" });
    }

    startGamePlay() {
      this.state = 'moving';
      this.spawnNextIngredient();
    }

    // ------------------------------------------------------------------------
    // 다음 재료 스폰 & 좌우 이동
    // ------------------------------------------------------------------------
    getNextIngredientDef() {
      // 10층 단위마다 윗빵 등장!
      if ((this.floor + 1) % 10 === 0) {
        return INGREDIENTS.find(i => i.id === 'bun-top');
      }

      // 기본 1~9층은 시퀀스 패턴 사용
      const patternIdx = this.floor % SEQUENCE_PATTERN.length;
      const targetId = SEQUENCE_PATTERN[patternIdx];
      const found = INGREDIENTS.find(i => i.id === targetId);
      if (found && !found.isTopBun) return found;

      // 무한 쌓기 모드 랜덤 선택 (아랫빵/윗빵 제외 8종)
      const pool = INGREDIENTS.filter(i => !i.isBun && !i.isTopBun);
      const randomIdx = Math.floor(Math.random() * pool.length);
      return pool[randomIdx];
    }

    getSpeedDuration() {
      // 1~5층: 기본 속도 (1.9s)
      // 6~10층: x1.15 속도 (1.65s)
      // 11~20층: x1.30 속도 (1.46s)
      // 21~35층: x1.50 속도 (1.26s)
      // 36층 이상: x1.70 속도 (1.11s) (최대 속도 상한 1.05s)
      const base = 1.9;
      let multiplier = 1.0;

      if (this.floor >= 36) {
        multiplier = 1.7;
      } else if (this.floor >= 21) {
        multiplier = 1.5;
      } else if (this.floor >= 11) {
        multiplier = 1.3;
      } else if (this.floor >= 6) {
        multiplier = 1.15;
      }

      const duration = Math.max(1.05, base / multiplier);
      return duration;
    }

    spawnNextIngredient() {
      if (this.state !== 'moving') return;

      const def = this.getNextIngredientDef();
      const stageW = this.$stage.width();
      const ingW = def.width;
      const ingH = def.height;

      // 이동 범위 계산 (좌우 패딩 12px)
      const minX = 12;
      const maxX = stageW - ingW - 12;

      // 등장 방향 전환
      if (this.floor > 10 && Math.random() > 0.5) {
        this.spawnDirection = -this.spawnDirection;
      } else {
        this.spawnDirection = (this.floor % 2 === 0) ? 1 : -1;
      }

      const startX = this.spawnDirection === 1 ? minX : maxX;
      const targetX = this.spawnDirection === 1 ? maxX : minX;

      // 이동 레이어 엘리먼트 생성
      this.$movingLayer.empty();
      const $el = $(`<div class="burger-ingredient ${def.cssClass}" style="width: ${ingW}px; height: ${ingH}px; top: 0; left: 0;"></div>`);
      this.$movingLayer.append($el);
      this.$currentMovingEl = $el;

      gsap.set($el, { x: startX, y: 0, scale: 1, rotation: 0, opacity: 1 });

      this.currentIngredient = {
        def: def,
        width: ingW,
        height: ingH,
        startX: startX,
        targetX: targetX
      };

      // GSAP 좌우 왕복 이동 애니메이션
      const duration = this.getSpeedDuration();
      this.movingTween = gsap.to($el, {
        x: targetX,
        duration: duration,
        repeat: -1,
        yoyo: true,
        ease: "none"
      });
    }

    // ------------------------------------------------------------------------
    // 클릭 / 터치 / Space 드롭 동작
    // ------------------------------------------------------------------------
    handleActionDrop() {
      if (this.state !== 'moving' || !this.$currentMovingEl || !this.currentIngredient) {
        return;
      }

      this.state = 'dropping';
      sound.playDrop();

      // 1. 좌우 이동 즉시 정지 및 현재 x 좌표 확정
      if (this.movingTween) {
        this.movingTween.pause();
      }

      const currentX = gsap.getProperty(this.$currentMovingEl[0], "x");
      this.currentIngredient.currentX = currentX;

      // 2. 착지할 목표 높이 계산
      const topStack = this.placedStack[this.placedStack.length - 1];
      const targetTopY = topStack.topY; // 스택 그룹 바닥(0) 기준 높이

      // 화면 좌표계 기준 이동 레이어 Top과 스택 최상단의 상대 거리 계산
      const movingOffset = this.$movingLayer.offset();
      const stageOffset = this.$stage.offset();
      const movingRelTop = movingOffset ? (movingOffset.top - stageOffset.top) : 110;

      let dropDistance;
      if (topStack.$el && topStack.$el.length && topStack.$el.offset() && movingOffset) {
        dropDistance = (topStack.$el.offset().top - movingOffset.top) - this.currentIngredient.height;
      } else {
        const stageH = this.$stage.height() || 560;
        const tableH = 50; // 하단 테이블 여백
        const worldY = this.cameraOffsetY; // 카메라 스크롤 값
        const stackTopStageY = stageH - tableH - 12 - targetTopY + worldY;
        dropDistance = stackTopStageY - movingRelTop - this.currentIngredient.height;
      }

      // 중력 가속도 낙하 애니메이션 (power2.in)
      const dropDuration = Math.max(0.22, Math.min(0.36, dropDistance / 850));

      this.dropTween = gsap.to(this.$currentMovingEl, {
        y: dropDistance,
        duration: dropDuration,
        ease: "power2.in",
        onComplete: () => {
          this.handleLanding(currentX);
        }
      });
    }

    // ------------------------------------------------------------------------
    // 착지 및 정밀 충돌 판정
    // ------------------------------------------------------------------------
    handleLanding(landX) {
      this.state = 'landing';

      const curW = this.currentIngredient.width;
      const curH = this.currentIngredient.height;
      const curCenterX = landX + curW / 2;

      const topStack = this.placedStack[this.placedStack.length - 1];
      const belowCenterX = topStack.centerX;
      const belowW = topStack.width;

      // 1. 가로 겹침 폭(Overlap Width) 계산
      const curLeft = curCenterX - curW / 2;
      const curRight = curCenterX + curW / 2;
      const belowLeft = belowCenterX - belowW / 2;
      const belowRight = belowCenterX + belowW / 2;

      const overlapWidth = Math.max(0, Math.min(curRight, belowRight) - Math.max(curLeft, belowLeft));
      const overlapRatio = (overlapWidth / curW) * 100;

      // 2. 중심 거리 오차 및 판정
      const centerDist = Math.abs(curCenterX - belowCenterX);
      const perfectLimit = belowW * 0.08; // 8% 이내 오차

      let judgment = 'miss';
      let pts = 0;
      let comboBonus = 0;

      if (overlapWidth > 0 && centerDist <= perfectLimit) {
        judgment = 'perfect';
        this.perfectCount++;
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        // 콤보 보너스: min((연속 PERFECT 횟수 - 1) * 20, 100)
        comboBonus = Math.min((this.combo - 1) * 20, 100);
        pts = 100 + comboBonus;
      } else if (overlapRatio >= 80) {
        judgment = 'good';
        this.goodCount++;
        this.combo = 0;
        pts = 70;
      } else if (overlapRatio >= 55) {
        judgment = 'normal';
        this.normalCount++;
        this.combo = 0;
        pts = 40;
      } else {
        judgment = 'miss';
      }

      // 판정별 분기 처리
      if (judgment === 'miss') {
        this.handleGameOver(landX, belowCenterX);
      } else {
        this.handleSuccessLanding(judgment, pts, comboBonus, landX, curCenterX);
      }
    }

    // ------------------------------------------------------------------------
    // 착지 성공 처리
    // ------------------------------------------------------------------------
    handleSuccessLanding(judgment, pts, comboBonus, landX, curCenterX) {
      const topStack = this.placedStack[this.placedStack.length - 1];
      const def = this.currentIngredient.def;
      const curW = this.currentIngredient.width;
      const curH = this.currentIngredient.height;

      // PERFECT일 경우 중앙으로 부드럽게 스냅 보정
      let finalCenterX = curCenterX;
      if (judgment === 'perfect') {
        finalCenterX = topStack.centerX;
      }
      const finalLeftX = finalCenterX - curW / 2;

      // 윗빵 완성 보너스 (+200점)
      let isBurgerComplete = false;
      if (def.isTopBun) {
        pts += 200;
        isBurgerComplete = true;
      }

      this.score += pts;
      this.floor += 1;

      // 스택 그룹에 정식 배치
      const newBottomY = topStack.topY;
      const newTopY = newBottomY + curH;

      const $stackedEl = $(`<div class="burger-ingredient ${def.cssClass}" style="width: ${curW}px; height: ${curH}px; left: ${finalLeftX}px; bottom: ${newBottomY}px;"></div>`);
      this.$stackGroup.append($stackedEl);

      // 이동 레이어 엘리먼트 제거
      if (this.$currentMovingEl) {
        this.$currentMovingEl.remove();
        this.$currentMovingEl = null;
      }

      this.placedStack.push({
        def: def,
        width: curW,
        height: curH,
        centerX: finalCenterX,
        bottomY: newBottomY,
        topY: newTopY,
        $el: $stackedEl
      });

      // 사운드 재생
      if (isBurgerComplete) {
        sound.playBurgerComplete();
      } else if (judgment === 'perfect') {
        sound.playLandPerfect();
        if (this.combo >= 2) sound.playCombo(this.combo);
      } else if (judgment === 'good') {
        sound.playLandGood();
      } else {
        sound.playLandNormal();
      }

      // 착지 말랑 탄성 애니메이션 (GSAP elastic.out)
      gsap.fromTo($stackedEl, 
        { scaleX: 1.15, scaleY: 0.84 },
        { scaleX: 1, scaleY: 1, duration: 0.38, ease: "elastic.out(1.2, 0.45)" }
      );

      // 아래 재료도 살짝 눌리는 연출
      gsap.fromTo(topStack.$el, 
        { scaleX: 1.05, scaleY: 0.94 },
        { scaleX: 1, scaleY: 1, duration: 0.25, ease: "power1.out" }
      );

      // 판정 플로팅 텍스트 표시
      this.showJudgmentPopup(judgment, pts, comboBonus, isBurgerComplete);

      // PERFECT 시 반짝이 파티클 폭발
      if (judgment === 'perfect') {
        this.spawnSparkleParticles(finalCenterX, newTopY);
      }

      // HUD 갱신
      this.updateHud();

      // 카메라 높이 확인 및 화면 이동
      this.adjustCamera(() => {
        // 다음 재료 자동 스폰
        this.state = 'moving';
        this.spawnNextIngredient();
      });
    }

    // ------------------------------------------------------------------------
    // 카메라 자동 스크롤 (탑이 높아지면 월드를 아래로 부드럽게 이동)
    // ------------------------------------------------------------------------
    adjustCamera(callback) {
      const topStack = this.placedStack[this.placedStack.length - 1];
      const totalTowerHeight = topStack.topY; // 누적 높이

      // 스테이지 높이 확대(680px)에 맞춰 360px 도달 시 스크롤 시작
      const triggerThreshold = 360;
      if (totalTowerHeight > triggerThreshold) {
        this.state = 'camera-moving';
        const targetOffset = totalTowerHeight - triggerThreshold;
        this.cameraOffsetY = targetOffset;

        gsap.to(this.$world, {
          y: targetOffset,
          duration: 0.42,
          ease: "power2.out",
          onComplete: () => {
            if (typeof callback === 'function') callback();
          }
        });
      } else {
        if (typeof callback === 'function') {
          setTimeout(callback, 260);
        }
      }
    }

    // ------------------------------------------------------------------------
    // 판정 팝업 문구 & 파티클 연출
    // ------------------------------------------------------------------------
    showJudgmentPopup(judgment, pts, comboBonus, isComplete) {
      const titles = {
        perfect: 'PERFECT!',
        good: 'GOOD!',
        normal: 'OK!'
      };

      const titleTxt = isComplete ? 'BURGER COMPLETE! 🍔' : (titles[judgment] || '');
      let comboHtml = '';
      if (this.combo >= 2) {
        comboHtml = `<div class="judgment-combo-tag">${this.combo} COMBO (+${comboBonus})</div>`;
      }

      const $pop = $(`
        <div class="judgment-popup judgment-${judgment}">
          <div class="judgment-title">${titleTxt}</div>
          <div class="judgment-pts">+${pts}</div>
          ${comboHtml}
        </div>
      `);

      this.$popupLayer.append($pop);

      // 월드 최상단 위치 부근에 표시
      const stageH = this.$stage.height();
      const topStack = this.placedStack[this.placedStack.length - 1];
      const popY = Math.max(80, stageH - 50 - 12 - topStack.topY + this.cameraOffsetY - 50);

      gsap.fromTo($pop,
        { top: popY + 20, opacity: 0, scale: 0.7 },
        {
          top: popY - 30,
          opacity: 1,
          scale: 1.15,
          duration: 0.35,
          ease: "back.out(2)",
          onComplete: () => {
            gsap.to($pop, {
              opacity: 0,
              y: -25,
              scale: 0.9,
              duration: 0.35,
              delay: 0.25,
              onComplete: () => $pop.remove()
            });
          }
        }
      );
    }

    spawnSparkleParticles(x, y) {
      const count = 12;
      const stageH = this.$stage.height();
      const originY = stageH - 50 - 12 - y + this.cameraOffsetY;

      for (let i = 0; i < count; i++) {
        const $dot = $('<div class="sparkle-particle"></div>');
        this.$popupLayer.append($dot);

        const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.4);
        const dist = 35 + Math.random() * 55;
        const targetX = x + Math.cos(angle) * dist;
        const targetY = originY + Math.sin(angle) * dist;

        gsap.set($dot, { left: x, top: originY, scale: Math.random() * 0.8 + 0.6, opacity: 1 });
        gsap.to($dot, {
          left: targetX,
          top: targetY,
          opacity: 0,
          scale: 0.2,
          duration: 0.5 + Math.random() * 0.2,
          ease: "power2.out",
          onComplete: () => $dot.remove()
        });
      }
    }

    // ------------------------------------------------------------------------
    // 게임 오버 연출 및 결과 모달
    // ------------------------------------------------------------------------
    handleGameOver(landX, belowCenterX) {
      this.state = 'gameover';
      sound.playMiss();

      // MISS 팝업
      const $missPop = $(`
        <div class="judgment-popup judgment-miss">
          <div class="judgment-title">MISS!</div>
        </div>
      `);
      this.$popupLayer.append($missPop);
      gsap.fromTo($missPop, { scale: 0.6, opacity: 0, top: '40%' }, { scale: 1.2, opacity: 1, duration: 0.3, ease: "back.out(2)" });

      // 실패한 재료가 빗나간 방향으로 회전하며 추락
      const tiltAngle = (landX + this.currentIngredient.width / 2 > belowCenterX) ? 55 : -55;
      const fallDistance = 600;

      if (this.$currentMovingEl) {
        gsap.to(this.$currentMovingEl, {
          y: `+=${fallDistance}`,
          rotation: tiltAngle,
          duration: 0.65,
          ease: "power2.in",
          onComplete: () => {
            if (this.$currentMovingEl) {
              this.$currentMovingEl.remove();
              this.$currentMovingEl = null;
            }
          }
        });
      }

      // 햄버거 탑 좌우 미세 흔들림
      gsap.to(this.$stackGroup, {
        x: (tiltAngle > 0 ? -8 : 8),
        duration: 0.06,
        repeat: 5,
        yoyo: true,
        onComplete: () => {
          gsap.set(this.$stackGroup, { x: 0 });
        }
      });

      // 1.1초 후 결과 화면 오픈
      setTimeout(() => {
        sound.playGameOver();
        this.showResultModal();
      }, 1100);
    }

    showResultModal() {
      const playDuration = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // 기록 저장
      const res = records.addRecord({
        id: 'rec_' + Date.now(),
        date: dateStr,
        score: this.score,
        floor: this.floor,
        maxCombo: this.maxCombo,
        perfectCount: this.perfectCount,
        goodCount: this.goodCount,
        normalCount: this.normalCount,
        playTimeSec: playDuration
      });

      // 결과 모달 데이터 바인딩
      $('#resFinalScore').text(this.score.toLocaleString() + '점');
      $('#resFinalFloor').text(this.floor + '층');
      $('#resMaxCombo').text(this.maxCombo + ' COMBO');
      $('#resPerfectCount').text(this.perfectCount + '회');
      $('#resGoodCount').text(this.goodCount + '회');
      $('#resNormalCount').text(this.normalCount + '회');
      $('#resBestScore').text(records.data.bestScore.toLocaleString() + '점');
      $('#resBestFloor').text(records.data.bestFloor + '층');

      if (res.isNewBestScore || res.isNewBestFloor) {
        $('#resNewRecordBadge').removeClass('hidden');
      } else {
        $('#resNewRecordBadge').addClass('hidden');
      }

      this.$resultModal.removeClass('hidden');
      this.updateHud();
    }

    closeResultModal() {
      this.$resultModal.addClass('hidden');
    }

    // ------------------------------------------------------------------------
    // 일시정지 & 재개
    // ------------------------------------------------------------------------
    togglePause() {
      if (this.state === 'gameover' || this.state === 'countdown' || this.state === 'ready') return;
      if (this.state === 'paused') {
        this.resumeGame();
      } else {
        this.pauseGame();
      }
    }

    pauseGame() {
      if (this.state !== 'moving' && this.state !== 'dropping' && this.state !== 'landing') return;
      this.prevState = this.state;
      this.state = 'paused';

      if (this.movingTween) this.movingTween.pause();
      if (this.dropTween) this.dropTween.pause();

      this.$pauseOverlay.removeClass('hidden');
    }

    resumeGame() {
      if (this.state !== 'paused') return;
      this.$pauseOverlay.addClass('hidden');

      if (this.movingTween && this.prevState === 'moving') {
        this.movingTween.resume();
      }
      if (this.dropTween && this.prevState === 'dropping') {
        this.dropTween.resume();
      }

      this.state = this.prevState || 'moving';
    }

    confirmRestart() {
      if (confirm('게임을 다시 시작하시겠습니까? 현재 진행 상황은 초기화됩니다.')) {
        this.startCountdown();
      }
    }

    // ------------------------------------------------------------------------
    // 기록실 모달
    // ------------------------------------------------------------------------
    openHistoryModal() {
      this.renderHistoryTable();
      this.$historyModal.removeClass('hidden');
    }

    closeHistoryModal() {
      this.$historyModal.addClass('hidden');
    }

    renderHistoryTable() {
      $('#histBestScore').text(records.data.bestScore.toLocaleString() + '점');
      $('#histBestFloor').text(records.data.bestFloor + '층');
      $('#histTotalPlays').text(records.data.totalPlays + '회');
      $('#histTotalIngredients').text(records.data.totalIngredients + '개');

      const $tbody = $('#historyTableBody');
      $tbody.empty();

      if (!records.data.recentRecords || records.data.recentRecords.length === 0) {
        $('#historyEmptyMessage').removeClass('hidden');
        $('#historyTableWrapper').addClass('hidden');
      } else {
        $('#historyEmptyMessage').addClass('hidden');
        $('#historyTableWrapper').removeClass('hidden');

        records.data.recentRecords.forEach((rec, idx) => {
          const $tr = $(`
            <tr>
              <td>${idx + 1}</td>
              <td>${rec.date}</td>
              <td class="font-bold text-primary">${rec.score.toLocaleString()}</td>
              <td class="font-bold text-success">${rec.floor}층</td>
              <td>${rec.maxCombo}</td>
              <td>${rec.perfectCount} / ${rec.goodCount} / ${rec.normalCount}</td>
            </tr>
          `);
          $tbody.append($tr);
        });
      }
    }

    // ------------------------------------------------------------------------
    // UI HUD 갱신 & 리사이즈
    // ------------------------------------------------------------------------
    updateHud() {
      this.$curScore.text(this.score.toLocaleString());
      this.$curFloor.text(this.floor);
      this.$curCombo.text(this.combo);
      this.$bestRecord.text(`${records.data.bestFloor}층 (${records.data.bestScore.toLocaleString()})`);

      if (this.combo >= 2) {
        this.$hudComboCard.addClass('combo-active');
      } else {
        this.$hudComboCard.removeClass('combo-active');
      }
    }

    handleResize() {
      // 화면 크기 변경 시 아랫빵 및 현재 배치된 아이템의 중앙점 재조정
      if (this.placedStack.length > 0) {
        const stageW = this.$stage.width();
        const baseCenter = stageW / 2;
        const bottomBun = this.placedStack[0];
        const shiftX = baseCenter - bottomBun.centerX;

        if (Math.abs(shiftX) > 1) {
          this.placedStack.forEach(item => {
            item.centerX += shiftX;
            item.$el.css('left', `${item.centerX - item.width / 2}px`);
          });
        }
      }
    }
  }

  // DOM Ready 후 게임 인스턴스 초기화
  $(document).ready(function () {
    window.BurgerStackGame = new BurgerGame();
  });

})(jQuery);
