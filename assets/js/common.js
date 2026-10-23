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
  const FALLBACK_HEADER = `
  <header class="site-header">
    <div class="header-container">
      <a href="${isSubpage ? '../index.html' : 'index.html'}" class="brand-logo" title="1분 챌린지 홈으로 이동">
        <div class="logo-badge">⚡</div>
        <span class="logo-text">1-Min Challenge</span>
        <span class="logo-sub">BETA</span>
      </a>
      <button class="mobile-nav-toggle" id="mobileNavBtn" aria-label="메뉴 토글">☰</button>
      <nav class="nav-menu">
        <ul class="nav-links" id="mainNavLinks">
          <li>
            <a href="${isSubpage ? '../index.html' : 'index.html'}" class="nav-link" data-page="home">
              <span>🏠</span> 홈
            </a>
          </li>
          <li>
            <a href="${pagePath}color-match.html" class="nav-link" data-page="color-match">
              <span>🎨</span> 1분 카드 매칭
            </a>
          </li>
          <li>
            <a href="${pagePath}speed-math.html" class="nav-link" data-page="speed-math">
              <span>🔢</span> 1분 스피드 암산
            </a>
          </li>
          <li>
            <a href="#" class="nav-link disabled-link" title="곧 오픈 예정!">
              <span>⚡</span> 1분 반응속도
              <span class="badge badge-warning">준비중</span>
            </a>
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
        <a href="${pagePath}speed-math.html" class="btn btn-primary btn-sm">
          <span>🔥 암산왕 도전</span>
        </a>
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

      if (href === 'index.html') {
        $a.attr('href', isSubpage ? '../index.html' : 'index.html');
      } else if (href === 'color-match.html') {
        $a.attr('href', isSubpage ? 'color-match.html' : 'page/color-match.html');
      } else if (href === 'speed-math.html') {
        $a.attr('href', isSubpage ? 'speed-math.html' : 'page/speed-math.html');
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

  // 현재 페이지 네비게이션 하이라이트
  function highlightCurrentNav() {
    const currentPage = $('body').data('current-page');
    if (!currentPage) return;

    $('.nav-link').removeClass('active');
    $(`.nav-link[data-page="${currentPage}"]`).addClass('active');
  }

  // 모바일 메뉴 및 테마 토글 이벤트 바인딩
  function initHeaderEvents() {
    $(document).on('click', '#mobileNavBtn', function (e) {
      e.stopPropagation();
      $('#mainNavLinks').toggleClass('open');
    });

    $(document).on('click', function () {
      $('#mainNavLinks').removeClass('open');
    });

    $('#mainNavLinks').on('click', function (e) {
      e.stopPropagation();
    });

    // 다크모드 토글 스위치 변경 이벤트 (체크박스 change)
    $(document).on('change', '#themeToggleSwitch', function () {
      const isChecked = $(this).is(':checked');
      handleThemeToggle(isChecked);
    });

    // 비활성화 링크 안내
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
