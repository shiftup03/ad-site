/**
 * 1분 챌린지 - 공통 컴포넌트 로더, 다크모드 토글 스위치 및 유틸리티
 */

(function ($) {
  'use strict';

  // 현재 페이지가 subpage(page/ 폴더 내부)인지 확인
  const isSubpage = $('body').data('is-subpage') === true ||
                    window.location.pathname.indexOf('/page/') !== -1 ||
                    window.location.pathname.indexOf('\\page\\') !== -1;

  const basePath = isSubpage ? '../' : './';
  const pagePath = isSubpage ? './' : 'page/';

  // 테마 관리 (Light / Dark Mode with LocalStorage)
  const THEME_KEY = 'challenge_1min_theme';

  function applyTheme(theme) {
    const isDark = (theme === 'dark');
    if (isDark) {
      $('html').attr('data-theme', 'dark');
      $('body').attr('data-theme', 'dark');
    } else {
      $('html').removeAttr('data-theme');
      $('body').removeAttr('data-theme');
    }

    // 토글 스위치 체크박스 상태 동기화
    $('#themeToggleSwitch').prop('checked', isDark);
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(savedTheme);
  }

  function handleThemeToggle(isChecked) {
    const nextTheme = isChecked ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);

    // 사운드 효과
    if (window.SoundFX && typeof window.SoundFX.keyClick === 'function') {
      window.SoundFX.keyClick();
    }
  }

  // 헤더/푸터 템플릿 인라인 백업 (file:// 로컬 프로토콜 실행 시 CORS 차단 방지용 Fallback)
  // 카테고리 맵핑 (활성화 상태 및 모바일 아코디언 관리용)
  const PAGE_CATEGORY_MAP = {
    'home': null,
    'color-match': 'game',
    'speed-math': 'game',
    'reaction-speed': 'game',
    'love-test': 'test',
    'emotion-ratio': 'test',
    'typing-practice': 'tool',
    'business-card': 'tool',
    'resume-builder': 'tool',
    'habit-challenge': 'tool',
    'life-time-calc': 'tool'
  };

  // 헤더/푸터 템플릿 인라인 백업 (file:// 로컬 프로토콜 실행 시 CORS 차단 방지용 Fallback)
  const FALLBACK_HEADER = `
  <header class="site-header">
    <div class="header-container">
      <a href="${isSubpage ? '../index.html' : 'index.html'}" class="brand-logo" title="1분 챌린지 홈으로 이동">
        <div class="logo-badge">⚡</div>
        <span class="logo-text">1-Min Challenge</span>
        <span class="logo-sub">BETA</span>
      </a>

      <nav class="nav-menu" id="mainNavMenu" aria-label="메인 네비게이션">
        <ul class="nav-links" id="mainNavLinks">
          <li class="nav-item">
            <a href="${isSubpage ? '../index.html' : 'index.html'}" class="nav-link" data-page="home">
              <span class="menu-icon">🏠</span>
              <span class="menu-text">홈</span>
            </a>
          </li>

          <li class="nav-item nav-dropdown" data-category="game">
            <button type="button" class="nav-link dropdown-toggle" aria-expanded="false" aria-haspopup="true">
              <span class="menu-icon">🎮</span>
              <span class="menu-text">게임</span>
              <span class="dropdown-chevron" aria-hidden="true">▾</span>
            </button>
            <ul class="dropdown-menu" role="menu">
              <li role="none">
                <a href="${pagePath}color-match.html" class="dropdown-link" data-page="color-match" role="menuitem">
                  <span class="dropdown-icon">🎨</span>
                  <span class="dropdown-text">1분 카드 매칭</span>
                </a>
              </li>
              <li role="none">
                <a href="${pagePath}speed-math.html" class="dropdown-link" data-page="speed-math" role="menuitem">
                  <span class="dropdown-icon">🔢</span>
                  <span class="dropdown-text">1분 스피드 암산</span>
                </a>
              </li>
              <li role="none">
                <a href="${pagePath}reaction-speed.html" class="dropdown-link" data-page="reaction-speed" role="menuitem">
                  <span class="dropdown-icon">⚡</span>
                  <span class="dropdown-text">1분 반응 속도</span>
                </a>
              </li>
            </ul>
          </li>

          <li class="nav-item nav-dropdown" data-category="test">
            <button type="button" class="nav-link dropdown-toggle" aria-expanded="false" aria-haspopup="true">
              <span class="menu-icon">🧪</span>
              <span class="menu-text">테스트</span>
              <span class="dropdown-chevron" aria-hidden="true">▾</span>
            </button>
            <ul class="dropdown-menu" role="menu">
              <li role="none">
                <a href="${pagePath}love-test.html" class="dropdown-link" data-page="love-test" role="menuitem">
                  <span class="dropdown-icon">💖</span>
                  <span class="dropdown-text">연애 성향 테스트</span>
                </a>
              </li>
              <li role="none">
                <a href="${pagePath}emotion-ratio.html" class="dropdown-link" data-page="emotion-ratio" role="menuitem">
                  <span class="dropdown-icon">🧠</span>
                  <span class="dropdown-text">감정 비율 테스트</span>
                </a>
              </li>
            </ul>
          </li>

          <li class="nav-item nav-dropdown" data-category="tool">
            <button type="button" class="nav-link dropdown-toggle" aria-expanded="false" aria-haspopup="true">
              <span class="menu-icon">🛠️</span>
              <span class="menu-text">도구</span>
              <span class="dropdown-chevron" aria-hidden="true">▾</span>
            </button>
            <ul class="dropdown-menu" role="menu">
              <li role="none">
                <a href="${pagePath}typing-practice.html" class="dropdown-link" data-page="typing-practice" role="menuitem">
                  <span class="dropdown-icon">⌨️</span>
                  <span class="dropdown-text">온라인 타자 연습</span>
                </a>
              </li>
              <li role="none">
                <a href="${pagePath}business-card.html" class="dropdown-link" data-page="business-card" role="menuitem">
                  <span class="dropdown-icon">🪪</span>
                  <span class="dropdown-text">명함 만들기</span>
                </a>
              </li>
              <li role="none">
                <a href="${pagePath}resume-builder.html" class="dropdown-link" data-page="resume-builder" role="menuitem">
                  <span class="dropdown-icon">📄</span>
                  <span class="dropdown-text">이력서 및 자기소개서</span>
                </a>
              </li>
              <li role="none">
                <a href="${pagePath}habit-challenge.html" class="dropdown-link" data-page="habit-challenge" role="menuitem">
                  <span class="dropdown-icon">✅</span>
                  <span class="dropdown-text">습관 챌린지</span>
                </a>
              </li>
              <li role="none">
                <a href="${pagePath}life-time-calc.html" class="dropdown-link" data-page="life-time-calc" role="menuitem">
                  <span class="dropdown-icon">⏳</span>
                  <span class="dropdown-text">살아온 시간 계산기</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <div class="header-actions">
        <!-- 다크모드 슬라이딩 토글 스위치 -->
        <div class="theme-switch-container">
          <label class="theme-switch" for="themeToggleSwitch" title="다크 / 라이트 모드 전환">
            <input type="checkbox" id="themeToggleSwitch" aria-label="다크 모드 토글 스위치">
            <span class="theme-slider">
              <span class="icon-sun">☀️</span>
              <span class="icon-moon">🌙</span>
            </span>
          </label>
        </div>

        <button class="mobile-nav-toggle" id="mobileNavBtn" aria-label="메뉴 토글" aria-expanded="false">
          ☰
        </button>
      </div>
    </div>
  </header>`;

  const FALLBACK_FOOTER = `
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-brand">
          <h4>⚡ 1-Minute Challenge</h4>
          <p>하루 딱 1분, 순간 집중력과 뇌 피지컬을 깨우는 미니 챌린지 플랫폼</p>
        </div>
        <ul class="footer-links">
          <li><a href="${isSubpage ? '../index.html' : 'index.html'}">홈</a></li>
          <li><a href="${pagePath}color-match.html">카드 매칭</a></li>
          <li><a href="${pagePath}speed-math.html">스피드 암산</a></li>
          <li><a href="${pagePath}love-test.html">연애 성향 테스트</a></li>
          <li><a href="${pagePath}typing-practice.html">타자 연습</a></li>
          <li><a href="${pagePath}reaction-speed.html">반응속도</a></li>
          <li><a href="${pagePath}business-card.html">명함 만들기</a></li>
          <li><a href="${pagePath}resume-builder.html">이력서·자소서</a></li>
          <li><a href="${pagePath}habit-challenge.html">습관 챌린지</a></li>
          <li><a href="${pagePath}life-time-calc.html">살아온 시간 계산기</a></li>
          <li><a href="${pagePath}emotion-ratio.html">감정 비율 테스트</a></li>
          <li><a href="javascript:void(0)" onclick="alert('명예의 전당 랭킹 시스템은 곧 업데이트됩니다!')">명예의 전당</a></li>
        </ul>
      </div>
      <div class="footer-bottom">
        <p>© 2026 1-Minute Challenge Lab. All rights reserved.</p>
        <p>Built with HTML5, CSS3, JavaScript &amp; jQuery</p>
      </div>
    </div>
  </footer>`;

  // 링크 주소 보정 함수 (외부 html 파일 로드 시 경로를 현재 위치에 맞춤)
  function fixComponentLinks($container) {
    $container.find('a').each(function () {
      const $a = $(this);
      const href = $a.attr('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      if (href === 'index.html' || href === '../index.html') {
        $a.attr('href', isSubpage ? '../index.html' : 'index.html');
      } else if (href.indexOf('color-match.html') !== -1) {
        $a.attr('href', isSubpage ? 'color-match.html' : 'page/color-match.html');
      } else if (href.indexOf('speed-math.html') !== -1) {
        $a.attr('href', isSubpage ? 'speed-math.html' : 'page/speed-math.html');
      } else if (href.indexOf('love-test.html') !== -1) {
        $a.attr('href', isSubpage ? 'love-test.html' : 'page/love-test.html');
      } else if (href.indexOf('typing-practice.html') !== -1) {
        $a.attr('href', isSubpage ? 'typing-practice.html' : 'page/typing-practice.html');
      } else if (href.indexOf('reaction-speed.html') !== -1) {
        $a.attr('href', isSubpage ? 'reaction-speed.html' : 'page/reaction-speed.html');
      } else if (href.indexOf('business-card.html') !== -1) {
        $a.attr('href', isSubpage ? 'business-card.html' : 'page/business-card.html');
      } else if (href.indexOf('resume-builder.html') !== -1) {
        $a.attr('href', isSubpage ? 'resume-builder.html' : 'page/resume-builder.html');
      } else if (href.indexOf('habit-challenge.html') !== -1) {
        $a.attr('href', isSubpage ? 'habit-challenge.html' : 'page/habit-challenge.html');
      } else if (href.indexOf('life-time-calc.html') !== -1) {
        $a.attr('href', isSubpage ? 'life-time-calc.html' : 'page/life-time-calc.html');
      } else if (href.indexOf('emotion-ratio.html') !== -1) {
        $a.attr('href', isSubpage ? 'emotion-ratio.html' : 'page/emotion-ratio.html');
      }
    });
  }

  // 컴포넌트 로드 함수
  function loadComponent(targetSelector, filePath, fallbackHtml, callback) {
    const $target = $(targetSelector);
    if (!$target.length) return;

    if (window.location.protocol === 'file:') {
      $target.html(fallbackHtml);
      fixComponentLinks($target);
      if (typeof callback === 'function') callback();
    } else {
      $.ajax({
        url: filePath,
        method: 'GET',
        dataType: 'html',
        success: function (data) {
          $target.html(data);
          fixComponentLinks($target);
          if (typeof callback === 'function') callback();
        },
        error: function () {
          $target.html(fallbackHtml);
          fixComponentLinks($target);
          if (typeof callback === 'function') callback();
        }
      });
    }
  }

  // 현재 페이지 네비게이션 하이라이트 (상위 카테고리 & 하위 메뉴 동시 활성화)
  function highlightCurrentNav() {
    const currentPage = $('body').data('current-page');
    if (!currentPage) return;

    // 전체 활성화 상태 초기화
    $('.nav-link, .dropdown-toggle, .dropdown-link').removeClass('active').removeAttr('aria-current');
    $('.nav-dropdown').removeClass('is-open');

    if (currentPage === 'home') {
      $('.nav-link[data-page="home"]').addClass('active').attr('aria-current', 'page');
    } else {
      // 하위 개별 메뉴 링크 활성화
      const $childLink = $(`.dropdown-link[data-page="${currentPage}"]`);
      if ($childLink.length) {
        $childLink.addClass('active').attr('aria-current', 'page');
      }

      // 상위 카테고리 메뉴 활성화
      const parentCat = PAGE_CATEGORY_MAP[currentPage];
      if (parentCat) {
        const $catDropdown = $(`.nav-dropdown[data-category="${parentCat}"]`);
        $catDropdown.children('.dropdown-toggle').addClass('active');
        // 모바일 접속 시 현재 카테고리 아코디언 기본 오픈
        $catDropdown.addClass('accordion-open');
        $catDropdown.children('.dropdown-toggle').attr('aria-expanded', 'true');
      }
    }
  }

  function isMobileNavView() {
    return window.innerWidth <= 860;
  }

  function closeAllDropdowns() {
    $('.nav-dropdown').removeClass('is-open');
    if (!isMobileNavView()) {
      $('.dropdown-toggle').attr('aria-expanded', 'false');
    }
  }

  // 모바일 메뉴 및 드롭다운 / 아코디언 이벤트 바인딩
  function initHeaderEvents() {
    // 1. 모바일 햄버거 토글 버튼
    $(document).on('click', '#mobileNavBtn', function (e) {
      e.stopPropagation();
      const $menu = $('#mainNavMenu');
      const isCurrentlyOpen = $menu.hasClass('open');
      $menu.toggleClass('open', !isCurrentlyOpen);
      $(this).attr('aria-expanded', !isCurrentlyOpen ? 'true' : 'false');
    });

    // 2. 상위 드롭다운 토글 클릭 (PC 클릭 토글 & 모바일 아코디언)
    $(document).on('click', '.dropdown-toggle', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const $toggle = $(this);
      const $parentDropdown = $toggle.closest('.nav-dropdown');

      if (isMobileNavView()) {
        // 모바일: 아코디언 토글 (선택된 카테고리 외 다른 카테고리 자동 닫기 지원)
        const isAccordionOpen = $parentDropdown.hasClass('accordion-open');
        $('.nav-dropdown').not($parentDropdown).removeClass('accordion-open').children('.dropdown-toggle').attr('aria-expanded', 'false');
        $parentDropdown.toggleClass('accordion-open', !isAccordionOpen);
        $toggle.attr('aria-expanded', !isAccordionOpen ? 'true' : 'false');
      } else {
        // PC: 클릭 시 토글
        const isOpen = $parentDropdown.hasClass('is-open');
        closeAllDropdowns();
        if (!isOpen) {
          $parentDropdown.addClass('is-open');
          $toggle.attr('aria-expanded', 'true');
        }
      }
    });

    // 3. PC 마우스 Hover 이벤트
    $(document).on('mouseenter', '.nav-dropdown', function () {
      if (!isMobileNavView()) {
        const $dropdown = $(this);
        $dropdown.addClass('is-open');
        $dropdown.children('.dropdown-toggle').attr('aria-expanded', 'true');
      }
    });

    $(document).on('mouseleave', '.nav-dropdown', function () {
      if (!isMobileNavView()) {
        const $dropdown = $(this);
        $dropdown.removeClass('is-open');
        $dropdown.children('.dropdown-toggle').attr('aria-expanded', 'false');
      }
    });

    // 4. 메뉴 외부 클릭 시 닫기
    $(document).on('click', function (e) {
      if (!$(e.target).closest('.nav-dropdown').length) {
        closeAllDropdowns();
      }
      if (!$(e.target).closest('#mainNavMenu, #mobileNavBtn').length) {
        $('#mainNavMenu').removeClass('open');
        $('#mobileNavBtn').attr('aria-expanded', 'false');
      }
    });

    // 5. Escape(ESC) 키 입력 시 모든 열린 메뉴 닫기
    $(document).on('keydown', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        closeAllDropdowns();
        $('#mainNavMenu').removeClass('open');
        $('#mobileNavBtn').attr('aria-expanded', 'false');
      }
    });

    // 6. 하위 링크 클릭 시 모바일 메뉴 자동 닫기
    $(document).on('click', '.dropdown-link, .nav-link', function () {
      if (isMobileNavView() && !$(this).hasClass('dropdown-toggle')) {
        $('#mainNavMenu').removeClass('open');
        $('#mobileNavBtn').attr('aria-expanded', 'false');
      }
    });

    // 7. 다크모드 토글 스위치 변경 이벤트 (체크박스 change)
    $(document).on('change', '#themeToggleSwitch', function () {
      const isChecked = $(this).is(':checked');
      handleThemeToggle(isChecked);
    });

    // 8. 드롭다운 메뉴 내부 클릭 시 부모 이벤트 버블링 차단 (링크 제외)
    $(document).on('click', '.dropdown-menu', function (e) {
      if (!$(e.target).closest('a').length) {
        e.stopPropagation();
      }
    });

    // 9. 비활성화 링크 안내
    $(document).on('click', '.disabled-link', function (e) {
      e.preventDefault();
      alert('🚀 다음 챌린지 서비스로 준비 중입니다! 기대해주세요.');
    });
  }

  // 사운드 효과 유틸리티 (Web Audio API 기반)
  window.SoundFX = {
    ctx: null,
    init: function () {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
    },
    playTone: function (freq, type, duration, delay = 0) {
      try {
        this.init();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const now = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {
        // silent fail
      }
    },
    cardFlip: function () {
      this.playTone(480, 'sine', 0.08);
    },
    keyClick: function () {
      this.playTone(600, 'sine', 0.04);
    },
    correctAnswer: function () {
      this.playTone(523.25, 'triangle', 0.1, 0);
      this.playTone(659.25, 'triangle', 0.1, 0.07);
      this.playTone(783.99, 'triangle', 0.15, 0.14);
    },
    wrongAnswer: function () {
      this.playTone(240, 'sawtooth', 0.15, 0);
      this.playTone(190, 'sawtooth', 0.2, 0.08);
    },
    matchSuccess: function () {
      this.correctAnswer();
    },
    matchFail: function () {
      this.wrongAnswer();
    },
    combo: function (multiplier) {
      const base = 420 + (multiplier * 50);
      this.playTone(base, 'triangle', 0.12, 0);
      this.playTone(base * 1.25, 'triangle', 0.15, 0.07);
    },
    countdownTick: function () {
      this.playTone(750, 'sine', 0.05);
    },
    gameOver: function () {
      this.playTone(440, 'triangle', 0.15, 0);
      this.playTone(370, 'triangle', 0.15, 0.15);
      this.playTone(311, 'triangle', 0.35, 0.3);
    }
  };

  // ==========================================================================
  // 공통 결과 이미지 저장 헬퍼 (HTML5 Canvas 1080x1350 PNG)
  // ==========================================================================
  window.downloadGameResultImage = function (options) {
    const {
      title = '1분 챌린지 결과',
      category = 'GAME CHALLENGE',
      rankBadge = '👑',
      grade = '[ Rank S ]',
      gradeDesc = '탁월한 집중력과 순발력의 달인!',
      stats = [],
      filename = '1분챌린지_결과'
    } = options;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d');

      // 1) 배경 그라데이션 (프리미엄 딥 다크/인디고)
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
      bgGrad.addColorStop(0, '#0b0f19');
      bgGrad.addColorStop(0.5, '#1e1b4b');
      bgGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1350);

      // 2) 장식용 배경 원형 글로우
      const glow1 = ctx.createRadialGradient(250, 220, 10, 250, 220, 380);
      glow1.addColorStop(0, 'rgba(236, 72, 153, 0.22)');
      glow1.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = glow1;
      ctx.beginPath();
      ctx.arc(250, 220, 380, 0, Math.PI * 2);
      ctx.fill();

      const glow2 = ctx.createRadialGradient(850, 800, 10, 850, 800, 420);
      glow2.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
      glow2.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = glow2;
      ctx.beginPath();
      ctx.arc(850, 800, 420, 0, Math.PI * 2);
      ctx.fill();

      // 헬퍼: 둥근 사각형
      function drawRoundRect(x, y, w, h, r, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
      }

      // 3) 외곽 프레임
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      drawRoundRect(50, 50, 980, 1250, 32, false, true);

      // 4) 상단 브랜딩 뱃지
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 1.5;
      drawRoundRect(320, 95, 440, 46, 23, true, true);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`⚡ 1-MIN CHALLENGE · ${category}`, 540, 126);

      // 5) 게임 타이틀
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 52px sans-serif';
      ctx.fillText(title, 540, 205);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 24px sans-serif';
      ctx.fillText('하루 딱 1분, 순간 집중력과 뇌 피지컬 측정 결과', 540, 250);

      // 6) 메인 랭크 카드 (중앙 하이라이트)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 1.5;
      drawRoundRect(100, 290, 880, 310, 24, true, true);

      // 랭크 아이콘
      ctx.font = '76px sans-serif';
      ctx.fillText(rankBadge, 540, 395);

      // 랭크 헤드라인
      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 44px sans-serif';
      ctx.fillText(grade, 540, 470);

      // 랭크 설명
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 25px sans-serif';
      ctx.fillText(gradeDesc, 540, 525);

      // 7) 4대 통계 지표 박스 (2x2 그리드)
      const gridY = 640;
      const boxW = 420;
      const boxH = 160;

      stats.slice(0, 4).forEach((st, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const bx = 100 + (col * 460);
        const by = gridY + (row * 190);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        drawRoundRect(bx, by, boxW, boxH, 20, true, true);

        // 상단 액센트 바
        ctx.fillStyle = st.color || '#6366f1';
        drawRoundRect(bx + 20, by + 18, 40, 4, 2, true, false);

        // 라벨
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 22px sans-serif';
        ctx.fillText(st.label, bx + 24, by + 60);

        // 값
        ctx.fillStyle = st.color || '#ffffff';
        ctx.font = '800 42px sans-serif';
        ctx.fillText(st.value, bx + 24, by + 120);
      });

      // 8) 하단 푸터 영역
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100, 1160);
      ctx.lineTo(980, 1160);
      ctx.stroke();

      const now = new Date();
      const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.font = '500 20px sans-serif';
      ctx.fillText(`측정 일시: ${dateStr}`, 100, 1210);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('⚡ 1-Minute Challenge Platform', 980, 1210);

      // 9) PNG 다운로드 트리거
      const link = document.createElement('a');
      link.download = `${filename}_${now.toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Image download error:', err);
      alert('결과 이미지 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // DOM 로드 즉시 테마 초기 적용 (화면 깜빡임 방지)
  initTheme();

  // 초기화 실행
  $(document).ready(function () {
    const headerPath = basePath + 'components/header.html';
    const footerPath = basePath + 'components/footer.html';

    loadComponent('#header-placeholder', headerPath, FALLBACK_HEADER, function () {
      highlightCurrentNav();
      // 헤더 컴포넌트 마운트 후 토글 스위치 상태 동기화
      const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
      applyTheme(savedTheme);
    });

    loadComponent('#footer-placeholder', footerPath, FALLBACK_FOOTER);

    initHeaderEvents();

    $(document).one('click keydown', function () {
      SoundFX.init();
      if (SoundFX.ctx && SoundFX.ctx.state === 'suspended') {
        SoundFX.ctx.resume();
      }
    });
  });

})(jQuery);
