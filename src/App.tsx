/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sun,
  Users,
  Calendar,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Code2,
  Settings,
  FileSpreadsheet,
  AlertCircle,
  Volume2,
  VolumeX,
  Search,
  Plus,
  Trash2,
  ShieldAlert,
  HeartHandshake
} from 'lucide-react';

// 산뜻한 파스텔톤 일러스트레이션 이미지 에셋 경로
import heroIllustration from './assets/images/morning_weather_hero_1792218704283.jpg';
import gardenIllustration from './assets/images/flower_garden_students_1792218704407.jpg';
import careIllustration from './assets/images/warm_sunshine_care_1792218704785.jpg';

// 6가지 날씨 감정 데이터 (파스텔톤 테마)
export interface WeatherEmotion {
  id: string;
  title: string;
  emoji: string;
  subtitle: string;
  colorName: string;
  pastelBg: string;
  pastelBorder: string;
  activeBorderClass: string;
  textColor: string;
  barColor: string;
  isCareNeeded: boolean;
}

export const WEATHER_OPTIONS: WeatherEmotion[] = [
  {
    id: 'sunny',
    title: '해가 쨍쨍한 날',
    emoji: '☀️',
    subtitle: '아주 좋아요 / 활기차고 신나요',
    colorName: 'amber',
    pastelBg: 'bg-amber-50/80 hover:bg-amber-100/90',
    pastelBorder: 'border-amber-200/80',
    activeBorderClass: 'border-amber-400 bg-amber-100/90 ring-3 ring-amber-300/60 shadow-sm',
    textColor: 'text-amber-900',
    barColor: '#fbbf24',
    isCareNeeded: false,
  },
  {
    id: 'cloudy',
    title: '구름이 낀 날',
    emoji: '⛅',
    subtitle: '그저 그래요 / 보통이에요 / 차분해요',
    colorName: 'slate',
    pastelBg: 'bg-slate-50/90 hover:bg-slate-100/90',
    pastelBorder: 'border-slate-200/80',
    activeBorderClass: 'border-slate-400 bg-slate-100 ring-3 ring-slate-300/60 shadow-sm',
    textColor: 'text-slate-800',
    barColor: '#94a3b8',
    isCareNeeded: false,
  },
  {
    id: 'rainy',
    title: '비가 오는 날',
    emoji: '🌧️',
    subtitle: '슬퍼요 / 울적해요 / 지치고 힘들어요',
    colorName: 'blue',
    pastelBg: 'bg-sky-50/90 hover:bg-sky-100/90',
    pastelBorder: 'border-sky-200/80',
    activeBorderClass: 'border-sky-400 bg-sky-100 ring-3 ring-sky-300/60 shadow-sm',
    textColor: 'text-sky-900',
    barColor: '#60a5fa',
    isCareNeeded: true,
  },
  {
    id: 'windy',
    title: '바람 부는 날',
    emoji: '💨',
    subtitle: '싱숭생숭해요 / 마음이 흔들려요 / 불안해요',
    colorName: 'teal',
    pastelBg: 'bg-teal-50/90 hover:bg-teal-100/90',
    pastelBorder: 'border-teal-200/80',
    activeBorderClass: 'border-teal-400 bg-teal-100 ring-3 ring-teal-300/60 shadow-sm',
    textColor: 'text-teal-900',
    barColor: '#2dd4bf',
    isCareNeeded: false,
  },
  {
    id: 'snowy',
    title: '눈 오는 날',
    emoji: '❄️',
    subtitle: '설레요 / 차분하고 포근해요 / 얼어붙었어요',
    colorName: 'purple',
    pastelBg: 'bg-purple-50/90 hover:bg-purple-100/90',
    pastelBorder: 'border-purple-200/80',
    activeBorderClass: 'border-purple-400 bg-purple-100 ring-3 ring-purple-300/60 shadow-sm',
    textColor: 'text-purple-900',
    barColor: '#c084fc',
    isCareNeeded: false,
  },
  {
    id: 'thunder',
    title: '번개 치는 날',
    emoji: '⚡',
    subtitle: '화나요 / 짜증나요 / 답답해요',
    colorName: 'rose',
    pastelBg: 'bg-rose-50/90 hover:bg-rose-100/90',
    pastelBorder: 'border-rose-200/80',
    activeBorderClass: 'border-rose-400 bg-rose-100 ring-3 ring-rose-300/60 shadow-sm',
    textColor: 'text-rose-900',
    barColor: '#fb7185',
    isCareNeeded: true,
  },
];

export interface Student {
  number: number;
  name: string; // 꽃이름 닉네임
  flowerEmoji?: string;
}

export interface EmotionRecord {
  id: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  number: number;
  name: string;
  emotion: string; // e.g. "☀️ 해가 쨍쨍한 날"
  note: string;
}

// 꽃이름 닉네임 기본 학생 명단
const DEFAULT_FLOWER_STUDENTS: Student[] = [
  { number: 1, name: '민들레', flowerEmoji: '🌼' },
  { number: 2, name: '해바라기', flowerEmoji: '🌻' },
  { number: 3, name: '튤립', flowerEmoji: '🌷' },
  { number: 4, name: '장미', flowerEmoji: '🌹' },
  { number: 5, name: '코스모스', flowerEmoji: '🌸' },
  { number: 6, name: '수국', flowerEmoji: '🪻' },
  { number: 7, name: '동백꽃', flowerEmoji: '🌺' },
  { number: 8, name: '수선화', flowerEmoji: '🌼' },
  { number: 9, name: '제비꽃', flowerEmoji: '💜' },
  { number: 10, name: '안개꽃', flowerEmoji: '🤍' },
  { number: 11, name: '은방울꽃', flowerEmoji: '🔔' },
  { number: 12, name: '라벤더', flowerEmoji: '🪻' },
  { number: 13, name: '무궁화', flowerEmoji: '🌺' },
  { number: 14, name: '백합', flowerEmoji: '💐' },
  { number: 15, name: '목련', flowerEmoji: '🤍' },
  { number: 16, name: '진달래', flowerEmoji: '🌸' },
  { number: 17, name: '개나리', flowerEmoji: '🌼' },
  { number: 18, name: '연꽃', flowerEmoji: '🪷' },
  { number: 19, name: '채송화', flowerEmoji: '🏵️' },
  { number: 20, name: '프리지아', flowerEmoji: '💛' },
];

const QUICK_SUGGESTIONS = [
  '푹 자서 기분이 상쾌해요 🌿',
  '오늘 미술 시간이 기대돼요 🎨',
  '숙제를 깜빡해서 걱정돼요 💧',
  '아침에 늦잠 자서 피곤해요 😴',
  '친구랑 재미있게 놀고 싶어요 🧸',
  '화단에 핀 꽃이 예뻐서 기뻐요 🌸',
  '몸이 조금 으슬으슬 감기 기운이 있어요 🧣',
  '오늘 맛있는 급식이 기다려져요 🍱',
];

// 간단한 따뜻한 효과음 합성 함수 (Web Audio API)
const playChimeSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.55);
    });
  } catch {
    // 오디오 미지원 환경 무시
  }
};

export default function App() {
  // 전역 상태
  const [activeTab, setActiveTab] = useState<'checkin' | 'dashboard' | 'roster' | 'code'>('checkin');
  
  // 학생 명단: 꽃이름 닉네임 기본 적용
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('class_students');
    if (!saved) return DEFAULT_FLOWER_STUDENTS;
    try {
      const parsed = JSON.parse(saved);
      // 기존 사람 이름(김민준 등)으로 저장된 경우 꽃이름 닉네임으로 자동 전환
      const hasOldNames = parsed.some((s: Student) => s.name === '김민준' || s.name === '이서연');
      if (hasOldNames) return DEFAULT_FLOWER_STUDENTS;
      return parsed;
    } catch {
      return DEFAULT_FLOWER_STUDENTS;
    }
  });

  const [records, setRecords] = useState<EmotionRecord[]>(() => {
    const saved = localStorage.getItem('class_emotion_records');
    return saved ? JSON.parse(saved) : [];
  });
  const [gasUrl, setGasUrl] = useState<string>(() => {
    return localStorage.getItem('class_gas_url') || '';
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // 학생 체크인 폼 상태
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<WeatherEmotion | null>(null);
  const [oneLineNote, setOneLineNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // 대시보드 상태
  const [dashboardFilter, setDashboardFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // 코드 뷰어 탭
  const [codeViewerTab, setCodeViewerTab] = useState<'codegs' | 'indexhtml' | 'stylecss' | 'scriptjs'>('codegs');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<string>('');

  // 신규 학생 추가 입력 상태
  const [newNum, setNewNum] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newEmoji, setNewEmoji] = useState<string>('🌸');

  const formRef = useRef<HTMLDivElement>(null);

  // 로컬 저장소 동기화
  useEffect(() => {
    localStorage.setItem('class_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('class_emotion_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('class_gas_url', gasUrl);
  }, [gasUrl]);

  // 오늘 날짜 포맷
  const todayFormatted = useMemo(() => {
    const d = new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]}요일)`;
  }, []);

  // 오늘 제출된 기록들
  const todayRecords = useMemo(() => {
    return records.filter((r) => r.timestamp.startsWith(selectedDate));
  }, [records, selectedDate]);

  // 학생별 오늘 제출 기록 맵
  const studentTodayRecordMap = useMemo(() => {
    const map = new Map<number, EmotionRecord>();
    todayRecords.forEach((r) => {
      map.set(r.number, r);
    });
    return map;
  }, [todayRecords]);

  // 대시보드 통계 계산
  const stats = useMemo(() => {
    const total = students.length;
    const submittedCount = studentTodayRecordMap.size;
    const missingCount = Math.max(0, total - submittedCount);
    const rate = total > 0 ? Math.round((submittedCount / total) * 100) : 0;

    // 날씨별 카운트
    const weatherCounts: Record<string, number> = {};
    WEATHER_OPTIONS.forEach((w) => {
      weatherCounts[w.title] = 0;
    });

    const careStudents: EmotionRecord[] = [];

    todayRecords.forEach((r) => {
      WEATHER_OPTIONS.forEach((w) => {
        if (r.emotion.includes(w.title) || r.emotion.includes(w.emoji)) {
          weatherCounts[w.title] = (weatherCounts[w.title] || 0) + 1;
          if (w.isCareNeeded) {
            careStudents.push(r);
          }
        }
      });
    });

    return { total, submittedCount, missingCount, rate, weatherCounts, careStudents };
  }, [students, studentTodayRecordMap, todayRecords]);

  // 학생 카드 클릭 시 선택 처리
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    const existing = studentTodayRecordMap.get(student.number);
    if (existing) {
      const matchEmotion = WEATHER_OPTIONS.find((w) => existing.emotion.includes(w.title));
      if (matchEmotion) setSelectedEmotion(matchEmotion);
      setOneLineNote(existing.note || '');
    } else {
      setSelectedEmotion(null);
      setOneLineNote('');
    }

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  // 감정 체크인 제출
  const handleSubmitCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedEmotion || !oneLineNote.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitFeedback(null);

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const fullEmotion = `${selectedEmotion.emoji} ${selectedEmotion.title}`;

    const newRecord: EmotionRecord = {
      id: `${Date.now()}-${selectedStudent.number}`,
      timestamp,
      number: selectedStudent.number,
      name: selectedStudent.name,
      emotion: fullEmotion,
      note: oneLineNote.trim(),
    };

    // 1. 로컬 저장소 우선 반영
    setRecords((prev) => [newRecord, ...prev.filter((r) => !(r.number === selectedStudent.number && r.timestamp.startsWith(selectedDate)))]);

    // 2. 구글 스프레드시트 Apps Script 웹앱 전송
    let sheetSaved = false;
    if (gasUrl && gasUrl.startsWith('http')) {
      try {
        /**
         * [주요 요구사항 반영]
         * GitHub Pages 및 브라우저에서 CORS Preflight (OPTIONS) 방지를 위해
         * Content-Type을 'text/plain;charset=utf-8'로 전송합니다.
         */
        const res = await fetch(gasUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            timestamp: newRecord.timestamp,
            number: newRecord.number,
            name: newRecord.name,
            emotion: newRecord.emotion,
            note: newRecord.note,
          }),
        });

        if (res.ok) {
          sheetSaved = true;
        }
      } catch (err) {
        console.warn('Apps Script 네트워크 통신 안내:', err);
      }
    }

    if (isSoundEnabled) {
      playChimeSound();
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f472b6', '#fbbf24', '#34d399', '#818cf8', '#fb7185'],
    });

    const msg = sheetSaved
      ? `🎉 '${selectedStudent.name}' 친구의 마음 날씨가 구글 시트에 안전하게 저장되었어요!`
      : `✨ '${selectedStudent.name}' 친구의 체크인이 완료되었어요! ${!gasUrl ? '(임시 로컬 모드)' : ''}`;

    setSubmitFeedback({ message: msg, type: 'success' });
    setIsSubmitting(false);

    // 폼 정리
    setSelectedStudent(null);
    setSelectedEmotion(null);
    setOneLineNote('');

    setTimeout(() => {
      setSubmitFeedback(null);
    }, 4500);
  };

  // 샘플 데이터 자동 채우기 (꽃이름 학생 기준)
  const handleFillSampleRecords = () => {
    const sampleNotes = [
      '햇살이 따뜻해서 기분이 좋아요! 🌼',
      '오늘 미술 시간에 종이접기가 기대돼요. 🎨',
      '어젯밤에 늦게 자서 조금 졸려요. 💤',
      '숙제를 집에 두고 와서 마음이 쿵쾅거려요. 💧',
      '친구와 쉬는 시간에 놀기로 해서 설레요! 🧸',
      '아침에 동생이랑 다퉈서 속상했어요. ⚡',
      '오늘 급식에 맛있는 반찬이 나와서 기뻐요! 🍱',
      '날씨가 맑아서 체육 시간이 기다려져요. ☀️',
    ];

    const newSampleRecords: EmotionRecord[] = [];
    const pad = (n: number) => String(n).padStart(2, '0');

    students.slice(0, 16).forEach((stu, idx) => {
      const weather = WEATHER_OPTIONS[idx % WEATHER_OPTIONS.length];
      const timeStr = `${selectedDate} ${pad(8)}:${pad(20 + idx)}:${pad((idx * 3) % 60)}`;
      newSampleRecords.push({
        id: `sample-${Date.now()}-${stu.number}`,
        timestamp: timeStr,
        number: stu.number,
        name: stu.name,
        emotion: `${weather.emoji} ${weather.title}`,
        note: sampleNotes[idx % sampleNotes.length],
      });
    });

    setRecords((prev) => [...newSampleRecords, ...prev.filter((r) => !r.timestamp.startsWith(selectedDate))]);
    setSubmitFeedback({ message: '꽃이름 친구들 16명의 샘플 체크인 데이터가 입력되었어요! 대시보드를 확인해보세요.', type: 'info' });
    setTimeout(() => setSubmitFeedback(null), 3000);
  };

  // CSV 내보내기
  const handleExportCSV = () => {
    if (records.length === 0) {
      alert('내보낼 감정 기록이 없습니다.');
      return;
    }
    const headers = ['일시', '번호', '꽃이름(닉네임)', '감정이모지', '한줄마음'];
    const rows = records.map((r) => [
      `"${r.timestamp}"`,
      r.number,
      `"${r.name}"`,
      `"${r.emotion}"`,
      `"${(r.note || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `우리반_꽃이름_감정기록_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 알림 텍스트 복사 (학급 일지 / 알림장용)
  const handleCopySummaryText = () => {
    const text = `[${selectedDate} 우리 반 꽃밭 아침 마음 날씨 요약]
🌸 총 인원: ${stats.total}명 중 ${stats.submittedCount}명 체크인 완료 (참여율 ${stats.rate}%)
🌈 마음 날씨 분포:
  ☀️ 해가 쨍쨍: ${stats.weatherCounts['해가 쨍쨍한 날'] || 0}명
  ⛅ 구름 낌: ${stats.weatherCounts['구름이 낀 날'] || 0}명
  🌧️ 비 옴: ${stats.weatherCounts['비가 오는 날'] || 0}명
  💨 바람 붊: ${stats.weatherCounts['바람 부는 날'] || 0}명
  ❄️ 눈 옴: ${stats.weatherCounts['눈 오는 날'] || 0}명
  ⚡ 번개 침: ${stats.weatherCounts['번개 치는 날'] || 0}명
💌 따뜻한 돌봄이 필요한 꽃: ${stats.careStudents.length > 0 ? stats.careStudents.map((s) => `${s.number}번 ${s.name}`).join(', ') : '없음'}`;

    navigator.clipboard.writeText(text);
    alert('학급 감정 요약 내용이 복사되었습니다.');
  };

  // 스프레드시트 웹앱 연결 테스트
  const handleTestConnection = async () => {
    if (!gasUrl.trim()) {
      setTestStatus('웹앱 URL을 먼저 입력해주세요.');
      return;
    }
    setTestStatus('연결 테스트 중...');
    try {
      const res = await fetch(`${gasUrl}${gasUrl.includes('?') ? '&' : '?'}action=ping`);
      const data = await res.json();
      if (data.status === 'success') {
        setTestStatus(`✅ 연결 성공! (${data.message || '정상 통신'})`);
      } else {
        setTestStatus(`⚠️ 응답 수신됨: ${data.message}`);
      }
    } catch {
      setTestStatus('💡 Apps Script의 웹앱 배포 권한이 [모든 사용자(Anyone)]로 설정되었는지 확인해 주세요.');
    }
  };

  // 신규 학생 추가
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newNum, 10);
    const name = newName.trim();
    if (isNaN(num) || num <= 0 || !name) return;

    if (students.some((s) => s.number === num)) {
      alert(`${num}번 학생이 이미 존재합니다.`);
      return;
    }

    const updated = [...students, { number: num, name, flowerEmoji: newEmoji || '🌸' }].sort((a, b) => a.number - b.number);
    setStudents(updated);
    setNewNum('');
    setNewName('');
  };

  const handleDeleteStudent = (num: number) => {
    if (confirm(`${num}번 학생을 명단에서 삭제하시겠습니까?`)) {
      setStudents(students.filter((s) => s.number !== num));
    }
  };

  const handleResetFlowerStudents = () => {
    if (confirm('학생 명단을 기본 20개의 예쁜 꽃이름 닉네임으로 초기화하시겠습니까?')) {
      setStudents(DEFAULT_FLOWER_STUDENTS);
    }
  };

  const handleCopyCode = (code: string, fileName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 flex flex-col font-sans">
      {/* 1. 상단 Top Navigation Bar (3-Zone Contract, 파스텔 헤더) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-amber-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: 브랜드 타이틀 (꽃밭 테마) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-2xl select-none" role="img" aria-label="flower weather">
              🌸
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-slate-800 whitespace-nowrap">
                우리 반 꽃밭 마음 날씨
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100/80 text-pink-700 font-semibold hidden sm:inline">
                아침 감정 체크인
              </span>
            </div>
          </div>

          {/* Zone 2: 4개 단정하고 부드러운 네비게이션 탭 */}
          <nav className="flex items-center gap-1 sm:gap-1.5 bg-amber-50/70 border border-amber-100/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('checkin')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'checkin'
                  ? 'bg-white text-amber-900 shadow-xs border border-amber-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>학생 체크인</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>선생님 대시보드</span>
              {stats.careStudents.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" title="케어 필요 학생 있음" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 hidden md:flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-emerald-500" />
              <span>꽃이름 명단</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-white text-sky-900 shadow-xs border border-sky-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-sky-500" />
              <span>시트 & 코드</span>
            </button>
          </nav>

          {/* Zone 3: 단일 주요 액션 / 유틸리티 */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              title={isSoundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-amber-100/60 rounded-lg transition-colors"
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={handleExportCSV}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-amber-200/70 rounded-lg hover:bg-amber-50/60 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>CSV 저장</span>
            </button>
          </div>
        </div>
      </header>

      {/* 실시간 알림 피드백 배너 */}
      {submitFeedback && (
        <div
          className={`px-4 py-2.5 text-center text-sm font-bold transition-all shadow-xs ${
            submitFeedback.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-indigo-500 text-white'
          }`}
        >
          {submitFeedback.message}
        </div>
      )}

      {/* 2. 메인 콘텐츠 뷰 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ============================================================== */}
        {/* TAB 1: 학생 감정 체크인 모드 (파스텔 & 일러스트레이션) */}
        {/* ============================================================== */}
        {activeTab === 'checkin' && (
          <div className="space-y-6">
            {/* 상단 파스텔 일러스트레이션 히어로 배너 */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-50/90 via-rose-50/80 to-sky-50/90 border border-amber-100 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 z-10">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{todayFormatted}</span>
                  <span className="text-amber-300">·</span>
                  <span className="bg-white/80 px-2 py-0.5 rounded-full border border-amber-200/60">
                    체크인 완료 {stats.submittedCount}/{stats.total}송이
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 leading-tight">
                  오늘 내 마음의 날씨는 어떤가요? 🌤️
                </h1>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  자신의 예쁜 <strong>꽃이름 닉네임</strong>을 누르고, 지금 내 마음과 가장 닮은 날씨와 한 줄 이야기를 남겨주세요.
                </p>

                <div className="flex items-center gap-2.5 mt-4 pt-2">
                  <button
                    onClick={handleFillSampleRecords}
                    className="text-xs px-3.5 py-1.5 font-bold text-pink-700 bg-white/90 border border-pink-200 rounded-xl hover:bg-pink-50 transition-colors shadow-2xs"
                  >
                    ✨ 예시 데이터 채워보기
                  </button>
                  {gasUrl ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1.5 rounded-xl border border-emerald-200/70">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      구글 시트 실시간 연동 중
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveTab('code')}
                      className="text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-200 hover:bg-amber-200/80 transition-colors"
                    >
                      시트 연동 설정 ⚙️
                    </button>
                  )}
                </div>
              </div>

              {/* 산뜻한 파스텔 수채화 일러스트레이션 */}
              <div className="w-full md:w-80 h-44 sm:h-48 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-amber-50">
                <img
                  src={heroIllustration}
                  alt="상쾌한 아침 햇살과 교실 창문 일러스트"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 1단계: 학생 명단 꽃밭 그리드 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-100 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-amber-50">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <span>내 꽃이름 닉네임 선택하기</span>
                      <span className="text-xs font-normal text-slate-500">
                        (클릭하면 오늘 마음을 남길 수 있어요)
                      </span>
                    </h2>
                  </div>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    피어난 꽃 {stats.submittedCount}송이
                  </span>
                  <span>/</span>
                  <span>남은 친구 {stats.missingCount}명</span>
                </div>
              </div>

              {/* 20명 꽃이름 카드 그리드 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2.5">
                {students.map((student) => {
                  const isSelected = selectedStudent?.number === student.number;
                  const todayRecord = studentTodayRecordMap.get(student.number);
                  const flower = student.flowerEmoji || '🌸';

                  return (
                    <button
                      key={student.number}
                      type="button"
                      onClick={() => handleSelectStudent(student)}
                      className={`relative p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-pink-400 bg-pink-50/90 ring-3 ring-pink-300/60 shadow-sm scale-[1.02]'
                          : todayRecord
                          ? 'border-emerald-200/90 bg-emerald-50/50 hover:bg-emerald-50'
                          : 'border-amber-100/90 bg-[#fffdf9] hover:border-amber-200 hover:bg-amber-50/50'
                      }`}
                    >
                      {todayRecord && (
                        <span className="absolute top-1.5 right-1.5 text-emerald-500 font-bold text-xs">
                          ✓
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-slate-400 mb-0.5">
                        {student.number}번
                      </span>
                      <span className="text-xl my-0.5" role="img" aria-label={student.name}>
                        {flower}
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate max-w-full">
                        {student.name}
                      </span>
                      {todayRecord && (
                        <span className="text-[11px] mt-1 font-semibold text-slate-600 bg-white/80 px-1.5 py-0.2 rounded-full border border-slate-200/60">
                          {todayRecord.emotion.split(' ')[0]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2단계 & 3단계: 선택된 학생의 체크인 폼 */}
            {selectedStudent && (
              <div
                ref={formRef}
                className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-pink-300 shadow-md transition-all animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between pb-4 border-b border-pink-100 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-pink-500 text-white font-extrabold text-xs shadow-2xs">
                      {selectedStudent.number}번 {selectedStudent.flowerEmoji || '🌸'}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-800">
                      '{selectedStudent.name}' 친구의 오늘 마음 날씨 체크인
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                  >
                    선택 취소
                  </button>
                </div>

                <form onSubmit={handleSubmitCheckin} className="space-y-6">
                  {/* 날씨 감정 6가지 선택 버튼 */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center">
                        2
                      </span>
                      <label className="text-sm font-bold text-slate-800">
                        지금 내 마음과 가장 닮은 날씨를 골라주세요
                      </label>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                      {WEATHER_OPTIONS.map((weather) => {
                        const isChosen = selectedEmotion?.id === weather.id;
                        return (
                          <button
                            key={weather.id}
                            type="button"
                            onClick={() => setSelectedEmotion(weather)}
                            className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                              isChosen
                                ? weather.activeBorderClass
                                : `${weather.pastelBorder} ${weather.pastelBg}`
                            }`}
                          >
                            <span className="text-3xl leading-none" role="img" aria-label={weather.title}>
                              {weather.emoji}
                            </span>
                            <span className={`text-sm font-bold ${weather.textColor}`}>
                              {weather.title}
                            </span>
                            <span className="text-xs text-slate-500">
                              {weather.subtitle}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3단계: 한 줄 이유 적기 */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center">
                        3
                      </span>
                      <label htmlFor="student-note" className="text-sm font-bold text-slate-800">
                        왜 그런 마음 날씨가 되었는지 짧은 한 줄로 적어주세요
                      </label>
                    </div>

                    <input
                      id="student-note"
                      type="text"
                      value={oneLineNote}
                      onChange={(e) => setOneLineNote(e.target.value)}
                      placeholder="예: 푹 자서 기분이 상쾌해요! / 친구와 재미있는 놀이를 해서 신나요."
                      maxLength={120}
                      className="w-full px-4 py-3 rounded-2xl border border-amber-200/80 focus:outline-none focus:ring-3 focus:ring-pink-300 focus:border-pink-400 text-sm bg-white"
                      required
                    />

                    {/* 추천 빠른 문구 칩 */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      <span className="text-xs text-slate-400 self-center mr-1">추천:</span>
                      {QUICK_SUGGESTIONS.map((phrase, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setOneLineNote(phrase)}
                          className="px-3 py-1 text-xs rounded-full bg-amber-50 hover:bg-pink-100 hover:text-pink-800 text-slate-600 border border-amber-200/70 transition-colors"
                        >
                          {phrase}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 제출하기 버튼 */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!selectedEmotion || !oneLineNote.trim() || isSubmitting}
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-base text-white transition-all shadow-sm flex items-center justify-center gap-2 ${
                        !selectedEmotion || !oneLineNote.trim() || isSubmitting
                          ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                          : 'bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 active:scale-[0.99] cursor-pointer'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>구글 시트에 소중히 기록 중...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>'{selectedStudent.name}' 친구의 마음 날씨 제출하기</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: 교사용 대시보드 (Teacher Dashboard) */}
        {/* ============================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 상단 날짜 및 필터 헤더 */}
            <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
                  우리 반 감정 현황 요약 대시보드 📊
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  오늘 꽃이름 친구들의 감정 분포와 실시간 체크인 현황을 모니터링합니다.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3.5 py-1.5 text-xs sm:text-sm border border-amber-200 rounded-xl text-slate-700 bg-white"
                />
                <button
                  onClick={handleCopySummaryText}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-600" />
                  <span>요약 복사</span>
                </button>
              </div>
            </div>

            {/* 통계 요약 4대 KPI 메트릭 카드 (파스텔 톤) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-amber-50/70 to-white p-5 rounded-3xl border border-amber-200/70 shadow-2xs">
                <div className="text-xs font-bold text-slate-500">전체 꽃친구</div>
                <div className="text-3xl font-black text-slate-800 mt-1 tabular-nums">
                  {stats.total}명
                </div>
                <div className="text-xs text-slate-400 mt-1">우리 반 등록 인원</div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50/70 to-white p-5 rounded-3xl border border-emerald-200/70 shadow-2xs">
                <div className="text-xs font-bold text-emerald-700">오늘 피어난 마음</div>
                <div className="text-3xl font-black text-emerald-700 mt-1 tabular-nums">
                  {stats.submittedCount}명
                </div>
                <div className="text-xs text-emerald-600 mt-1">참여율 {stats.rate}%</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50/70 to-white p-5 rounded-3xl border border-orange-200/70 shadow-2xs">
                <div className="text-xs font-bold text-orange-700">체크인 대기 중</div>
                <div className="text-3xl font-black text-orange-700 mt-1 tabular-nums">
                  {stats.missingCount}명
                </div>
                <div className="text-xs text-orange-600 mt-1">미제출 학생</div>
              </div>

              <div className="bg-gradient-to-br from-rose-50/70 to-white p-5 rounded-3xl border border-rose-200/70 shadow-2xs">
                <div className="text-xs font-bold text-rose-700">마음 케어 필요</div>
                <div className="text-3xl font-black text-rose-700 mt-1 tabular-nums">
                  {stats.careStudents.length}명
                </div>
                <div className="text-xs text-rose-600 mt-1">비(🌧️)·번개(⚡) 선택</div>
              </div>
            </div>

            {/* 마인드 케어 알리미 (산뜻한 일러스트레이션 포함) */}
            {stats.careStudents.length > 0 && (
              <div className="bg-gradient-to-r from-rose-50/90 via-pink-50/80 to-amber-50/90 border-2 border-rose-200/90 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-56 h-36 rounded-2xl overflow-hidden border-2 border-white shadow-xs shrink-0 bg-rose-50">
                  <img
                    src={careIllustration}
                    alt="비구름 속 따뜻한 햇살 일러스트"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-rose-800 font-extrabold text-base mb-1.5">
                    <HeartHandshake className="w-5 h-5 text-rose-600" />
                    <span>오늘 아침 따뜻한 눈맞춤과 토닥임이 필요한 꽃친구</span>
                  </div>
                  <p className="text-xs text-rose-700 mb-3 leading-relaxed">
                    비나 번개 날씨를 골라 마음이 지치거나 화가 난 학생입니다. 아침 조회 시간에 조용히 다가가 따뜻한 관심의 한마디를 건네주세요.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {stats.careStudents.map((care) => (
                      <div
                        key={care.id}
                        className="bg-white/95 p-3.5 rounded-2xl border border-rose-200 flex items-start gap-3 shadow-2xs"
                      >
                        <span className="text-2xl leading-none">{care.emotion.split(' ')[0]}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-extrabold text-slate-800">
                              {care.number}번 {care.name}
                            </span>
                            <span className="text-xs text-slate-400">{care.timestamp.split(' ')[1]}</span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1 italic line-clamp-2">
                            "{care.note}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 감정 날씨 분포 게이지 차트 & 필터 */}
            <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-extrabold text-slate-800">
                  오늘의 마음 날씨 분포 비율
                </h2>
                <span className="text-xs text-slate-400">
                  {todayRecords.length > 0 ? `총 ${todayRecords.length}송이 기록` : '기록 없음'}
                </span>
              </div>

              {/* 분포 바 */}
              <div className="h-8 w-full bg-slate-100 rounded-2xl overflow-hidden flex shadow-inner mb-4">
                {todayRecords.length === 0 ? (
                  <div className="w-full text-center text-xs text-slate-400 leading-8 font-medium">
                    아직 기록된 감정이 없습니다.
                  </div>
                ) : (
                  WEATHER_OPTIONS.map((w) => {
                    const count = stats.weatherCounts[w.title] || 0;
                    if (count === 0) return null;
                    const pct = Math.round((count / todayRecords.length) * 100);
                    return (
                      <div
                        key={w.id}
                        style={{ width: `${pct}%`, backgroundColor: w.barColor }}
                        className="h-full flex items-center justify-center text-xs font-bold text-white transition-all shadow-2xs"
                        title={`${w.title}: ${count}명 (${pct}%)`}
                      >
                        {pct >= 10 ? `${w.emoji} ${pct}%` : w.emoji}
                      </div>
                    );
                  })
                )}
              </div>

              {/* 날씨별 범례 및 인터랙티브 필터 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {WEATHER_OPTIONS.map((w) => {
                  const count = stats.weatherCounts[w.title] || 0;
                  const isActive = dashboardFilter === w.title;
                  return (
                    <button
                      key={w.id}
                      onClick={() => setDashboardFilter(isActive ? 'all' : w.title)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'border-indigo-400 bg-indigo-50/90 ring-2 ring-indigo-300/60 shadow-2xs'
                          : `${w.pastelBg} ${w.pastelBorder}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{w.emoji}</span>
                        <span className="text-xs font-bold text-slate-800 tabular-nums">
                          {count}명
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-700 mt-1 truncate">
                        {w.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 학생 제출 현황 카드 목록 */}
            <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-800">
                    꽃친구별 제출 상세 카드
                  </h2>
                  {dashboardFilter !== 'all' && (
                    <button
                      onClick={() => setDashboardFilter('all')}
                      className="text-xs text-indigo-600 hover:underline font-bold"
                    >
                      전체 보기로 돌아가기
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="꽃이름 또는 번호 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3.5 py-1.5 text-xs rounded-xl border border-amber-200 text-slate-700 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {students
                  .filter((s) => {
                    const rec = studentTodayRecordMap.get(s.number);
                    if (dashboardFilter !== 'all') {
                      if (!rec || !rec.emotion.includes(dashboardFilter)) return false;
                    }
                    if (searchTerm.trim()) {
                      const matchName = s.name.includes(searchTerm.trim());
                      const matchNum = String(s.number).includes(searchTerm.trim());
                      return matchName || matchNum;
                    }
                    return true;
                  })
                  .map((student) => {
                    const record = studentTodayRecordMap.get(student.number);
                    const matchWeather = record
                      ? WEATHER_OPTIONS.find((w) => record.emotion.includes(w.title))
                      : null;

                    return (
                      <div
                        key={student.number}
                        className={`p-4 rounded-2xl border transition-all ${
                          record
                            ? matchWeather?.isCareNeeded
                              ? 'border-rose-200 bg-rose-50/50 shadow-2xs'
                              : 'border-amber-100 bg-[#fffdf9] shadow-2xs'
                            : 'border-dashed border-slate-200 bg-slate-50/60 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-400">
                            {student.number}번
                          </span>
                          {record ? (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200/60">
                              피어남
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">
                              대기 중
                            </span>
                          )}
                        </div>

                        <div className="text-base font-extrabold text-slate-800 mb-1 flex items-center gap-1.5">
                          <span>{student.flowerEmoji || '🌸'}</span>
                          <span>{student.name}</span>
                        </div>

                        {record ? (
                          <div className="mt-2 pt-2 border-t border-amber-100/60">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                              <span>{record.emotion}</span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2 italic">
                              "{record.note}"
                            </p>
                            <div className="text-[10px] text-slate-400 mt-2">
                              {record.timestamp.split(' ')[1]} 기록
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic mt-3">
                            아직 체크인하지 않았습니다.
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* 전체 실시간 제출 로그 테이블 */}
            <div className="bg-white rounded-3xl border border-amber-100 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-amber-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  {selectedDate} 실시간 감정 기록 테이블 ({todayRecords.length}건)
                </h3>
                <button
                  onClick={handleExportCSV}
                  className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV 다운로드</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-amber-50/60 text-slate-600 font-bold border-b border-amber-100">
                    <tr>
                      <th className="px-6 py-3">시간</th>
                      <th className="px-4 py-3">번호</th>
                      <th className="px-4 py-3">꽃이름(닉네임)</th>
                      <th className="px-4 py-3">마음 날씨</th>
                      <th className="px-6 py-3">한 줄 마음</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-50">
                    {todayRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                          선택한 날짜에 등록된 감정 기록이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      todayRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-amber-50/30">
                          <td className="px-6 py-3 text-slate-400 tabular-nums">
                            {r.timestamp.split(' ')[1] || r.timestamp}
                          </td>
                          <td className="px-4 py-3 font-semibold">{r.number}번</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{r.name}</td>
                          <td className="px-4 py-3 font-medium">{r.emotion}</td>
                          <td className="px-6 py-3 text-slate-700">{r.note}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: 학생 명단 관리 (꽃이름 닉네임 관리) */}
        {/* ============================================================== */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
                  우리 반 꽃이름 닉네임 명단 관리 🌸
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  학생들이 자신을 표현할 꽃이름 닉네임을 등록하고 수정할 수 있습니다.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetFlowerStudents}
                  className="px-3.5 py-1.5 text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200/80 rounded-xl transition-colors"
                >
                  기본 20개 꽃이름으로 리셋 🌺
                </button>
              </div>
            </div>

            {/* 신규 학생 추가 폼 */}
            <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-xs">
              <h2 className="text-sm font-extrabold text-slate-800 mb-3">새 꽃친구 추가하기</h2>
              <form onSubmit={handleAddStudent} className="flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  placeholder="번호 (예: 21)"
                  value={newNum}
                  onChange={(e) => setNewNum(e.target.value)}
                  min="1"
                  max="100"
                  className="w-28 px-3.5 py-2 text-sm border border-amber-200 rounded-xl text-slate-800 bg-white"
                  required
                />
                <input
                  type="text"
                  placeholder="꽃이름 (예: 프리지아)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-44 px-3.5 py-2 text-sm border border-amber-200 rounded-xl text-slate-800 bg-white"
                  required
                />
                <input
                  type="text"
                  placeholder="꽃 이모지 (예: 🌼)"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  className="w-24 px-3.5 py-2 text-sm border border-amber-200 rounded-xl text-slate-800 bg-white text-center"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>등록</span>
                </button>
              </form>
            </div>

            {/* 현재 등록 학생 리스트 */}
            <div className="bg-white rounded-3xl border border-amber-100 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-amber-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  현재 등록된 꽃이름 친구 ({students.length}송이)
                </span>
                <span className="text-xs text-slate-400">
                  * 학생 카드를 누르면 체크인 화면에서 바로 선택 가능합니다.
                </span>
              </div>

              <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {students.map((student) => (
                  <div
                    key={student.number}
                    className="p-3.5 rounded-2xl border border-amber-100 bg-[#fffdf9] flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{student.flowerEmoji || '🌸'}</span>
                      <div>
                        <span className="text-xs text-slate-400 font-semibold block">
                          {student.number}번
                        </span>
                        <span className="text-sm font-extrabold text-slate-800">
                          {student.name}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteStudent(student.number)}
                      className="text-slate-300 hover:text-rose-500 p-1"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: 구글 스프레드시트 연동 & GitHub Pages 분리 코드 뷰어 */}
        {/* ============================================================== */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            {/* 상단 소개 카드 */}
            <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-1">
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                <span>스프레드시트 연동 및 GitHub Pages 3개 파일 배포 센터</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
                구글 시트 연동 및 3개 분리 파일(HTML, CSS, JS) & code.gs
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                유지보수가 쉽도록 <code>index.html</code>, <code>style.css</code>, <code>script.js</code> 3개 파일로 분리되어 있으며,
                학생 이름은 <strong>꽃이름 닉네임</strong>으로 안전하게 연동됩니다.
              </p>
            </div>

            {/* 웹앱 URL 등록 섹션 */}
            <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-xs space-y-4">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-600" />
                <span>구글 Apps Script 웹앱 URL (Exec URL) 등록</span>
              </h2>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={gasUrl}
                  onChange={(e) => setGasUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-amber-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  className="px-4 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors whitespace-nowrap shadow-2xs"
                >
                  연결 테스트
                </button>
              </div>

              {testStatus && (
                <div className="text-xs p-3 rounded-xl bg-amber-50 border border-amber-200 text-slate-700">
                  {testStatus}
                </div>
              )}

              <div className="text-xs text-slate-600 bg-sky-50/80 border border-sky-200 rounded-2xl p-3.5">
                <div className="font-bold text-sky-900 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-sky-700" />
                  <span>GitHub Pages CORS 에러 방지 처리 완료</span>
                </div>
                <span>
                  POST 전송 시 <strong><code>Content-Type: text/plain;charset=utf-8</code></strong>를 적용하여
                  GitHub Pages를 포함한 모든 외부 웹 환경에서 사전 요청(OPTIONS preflight) 없이 구글 시트에 즉시 저장됩니다.
                </span>
              </div>
            </div>

            {/* 스프레드시트 탭 구조 가이드 카드 */}
            <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-xs space-y-4">
              <h2 className="text-base font-extrabold text-slate-800">
                📊 구글 스프레드시트 탭 구성 구조 (꽃이름 닉네임)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-amber-100 rounded-2xl p-4 bg-amber-50/40">
                  <div className="text-sm font-bold text-slate-800 mb-2 flex items-center justify-between">
                    <span>1. '학생명단' 탭</span>
                    <span className="text-xs text-slate-500 font-normal">꽃이름 닉네임 기본 정보</span>
                  </div>
                  <table className="w-full text-xs text-center border-collapse bg-white rounded-xl border border-amber-200/70">
                    <thead className="bg-amber-100/70 font-bold text-amber-900 border-b border-amber-200">
                      <tr>
                        <th className="p-2 border-r border-amber-200">A열 (번호)</th>
                        <th className="p-2">B열 (이름 - 꽃이름)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100/70">
                      <tr><td className="p-1.5 border-r border-amber-100">1</td><td className="p-1.5">민들레</td></tr>
                      <tr><td className="p-1.5 border-r border-amber-100">2</td><td className="p-1.5">해바라기</td></tr>
                      <tr><td className="p-1.5 border-r border-amber-100">3</td><td className="p-1.5">튤립</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="border border-amber-100 rounded-2xl p-4 bg-amber-50/40">
                  <div className="text-sm font-bold text-slate-800 mb-2 flex items-center justify-between">
                    <span>2. '감정기록' 탭</span>
                    <span className="text-xs text-slate-500 font-normal">실시간 체크인 자동 누적</span>
                  </div>
                  <table className="w-full text-[11px] text-center border-collapse bg-white rounded-xl border border-amber-200/70">
                    <thead className="bg-pink-100/70 font-bold text-pink-900 border-b border-pink-200">
                      <tr>
                        <th className="p-1.5 border-r border-pink-200">A열(일시)</th>
                        <th className="p-1.5 border-r border-pink-200">B(번호)</th>
                        <th className="p-1.5 border-r border-pink-200">C(꽃이름)</th>
                        <th className="p-1.5 border-r border-pink-200">D(감정이모지)</th>
                        <th className="p-1.5">E(한줄마음)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-100/70">
                      <tr>
                        <td className="p-1 border-r border-pink-100">2026-10-17 08:30:12</td>
                        <td className="p-1 border-r border-pink-100">1</td>
                        <td className="p-1 border-r border-pink-100">민들레</td>
                        <td className="p-1 border-r border-pink-100">☀️ 해가 쨍쨍한 날</td>
                        <td className="p-1 text-left">햇살이 따뜻해요</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 코드 뷰어 (code.gs, index.html, style.css, script.js) */}
            <div className="bg-white rounded-3xl border border-amber-100 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCodeViewerTab('codegs')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      codeViewerTab === 'codegs'
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    code.gs (Apps Script)
                  </button>
                  <button
                    onClick={() => setCodeViewerTab('indexhtml')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      codeViewerTab === 'indexhtml'
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    index.html
                  </button>
                  <button
                    onClick={() => setCodeViewerTab('stylecss')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      codeViewerTab === 'stylecss'
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    style.css
                  </button>
                  <button
                    onClick={() => setCodeViewerTab('scriptjs')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      codeViewerTab === 'scriptjs'
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    script.js
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const code =
                      codeViewerTab === 'codegs'
                        ? `// code.gs\nconst SHEET_STUDENTS = '학생명단';\nconst SHEET_RECORDS = '감정기록';`
                        : codeViewerTab === 'indexhtml'
                        ? `<!-- /standalone/index.html 파일 참조 -->`
                        : codeViewerTab === 'stylecss'
                        ? `/* /standalone/style.css 파일 참조 */`
                        : `// /standalone/script.js 파일 참조`;
                    handleCopyCode(code, codeViewerTab);
                  }}
                  className="px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copiedFile === codeViewerTab ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>코드 복사</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto max-h-80 leading-relaxed">
                <pre>
                  {codeViewerTab === 'codegs' && `// code.gs - 꽃이름 닉네임 기본 설정 포함
const SHEET_STUDENTS = '학생명단';
const SHEET_RECORDS = '감정기록';

function setupInitialSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let studentSheet = ss.getSheetByName(SHEET_STUDENTS);
  if (!studentSheet) {
    studentSheet = ss.insertSheet(SHEET_STUDENTS);
    studentSheet.appendRow(['번호', '이름']);
    const defaultStudents = [
      [1, '민들레'], [2, '해바라기'], [3, '튤립'], [4, '장미'], [5, '코스모스'],
      [6, '수국'], [7, '동백꽃'], [8, '수선화'], [9, '제비꽃'], [10, '안개꽃'],
      [11, '은방울꽃'], [12, '라벤더'], [13, '무궁화'], [14, '백합'], [15, '목련'],
      [16, '진달래'], [17, '개나리'], [18, '연꽃'], [19, '채송화'], [20, '프리지아']
    ];
    studentSheet.getRange(2, 1, defaultStudents.length, 2).setValues(defaultStudents);
  }
}

// GitHub Pages CORS 에러 방지를 위해 Content-Type: text/plain;charset=utf-8 로 전송된 JSON 수신
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_RECORDS);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_RECORDS);
      sheet.appendRow(['일시', '번호', '이름', '감정이모지', '한줄마음']);
    }
    const timestamp = payload.timestamp || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    sheet.appendRow([timestamp, payload.number || '', payload.name || '', payload.emotion || '', payload.note || '']);
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`}
                  {codeViewerTab === 'indexhtml' && `<!-- /standalone/index.html 에 꽃이름 닉네임과 분리된 스탠드얼론 코드가 저장되어 있습니다 -->`}
                  {codeViewerTab === 'stylecss' && `/* /standalone/style.css 에 파스텔톤 전용 테마 변수가 적용되어 있습니다 */`}
                  {codeViewerTab === 'scriptjs' && `// /standalone/script.js - text/plain CORS POST 통신 및 꽃이름 닉네임 기본 세팅`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. 푸터 (파스텔 톤) */}
      <footer className="mt-auto border-t border-amber-100 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>🌸 우리 반 꽃밭 마음 날씨 · 아침 감정 체크인</span>
          <div className="flex items-center gap-3 text-slate-400">
            <span>☀️ 해가 쨍쨍</span>
            <span>⛅ 구름 낌</span>
            <span>🌧️ 비 옴</span>
            <span>💨 바람 붊</span>
            <span>❄️ 눈 옴</span>
            <span>⚡ 번개 침</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
