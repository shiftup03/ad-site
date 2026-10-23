/**
 * ========================================================
 * 무료 온라인 명함 만들기 (Business Card Maker) 핵심 에디터 스크립트
 * HTML5 Canvas, Vanilla JS, jQuery 3.7.1, QRCode.js
 * ========================================================
 */

(function ($) {
  'use strict';

  // 1. 상수 및 기본 규격 정의 (300 DPI 기준 픽셀)
  // 90 × 50 mm: 90 / 25.4 * 300 = 1062.99 -> 1063 × 591 px
  // 85 × 55 mm: 85 / 25.4 * 300 = 1003.93 -> 1004 × 650 px
  // 3mm 도련(Bleed): 3 / 25.4 * 300 = ~35.4 px (양쪽 71px)
  const SPECS = {
    '90x50': {
      widthMm: 90,
      heightMm: 50,
      pxWidth: 1063,
      pxHeight: 591,
      bleedPx: 35
    },
    '85x55': {
      widthMm: 85,
      heightMm: 55,
      pxWidth: 1004,
      pxHeight: 650,
      bleedPx: 35
    }
  };

  const STORAGE_KEYS = {
    AUTOSAVE: 'challenge_1min_card_autosave',
    PROJECTS: 'challenge_1min_card_projects'
  };

  // 2. 전역 상태 (Card Editor State)
  const state = {
    specKey: '90x50',
    orientation: 'landscape', // 'landscape' | 'portrait'
    bleed: false,
    showGuides: true,
    currentSide: 'front', // 'front' | 'back'
    currentTemplate: 't1',
    selectedElementId: null,
    zoom: 1.0,
    panX: 0,
    panY: 0,

    // 명함 기본 정보 (사용자 입력 필드)
    info: {
      name: '김민수',
      nameEn: 'MINSU KIM',
      title: '수석 디자이너',
      company: '넥스트 크리에이티브',
      dept: '디자인 혁신팀',
      phone: '010-1234-5678',
      tel: '02-555-0199',
      email: 'minsu.kim@creative.kr',
      website: 'www.creative-studio.kr',
      address: '서울특별시 강남구 테헤란로 152 7층',
      sns: '@minsu_design',
      tagline: 'Design that creates meaningful moments'
    },

    // 앞면 데이터
    front: {
      background: {
        type: 'solid', // 'solid' | 'gradient' | 'image'
        color: '#ffffff',
        gradient: { color1: '#0f172a', color2: '#312e81', angle: 135 },
        imageSrc: null
      },
      elements: []
    },

    // 뒷면 데이터
    back: {
      background: {
        type: 'solid',
        color: '#ffffff',
        gradient: { color1: '#0f172a', color2: '#312e81', angle: 135 },
        imageSrc: null
      },
      elements: []
    },

    // 실행 취소 / 다시 실행 히스토리
    history: [],
    historyIndex: -1,
    isHistoryBusy: false
  };

  // 3. 템플릿 생성기 (8종 고유 디자인: 앞면 & 뒷면)
  const Templates = {
    // T1: 미니멀 화이트 (Minimal White)
    t1: function (info, spec) {
      const isPortrait = state.orientation === 'portrait';
      const w = spec.pxWidth;
      const h = spec.pxHeight;

      return {
        front: {
          background: { type: 'solid', color: '#ffffff' },
          elements: [
            {
              id: 'el_company',
              type: 'text',
              fieldKey: 'company',
              text: info.company,
              x: 80, y: 90, width: 400, height: 30,
              fontSize: 20, fontFamily: 'Pretendard, sans-serif', fontWeight: '700',
              color: '#64748b', textAlign: 'left', rotation: 0, zIndex: 1
            },
            {
              id: 'el_name',
              type: 'text',
              fieldKey: 'name',
              text: info.name,
              x: 80, y: 175, width: 350, height: 60,
              fontSize: 50, fontFamily: 'Pretendard, sans-serif', fontWeight: '900',
              color: '#0f172a', textAlign: 'left', rotation: 0, zIndex: 2
            },
            {
              id: 'el_title',
              type: 'text',
              fieldKey: 'title',
              text: `${info.title}  |  ${info.dept}`,
              x: 80, y: 245, width: 450, height: 35,
              fontSize: 22, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#475569', textAlign: 'left', rotation: 0, zIndex: 3
            },
            {
              id: 'el_divider',
              type: 'shape',
              shapeType: 'line',
              x: 80, y: 300, width: 280, height: 2,
              fillColor: '#4f46e5', strokeColor: '#4f46e5', strokeWidth: 2,
              rotation: 0, zIndex: 4
            },
            {
              id: 'el_phone',
              type: 'text',
              fieldKey: 'phone',
              text: `M. ${info.phone}`,
              x: 80, y: 335, width: 320, height: 25,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#334155', textAlign: 'left', rotation: 0, zIndex: 5
            },
            {
              id: 'el_email',
              type: 'text',
              fieldKey: 'email',
              text: `E. ${info.email}`,
              x: 80, y: 375, width: 350, height: 25,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#334155', textAlign: 'left', rotation: 0, zIndex: 6
            },
            {
              id: 'el_website',
              type: 'text',
              fieldKey: 'website',
              text: `W. ${info.website}`,
              x: 80, y: 415, width: 350, height: 25,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#334155', textAlign: 'left', rotation: 0, zIndex: 7
            },
            {
              id: 'el_address',
              type: 'text',
              fieldKey: 'address',
              text: info.address,
              x: 80, y: 455, width: 500, height: 25,
              fontSize: 16, fontFamily: 'Pretendard, sans-serif', fontWeight: '400',
              color: '#64748b', textAlign: 'left', rotation: 0, zIndex: 8
            }
          ]
        },
        back: {
          background: { type: 'solid', color: '#ffffff' },
          elements: [
            {
              id: 'el_b_company',
              type: 'text',
              fieldKey: 'company',
              text: info.company,
              x: 80, y: 210, width: 500, height: 50,
              fontSize: 42, fontFamily: 'Pretendard, sans-serif', fontWeight: '900',
              color: '#0f172a', textAlign: 'left', rotation: 0, zIndex: 1
            },
            {
              id: 'el_b_tagline',
              type: 'text',
              fieldKey: 'tagline',
              text: info.tagline,
              x: 80, y: 275, width: 550, height: 35,
              fontSize: 20, fontFamily: 'Pretendard, sans-serif', fontWeight: '400',
              color: '#64748b', textAlign: 'left', rotation: 0, zIndex: 2
            },
            {
              id: 'el_b_web',
              type: 'text',
              fieldKey: 'website',
              text: info.website,
              x: 80, y: 330, width: 450, height: 30,
              fontSize: 20, fontFamily: 'Pretendard, sans-serif', fontWeight: '600',
              color: '#4f46e5', textAlign: 'left', rotation: 0, zIndex: 3
            },
            {
              id: 'el_b_qr',
              type: 'qr',
              content: info.website ? (info.website.startsWith('http') ? info.website : 'https://' + info.website) : 'https://example.com',
              qrColor: '#0f172a', qrBgColor: '#ffffff',
              x: 800, y: 190, width: 180, height: 180,
              rotation: 0, zIndex: 4
            }
          ]
        }
      };
    },

    // T2: 모던 블랙 (Modern Black)
    t2: function (info, spec) {
      return {
        front: {
          background: { type: 'solid', color: '#0f172a' },
          elements: [
            {
              id: 'el_gold_bar',
              type: 'shape',
              shapeType: 'rect',
              x: 80, y: 130, width: 45, height: 6,
              fillColor: '#f59e0b', strokeColor: '#f59e0b', strokeWidth: 0, borderRadius: 2,
              rotation: 0, zIndex: 1
            },
            {
              id: 'el_name',
              type: 'text',
              fieldKey: 'name',
              text: info.name,
              x: 80, y: 175, width: 350, height: 60,
              fontSize: 50, fontFamily: 'Pretendard, sans-serif', fontWeight: '900',
              color: '#ffffff', textAlign: 'left', rotation: 0, zIndex: 2
            },
            {
              id: 'el_title',
              type: 'text',
              fieldKey: 'title',
              text: info.title,
              x: 80, y: 245, width: 350, height: 30,
              fontSize: 22, fontFamily: 'Pretendard, sans-serif', fontWeight: '700',
              color: '#f59e0b', textAlign: 'left', rotation: 0, zIndex: 3
            },
            {
              id: 'el_company',
              type: 'text',
              fieldKey: 'company',
              text: `${info.company}  ·  ${info.dept}`,
              x: 80, y: 295, width: 450, height: 30,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '400',
              color: '#94a3b8', textAlign: 'left', rotation: 0, zIndex: 4
            },
            {
              id: 'el_phone',
              type: 'text',
              fieldKey: 'phone',
              text: info.phone,
              x: 80, y: 360, width: 350, height: 25,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#cbd5e1', textAlign: 'left', rotation: 0, zIndex: 5
            },
            {
              id: 'el_email',
              type: 'text',
              fieldKey: 'email',
              text: info.email,
              x: 80, y: 395, width: 350, height: 25,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#cbd5e1', textAlign: 'left', rotation: 0, zIndex: 6
            },
            {
              id: 'el_address',
              type: 'text',
              fieldKey: 'address',
              text: info.address,
              x: 80, y: 435, width: 500, height: 25,
              fontSize: 16, fontFamily: 'Pretendard, sans-serif', fontWeight: '400',
              color: '#64748b', textAlign: 'left', rotation: 0, zIndex: 7
            }
          ]
        },
        back: {
          background: { type: 'solid', color: '#090d16' },
          elements: [
            {
              id: 'el_b_company',
              type: 'text',
              fieldKey: 'company',
              text: info.company,
              x: 100, y: 200, width: 500, height: 50,
              fontSize: 44, fontFamily: 'Pretendard, sans-serif', fontWeight: '900',
              color: '#ffffff', textAlign: 'left', rotation: 0, zIndex: 1
            },
            {
              id: 'el_b_tagline',
              type: 'text',
              fieldKey: 'tagline',
              text: info.tagline,
              x: 100, y: 265, width: 550, height: 35,
              fontSize: 20, fontFamily: 'Pretendard, sans-serif', fontWeight: '400',
              color: '#f59e0b', textAlign: 'left', rotation: 0, zIndex: 2
            },
            {
              id: 'el_b_web',
              type: 'text',
              fieldKey: 'website',
              text: info.website,
              x: 100, y: 320, width: 450, height: 30,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#94a3b8', textAlign: 'left', rotation: 0, zIndex: 3
            },
            {
              id: 'el_b_qr',
              type: 'qr',
              content: info.website ? (info.website.startsWith('http') ? info.website : 'https://' + info.website) : 'https://example.com',
              qrColor: '#f59e0b', qrBgColor: '#090d16',
              x: 800, y: 190, width: 170, height: 170,
              rotation: 0, zIndex: 4
            }
          ]
        }
      };
    },

    // T3: 블루 비즈니스 (Blue Business)
    t3: function (info, spec) {
      return {
        front: {
          background: { type: 'solid', color: '#ffffff' },
          elements: [
            {
              id: 'el_navy_top',
              type: 'shape',
              shapeType: 'rect',
              x: 0, y: 0, width: 1063, height: 45,
              fillColor: '#1e3a8a', strokeColor: '#1e3a8a', strokeWidth: 0,
              rotation: 0, zIndex: 1
            },
            {
              id: 'el_blue_stripe',
              type: 'shape',
              shapeType: 'rect',
              x: 0, y: 45, width: 1063, height: 8,
              fillColor: '#2563eb', strokeColor: '#2563eb', strokeWidth: 0,
              rotation: 0, zIndex: 2
            },
            {
              id: 'el_company',
              type: 'text',
              fieldKey: 'company',
              text: info.company,
              x: 80, y: 110, width: 400, height: 35,
              fontSize: 26, fontFamily: 'Pretendard, sans-serif', fontWeight: '800',
              color: '#1e3a8a', textAlign: 'left', rotation: 0, zIndex: 3
            },
            {
              id: 'el_name',
              type: 'text',
              fieldKey: 'name',
              text: info.name,
              x: 80, y: 190, width: 350, height: 55,
              fontSize: 48, fontFamily: 'Pretendard, sans-serif', fontWeight: '900',
              color: '#0f172a', textAlign: 'left', rotation: 0, zIndex: 4
            },
            {
              id: 'el_title',
              type: 'text',
              fieldKey: 'title',
              text: `${info.title}  /  ${info.dept}`,
              x: 80, y: 255, width: 450, height: 30,
              fontSize: 20, fontFamily: 'Pretendard, sans-serif', fontWeight: '600',
              color: '#2563eb', textAlign: 'left', rotation: 0, zIndex: 5
            },
            {
              id: 'el_phone',
              type: 'text',
              fieldKey: 'phone',
              text: `Tel. ${info.phone}  |  Office. ${info.tel}`,
              x: 80, y: 350, width: 500, height: 25,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#334155', textAlign: 'left', rotation: 0, zIndex: 6
            },
            {
              id: 'el_email',
              type: 'text',
              fieldKey: 'email',
              text: `Email. ${info.email}`,
              x: 80, y: 390, width: 450, height: 25,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#334155', textAlign: 'left', rotation: 0, zIndex: 7
            },
            {
              id: 'el_address',
              type: 'text',
              fieldKey: 'address',
              text: `Add. ${info.address}`,
              x: 80, y: 430, width: 550, height: 25,
              fontSize: 16, fontFamily: 'Pretendard, sans-serif', fontWeight: '400',
              color: '#64748b', textAlign: 'left', rotation: 0, zIndex: 8
            }
          ]
        },
        back: {
          background: { type: 'solid', color: '#1e3a8a' },
          elements: [
            {
              id: 'el_b_company',
              type: 'text',
              fieldKey: 'company',
              text: info.company,
              x: 80, y: 190, width: 550, height: 50,
              fontSize: 44, fontFamily: 'Pretendard, sans-serif', fontWeight: '900',
              color: '#ffffff', textAlign: 'left', rotation: 0, zIndex: 1
            },
            {
              id: 'el_b_tagline',
              type: 'text',
              fieldKey: 'tagline',
              text: info.tagline,
              x: 80, y: 255, width: 550, height: 35,
              fontSize: 20, fontFamily: 'Pretendard, sans-serif', fontWeight: '400',
              color: '#93c5fd', textAlign: 'left', rotation: 0, zIndex: 2
            },
            {
              id: 'el_b_web',
              type: 'text',
              fieldKey: 'website',
              text: info.website,
              x: 80, y: 320, width: 450, height: 30,
              fontSize: 20, fontFamily: 'Pretendard, sans-serif', fontWeight: '600',
              color: '#ffffff', textAlign: 'left', rotation: 0, zIndex: 3
            },
            {
              id: 'el_b_qr',
              type: 'qr',
              content: info.website ? (info.website.startsWith('http') ? info.website : 'https://' + info.website) : 'https://example.com',
              qrColor: '#1e3a8a', qrBgColor: '#ffffff',
              x: 800, y: 190, width: 170, height: 170,
              rotation: 0, zIndex: 4
            }
          ]
        }
      };
    },

    // T4: 감성 베이지 (Emotional Beige)
    t4: function (info, spec) {
      return {
        front: {
          background: { type: 'solid', color: '#f7f4ee' },
          elements: [
            {
              id: 'el_name',
              type: 'text',
              fieldKey: 'name',
              text: info.name,
              x: 90, y: 180, width: 350, height: 55,
              fontSize: 50, fontFamily: "'Gowun Batang', serif", fontWeight: '700',
              color: '#3e2723', textAlign: 'left', rotation: 0, zIndex: 1
            },
            {
              id: 'el_name_en',
              type: 'text',
              fieldKey: 'nameEn',
              text: info.nameEn,
              x: 90, y: 245, width: 350, height: 25,
              fontSize: 18, fontFamily: "'Montserrat', sans-serif", fontWeight: '400',
              color: '#78350f', textAlign: 'left', rotation: 0, zIndex: 2
            },
            {
              id: 'el_title',
              type: 'text',
              fieldKey: 'title',
              text: `${info.title}  ·  ${info.company}`,
              x: 90, y: 285, width: 450, height: 30,
              fontSize: 20, fontFamily: "'Gowun Batang', serif", fontWeight: '400',
              color: '#5c3826', textAlign: 'left', rotation: 0, zIndex: 3
            },
            {
              id: 'el_line',
              type: 'shape',
              shapeType: 'line',
              x: 90, y: 330, width: 220, height: 1.5,
              fillColor: '#b45309', strokeColor: '#b45309', strokeWidth: 1.5,
              rotation: 0, zIndex: 4
            },
            {
              id: 'el_phone',
              type: 'text',
              fieldKey: 'phone',
              text: info.phone,
              x: 90, y: 365, width: 350, height: 25,
              fontSize: 18, fontFamily: "'Gowun Batang', serif", fontWeight: '400',
              color: '#451a03', textAlign: 'left', rotation: 0, zIndex: 5
            },
            {
              id: 'el_email',
              type: 'text',
              fieldKey: 'email',
              text: info.email,
              x: 90, y: 400, width: 350, height: 25,
              fontSize: 18, fontFamily: "'Gowun Batang', serif", fontWeight: '400',
              color: '#451a03', textAlign: 'left', rotation: 0, zIndex: 6
            },
            {
              id: 'el_sns',
              type: 'text',
              fieldKey: 'sns',
              text: info.sns,
              x: 90, y: 435, width: 350, height: 25,
              fontSize: 18, fontFamily: "'Montserrat', sans-serif", fontWeight: '500',
              color: '#78350f', textAlign: 'left', rotation: 0, zIndex: 7
            }
          ]
        },
        back: {
          background: { type: 'solid', color: '#f7f4ee' },
          elements: [
            {
              id: 'el_b_circle',
              type: 'shape',
              shapeType: 'circle',
              x: 480, y: 120, width: 100, height: 100,
              fillColor: 'transparent', strokeColor: '#b45309', strokeWidth: 1.5,
              rotation: 0, zIndex: 1
            },
            {
              id: 'el_b_company',
              type: 'text',
              fieldKey: 'company',
              text: info.company,
              x: 180, y: 250, width: 700, height: 45,
              fontSize: 38, fontFamily: "'Gowun Batang', serif", fontWeight: '700',
              color: '#3e2723', textAlign: 'center', rotation: 0, zIndex: 2
            },
            {
              id: 'el_b_tagline',
              type: 'text',
              fieldKey: 'tagline',
              text: info.tagline,
              x: 180, y: 305, width: 700, height: 35,
              fontSize: 19, fontFamily: "'Gowun Batang', serif", fontWeight: '400',
              color: '#78350f', textAlign: 'center', rotation: 0, zIndex: 3
            },
            {
              id: 'el_b_qr',
              type: 'qr',
              content: info.website ? (info.website.startsWith('http') ? info.website : 'https://' + info.website) : 'https://example.com',
              qrColor: '#451a03', qrBgColor: '#f7f4ee',
              x: 460, y: 360, width: 140, height: 140,
              rotation: 0, zIndex: 4
            }
          ]
        }
      };
    },

    // T5: 크리에이티브 컬러 (Creative Color)
    t5: function (info, spec) {
      return {
        front: {
          background: { type: 'solid', color: '#ffffff' },
          elements: [
            {
              id: 'el_shape_violet',
              type: 'shape',
              shapeType: 'rect',
              x: 820, y: 0, width: 243, height: 280,
              fillColor: '#6366f1', strokeColor: '#6366f1', strokeWidth: 0,
              rotation: 0, zIndex: 1
            },
            {
              id: 'el_shape_coral',
              type: 'shape',
              shapeType: 'rect',
              x: 870, y: 280, width: 193, height: 311,
              fillColor: '#f43f5e', strokeColor: '#f43f5e', strokeWidth: 0,
              rotation: 0, zIndex: 2
            },
            {
              id: 'el_name',
              type: 'text',
              fieldKey: 'name',
              text: info.name,
              x: 80, y: 170, width: 350, height: 60,
              fontSize: 52, fontFamily: "'Montserrat', sans-serif", fontWeight: '900',
              color: '#0f172a', textAlign: 'left', rotation: 0, zIndex: 3
            },
            {
              id: 'el_title',
              type: 'text',
              fieldKey: 'title',
              text: info.title,
              x: 80, y: 240, width: 350, height: 30,
              fontSize: 24, fontFamily: 'Pretendard, sans-serif', fontWeight: '700',
              color: '#6366f1', textAlign: 'left', rotation: 0, zIndex: 4
            },
            {
              id: 'el_company',
              type: 'text',
              fieldKey: 'company',
              text: info.company,
              x: 80, y: 285, width: 400, height: 30,
              fontSize: 20, fontFamily: 'Pretendard, sans-serif', fontWeight: '600',
              color: '#334155', textAlign: 'left', rotation: 0, zIndex: 5
            },
            {
              id: 'el_phone',
              type: 'text',
              fieldKey: 'phone',
              text: info.phone,
              x: 80, y: 360, width: 350, height: 25,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#475569', textAlign: 'left', rotation: 0, zIndex: 6
            },
            {
              id: 'el_email',
              type: 'text',
              fieldKey: 'email',
              text: info.email,
              x: 80, y: 395, width: 350, height: 25,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#475569', textAlign: 'left', rotation: 0, zIndex: 7
            },
            {
              id: 'el_website',
              type: 'text',
              fieldKey: 'website',
              text: info.website,
              x: 80, y: 430, width: 350, height: 25,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#475569', textAlign: 'left', rotation: 0, zIndex: 8
            }
          ]
        },
        back: {
          background: { type: 'solid', color: '#6366f1' },
          elements: [
            {
              id: 'el_b_company',
              type: 'text',
              fieldKey: 'company',
              text: info.company,
              x: 80, y: 200, width: 550, height: 50,
              fontSize: 46, fontFamily: "'Montserrat', sans-serif", fontWeight: '900',
              color: '#ffffff', textAlign: 'left', rotation: 0, zIndex: 1
            },
            {
              id: 'el_b_web',
              type: 'text',
              fieldKey: 'website',
              text: info.website,
              x: 80, y: 265, width: 550, height: 35,
              fontSize: 24, fontFamily: "'Montserrat', sans-serif", fontWeight: '700',
              color: '#fef08a', textAlign: 'left', rotation: 0, zIndex: 2
            },
            {
              id: 'el_b_tagline',
              type: 'text',
              fieldKey: 'tagline',
              text: info.tagline,
              x: 80, y: 320, width: 550, height: 30,
              fontSize: 20, fontFamily: 'Pretendard, sans-serif', fontWeight: '400',
              color: '#e0e7ff', textAlign: 'left', rotation: 0, zIndex: 3
            },
            {
              id: 'el_b_qr',
              type: 'qr',
              content: info.website ? (info.website.startsWith('http') ? info.website : 'https://' + info.website) : 'https://example.com',
              qrColor: '#6366f1', qrBgColor: '#ffffff',
              x: 800, y: 190, width: 170, height: 170,
              rotation: 0, zIndex: 4
            }
          ]
        }
      };
    },

    // T6: 세로형 명함 (Vertical Studio) - Portrait Layout
    t6: function (info, spec) {
      return {
        front: {
          background: { type: 'solid', color: '#ffffff' },
          elements: [
            {
              id: 'el_company',
              type: 'text',
              fieldKey: 'company',
              text: info.company,
              x: 70, y: 130, width: 450, height: 30,
              fontSize: 22, fontFamily: 'Pretendard, sans-serif', fontWeight: '800',
              color: '#0f172a', textAlign: 'center', rotation: 0, zIndex: 1
            },
            {
              id: 'el_v_line',
              type: 'shape',
              shapeType: 'rect',
              x: 290, y: 180, width: 2, height: 60,
              fillColor: '#0f172a', strokeColor: '#0f172a', strokeWidth: 0,
              rotation: 0, zIndex: 2
            },
            {
              id: 'el_name',
              type: 'text',
              fieldKey: 'name',
              text: info.name,
              x: 50, y: 280, width: 490, height: 70,
              fontSize: 60, fontFamily: 'Pretendard, sans-serif', fontWeight: '900',
              color: '#0f172a', textAlign: 'center', rotation: 0, zIndex: 3
            },
            {
              id: 'el_title',
              type: 'text',
              fieldKey: 'title',
              text: info.title,
              x: 50, y: 360, width: 490, height: 30,
              fontSize: 22, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#64748b', textAlign: 'center', rotation: 0, zIndex: 4
            },
            {
              id: 'el_phone',
              type: 'text',
              fieldKey: 'phone',
              text: info.phone,
              x: 50, y: 680, width: 490, height: 30,
              fontSize: 20, fontFamily: 'Pretendard, sans-serif', fontWeight: '600',
              color: '#334155', textAlign: 'center', rotation: 0, zIndex: 5
            },
            {
              id: 'el_email',
              type: 'text',
              fieldKey: 'email',
              text: info.email,
              x: 50, y: 725, width: 490, height: 30,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#475569', textAlign: 'center', rotation: 0, zIndex: 6
            },
            {
              id: 'el_web',
              type: 'text',
              fieldKey: 'website',
              text: info.website,
              x: 50, y: 765, width: 490, height: 30,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#64748b', textAlign: 'center', rotation: 0, zIndex: 7
            }
          ]
        },
        back: {
          background: { type: 'solid', color: '#0f172a' },
          elements: [
            {
              id: 'el_b_comp',
              type: 'text',
              fieldKey: 'company',
              text: info.company,
              x: 50, y: 280, width: 490, height: 50,
              fontSize: 40, fontFamily: 'Pretendard, sans-serif', fontWeight: '900',
              color: '#ffffff', textAlign: 'center', rotation: 0, zIndex: 1
            },
            {
              id: 'el_b_tag',
              type: 'text',
              fieldKey: 'tagline',
              text: info.tagline,
              x: 50, y: 350, width: 490, height: 30,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '400',
              color: '#94a3b8', textAlign: 'center', rotation: 0, zIndex: 2
            },
            {
              id: 'el_b_qr',
              type: 'qr',
              content: info.website ? (info.website.startsWith('http') ? info.website : 'https://' + info.website) : 'https://example.com',
              qrColor: '#0f172a', qrBgColor: '#ffffff',
              x: 185, y: 460, width: 220, height: 220,
              rotation: 0, zIndex: 3
            }
          ]
        }
      };
    },

    // T7: 그라데이션 모던 (Gradient Modern)
    t7: function (info, spec) {
      return {
        front: {
          background: {
            type: 'gradient',
            color: '#0f172a',
            gradient: { color1: '#0f172a', color2: '#312e81', angle: 135 }
          },
          elements: [
            {
              id: 'el_pill',
              type: 'shape',
              shapeType: 'rect',
              x: 80, y: 110, width: 150, height: 32,
              fillColor: 'rgba(99, 102, 241, 0.2)', strokeColor: '#818cf8', strokeWidth: 1, borderRadius: 16,
              rotation: 0, zIndex: 1
            },
            {
              id: 'el_pill_text',
              type: 'text',
              text: 'TECH & INNOVATION',
              x: 95, y: 131, width: 120, height: 20,
              fontSize: 13, fontFamily: "'Montserrat', sans-serif", fontWeight: '700',
              color: '#818cf8', textAlign: 'left', rotation: 0, zIndex: 2
            },
            {
              id: 'el_name',
              type: 'text',
              fieldKey: 'name',
              text: info.name,
              x: 80, y: 190, width: 350, height: 60,
              fontSize: 52, fontFamily: 'Pretendard, sans-serif', fontWeight: '900',
              color: '#ffffff', textAlign: 'left', rotation: 0, zIndex: 3
            },
            {
              id: 'el_title',
              type: 'text',
              fieldKey: 'title',
              text: `${info.title}  ·  ${info.company}`,
              x: 80, y: 260, width: 450, height: 30,
              fontSize: 22, fontFamily: 'Pretendard, sans-serif', fontWeight: '600',
              color: '#38bdf8', textAlign: 'left', rotation: 0, zIndex: 4
            },
            {
              id: 'el_phone',
              type: 'text',
              fieldKey: 'phone',
              text: info.phone,
              x: 80, y: 350, width: 350, height: 25,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#cbd5e1', textAlign: 'left', rotation: 0, zIndex: 5
            },
            {
              id: 'el_email',
              type: 'text',
              fieldKey: 'email',
              text: info.email,
              x: 80, y: 385, width: 350, height: 25,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#cbd5e1', textAlign: 'left', rotation: 0, zIndex: 6
            },
            {
              id: 'el_web',
              type: 'text',
              fieldKey: 'website',
              text: info.website,
              x: 80, y: 420, width: 350, height: 25,
              fontSize: 18, fontFamily: 'Pretendard, sans-serif', fontWeight: '500',
              color: '#94a3b8', textAlign: 'left', rotation: 0, zIndex: 7
            },
            {
              id: 'el_qr',
              type: 'qr',
              content: info.website ? (info.website.startsWith('http') ? info.website : 'https://' + info.website) : 'https://example.com',
              qrColor: '#0f172a', qrBgColor: '#ffffff',
              x: 800, y: 190, width: 170, height: 170,
              rotation: 0, zIndex: 8
            }
          ]
        },
        back: {
          background: {
            type: 'gradient',
            color: '#090d16',
            gradient: { color1: '#090d16', color2: '#1e1b4b', angle: 135 }
          },
          elements: [
            {
              id: 'el_b_comp',
              type: 'text',
              fieldKey: 'company',
              text: info.company,
              x: 100, y: 220, width: 860, height: 50,
              fontSize: 48, fontFamily: "'Montserrat', sans-serif", fontWeight: '900',
              color: '#ffffff', textAlign: 'center', rotation: 0, zIndex: 1
            },
            {
              id: 'el_b_tag',
              type: 'text',
              fieldKey: 'tagline',
              text: info.tagline,
              x: 100, y: 290, width: 860, height: 35,
              fontSize: 22, fontFamily: 'Pretendard, sans-serif', fontWeight: '400',
              color: '#38bdf8', textAlign: 'center', rotation: 0, zIndex: 2
            },
            {
              id: 'el_b_web',
              type: 'text',
              fieldKey: 'website',
              text: info.website,
              x: 100, y: 350, width: 860, height: 30,
              fontSize: 20, fontFamily: 'Pretendard, sans-serif', fontWeight: '600',
              color: '#94a3b8', textAlign: 'center', rotation: 0, zIndex: 3
            }
          ]
        }
      };
    },

    // T8: 클래식 프리미엄 (Classic Premium)
    t8: function (info, spec) {
      return {
        front: {
          background: { type: 'solid', color: '#faf7f2' },
          elements: [
            {
              id: 'el_border_outer',
              type: 'shape',
              shapeType: 'rect',
              x: 35, y: 35, width: 993, height: 521,
              fillColor: 'transparent', strokeColor: '#d97706', strokeWidth: 2,
              rotation: 0, zIndex: 1
            },
            {
              id: 'el_border_inner',
              type: 'shape',
              shapeType: 'rect',
              x: 47, y: 47, width: 969, height: 497,
              fillColor: 'transparent', strokeColor: '#d97706', strokeWidth: 1,
              rotation: 0, zIndex: 2
            },
            {
              id: 'el_name',
              type: 'text',
              fieldKey: 'name',
              text: info.name,
              x: 100, y: 195, width: 863, height: 60,
              fontSize: 54, fontFamily: "'Playfair Display', serif", fontWeight: '700',
              color: '#1c1917', textAlign: 'center', rotation: 0, zIndex: 3
            },
            {
              id: 'el_title',
              type: 'text',
              fieldKey: 'title',
              text: `${info.title}  ·  ${info.dept}`,
              x: 100, y: 265, width: 863, height: 30,
              fontSize: 20, fontFamily: "'Gowun Batang', serif", fontWeight: '400',
              color: '#b45309', textAlign: 'center', rotation: 0, zIndex: 4
            },
            {
              id: 'el_company',
              type: 'text',
              fieldKey: 'company',
              text: info.company,
              x: 100, y: 315, width: 863, height: 30,
              fontSize: 22, fontFamily: "'Gowun Batang', serif", fontWeight: '700',
              color: '#44403c', textAlign: 'center', rotation: 0, zIndex: 5
            },
            {
              id: 'el_contact',
              type: 'text',
              fieldKey: 'phone',
              text: `${info.phone}   |   ${info.email}   |   ${info.website}`,
              x: 100, y: 395, width: 863, height: 25,
              fontSize: 17, fontFamily: 'Pretendard, sans-serif', fontWeight: '400',
              color: '#57534e', textAlign: 'center', rotation: 0, zIndex: 6
            }
          ]
        },
        back: {
          background: { type: 'solid', color: '#faf7f2' },
          elements: [
            {
              id: 'el_b_border_o',
              type: 'shape',
              shapeType: 'rect',
              x: 35, y: 35, width: 993, height: 521,
              fillColor: 'transparent', strokeColor: '#d97706', strokeWidth: 2,
              rotation: 0, zIndex: 1
            },
            {
              id: 'el_b_border_i',
              type: 'shape',
              shapeType: 'rect',
              x: 47, y: 47, width: 969, height: 497,
              fillColor: 'transparent', strokeColor: '#d97706', strokeWidth: 1,
              rotation: 0, zIndex: 2
            },
            {
              id: 'el_b_crest',
              type: 'text',
              text: '⚜️',
              x: 480, y: 150, width: 100, height: 50,
              fontSize: 48, fontFamily: 'serif', fontWeight: '400',
              color: '#d97706', textAlign: 'center', rotation: 0, zIndex: 3
            },
            {
              id: 'el_b_comp',
              type: 'text',
              fieldKey: 'company',
              text: info.company,
              x: 100, y: 230, width: 863, height: 45,
              fontSize: 40, fontFamily: "'Playfair Display', serif", fontWeight: '700',
              color: '#1c1917', textAlign: 'center', rotation: 0, zIndex: 4
            },
            {
              id: 'el_b_tag',
              type: 'text',
              fieldKey: 'tagline',
              text: info.tagline,
              x: 100, y: 290, width: 863, height: 30,
              fontSize: 18, fontFamily: "'Gowun Batang', serif", fontWeight: '400',
              color: '#78350f', textAlign: 'center', rotation: 0, zIndex: 5
            },
            {
              id: 'el_b_addr',
              type: 'text',
              fieldKey: 'address',
              text: info.address,
              x: 100, y: 340, width: 863, height: 25,
              fontSize: 16, fontFamily: 'Pretendard, sans-serif', fontWeight: '400',
              color: '#57534e', textAlign: 'center', rotation: 0, zIndex: 6
            },
            {
              id: 'el_b_qr',
              type: 'qr',
              content: info.website ? (info.website.startsWith('http') ? info.website : 'https://' + info.website) : 'https://example.com',
              qrColor: '#451a03', qrBgColor: '#faf7f2',
              x: 460, y: 385, width: 140, height: 140,
              rotation: 0, zIndex: 7
            }
          ]
        }
      };
    }
  };

  // 4. 캔버스 해상도 및 현재 규격 계산기
  function getCurrentDimensions(includeBleed = false) {
    const spec = SPECS[state.specKey] || SPECS['90x50'];
    let w = spec.pxWidth;
    let h = spec.pxHeight;

    if (state.orientation === 'portrait') {
      const temp = w;
      w = h;
      h = temp;
    }

    if (includeBleed && state.bleed) {
      w += spec.bleedPx * 2;
      h += spec.bleedPx * 2;
    }

    return {
      width: w,
      height: h,
      bleedPx: spec.bleedPx
    };
  }

  // 5. QR 코드 이미지 캐시 생성기
  const qrImageCache = {};

  function generateQrDataUrl(content, colorDark = '#000000', colorLight = '#ffffff') {
    return new Promise((resolve) => {
      const cacheKey = `${content}_${colorDark}_${colorLight}`;
      if (qrImageCache[cacheKey]) {
        resolve(qrImageCache[cacheKey]);
        return;
      }

      const tempDiv = document.createElement('div');
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      try {
        if (typeof QRCode !== 'undefined') {
          new QRCode(tempDiv, {
            text: content || 'https://example.com',
            width: 256,
            height: 256,
            colorDark: colorDark || '#000000',
            colorLight: colorLight || '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
          });

          setTimeout(() => {
            const canvas = tempDiv.querySelector('canvas');
            if (canvas) {
              const url = canvas.toDataURL('image/png');
              qrImageCache[cacheKey] = url;
              document.body.removeChild(tempDiv);
              resolve(url);
            } else {
              const img = tempDiv.querySelector('img');
              if (img && img.src) {
                qrImageCache[cacheKey] = img.src;
                document.body.removeChild(tempDiv);
                resolve(img.src);
              } else {
                document.body.removeChild(tempDiv);
                resolve(null);
              }
            }
          }, 30);
        } else {
          document.body.removeChild(tempDiv);
          resolve(null);
        }
      } catch (e) {
        if (tempDiv.parentNode) document.body.removeChild(tempDiv);
        resolve(null);
      }
    });
  }

  // 6. 캔버스 렌더러 (UI 캔버스 & 300DPI 오프스크린 캔버스 공용)
  function renderCard(sideKey, targetCanvas, options = {}) {
    if (!targetCanvas) return;
    const ctx = targetCanvas.getContext('2d');
    const sideData = state[sideKey] || state.front;
    const dims = getCurrentDimensions(options.includeBleed);

    targetCanvas.width = dims.width;
    targetCanvas.height = dims.height;

    ctx.clearRect(0, 0, dims.width, dims.height);
    ctx.save();

    // 1) 배경 그리기
    const bg = sideData.background;
    if (bg.type === 'solid') {
      ctx.fillStyle = bg.color || '#ffffff';
      ctx.fillRect(0, 0, dims.width, dims.height);
    } else if (bg.type === 'gradient' && bg.gradient) {
      const g = bg.gradient;
      const angleRad = (g.angle || 135) * (Math.PI / 180);
      const halfW = dims.width / 2;
      const halfH = dims.height / 2;
      const diag = Math.sqrt(halfW * halfW + halfH * halfH);

      const x0 = halfW - Math.cos(angleRad) * diag;
      const y0 = halfH - Math.sin(angleRad) * diag;
      const x1 = halfW + Math.cos(angleRad) * diag;
      const y1 = halfH + Math.sin(angleRad) * diag;

      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      grad.addColorStop(0, g.color1 || '#0f172a');
      grad.addColorStop(1, g.color2 || '#312e81');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, dims.width, dims.height);
    } else if (bg.type === 'image' && bg.imageSrc && options.loadedImages && options.loadedImages[bg.imageSrc]) {
      ctx.drawImage(options.loadedImages[bg.imageSrc], 0, 0, dims.width, dims.height);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, dims.width, dims.height);
    }

    // 도련 오프셋 (Bleed가 켜져 있을 때 요소 위치 보정)
    const offsetX = (options.includeBleed && state.bleed) ? dims.bleedPx : 0;
    const offsetY = (options.includeBleed && state.bleed) ? dims.bleedPx : 0;

    // 2) 요소들을 z-index 순서대로 렌더링
    const sortedElements = [...sideData.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    sortedElements.forEach((el) => {
      // 텍스트 내용이 없는 경우(필드 비어있음) 건너뜀
      if (el.type === 'text' && (!el.text || el.text.trim() === '')) return;

      ctx.save();
      const elX = el.x + offsetX;
      const elY = el.y + offsetY;
      const cx = elX + el.width / 2;
      const cy = elY + el.height / 2;

      // 회전 적용
      if (el.rotation) {
        ctx.translate(cx, cy);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.translate(-cx, -cy);
      }

      // 투명도
      if (el.opacity !== undefined) {
        ctx.globalAlpha = el.opacity;
      }

      // 타입별 그리기
      if (el.type === 'text') {
        const weight = el.fontWeight || 'normal';
        const style = el.fontStyle === 'italic' ? 'italic ' : '';
        const size = el.fontSize || 20;
        const family = el.fontFamily || 'Pretendard, sans-serif';

        ctx.font = `${style}${weight} ${size}px ${family}`;
        ctx.fillStyle = el.color || '#0f172a';
        ctx.textBaseline = 'middle';

        let textX = elX;
        if (el.textAlign === 'center') {
          ctx.textAlign = 'center';
          textX = elX + el.width / 2;
        } else if (el.textAlign === 'right') {
          ctx.textAlign = 'right';
          textX = elX + el.width;
        } else {
          ctx.textAlign = 'left';
        }

        // 멀티라인 줄바꿈 처리
        const lines = String(el.text).split('\n');
        const lineHeight = size * 1.35;
        const totalHeight = lines.length * lineHeight;
        let startY = elY + (el.height - totalHeight) / 2 + lineHeight / 2;

        lines.forEach((line) => {
          ctx.fillText(line, textX, startY);
          startY += lineHeight;
        });

      } else if (el.type === 'shape') {
        ctx.fillStyle = el.fillColor || 'transparent';
        ctx.strokeStyle = el.strokeColor || '#000000';
        ctx.lineWidth = el.strokeWidth || 0;

        if (el.shapeType === 'rect') {
          const r = el.borderRadius || 0;
          if (r > 0) {
            ctx.beginPath();
            ctx.roundRect(elX, elY, el.width, el.height, r);
            if (el.fillColor && el.fillColor !== 'transparent') ctx.fill();
            if (el.strokeWidth > 0) ctx.stroke();
          } else {
            if (el.fillColor && el.fillColor !== 'transparent') {
              ctx.fillRect(elX, elY, el.width, el.height);
            }
            if (el.strokeWidth > 0) {
              ctx.strokeRect(elX, elY, el.width, el.height);
            }
          }
        } else if (el.shapeType === 'circle') {
          const rx = el.width / 2;
          const ry = el.height / 2;
          ctx.beginPath();
          ctx.ellipse(elX + rx, elY + ry, rx, ry, 0, 0, Math.PI * 2);
          if (el.fillColor && el.fillColor !== 'transparent') ctx.fill();
          if (el.strokeWidth > 0) ctx.stroke();
        } else if (el.shapeType === 'line') {
          ctx.beginPath();
          ctx.moveTo(elX, elY + el.height / 2);
          ctx.lineTo(elX + el.width, elY + el.height / 2);
          ctx.stroke();
        }

      } else if (el.type === 'image' && el.src) {
        const img = options.loadedImages && options.loadedImages[el.src];
        if (img) {
          ctx.drawImage(img, elX, elY, el.width, el.height);
        }
      } else if (el.type === 'qr' && el.content) {
        const qrUrl = qrImageCache[`${el.content}_${el.qrColor || '#000000'}_${el.qrBgColor || '#ffffff'}`];
        if (qrUrl && options.loadedImages && options.loadedImages[qrUrl]) {
          ctx.drawImage(options.loadedImages[qrUrl], elX, elY, el.width, el.height);
        }
      }

      ctx.restore();
    });

    ctx.restore();
  }

  // 7. 이미지 프리로드 헬퍼
  function preloadImagesForSide(sideKey) {
    const sideData = state[sideKey] || state.front;
    const urls = [];

    if (sideData.background.type === 'image' && sideData.background.imageSrc) {
      urls.push(sideData.background.imageSrc);
    }

    sideData.elements.forEach((el) => {
      if (el.type === 'image' && el.src) {
        urls.push(el.src);
      } else if (el.type === 'qr' && el.content) {
        const cacheKey = `${el.content}_${el.qrColor || '#000000'}_${el.qrBgColor || '#ffffff'}`;
        if (qrImageCache[cacheKey]) {
          urls.push(qrImageCache[cacheKey]);
        }
      }
    });

    const loaded = {};
    const promises = urls.map((url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          loaded[url] = img;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = url;
      });
    });

    return Promise.all(promises).then(() => loaded);
  }

  // 8. 메인 뷰포트 캔버스 갱신 함수
  let renderDebounceTimer = null;

  function updateCanvas() {
    clearTimeout(renderDebounceTimer);
    renderDebounceTimer = setTimeout(() => {
      const canvas = document.getElementById('businessCardCanvas');
      if (!canvas) return;

      // QR 코드들 선행 생성 확인
      const currentSideData = state[state.currentSide];
      const qrPromises = currentSideData.elements
        .filter((el) => el.type === 'qr')
        .map((el) => generateQrDataUrl(el.content, el.qrColor, el.qrBgColor));

      Promise.all(qrPromises).then(() => {
        preloadImagesForSide(state.currentSide).then((loadedImages) => {
          renderCard(state.currentSide, canvas, { loadedImages, includeBleed: false });
          updateSelectionBox();
          updateGuides();
          triggerAutoSave();
        });
      });
    }, 16);
  }

  // 9. 가이드라인 및 재단선 위치 동기화
  function updateGuides() {
    const $guides = $('#guidesOverlay');
    if (!state.showGuides) {
      $guides.hide();
      return;
    }
    $guides.show();

    const dims = getCurrentDimensions(false);
    // 3mm 안전 영역은 약 35px 안쪽
    const safeMargin = 35;
    const safeLeft = (safeMargin / dims.width) * 100;
    const safeTop = (safeMargin / dims.height) * 100;
    const safeWidth = ((dims.width - safeMargin * 2) / dims.width) * 100;
    const safeHeight = ((dims.height - safeMargin * 2) / dims.height) * 100;

    $('#guideSafeBox').css({
      left: `${safeLeft}%`,
      top: `${safeTop}%`,
      width: `${safeWidth}%`,
      height: `${safeHeight}%`
    });
  }

  // 10. 상호작용 오버레이 & 선택 박스 제어
  function updateSelectionBox() {
    const $box = $('#selectionBox');
    const selected = getSelectedElement();

    if (!selected) {
      $box.hide();
      $('#noSelectionView').show();
      $('#selectionPropsView').hide();
      return;
    }

    const dims = getCurrentDimensions(false);
    const leftPercent = (selected.x / dims.width) * 100;
    const topPercent = (selected.y / dims.height) * 100;
    const widthPercent = (selected.width / dims.width) * 100;
    const heightPercent = (selected.height / dims.height) * 100;

    $box.css({
      display: 'block',
      left: `${leftPercent}%`,
      top: `${topPercent}%`,
      width: `${widthPercent}%`,
      height: `${heightPercent}%`,
      transform: selected.rotation ? `rotate(${selected.rotation}deg)` : 'none'
    });

    $('#rotationBadge').text(`${Math.round(selected.rotation || 0)}°`);

    // 우측 속성 패널 동기화
    $('#noSelectionView').hide();
    $('#selectionPropsView').show();
    syncPropertyInspector(selected);
  }

  function getSelectedElement() {
    if (!state.selectedElementId) return null;
    const elements = state[state.currentSide].elements;
    return elements.find((el) => el.id === state.selectedElementId) || null;
  }

  // 11. 우측 속성 패널 동기화
  function syncPropertyInspector(el) {
    if (!el) return;

    // 타입 배지
    const typeNames = { text: '텍스트', shape: '도형', image: '이미지', qr: 'QR코드' };
    $('#propElemTypeBadge').text(typeNames[el.type] || '요소');

    // 공통 위치 / 크기 / 회전
    $('#propX').val(Math.round(el.x));
    $('#propY').val(Math.round(el.y));
    $('#propWidth').val(Math.round(el.width));
    $('#propHeight').val(Math.round(el.height));
    $('#propRotRange').val(Math.round(el.rotation || 0));
    $('#propRotVal').text(Math.round(el.rotation || 0));

    // 섹션별 노출 제어
    $('#sectionTextProps').toggle(el.type === 'text');
    $('#sectionShapeProps').toggle(el.type === 'shape');
    $('#sectionMediaProps').toggle(el.type === 'image' || el.type === 'qr');

    if (el.type === 'text') {
      $('#propTextContent').val(el.text || '');
      $('#propFontFamily').val(el.fontFamily || 'Pretendard, sans-serif');
      $('#propFontSize').val(el.fontSize || 24);
      $('#propFontWeight').val(el.fontWeight || '400');
      $('#propTextColor').val(el.color || '#0f172a');
      $('#propTextColorHex').val(el.color || '#0f172a');
      $('#btnToggleItalic').toggleClass('active', el.fontStyle === 'italic');

      $('#btnAlignTextL').toggleClass('active', el.textAlign === 'left' || !el.textAlign);
      $('#btnAlignTextC').toggleClass('active', el.textAlign === 'center');
      $('#btnAlignTextR').toggleClass('active', el.textAlign === 'right');

    } else if (el.type === 'shape') {
      $('#propShapeFillColor').val(el.fillColor === 'transparent' ? '#ffffff' : (el.fillColor || '#2563eb'));
      $('#propShapeFillHex').val(el.fillColor || '#2563eb');
      $('#propShapeBorderColor').val(el.strokeColor || '#000000');
      $('#propShapeBorderHex').val(el.strokeColor || '#000000');
      $('#propShapeBorderWidth').val(el.strokeWidth || 0);
      $('#propShapeRadius').val(el.borderRadius || 0);
      $('#shapeRadiusWrap').toggle(el.shapeType === 'rect');

    } else if (el.type === 'image' || el.type === 'qr') {
      $('#propOpacityRange').val(el.opacity !== undefined ? el.opacity : 1);
      if (el.type === 'qr') {
        $('#qrContentEditWrap').show();
        $('#propQrContentInput').val(el.content || '');
      } else {
        $('#qrContentEditWrap').hide();
      }
    }
  }

  // 12. 히스토리 (Undo / Redo) 관리
  function pushHistoryState() {
    if (state.isHistoryBusy) return;

    // 현재 인덱스 이후 기록 정리
    if (state.historyIndex < state.history.length - 1) {
      state.history = state.history.slice(0, state.historyIndex + 1);
    }

    // 스냅샷 생성
    const snapshot = {
      specKey: state.specKey,
      orientation: state.orientation,
      bleed: state.bleed,
      currentSide: state.currentSide,
      info: JSON.parse(JSON.stringify(state.info)),
      front: JSON.parse(JSON.stringify(state.front)),
      back: JSON.parse(JSON.stringify(state.back))
    };

    state.history.push(snapshot);
    if (state.history.length > 30) {
      state.history.shift();
    }
    state.historyIndex = state.history.length - 1;

    updateUndoRedoButtons();
  }

  function undo() {
    if (state.historyIndex > 0) {
      state.isHistoryBusy = true;
      state.historyIndex--;
      restoreHistorySnapshot(state.history[state.historyIndex]);
      state.isHistoryBusy = false;
      updateUndoRedoButtons();
    }
  }

  function redo() {
    if (state.historyIndex < state.history.length - 1) {
      state.isHistoryBusy = true;
      state.historyIndex++;
      restoreHistorySnapshot(state.history[state.historyIndex]);
      state.isHistoryBusy = false;
      updateUndoRedoButtons();
    }
  }

  function restoreHistorySnapshot(snapshot) {
    if (!snapshot) return;
    state.specKey = snapshot.specKey;
    state.orientation = snapshot.orientation;
    state.bleed = snapshot.bleed;
    state.currentSide = snapshot.currentSide;
    state.info = JSON.parse(JSON.stringify(snapshot.info));
    state.front = JSON.parse(JSON.stringify(snapshot.front));
    state.back = JSON.parse(JSON.stringify(snapshot.back));

    syncFormFieldsWithState();
    updateCanvasDimensionsStyle();
    updateCanvas();
  }

  function updateUndoRedoButtons() {
    $('#btnUndo').prop('disabled', state.historyIndex <= 0);
    $('#btnRedo').prop('disabled', state.historyIndex >= state.history.length - 1);
  }

  // 13. 캔버스 화면 크기 및 반응형 비율 스타일 맞춤
  function updateCanvasDimensionsStyle() {
    const dims = getCurrentDimensions(false);
    const $wrapper = $('#cardPaperWrapper');

    // 뷰포트 폭에 맞추어 CSS width / height 계산
    const viewportWidth = $('#canvasViewport').width() || 600;
    const baseW = dims.width;
    const baseH = dims.height;

    let targetW = Math.min(viewportWidth - 60, baseW);
    let scale = targetW / baseW;
    let targetH = baseH * scale;

    // 줌 배율 적용
    scale *= state.zoom;
    targetW = baseW * scale;
    targetH = baseH * scale;

    $wrapper.css({
      width: `${targetW}px`,
      height: `${targetH}px`,
      aspectRatio: `${baseW} / ${baseH}`
    });

    $('#zoomLevelDisplay').text(`${Math.round(state.zoom * 100)}%`);
  }

  // 13-1. 캔버스 스테이지 이동 변환 (드래그 Pan 반영)
  function updateStageTransform(animate = false) {
    const $stage = $('#cardStage');
    if (animate) {
      $stage.css('transition', 'transform 0.2s cubic-bezier(0.1, 0.9, 0.2, 1)');
    } else {
      $stage.css('transition', 'none');
    }
    $stage.css('transform', `translate3d(${state.panX}px, ${state.panY}px, 0)`);
  }

  // 14. 드래그, 리사이즈, 회전 및 캔버스 Pan 포인터 이벤트 핸들러
  let dragMode = null; // 'move' | 'resize' | 'rotate'
  let resizeHandleType = null;
  let startPointer = { x: 0, y: 0 };
  let startElementRect = { x: 0, y: 0, width: 0, height: 0, rotation: 0 };
  let dragDidMove = false;

  // 캔버스 마우스 드래그 이동 (Pan) 상태
  let isPanning = false;
  let startPanPointer = { x: 0, y: 0 };
  let startPan = { x: 0, y: 0 };

  function initPointerInteractions() {
    const $overlay = $('#interactionOverlay');
    const $viewport = $('#canvasViewport');

    // 1) 뷰포트 배경 클릭 시 드래그 이동 (Canvas Pan)
    $viewport.on('pointerdown', function (e) {
      if ($(e.target).closest('#cardPaperWrapper').length) return;
      isPanning = true;
      startPanPointer = { x: e.clientX, y: e.clientY };
      startPan = { x: state.panX, y: state.panY };
      $viewport.addClass('is-panning');
      try {
        this.setPointerCapture(e.pointerId);
      } catch (_) {}
    });

    // 2) 캔버스 오버레이 클릭 시: 요소 선택 및 드래그 이동 OR 빈 공간 클릭 시 캔버스 명함 Pan 이동
    $overlay.on('pointerdown', function (e) {
      if ($(e.target).closest('.handle, .rotation-handle').length) return;

      const rect = this.getBoundingClientRect();
      const dims = getCurrentDimensions(false);
      const scaleX = dims.width / rect.width;
      const scaleY = dims.height / rect.height;

      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      // 상위 z-index 요소부터 역순 탐색
      const elements = [...state[state.currentSide].elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
      let found = null;
      const HIT_PAD = 14; // 얇은 선이나 작은 텍스트도 편하게 잡을 수 있도록 판정 여유 부여

      for (const el of elements) {
        if (el.type === 'text' && (!el.text || el.text.trim() === '')) continue;
        const elW = Math.max(el.width || 0, 20);
        const elH = Math.max(el.height || 0, 20);

        if (
          clickX >= el.x - HIT_PAD &&
          clickX <= el.x + elW + HIT_PAD &&
          clickY >= el.y - HIT_PAD &&
          clickY <= el.y + elH + HIT_PAD
        ) {
          found = el;
          break;
        }
      }

      if (found) {
        state.selectedElementId = found.id;
        updateSelectionBox();

        // 선택 요소 드래그 이동 시작
        dragMode = 'move';
        dragDidMove = false;
        startPointer = { x: e.clientX, y: e.clientY };
        startElementRect = { ...found };
        try {
          this.setPointerCapture(e.pointerId);
        } catch (_) {}
      } else {
        // 빈 공간 클릭 -> 선택 해제 및 명함 전체 드래그 이동 (Pan)
        state.selectedElementId = null;
        updateSelectionBox();

        isPanning = true;
        startPanPointer = { x: e.clientX, y: e.clientY };
        startPan = { x: state.panX, y: state.panY };
        $viewport.addClass('is-panning');
        try {
          this.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
    });

    // 리사이즈 핸들 드래그 시작
    $(document).on('pointerdown', '.handle', function (e) {
      e.stopPropagation();
      const selected = getSelectedElement();
      if (!selected) return;

      dragMode = 'resize';
      dragDidMove = false;
      resizeHandleType = $(this).data('handle');
      startPointer = { x: e.clientX, y: e.clientY };
      startElementRect = { ...selected };
      try {
        $overlay[0].setPointerCapture(e.pointerId);
      } catch (_) {}
    });

    // 회전 핸들 드래그 시작
    $(document).on('pointerdown', '.rotation-handle', function (e) {
      e.stopPropagation();
      const selected = getSelectedElement();
      if (!selected) return;

      dragMode = 'rotate';
      dragDidMove = false;
      startPointer = { x: e.clientX, y: e.clientY };
      startElementRect = { ...selected };
      $('#rotationBadge').show();
      try {
        $overlay[0].setPointerCapture(e.pointerId);
      } catch (_) {}
    });

    // 전역 포인터 이동 (캔버스 드래그 Pan 또는 요소 이동/크기조절/회전)
    $(document).on('pointermove', function (e) {
      if (isPanning) {
        const dx = e.clientX - startPanPointer.x;
        const dy = e.clientY - startPanPointer.y;
        state.panX = startPan.x + dx;
        state.panY = startPan.y + dy;
        updateStageTransform(false);
        return;
      }

      if (!dragMode) return;
      const selected = getSelectedElement();
      if (!selected) return;

      dragDidMove = true;
      const overlayEl = document.getElementById('interactionOverlay');
      if (!overlayEl) return;
      const rect = overlayEl.getBoundingClientRect();
      const dims = getCurrentDimensions(false);
      const scaleX = dims.width / rect.width;
      const scaleY = dims.height / rect.height;

      const deltaX = (e.clientX - startPointer.x) * scaleX;
      const deltaY = (e.clientY - startPointer.y) * scaleY;

      if (dragMode === 'move') {
        let newX = Math.round(startElementRect.x + deltaX);
        let newY = Math.round(startElementRect.y + deltaY);

        // 중앙 스냅 가이드라인 (가로 중앙, 세로 중앙 ±7px)
        const centerX = dims.width / 2;
        const centerY = dims.height / 2;
        const elemCenterX = newX + selected.width / 2;
        const elemCenterY = newY + selected.height / 2;

        if (Math.abs(elemCenterX - centerX) < 7) {
          newX = Math.round(centerX - selected.width / 2);
          $('#snapLineV').show();
        } else {
          $('#snapLineV').hide();
        }

        if (Math.abs(elemCenterY - centerY) < 7) {
          newY = Math.round(centerY - selected.height / 2);
          $('#snapLineH').show();
        } else {
          $('#snapLineH').hide();
        }

        selected.x = newX;
        selected.y = newY;

      } else if (dragMode === 'resize') {
        let newW = startElementRect.width;
        let newH = startElementRect.height;
        let newX = startElementRect.x;
        let newY = startElementRect.y;

        if (resizeHandleType.includes('e')) newW = Math.max(20, startElementRect.width + deltaX);
        if (resizeHandleType.includes('s')) newH = Math.max(10, startElementRect.height + deltaY);
        if (resizeHandleType.includes('w')) {
          const proposedW = startElementRect.width - deltaX;
          if (proposedW >= 20) {
            newW = proposedW;
            newX = startElementRect.x + deltaX;
          }
        }
        if (resizeHandleType.includes('n')) {
          const proposedH = startElementRect.height - deltaY;
          if (proposedH >= 10) {
            newH = proposedH;
            newY = startElementRect.y + deltaY;
          }
        }

        selected.x = Math.round(newX);
        selected.y = Math.round(newY);
        selected.width = Math.round(newW);
        selected.height = Math.round(newH);

      } else if (dragMode === 'rotate') {
        const boxRect = document.getElementById('selectionBox').getBoundingClientRect();
        const centerScreenX = boxRect.left + boxRect.width / 2;
        const centerScreenY = boxRect.top + boxRect.height / 2;

        const rad = Math.atan2(e.clientY - centerScreenY, e.clientX - centerScreenX);
        let deg = (rad * 180) / Math.PI + 90;
        if (deg < 0) deg += 360;

        // 0°, 90°, 180°, 270° 마그네틱 스냅 (±4도 이내)
        [0, 90, 180, 270, 360].forEach((snapAngle) => {
          if (Math.abs(deg - snapAngle) < 4) deg = snapAngle % 360;
        });

        selected.rotation = Math.round(deg);
      }

      updateSelectionBox();
      updateCanvas();
    });

    // 드래그 종료
    $(document).on('pointerup pointercancel', function (e) {
      if (isPanning) {
        isPanning = false;
        $viewport.removeClass('is-panning');
      }

      if (dragMode) {
        if (dragDidMove) {
          pushHistoryState();
        }
        dragMode = null;
        $('#snapLineH').hide();
        $('#snapLineV').hide();
        $('#rotationBadge').hide();
      }
    });

    // 마우스 휠 줌 및 팬 제어
    $viewport.on('wheel', function (e) {
      e.preventDefault();
      const oe = e.originalEvent;
      if (oe.ctrlKey || oe.metaKey) {
        const delta = oe.deltaY < 0 ? 0.08 : -0.08;
        state.zoom = Math.max(0.4, Math.min(2.5, state.zoom + delta));
        updateCanvasDimensionsStyle();
        updateSelectionBox();
      } else {
        state.panX -= oe.deltaX;
        state.panY -= oe.deltaY;
        updateStageTransform(false);
      }
    });

    // 뷰포트 더블클릭 시 명함 위치 및 배율 리셋 (화면 중앙 정렬)
    $viewport.on('dblclick', function (e) {
      if ($(e.target).closest('.handle, .rotation-handle, .selection-box').length) return;
      state.panX = 0;
      state.panY = 0;
      updateStageTransform(true);
    });
  }

  // 15. 입력 폼 실시간 양방향 동기화
  function initFormSync() {
    const fieldMapping = {
      inputName: 'name',
      inputNameEn: 'nameEn',
      inputTitle: 'title',
      inputCompany: 'company',
      inputDept: 'dept',
      inputPhone: 'phone',
      inputTel: 'tel',
      inputEmail: 'email',
      inputWebsite: 'website',
      inputAddress: 'address',
      inputSns: 'sns',
      inputTagline: 'tagline'
    };

    $('#cardInfoForm input').on('input', function () {
      const fieldId = $(this).attr('id');
      const key = fieldMapping[fieldId];
      if (!key) return;

      const val = $(this).val();
      state.info[key] = val;

      // 앞면 및 뒷면에 바인딩된 텍스트 요소들 실시간 갱신
      ['front', 'back'].forEach((side) => {
        state[side].elements.forEach((el) => {
          if (el.type === 'text' && el.fieldKey === key) {
            el.text = val;
          }
        });
      });

      updateCanvas();
    });

    // 샘플 데이터 채우기 버튼
    $('#btnFillSampleInfo').on('click', function () {
      state.info = {
        name: '김민수',
        nameEn: 'MINSU KIM',
        title: '수석 디자이너',
        company: '넥스트 크리에이티브',
        dept: '디자인 혁신팀',
        phone: '010-1234-5678',
        tel: '02-555-0199',
        email: 'minsu.kim@creative.kr',
        website: 'www.creative-studio.kr',
        address: '서울특별시 강남구 테헤란로 152 7층',
        sns: '@minsu_design',
        tagline: 'Design that creates meaningful moments'
      };

      syncFormFieldsWithState();
      applyTemplate(state.currentTemplate);
    });
  }

  function syncFormFieldsWithState() {
    $('#inputName').val(state.info.name || '');
    $('#inputNameEn').val(state.info.nameEn || '');
    $('#inputTitle').val(state.info.title || '');
    $('#inputCompany').val(state.info.company || '');
    $('#inputDept').val(state.info.dept || '');
    $('#inputPhone').val(state.info.phone || '');
    $('#inputTel').val(state.info.tel || '');
    $('#inputEmail').val(state.info.email || '');
    $('#inputWebsite').val(state.info.website || '');
    $('#inputAddress').val(state.info.address || '');
    $('#inputSns').val(state.info.sns || '');
    $('#inputTagline').val(state.info.tagline || '');
  }

  // 16. 템플릿 적용 함수
  function applyTemplate(tplId) {
    if (!Templates[tplId]) return;
    state.currentTemplate = tplId;
    const spec = SPECS[state.specKey] || SPECS['90x50'];

    // 세로형 템플릿의 경우 명함 방향을 세로로 자동 전환
    if (tplId === 't6') {
      state.orientation = 'portrait';
      $('#btnOrientationPortrait').addClass('active').siblings().removeClass('active');
    } else if (state.orientation === 'portrait' && tplId !== 't6') {
      state.orientation = 'landscape';
      $('#btnOrientationLandscape').addClass('active').siblings().removeClass('active');
    }

    const tplData = Templates[tplId](state.info, spec);
    state.front = tplData.front;
    state.back = tplData.back;
    state.selectedElementId = null;

    $('.template-card').removeClass('active');
    $(`.template-card[data-template-id="${tplId}"]`).addClass('active');

    updateCanvasDimensionsStyle();
    updateCanvas();
    pushHistoryState();
  }

  // 17. 툴바 및 서브패널 이벤트 연결
  function initToolEvents() {
    // 탭 전환
    $('.tool-tab-btn').on('click', function () {
      const tabId = $(this).data('tab');
      $('.tool-tab-btn').removeClass('active').attr('aria-selected', 'false');
      $(this).addClass('active').attr('aria-selected', 'true');
      $('.tab-panel').removeClass('active');
      $(`#tab-${tabId}`).addClass('active');
    });

    // 템플릿 선택
    $('.template-card').on('click', function () {
      const tplId = $(this).data('template-id');
      applyTemplate(tplId);
    });

    // 앞면 / 뒷면 전환
    $('#btnSideFront, #btnSideBack').on('click', function () {
      const isFront = $(this).attr('id') === 'btnSideFront';
      switchSide(isFront ? 'front' : 'back');
    });

    $('#btnFlipCard').on('click', function () {
      switchSide(state.currentSide === 'front' ? 'back' : 'front');
    });

    // 줌 컨트롤
    $('#btnZoomIn').on('click', function () {
      state.zoom = Math.min(2.0, state.zoom + 0.15);
      updateCanvasDimensionsStyle();
      updateSelectionBox();
    });

    $('#btnZoomOut').on('click', function () {
      state.zoom = Math.max(0.4, state.zoom - 0.15);
      updateCanvasDimensionsStyle();
      updateSelectionBox();
    });

    $('#btnZoomFit').on('click', function () {
      state.zoom = 1.0;
      state.panX = 0;
      state.panY = 0;
      updateStageTransform(true);
      updateCanvasDimensionsStyle();
      updateSelectionBox();
    });

    // 가이드라인 및 도련 토글
    $('#chkShowGuides').on('change', function () {
      state.showGuides = $(this).is(':checked');
      updateGuides();
    });

    $('#chkApplyBleed').on('change', function () {
      state.bleed = $(this).is(':checked');
      updateCanvasDimensionsStyle();
      updateCanvas();
    });

    // 명함 규격 변경
    $('.spec-box').on('click', function () {
      const spec = $(this).data('spec');
      $('.spec-box').removeClass('active');
      $(this).addClass('active');
      state.specKey = spec;
      updateCanvasDimensionsStyle();
      updateCanvas();
      pushHistoryState();
    });

    // 가로 / 세로 방향 전환
    $('#btnOrientationLandscape').on('click', function () {
      $(this).addClass('active').siblings().removeClass('active');
      state.orientation = 'landscape';
      updateCanvasDimensionsStyle();
      updateCanvas();
      pushHistoryState();
    });

    $('#btnOrientationPortrait').on('click', function () {
      $(this).addClass('active').siblings().removeClass('active');
      state.orientation = 'portrait';
      updateCanvasDimensionsStyle();
      updateCanvas();
      pushHistoryState();
    });

    // 실행 취소 & 다시 실행
    $('#btnUndo').on('click', undo);
    $('#btnRedo').on('click', redo);

    // 단축키 (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, Delete)
    $(document).on('keydown', function (e) {
      if ($(e.target).is('input, textarea, select')) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedElementId) {
          e.preventDefault();
          deleteSelectedElement();
        }
      }
    });

    // 요소 추가 버튼들 (초기 크기 및 넉넉한 히트박스 제공)
    $('#btnAddHeadingText').on('click', function () {
      addElement({
        type: 'text',
        text: '새 제목 텍스트',
        fontSize: 38,
        fontWeight: '800',
        color: '#0f172a',
        width: 260,
        height: 52
      });
    });

    $('#btnAddBodyText').on('click', function () {
      addElement({
        type: 'text',
        text: '추가 본문 안내 텍스트',
        fontSize: 20,
        fontWeight: '400',
        color: '#334155',
        width: 240,
        height: 36
      });
    });

    $('#btnAddLabelText').on('click', function () {
      addElement({
        type: 'text',
        text: 'L. 010-0000-0000',
        fontSize: 16,
        fontWeight: '500',
        color: '#64748b',
        width: 180,
        height: 30
      });
    });

    $('#btnAddRectShape').on('click', function () {
      addElement({
        type: 'shape',
        shapeType: 'rect',
        width: 160,
        height: 60,
        fillColor: '#4f46e5',
        strokeColor: '#312e81',
        strokeWidth: 0,
        borderRadius: 4
      });
    });

    $('#btnAddCircleShape').on('click', function () {
      addElement({
        type: 'shape',
        shapeType: 'circle',
        width: 100,
        height: 100,
        fillColor: 'transparent',
        strokeColor: '#0f172a',
        strokeWidth: 2
      });
    });

    $('#btnAddLineShape').on('click', function () {
      addElement({
        type: 'shape',
        shapeType: 'line',
        width: 260,
        height: 16, // 드래그 잡기가 편리하도록 16px 높이 부여 (선은 수직 중앙 렌더링)
        fillColor: '#cbd5e1',
        strokeColor: '#cbd5e1',
        strokeWidth: 2
      });
    });

    // 로고 이미지 파일 업로드
    $('#logoFileInput').on('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        alert('이미지 파일 크기는 최대 10MB까지만 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onload = function (evt) {
        const dataUrl = evt.target.result;
        const img = new Image();
        img.onload = function () {
          const aspect = img.width / img.height;
          let w = 180;
          let h = Math.round(w / aspect);
          if (h > 180) {
            h = 180;
            w = Math.round(h * aspect);
          }

          addElement({
            type: 'image',
            src: dataUrl,
            width: w,
            height: h
          });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
      $(this).val('');
    });

    // QR 코드 추가 버튼
    $('#btnAddQrCode').on('click', function () {
      const content = $('#inputQrContent').val() || 'https://example.com';
      const dark = $('#inputQrColorDark').val() || '#000000';
      const light = $('#inputQrColorLight').val() || '#ffffff';

      generateQrDataUrl(content, dark, light).then(() => {
        addElement({
          type: 'qr',
          content: content,
          qrColor: dark,
          qrBgColor: light,
          width: 160,
          height: 160
        });
      });
    });

    // 배경 디자인 제어
    $('input[name="bgTypeRadio"]').on('change', function () {
      const type = $(this).val();
      $('#bgSolidSection').toggle(type === 'solid');
      $('#bgGradientSection').toggle(type === 'gradient');
      $('#bgImageSection').toggle(type === 'image');

      state[state.currentSide].background.type = type;
      updateCanvas();
      pushHistoryState();
    });

    $('#inputBgSolidColor').on('input', function () {
      const c = $(this).val();
      $('#inputBgSolidHex').val(c);
      state[state.currentSide].background.color = c;
      updateCanvas();
    });

    $('#inputBgSolidHex').on('change', function () {
      const c = $(this).val();
      $('#inputBgSolidColor').val(c);
      state[state.currentSide].background.color = c;
      updateCanvas();
      pushHistoryState();
    });

    $('.palette-swatches .swatch').on('click', function () {
      const color = $(this).data('color');
      $('#inputBgSolidColor').val(color);
      $('#inputBgSolidHex').val(color);
      state[state.currentSide].background.color = color;
      state[state.currentSide].background.type = 'solid';
      $('input[name="bgTypeRadio"][value="solid"]').prop('checked', true).trigger('change');
      updateCanvas();
      pushHistoryState();
    });

    // 그라데이션 컬러 및 각도
    $('#inputGradColor1, #inputGradColor2').on('input', function () {
      const c1 = $('#inputGradColor1').val();
      const c2 = $('#inputGradColor2').val();
      $('#inputGradHex1').val(c1);
      $('#inputGradHex2').val(c2);

      const bg = state[state.currentSide].background;
      bg.gradient = bg.gradient || {};
      bg.gradient.color1 = c1;
      bg.gradient.color2 = c2;
      updateCanvas();
    });

    $('.btn-angle').on('click', function () {
      $('.btn-angle').removeClass('active');
      $(this).addClass('active');
      const angle = Number($(this).data('angle'));
      $('#gradAngleDisplay').text(`${angle}°`);

      const bg = state[state.currentSide].background;
      bg.gradient = bg.gradient || {};
      bg.gradient.angle = angle;
      updateCanvas();
      pushHistoryState();
    });

    // 배경 사진 업로드
    $('#bgFileInput').on('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (evt) {
        state[state.currentSide].background.type = 'image';
        state[state.currentSide].background.imageSrc = evt.target.result;
        $('#btnRemoveBgImage').show();
        updateCanvas();
        pushHistoryState();
      };
      reader.readAsDataURL(file);
      $(this).val('');
    });

    $('#btnRemoveBgImage').on('click', function () {
      state[state.currentSide].background.imageSrc = null;
      state[state.currentSide].background.type = 'solid';
      $('input[name="bgTypeRadio"][value="solid"]').prop('checked', true).trigger('change');
      $(this).hide();
      updateCanvas();
      pushHistoryState();
    });

    // 양면 복제 버튼
    $('#btnQuickDuplicateSide').on('click', function () {
      const otherSide = state.currentSide === 'front' ? 'back' : 'front';
      const sideName = state.currentSide === 'front' ? '앞면' : '뒷면';
      const otherName = otherSide === 'front' ? '앞면' : '뒷면';

      if (confirm(`현재 ${sideName}의 디자인과 요소들을 ${otherName}으로 덮어씌워 복제하시겠습니까?`)) {
        state[otherSide] = JSON.parse(JSON.stringify(state[state.currentSide]));
        alert(`${otherName}으로 복제되었습니다.`);
        pushHistoryState();
      }
    });

    // 초기화 버튼
    $('#btnResetAll').on('click', function () {
      if (confirm('현재 작업 중인 명함 내용을 모두 초기화하고 새 명함을 만드시겠습니까?')) {
        applyTemplate('t1');
      }
    });
  }

  // 18. 요소 추가 및 삭제 헬퍼 (위치 엇갈림 스폰으로 겹침 방지)
  function addElement(options = {}) {
    const dims = getCurrentDimensions(false);
    const newId = 'elem_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    const defaultWidth = options.width || (options.type === 'text' ? 240 : 160);
    const defaultHeight = options.height || (options.type === 'text' ? 40 : 60);

    // 요소들이 서로 바로 겹쳐서 가려지지 않도록 순차적 좌표 오프셋 부여
    const existingCount = state[state.currentSide].elements.length;
    const offset = (existingCount % 6) * 26;
    const centerX = Math.round((dims.width - defaultWidth) / 2);
    const centerY = Math.round((dims.height - defaultHeight) / 2);
    const spawnX = Math.min(dims.width - defaultWidth - 30, Math.max(30, centerX + offset));
    const spawnY = Math.min(dims.height - defaultHeight - 30, Math.max(30, centerY + offset));

    const newEl = {
      id: newId,
      type: options.type || 'text',
      x: spawnX,
      y: spawnY,
      width: defaultWidth,
      height: defaultHeight,
      rotation: 0,
      zIndex: (state[state.currentSide].elements.length || 0) + 1,
      opacity: 1,
      ...options
    };

    state[state.currentSide].elements.push(newEl);
    state.selectedElementId = newId;

    updateSelectionBox();
    updateCanvas();
    pushHistoryState();
  }

  function deleteSelectedElement() {
    if (!state.selectedElementId) return;
    const elements = state[state.currentSide].elements;
    const index = elements.findIndex((el) => el.id === state.selectedElementId);
    if (index !== -1) {
      elements.splice(index, 1);
      state.selectedElementId = null;
      updateSelectionBox();
      updateCanvas();
      pushHistoryState();
    }
  }

  function duplicateSelectedElement() {
    const selected = getSelectedElement();
    if (!selected) return;

    const copy = JSON.parse(JSON.stringify(selected));
    copy.id = 'elem_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    copy.x += 20;
    copy.y += 20;
    delete copy.fieldKey; // 수동 복제 요소는 폼 자동 바인딩 해제
    copy.zIndex = (state[state.currentSide].elements.length || 0) + 1;

    state[state.currentSide].elements.push(copy);
    state.selectedElementId = copy.id;

    updateSelectionBox();
    updateCanvas();
    pushHistoryState();
  }

  // 19. 앞/뒷면 전환 처리
  function switchSide(sideKey) {
    if (state.currentSide === sideKey) return;
    state.currentSide = sideKey;
    state.selectedElementId = null;

    $('#btnSideFront').toggleClass('active', sideKey === 'front');
    $('#btnSideBack').toggleClass('active', sideKey === 'back');
    $('#bgCurrentSideLabel').text(sideKey === 'front' ? '앞면' : '뒷면');

    // 배경 컨트롤 값 동기화
    const bg = state[sideKey].background;
    $(`input[name="bgTypeRadio"][value="${bg.type || 'solid'}"]`).prop('checked', true);
    $('#bgSolidSection').toggle(bg.type === 'solid');
    $('#bgGradientSection').toggle(bg.type === 'gradient');
    $('#bgImageSection').toggle(bg.type === 'image');
    $('#inputBgSolidColor').val(bg.color || '#ffffff');
    $('#inputBgSolidHex').val(bg.color || '#ffffff');

    updateSelectionBox();
    updateCanvas();
  }

  // 20. 속성 인스펙터 편집 이벤트
  function initPropertyInspectorEvents() {
    $('#btnPropDelete').on('click', deleteSelectedElement);
    $('#btnPropDuplicate').on('click', duplicateSelectedElement);

    // X, Y, W, H 수동 입력
    $('#propX').on('change', function () {
      const el = getSelectedElement();
      if (el) {
        el.x = Number($(this).val());
        updateSelectionBox();
        updateCanvas();
        pushHistoryState();
      }
    });

    $('#propY').on('change', function () {
      const el = getSelectedElement();
      if (el) {
        el.y = Number($(this).val());
        updateSelectionBox();
        updateCanvas();
        pushHistoryState();
      }
    });

    $('#propWidth').on('change', function () {
      const el = getSelectedElement();
      if (el) {
        el.width = Math.max(10, Number($(this).val()));
        updateSelectionBox();
        updateCanvas();
        pushHistoryState();
      }
    });

    $('#propHeight').on('change', function () {
      const el = getSelectedElement();
      if (el) {
        el.height = Math.max(5, Number($(this).val()));
        updateSelectionBox();
        updateCanvas();
        pushHistoryState();
      }
    });

    // 회전 슬라이더 & 리셋
    $('#propRotRange').on('input', function () {
      const deg = Number($(this).val());
      $('#propRotVal').text(deg);
      const el = getSelectedElement();
      if (el) {
        el.rotation = deg;
        updateSelectionBox();
        updateCanvas();
      }
    }).on('change', function () {
      pushHistoryState();
    });

    $('#btnResetRot').on('click', function () {
      const el = getSelectedElement();
      if (el) {
        el.rotation = 0;
        $('#propRotRange').val(0);
        $('#propRotVal').text(0);
        updateSelectionBox();
        updateCanvas();
        pushHistoryState();
      }
    });

    // 텍스트 속성
    $('#propTextContent').on('input', function () {
      const el = getSelectedElement();
      if (el && el.type === 'text') {
        el.text = $(this).val();
        updateCanvas();
      }
    }).on('change', function () {
      pushHistoryState();
    });

    $('#propFontFamily').on('change', function () {
      const el = getSelectedElement();
      if (el && el.type === 'text') {
        el.fontFamily = $(this).val();
        updateCanvas();
        pushHistoryState();
      }
    });

    $('#propFontSize').on('change', function () {
      const el = getSelectedElement();
      if (el && el.type === 'text') {
        el.fontSize = Number($(this).val());
        updateCanvas();
        pushHistoryState();
      }
    });

    $('#propFontWeight').on('change', function () {
      const el = getSelectedElement();
      if (el && el.type === 'text') {
        el.fontWeight = $(this).val();
        updateCanvas();
        pushHistoryState();
      }
    });

    $('#propTextColor').on('input', function () {
      const c = $(this).val();
      $('#propTextColorHex').val(c);
      const el = getSelectedElement();
      if (el && el.type === 'text') {
        el.color = c;
        updateCanvas();
      }
    }).on('change', function () {
      pushHistoryState();
    });

    $('#btnToggleItalic').on('click', function () {
      const el = getSelectedElement();
      if (el && el.type === 'text') {
        el.fontStyle = el.fontStyle === 'italic' ? 'normal' : 'italic';
        $(this).toggleClass('active', el.fontStyle === 'italic');
        updateCanvas();
        pushHistoryState();
      }
    });

    // 정렬 버튼들
    $('#btnAlignTextL, #btnAlignTextC, #btnAlignTextR').on('click', function () {
      const align = $(this).data('align');
      const el = getSelectedElement();
      if (el && el.type === 'text') {
        el.textAlign = align;
        $('#btnAlignTextL, #btnAlignTextC, #btnAlignTextR').removeClass('active');
        $(this).addClass('active');
        updateCanvas();
        pushHistoryState();
      }
    });

    // 도형 속성
    $('#propShapeFillColor').on('input', function () {
      const c = $(this).val();
      $('#propShapeFillHex').val(c);
      const el = getSelectedElement();
      if (el && el.type === 'shape') {
        el.fillColor = c;
        updateCanvas();
      }
    }).on('change', function () {
      pushHistoryState();
    });

    $('#propShapeBorderColor').on('input', function () {
      const c = $(this).val();
      $('#propShapeBorderHex').val(c);
      const el = getSelectedElement();
      if (el && el.type === 'shape') {
        el.strokeColor = c;
        updateCanvas();
      }
    }).on('change', function () {
      pushHistoryState();
    });

    $('#propShapeBorderWidth').on('change', function () {
      const el = getSelectedElement();
      if (el && el.type === 'shape') {
        el.strokeWidth = Number($(this).val());
        updateCanvas();
        pushHistoryState();
      }
    });

    $('#propShapeRadius').on('change', function () {
      const el = getSelectedElement();
      if (el && el.type === 'shape') {
        el.borderRadius = Number($(this).val());
        updateCanvas();
        pushHistoryState();
      }
    });

    // 투명도
    $('#propOpacityRange').on('input', function () {
      const op = Number($(this).val());
      const el = getSelectedElement();
      if (el) {
        el.opacity = op;
        updateCanvas();
      }
    }).on('change', function () {
      pushHistoryState();
    });

    // QR코드 내용 갱신
    $('#btnUpdateQrContent').on('click', function () {
      const el = getSelectedElement();
      if (el && el.type === 'qr') {
        el.content = $('#propQrContentInput').val() || 'https://example.com';
        generateQrDataUrl(el.content, el.qrColor, el.qrBgColor).then(() => {
          updateCanvas();
          pushHistoryState();
        });
      }
    });

    // 명함 기준 정렬 버튼들
    $('#btnAlignCardCenterH').on('click', function () {
      const el = getSelectedElement();
      if (!el) return;
      const dims = getCurrentDimensions(false);
      el.x = Math.round((dims.width - el.width) / 2);
      updateSelectionBox();
      updateCanvas();
      pushHistoryState();
    });

    $('#btnAlignCardCenterV').on('click', function () {
      const el = getSelectedElement();
      if (!el) return;
      const dims = getCurrentDimensions(false);
      el.y = Math.round((dims.height - el.height) / 2);
      updateSelectionBox();
      updateCanvas();
      pushHistoryState();
    });

    $('#btnAlignCardLeft').on('click', function () {
      const el = getSelectedElement();
      if (!el) return;
      el.x = 80;
      updateSelectionBox();
      updateCanvas();
      pushHistoryState();
    });

    $('#btnAlignCardRight').on('click', function () {
      const el = getSelectedElement();
      if (!el) return;
      const dims = getCurrentDimensions(false);
      el.x = dims.width - el.width - 80;
      updateSelectionBox();
      updateCanvas();
      pushHistoryState();
    });

    $('#btnAlignCardTop').on('click', function () {
      const el = getSelectedElement();
      if (!el) return;
      el.y = 80;
      updateSelectionBox();
      updateCanvas();
      pushHistoryState();
    });

    $('#btnAlignCardBottom').on('click', function () {
      const el = getSelectedElement();
      if (!el) return;
      const dims = getCurrentDimensions(false);
      el.y = dims.height - el.height - 80;
      updateSelectionBox();
      updateCanvas();
      pushHistoryState();
    });

    // 레이어 순서 관리
    $('#btnLayerFront').on('click', function () {
      changeLayerOrder('front');
    });
    $('#btnLayerForward').on('click', function () {
      changeLayerOrder('forward');
    });
    $('#btnLayerBackward').on('click', function () {
      changeLayerOrder('backward');
    });
    $('#btnLayerBack').on('click', function () {
      changeLayerOrder('back');
    });
  }

  function changeLayerOrder(action) {
    const el = getSelectedElement();
    if (!el) return;
    const elements = state[state.currentSide].elements;
    elements.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    const idx = elements.findIndex((item) => item.id === el.id);
    if (idx === -1) return;

    if (action === 'front') {
      elements.splice(idx, 1);
      elements.push(el);
    } else if (action === 'back') {
      elements.splice(idx, 1);
      elements.unshift(el);
    } else if (action === 'forward' && idx < elements.length - 1) {
      const next = elements[idx + 1];
      elements[idx + 1] = el;
      elements[idx] = next;
    } else if (action === 'backward' && idx > 0) {
      const prev = elements[idx - 1];
      elements[idx - 1] = el;
      elements[idx] = prev;
    }

    elements.forEach((item, index) => {
      item.zIndex = index + 1;
    });

    updateCanvas();
    pushHistoryState();
  }

  // 21. 고해상도 PNG 다운로드 모달 & 엔진
  function initExportEngine() {
    $('#btnOpenPngModal').on('click', function () {
      const dims = getCurrentDimensions(state.bleed);
      const resText = `${dims.width} × ${dims.height} px`;
      $('.calc-res-front, .calc-res-back').text(resText);
      $('#modalPngDownload').fadeIn(150);
    });

    $('#btnDownloadFrontPng').on('click', function () {
      downloadSideAsPng('front');
    });

    $('#btnDownloadBackPng').on('click', function () {
      downloadSideAsPng('back');
    });

    $('#btnDownloadBothPng').on('click', function () {
      downloadSideAsPng('front');
      setTimeout(() => {
        downloadSideAsPng('back');
      }, 500);
    });

    // 모달 닫기
    $(document).on('click', '[data-close]', function () {
      const modalId = $(this).data('close');
      $(`#${modalId}`).fadeOut(150);
    });
  }

  function downloadSideAsPng(sideKey) {
    preloadImagesForSide(sideKey).then((loadedImages) => {
      const offscreen = document.createElement('canvas');
      renderCard(sideKey, offscreen, { loadedImages, includeBleed: state.bleed });

      const link = document.createElement('a');
      const sideName = sideKey === 'front' ? 'front' : 'back';
      const specLabel = state.specKey;
      link.download = `business_card_${sideName}_${specLabel}.png`;
      link.href = offscreen.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // 22. 인쇄 및 PDF 저장 모달 & 엔진
  function initPrintEngine() {
    $('#btnOpenPrintModal').on('click', function () {
      $('#modalPrintOptions').fadeIn(150);
    });

    $('[data-print-target]').on('click', function () {
      $('[data-print-target]').removeClass('active');
      $(this).addClass('active');
    });

    $('#btnExecutePrint').on('click', function () {
      const target = $('[data-print-target].active').data('print-target') || 'both';
      const showCropMarks = $('#chkPrintCropMarks').is(':checked');

      $('#modalPrintOptions').fadeOut(100);

      // 인쇄 레이아웃 준비
      preparePrintLayout(target, showCropMarks).then(() => {
        window.print();
      });
    });
  }

  function preparePrintLayout(target, showCropMarks) {
    const $container = $('#printLayoutContainer');
    $container.empty().show();

    const sides = target === 'front' ? ['front'] : (target === 'back' ? ['back'] : ['front', 'back']);
    const spec = SPECS[state.specKey] || SPECS['90x50'];
    const wMm = state.orientation === 'portrait' ? spec.heightMm : spec.widthMm;
    const hMm = state.orientation === 'portrait' ? spec.widthMm : spec.heightMm;

    const promises = sides.map((sideKey) => {
      return preloadImagesForSide(sideKey).then((loadedImages) => {
        const offscreen = document.createElement('canvas');
        renderCard(sideKey, offscreen, { loadedImages, includeBleed: state.bleed });
        const dataUrl = offscreen.toDataURL('image/png');

        const cardWrap = document.createElement('div');
        cardWrap.className = 'print-card-wrapper';
        cardWrap.style.width = `${wMm}mm`;
        cardWrap.style.height = `${hMm}mm`;

        if (showCropMarks) {
          cardWrap.style.outline = '0.5px solid #94a3b8';
        }

        const img = document.createElement('img');
        img.src = dataUrl;
        img.className = 'print-card-img';
        img.style.width = '100%';
        img.style.height = '100%';
        cardWrap.appendChild(img);

        return cardWrap;
      });
    });

    return Promise.all(promises).then((cardWrappers) => {
      cardWrappers.forEach((wrap) => {
        $container.append(wrap);
      });
    });
  }

  // 23. 프로젝트 저장 / 불러오기 / JSON 내보내기 & 가져오기
  function initProjectStorage() {
    updateSavedProjectCount();

    // 프로젝트 저장
    $('#btnSaveProject').on('click', function () {
      const name = prompt('저장할 명함 프로젝트의 이름을 입력해주세요:', `${state.info.name}의 비즈니스 명함`);
      if (!name) return;

      const projects = getSavedProjects();
      if (projects.length >= 10) {
        alert('최대 10개까지만 프로젝트를 저장할 수 있습니다. 기존 프로젝트를 삭제 후 시도해주세요.');
        return;
      }

      // 썸네일 생성
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = 300;
      thumbCanvas.height = 167;
      const tCtx = thumbCanvas.getContext('2d');
      const mainCanvas = document.getElementById('businessCardCanvas');
      if (mainCanvas) {
        tCtx.drawImage(mainCanvas, 0, 0, 300, 167);
      }

      const projectData = {
        id: 'proj_' + Date.now(),
        name: name,
        date: new Date().toLocaleDateString('ko-KR'),
        thumbnail: thumbCanvas.toDataURL('image/jpeg', 0.7),
        state: {
          specKey: state.specKey,
          orientation: state.orientation,
          bleed: state.bleed,
          info: state.info,
          front: state.front,
          back: state.back,
          template: state.currentTemplate
        }
      };

      projects.unshift(projectData);
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      updateSavedProjectCount();
      alert(`'${name}' 프로젝트가 안전하게 브라우저에 저장되었습니다.`);
    });

    // 프로젝트 목록 열기
    $('#btnOpenProjectsModal').on('click', function () {
      renderSavedProjectsModal();
      $('#modalSavedProjects').fadeIn(150);
    });

    // JSON 내보내기
    $('#btnExportJson').on('click', function () {
      const exportData = {
        app: '1-Min-Challenge-Business-Card-Maker',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        specKey: state.specKey,
        orientation: state.orientation,
        bleed: state.bleed,
        info: state.info,
        front: state.front,
        back: state.back,
        template: state.currentTemplate
      };

      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `business_card_${state.info.name || 'my_card'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    // JSON 가져오기
    $('#jsonFileInput').on('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (evt) {
        try {
          const imported = JSON.parse(evt.target.result);
          if (!imported.info || !imported.front || !imported.back) {
            alert('올바른 명함 프로젝트 JSON 파일 형식이 아닙니다.');
            return;
          }

          state.specKey = imported.specKey || '90x50';
          state.orientation = imported.orientation || 'landscape';
          state.bleed = !!imported.bleed;
          state.info = imported.info;
          state.front = imported.front;
          state.back = imported.back;
          state.currentTemplate = imported.template || 't1';

          syncFormFieldsWithState();
          updateCanvasDimensionsStyle();
          updateCanvas();
          pushHistoryState();

          alert('프로젝트가 성공적으로 복원되었습니다!');
        } catch (err) {
          alert('JSON 파일을 분석하는 도중 오류가 발생했습니다: ' + err.message);
        }
      };
      reader.readAsText(file);
      $(this).val('');
    });
  }

  function getSavedProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function updateSavedProjectCount() {
    const count = getSavedProjects().length;
    $('#savedProjectCount').text(count);
    $('#modalProjectCount').text(count);
  }

  function renderSavedProjectsModal() {
    const projects = getSavedProjects();
    const $grid = $('#savedProjectsList');
    $grid.empty();

    if (projects.length === 0) {
      $grid.html('<p class="text-muted text-center" style="grid-column: 1/-1; padding: 2rem;">저장된 명함 프로젝트가 없습니다. [현재 명함 프로젝트 저장] 버튼을 눌러 디자인을 보관하세요.</p>');
      return;
    }

    projects.forEach((proj) => {
      const $card = $(`
        <div class="saved-proj-card" data-proj-id="${proj.id}">
          <div class="saved-proj-thumb">
            ${proj.thumbnail ? `<img src="${proj.thumbnail}" style="width:100%;height:100%;object-fit:cover;" alt="썸네일">` : '미리보기'}
          </div>
          <div class="saved-proj-info">
            <strong title="${proj.name}">${proj.name}</strong>
            <span>${proj.date}</span>
          </div>
          <div class="saved-proj-actions">
            <button type="button" class="btn btn-primary btn-xs flex-1 btn-load-proj">불러오기</button>
            <button type="button" class="btn btn-outline btn-xs text-danger btn-del-proj">삭제</button>
          </div>
        </div>
      `);

      $card.find('.btn-load-proj').on('click', function () {
        if (confirm(`'${proj.name}' 프로젝트를 불러오시겠습니까? 현재 작업 중인 내용은 덮어씌워집니다.`)) {
          restoreProjectState(proj.state);
          $('#modalSavedProjects').fadeOut(150);
        }
      });

      $card.find('.btn-del-proj').on('click', function () {
        if (confirm(`'${proj.name}' 프로젝트를 정말 삭제하시겠습니까?`)) {
          deleteProject(proj.id);
        }
      });

      $grid.append($card);
    });
  }

  function restoreProjectState(projState) {
    if (!projState) return;
    state.specKey = projState.specKey || '90x50';
    state.orientation = projState.orientation || 'landscape';
    state.bleed = !!projState.bleed;
    state.info = projState.info || state.info;
    state.front = projState.front || state.front;
    state.back = projState.back || state.back;
    state.currentTemplate = projState.template || 't1';

    syncFormFieldsWithState();
    updateCanvasDimensionsStyle();
    updateCanvas();
    pushHistoryState();
  }

  function deleteProject(projId) {
    let projects = getSavedProjects();
    projects = projects.filter((p) => p.id !== projId);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    updateSavedProjectCount();
    renderSavedProjectsModal();
  }

  // 24. 자동 저장 (디바운싱)
  let autoSaveTimer = null;

  function triggerAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      try {
        const payload = {
          timestamp: Date.now(),
          specKey: state.specKey,
          orientation: state.orientation,
          bleed: state.bleed,
          info: state.info,
          front: state.front,
          back: state.back,
          template: state.currentTemplate
        };
        localStorage.setItem(STORAGE_KEYS.AUTOSAVE, JSON.stringify(payload));
        $('#saveIndicator .save-status-text').text('모든 변경사항 자동 저장됨');
      } catch (e) {
        // storage overflow fallback
      }
    }, 1200);
  }

  function checkAutosaveOnLoad() {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEYS.AUTOSAVE);
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (!data || !data.info) return;

      // 10초 이내 작성이 아니면 복원 배너 표시
      $('#autosaveBanner').show();

      $('#btnResumeAutosave').on('click', function () {
        restoreProjectState(data);
        $('#autosaveBanner').slideUp(200);
      });

      $('#btnDiscardAutosave').on('click', function () {
        localStorage.removeItem(STORAGE_KEYS.AUTOSAVE);
        $('#autosaveBanner').slideUp(200);
      });
    } catch (e) {}
  }

  // 25. 윈도우 리사이즈 대응
  $(window).on('resize', function () {
    updateCanvasDimensionsStyle();
    updateSelectionBox();
  });

  // 26. 초기 구동
  $(document).ready(function () {
    initFormSync();
    initToolEvents();
    initPropertyInspectorEvents();
    initPointerInteractions();
    initExportEngine();
    initPrintEngine();
    initProjectStorage();

    // 초기 템플릿(T1 미니멀 화이트) 장착
    applyTemplate('t1');

    // 윈도우 크기에 맞추어 캔버스 배율 계산 및 스테이지 위치 초기화
    updateCanvasDimensionsStyle();
    updateStageTransform(false);
    updateCanvas();

    // 자동 저장 복원 검사
    checkAutosaveOnLoad();
  });

})(jQuery);
