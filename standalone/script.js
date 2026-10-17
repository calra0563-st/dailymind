/**
 * ==============================================================================
 * 아침 감정 체크인 - 우리 반 마음 날씨 (script.js)
 * GitHub Pages 배포용 분리 스크립트
 * ==============================================================================
 */

// 기본 학생 명단 (꽃이름 닉네임)
const DEFAULT_STUDENTS = [
  { number: 1, name: '민들레', icon: '🌼' }, { number: 2, name: '해바라기', icon: '🌻' },
  { number: 3, name: '튤립', icon: '🌷' }, { number: 4, name: '장미', icon: '🌹' },
  { number: 5, name: '코스모스', icon: '🌸' }, { number: 6, name: '수국', icon: '🪻' },
  { number: 7, name: '동백꽃', icon: '🌺' }, { number: 8, name: '수선화', icon: '🌼' },
  { number: 9, name: '제비꽃', icon: '💜' }, { number: 10, name: '안개꽃', icon: '🤍' },
  { number: 11, name: '은방울꽃', icon: '🔔' }, { number: 12, name: '라벤더', icon: '🪻' },
  { number: 13, name: '무궁화', icon: '🌺' }, { number: 14, name: '백합', icon: '💐' },
  { number: 15, name: '목련', icon: '🤍' }, { number: 16, name: '진달래', icon: '🌸' },
  { number: 17, name: '개나리', icon: '🌼' }, { number: 18, name: '연꽃', icon: '🪷' },
  { number: 19, name: '채송화', icon: '🏵️' }, { number: 20, name: '프리지아', icon: '💛' }
];

// 6가지 날씨 감정 정의
const WEATHER_OPTIONS = [
  { id: 'sunny', emoji: '☀️', title: '해가 쨍쨍한 날', sub: '아주 좋아요 / 활기차요', color: '#f59e0b', care: false },
  { id: 'cloudy', emoji: '⛅', title: '구름이 낀 날', sub: '그저 그래요 / 보통이에요', color: '#64748b', care: false },
  { id: 'rainy', emoji: '🌧️', title: '비가 오는 날', sub: '슬퍼요 / 울적하고 지쳐요', color: '#3b82f6', care: true },
  { id: 'windy', emoji: '💨', title: '바람 부는 날', sub: '싱숭생숭 / 마음이 흔들려요', color: '#06b6d4', care: false },
  { id: 'snowy', emoji: '❄️', title: '눈 오는 날', sub: '설레요 / 얼어붙은 기분이에요', color: '#8b5cf6', care: false },
  { id: 'thunder', emoji: '⚡', title: '번개 치는 날', sub: '화나요 / 짜증나고 답답해요', color: '#ef4444', care: true }
];

// 앱 전역 상태
const state = {
  students: [],
  records: [],
  selectedStudent: null,
  selectedEmotion: null,
  gasUrl: '',
  activeTab: 'student-view',
  isSubmitting: false
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  loadStoredSettings();
  renderStudentGrid();
  renderWeatherOptions();
  setupEventListeners();
  updateDashboard();
});

/**
 * 로컬 스토리지 데이터 불러오기
 */
function loadStoredSettings() {
  const savedUrl = localStorage.getItem('class_gas_url');
  if (savedUrl) {
    state.gasUrl = savedUrl;
    const urlInput = document.getElementById('gas-url-input');
    if (urlInput) urlInput.value = savedUrl;
  }

  const savedStudents = localStorage.getItem('class_students');
  if (savedStudents) {
    try {
      state.students = JSON.parse(savedStudents);
    } catch (e) {
      state.students = [...DEFAULT_STUDENTS];
    }
  } else {
    state.students = [...DEFAULT_STUDENTS];
  }

  const savedRecords = localStorage.getItem('class_emotion_records');
  if (savedRecords) {
    try {
      state.records = JSON.parse(savedRecords);
    } catch (e) {
      state.records = [];
    }
  }

  updateConnectionBadge();
}

/**
 * 구글 시트 연결 상태 배너 표시
 */
function updateConnectionBadge() {
  const banner = document.getElementById('connection-status-banner');
  if (!banner) return;

  if (state.gasUrl) {
    banner.className = 'status-banner success';
    banner.innerHTML = '<span>🟢 <strong>구글 스프레드시트 연동 중</strong> (제출 시 구글 시트에 실시간 저장됩니다)</span>';
  } else {
    banner.className = 'status-banner warning';
    banner.innerHTML = '<span>⚠️ 구글 시트 웹앱 URL이 아직 등록되지 않았습니다. <strong>[시트 연동 설정]</strong> 탭에서 URL을 등록하거나 현재 브라우저 임시 모드로 사용할 수 있습니다.</span>';
  }
}

/**
 * 학생 명단 그리드 렌더링
 */
function renderStudentGrid() {
  const grid = document.getElementById('student-grid');
  if (!grid) return;

  grid.innerHTML = '';
  const todayStr = getTodayDateString();

  state.students.forEach(student => {
    // 오늘 제출 여부 확인
    const todayRecord = state.records.find(
      r => r.number === student.number && r.timestamp.startsWith(todayStr)
    );

    const card = document.createElement('div');
    card.className = 'student-card' + 
      (state.selectedStudent && state.selectedStudent.number === student.number ? ' selected' : '') +
      (todayRecord ? ' submitted' : '');

    card.innerHTML = `
      <div class="student-num">${student.number}번 ${student.icon || '🌸'}</div>
      <div class="student-name">${escapeHtml(student.name)}</div>
      ${todayRecord ? `<span class="student-badge-today" title="${escapeHtml(todayRecord.emotion)}">${todayRecord.emotion.split(' ')[0]}</span>` : ''}
    `;

    card.addEventListener('click', () => selectStudent(student));
    grid.appendChild(card);
  });
}

/**
 * 6개 날씨 감정 옵션 버튼 렌더링
 */
function renderWeatherOptions() {
  const container = document.getElementById('weather-options');
  if (!container) return;

  container.innerHTML = '';
  WEATHER_OPTIONS.forEach(opt => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'weather-btn' + (state.selectedEmotion && state.selectedEmotion.id === opt.id ? ' active' : '');
    btn.innerHTML = `
      <span class="weather-emoji">${opt.emoji}</span>
      <span class="weather-title">${opt.title}</span>
      <span class="weather-sub">${opt.sub}</span>
    `;

    btn.addEventListener('click', () => {
      state.selectedEmotion = opt;
      renderWeatherOptions();
      validateForm();
    });

    container.appendChild(btn);
  });
}

/**
 * 학생 카드 클릭 시 선택 처리
 */
function selectStudent(student) {
  state.selectedStudent = student;
  renderStudentGrid();

  const formContainer = document.getElementById('checkin-form');
  const selectedNameEl = document.getElementById('selected-student-name');
  const selectedNumEl = document.getElementById('selected-student-num');

  if (formContainer && selectedNameEl && selectedNumEl) {
    selectedNumEl.textContent = `${student.number}번`;
    selectedNameEl.textContent = student.name;
    formContainer.classList.add('active');

    // 폼 영역으로 부드럽게 스크롤
    formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  validateForm();
}

/**
 * 이벤트 리스너 등록
 */
function setupEventListeners() {
  // 상단 네비게이션 탭 전환
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // 한줄 마음 추천 칩 클릭 이벤트
  const chips = document.querySelectorAll('.chip-btn');
  const noteInput = document.getElementById('emotion-note');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (noteInput) {
        noteInput.value = chip.textContent.trim();
        validateForm();
      }
    });
  });

  // 텍스트 입력 시 유효성 검사
  if (noteInput) {
    noteInput.addEventListener('input', validateForm);
  }

  // 폼 제출 이벤트
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleSubmit);
  }

  // 구글 시트 URL 저장 버튼
  const saveUrlBtn = document.getElementById('save-gas-url-btn');
  if (saveUrlBtn) {
    saveUrlBtn.addEventListener('click', saveGasUrl);
  }

  // 대시보드 새로고침 버튼
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      updateDashboard();
      showToast('대시보드 데이터를 새로고침했습니다.');
    });
  }

  // 대시보드 CSV 다운로드
  const exportCsvBtn = document.getElementById('export-csv-btn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportToCsv);
  }
}

/**
 * 탭 전환 함수
 */
function switchTab(tabId) {
  state.activeTab = tabId;

  // 탭 버튼 활성화 상태 변경
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 탭 패널 표시 전환
  document.querySelectorAll('.tab-pane').forEach(pane => {
    if (pane.id === tabId) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  if (tabId === 'teacher-view') {
    updateDashboard();
  }
}

/**
 * 폼 제출 가능 여부 검사
 */
function validateForm() {
  const submitBtn = document.getElementById('submit-btn');
  const noteInput = document.getElementById('emotion-note');
  if (!submitBtn) return;

  const isValid = state.selectedStudent && state.selectedEmotion && noteInput && noteInput.value.trim().length > 0;
  submitBtn.disabled = !isValid || state.isSubmitting;
}

/**
 * 감정 체크인 제출 처리
 * [핵심] GitHub Pages CORS 에러 방지를 위해 Content-Type: text/plain;charset=utf-8 로 설정하여 전송
 */
async function handleSubmit(e) {
  e.preventDefault();
  if (state.isSubmitting) return;

  const noteInput = document.getElementById('emotion-note');
  const note = noteInput ? noteInput.value.trim() : '';

  if (!state.selectedStudent || !state.selectedEmotion) {
    showToast('학생과 오늘 마음 날씨를 선택해 주세요.');
    return;
  }

  state.isSubmitting = true;
  validateForm();

  const now = new Date();
  const timestamp = formatDateTime(now);
  const emotionFull = `${state.selectedEmotion.emoji} ${state.selectedEmotion.title}`;

  const payload = {
    timestamp: timestamp,
    number: state.selectedStudent.number,
    name: state.selectedStudent.name,
    emotion: emotionFull,
    note: note
  };

  // 1. 로컬 저장 (항상 즉각 반영)
  state.records.unshift(payload);
  localStorage.setItem('class_emotion_records', JSON.stringify(state.records));

  // 2. 구글 스프레드시트 연동 전송 (URL이 등록되어 있을 때)
  if (state.gasUrl) {
    try {
      showToast('구글 스프레드시트에 저장하는 중...');
      
      /**
       * 중요: GitHub Pages에서 Apps Script로 전송 시 CORS Preflight(OPTIONS) 방지를 위해
       * Content-Type을 'text/plain;charset=utf-8'로 설정합니다.
       */
      const response = await fetch(state.gasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.status === 'success') {
        showToast(`🎉 ${state.selectedStudent.name} 학생의 감정이 구글 시트에 안전하게 기록되었습니다!`);
      } else {
        showToast('로컬에는 기록되었으나 시트 저장 중 알림: ' + (result.message || ''));
      }
    } catch (err) {
      console.warn('Apps Script 통신 안내 (CORS 또는 네트워크):', err);
      showToast(`✨ ${state.selectedStudent.name} 학생의 감정이 기록되었습니다!`);
    }
  } else {
    showToast(`✨ ${state.selectedStudent.name} 학생의 감정이 기록되었습니다! (임시 모드)`);
  }

  // 제출 완료 후 입력 폼 초기화
  if (noteInput) noteInput.value = '';
  state.selectedEmotion = null;
  state.selectedStudent = null;
  state.isSubmitting = false;

  renderWeatherOptions();
  renderStudentGrid();

  const formContainer = document.getElementById('checkin-form');
  if (formContainer) {
    formContainer.classList.remove('active');
  }

  updateDashboard();
}

/**
 * 교사용 대시보드 요약 및 통계 계산
 */
function updateDashboard() {
  const todayStr = getTodayDateString();
  const todayRecords = state.records.filter(r => r.timestamp.startsWith(todayStr));
  const totalStudents = state.students.length;
  const checkedInCount = new Set(todayRecords.map(r => r.number)).size;
  const missingCount = Math.max(0, totalStudents - checkedInCount);
  const rate = totalStudents > 0 ? Math.round((checkedInCount / totalStudents) * 100) : 0;

  // 메트릭 카드 갱신
  const totalEl = document.getElementById('metric-total');
  const checkedEl = document.getElementById('metric-checked');
  const missingEl = document.getElementById('metric-missing');
  const rateEl = document.getElementById('metric-rate');

  if (totalEl) totalEl.textContent = `${totalStudents}명`;
  if (checkedEl) checkedEl.textContent = `${checkedInCount}명`;
  if (missingEl) missingEl.textContent = `${missingCount}명`;
  if (rateEl) rateEl.textContent = `${rate}%`;

  // 날씨별 감정 집계
  const counts = {};
  WEATHER_OPTIONS.forEach(opt => counts[opt.title] = 0);
  let careStudents = [];

  todayRecords.forEach(r => {
    WEATHER_OPTIONS.forEach(opt => {
      if (r.emotion.includes(opt.title) || r.emotion.includes(opt.emoji)) {
        counts[opt.title] = (counts[opt.title] || 0) + 1;
        if (opt.care) {
          careStudents.push(r);
        }
      }
    });
  });

  // 마음 케어 알림 박스 갱신
  const careBox = document.getElementById('care-alert-box');
  const careList = document.getElementById('care-student-list');
  if (careBox && careList) {
    if (careStudents.length > 0) {
      careBox.style.display = 'block';
      careList.innerHTML = careStudents
        .map(s => `<strong>${s.number}번 ${escapeHtml(s.name)}</strong> (${s.emotion.split(' ')[0]} "${escapeHtml(s.note)}")`)
        .join(' · ');
    } else {
      careBox.style.display = 'none';
    }
  }

  // 감정 분포 막대 바 렌더링
  const distBar = document.getElementById('distribution-bar');
  if (distBar) {
    distBar.innerHTML = '';
    const totalTodayRecords = todayRecords.length;

    if (totalTodayRecords === 0) {
      distBar.innerHTML = '<div style="width: 100%; text-align: center; color: #94a3b8; font-size: 0.8rem; line-height: 28px;">아직 오늘의 체크인 기록이 없습니다.</div>';
    } else {
      WEATHER_OPTIONS.forEach(opt => {
        const count = counts[opt.title] || 0;
        if (count > 0) {
          const pct = Math.round((count / totalTodayRecords) * 100);
          const segment = document.createElement('div');
          segment.className = 'dist-segment';
          segment.style.width = `${pct}%`;
          segment.style.backgroundColor = opt.color;
          segment.title = `${opt.emoji} ${opt.title}: ${count}명 (${pct}%)`;
          segment.textContent = `${opt.emoji} ${pct}%`;
          distBar.appendChild(segment);
        }
      });
    }
  }

  // 테이블 렌더링
  const tableBody = document.getElementById('records-table-body');
  if (tableBody) {
    tableBody.innerHTML = '';
    if (todayRecords.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 2rem;">오늘 제출된 감정 기록이 없습니다.</td></tr>';
    } else {
      todayRecords.forEach(r => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${r.timestamp.split(' ')[1] || r.timestamp}</td>
          <td>${r.number}번</td>
          <td><strong>${escapeHtml(r.name)}</strong></td>
          <td>${escapeHtml(r.emotion)}</td>
          <td>${escapeHtml(r.note)}</td>
        `;
        tableBody.appendChild(row);
      });
    }
  }
}

/**
 * 구글 시트 웹앱 URL 저장
 */
function saveGasUrl() {
  const urlInput = document.getElementById('gas-url-input');
  if (!urlInput) return;

  const url = urlInput.value.trim();
  state.gasUrl = url;
  localStorage.setItem('class_gas_url', url);

  updateConnectionBadge();
  showToast('구글 스프레드시트 웹앱 URL이 저장되었습니다.');
}

/**
 * CSV 파일로 내보내기
 */
function exportToCsv() {
  if (state.records.length === 0) {
    showToast('내보낼 기록이 없습니다.');
    return;
  }

  const headers = ['일시', '번호', '이름', '감정이모지', '한줄마음'];
  const rows = state.records.map(r => [
    `"${r.timestamp}"`,
    r.number,
    `"${r.name}"`,
    `"${r.emotion}"`,
    `"${(r.note || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `우리반_감정체크인_${getTodayDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('CSV 파일이 다운로드되었습니다.');
}

/**
 * 유틸리티: 토스트 메시지
 */
function showToast(message) {
  let toast = document.getElementById('toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/**
 * 오늘 날짜 문자열 반환 (yyyy-MM-dd)
 */
function getTodayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 날짜 및 시간 포맷팅 (yyyy-MM-dd HH:mm:ss)
 */
function formatDateTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

/**
 * XSS 방지 escape 문자열
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
