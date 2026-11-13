import AppSidebar from '@/Components/AppSidebar';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Chart from 'chart.js/auto';
import {
  Award,
  BadgePercent,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Gift,
  GraduationCap,
  HelpCircle,
  Home,
  Info,
  Lightbulb,
  LineChart,
  LogOut,
  Maximize,
  Moon,
  Package,
  Play,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Share2,
  ShoppingCart,
  Sparkles,
  Store,
  Tag,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
} from 'lucide-react';
import {
  ModuleItem,
  ModuleCategory,
  DifficultyLevel,
  UserModuleProgress,
  BadgeItem,
  LearningActivity,
  LearningRecommendation,
  LearningOverallStats,
  QuizQuestion,
} from '../../types/learning';

interface Props {
  modules: ModuleItem[];
  badges: BadgeItem[];
  activities: LearningActivity[];
  initialProgress: Record<string, UserModuleProgress>;
  recommendation: LearningRecommendation;
  stats: LearningOverallStats;
}

export default function LearningIndex({
  modules,
  badges: initialBadges,
  activities: initialActivities,
  initialProgress,
  recommendation: initialRec,
  stats: initialStats,
}: Props) {
  // Shell Layout State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'modul' | 'progres' | 'lencana'>('modul');

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive Learning Progress State
  const [userProgress, setUserProgress] = useState<Record<string, UserModuleProgress>>(initialProgress);
  const [badges, setBadges] = useState<BadgeItem[]>(initialBadges);
  const [activities, setActivities] = useState<LearningActivity[]>(initialActivities);
  const [recommendation, setRecommendation] = useState<LearningRecommendation>(initialRec);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fullscreen helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Overall Stats Calculation
  const stats = useMemo(() => {
    const completed = Object.values(userProgress).filter((p) => p.status === 'selesai');
    const completedCount = completed.length;
    const postScores = completed.filter((p) => p.post_test_score !== null).map((p) => p.post_test_score as number);
    const avgPost = postScores.length > 0 ? Math.round(postScores.reduce((a, b) => a + b, 0) / postScores.length) : 0;

    const gains = completed
      .filter((p) => p.pre_test_score !== null && p.post_test_score !== null)
      .map((p) => Math.max(0, (p.post_test_score as number) - (p.pre_test_score as number)));
    const avgGain = gains.length > 0 ? Math.round(gains.reduce((a, b) => a + b, 0) / gains.length) : 0;

    const unlockedBadges = badges.filter((b) => b.is_unlocked).length;

    return {
      modules_completed: completedCount,
      total_modules: modules.length,
      total_learning_hours: Number((completedCount * 0.25).toFixed(1)),
      badges_earned: unlockedBadges,
      total_badges: badges.length,
      avg_post_test_score: avgPost,
      avg_score_increase: avgGain,
      streak_learning_days: 3,
    };
  }, [userProgress, badges, modules.length]);

  // Current In-Progress / Resume Module
  const resumeModule = useMemo(() => {
    const inProgress = Object.values(userProgress).find((p) => p.status === 'sedang_belajar');
    if (inProgress) {
      const mod = modules.find((m) => m.id === inProgress.module_id);
      if (mod) return { module: mod, progress: inProgress };
    }
    // If none in progress, find first unstarted
    const unstarted = modules.find((m) => {
      const p = userProgress[m.id];
      return !p || p.status === 'belum_dimulai';
    });
    if (unstarted) {
      return { module: unstarted, progress: null };
    }
    return { module: modules[0], progress: userProgress[modules[0].id] || null };
  }, [userProgress, modules]);

  // Filtered Modules
  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      const p = userProgress[m.id];
      const status = p ? p.status : 'belum_dimulai';

      const matchCat = selectedCategory === 'Semua' || m.category === selectedCategory;
      const matchStatus =
        selectedStatus === 'Semua' ||
        (selectedStatus === 'Selesai' && status === 'selesai') ||
        (selectedStatus === 'Sedang Belajar' && status === 'sedang_belajar') ||
        (selectedStatus === 'Belum Dimulai' && status === 'belum_dimulai');

      const matchSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchStatus && matchSearch;
    });
  }, [modules, userProgress, selectedCategory, selectedStatus, searchQuery]);

  // =========================================================================
  // DETAIL MODAL & PLAYER STATE
  // =========================================================================
  const [selectedDetailModule, setSelectedDetailModule] = useState<ModuleItem | null>(null);

  // Player State
  const [activePlayerModule, setActivePlayerModule] = useState<ModuleItem | null>(null);
  const [playerMode, setPlayerMode] = useState<'pre_test' | 'lesson' | 'post_test' | 'result'>('pre_test');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [userPreAnswers, setUserPreAnswers] = useState<Record<string, string>>({});
  const [userPostAnswers, setUserPostAnswers] = useState<Record<string, string>>({});
  const [isGrading, setIsGrading] = useState<boolean>(false);

  // Grading Results
  const [quizResult, setQuizResult] = useState<{
    score: number;
    correct_count: number;
    total_questions: number;
    passed: boolean;
    score_gain: number | null;
    gain_message: string | null;
    breakdown: Array<{
      question_id: string;
      user_answer: string;
      correct_answer: string;
      is_correct: boolean;
      explanation: string;
    }>;
  } | null>(null);

  // Certificate Modal State
  const [certificateModule, setCertificateModule] = useState<ModuleItem | null>(null);

  // Open Detail Modal
  const handleOpenDetail = (mod: ModuleItem) => {
    setSelectedDetailModule(mod);
  };

  // Launch Player from Detail
  const handleStartLearning = (mod: ModuleItem, mode: 'pre_test' | 'lesson' = 'pre_test') => {
    setSelectedDetailModule(null);
    setActivePlayerModule(mod);
    const p = userProgress[mod.id];

    if (mode === 'pre_test' && (!p || p.pre_test_score === null)) {
      setPlayerMode('pre_test');
      setUserPreAnswers({});
    } else {
      setPlayerMode('lesson');
      setCurrentStepIndex(p ? Math.max(0, p.current_step - 1) : 0);
    }
  };

  // Skip Pre-test
  const handleSkipPreTest = async () => {
    if (!activePlayerModule) return;
    showToast('Tes awal dilewati. Kamu bisa langsung mulai membaca materi.');

    // Save progress to session API
    try {
      await fetch('/api/learning/save-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
        body: JSON.stringify({
          module_id: activePlayerModule.id,
          current_step: 1,
          status: 'sedang_belajar',
          pre_test_score: null,
        }),
      });
    } catch {}

    setUserProgress((prev) => ({
      ...prev,
      [activePlayerModule.id]: {
        module_id: activePlayerModule.id,
        status: 'sedang_belajar',
        current_step: 1,
        total_steps: activePlayerModule.steps.length,
        pre_test_score: null,
        post_test_score: null,
        best_post_test_score: null,
        attempts_count: 0,
        passed: false,
        last_accessed_at: 'Baru saja',
      },
    }));

    setPlayerMode('lesson');
    setCurrentStepIndex(0);
  };

  // Submit Pre-test
  const handleSubmitPreTest = async () => {
    if (!activePlayerModule) return;
    setIsGrading(true);

    try {
      const res = await fetch('/api/learning/grade-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
        body: JSON.stringify({
          module_id: activePlayerModule.id,
          test_type: 'pre',
          answers: userPreAnswers,
        }),
      });

      const data = await res.json();
      const score = data.score ?? 50;

      setUserProgress((prev) => ({
        ...prev,
        [activePlayerModule.id]: {
          module_id: activePlayerModule.id,
          status: 'sedang_belajar',
          current_step: 1,
          total_steps: activePlayerModule.steps.length,
          pre_test_score: score,
          post_test_score: null,
          best_post_test_score: null,
          attempts_count: 0,
          passed: false,
          last_accessed_at: 'Baru saja',
        },
      }));

      showToast(`Tes awal selesai! Skor pemahaman awalmu: ${score}%. Yuk mulai pelajari materinya.`);
    } catch {
      // Fallback
      setUserProgress((prev) => ({
        ...prev,
        [activePlayerModule.id]: {
          module_id: activePlayerModule.id,
          status: 'sedang_belajar',
          current_step: 1,
          total_steps: activePlayerModule.steps.length,
          pre_test_score: 50,
          post_test_score: null,
          best_post_test_score: null,
          attempts_count: 0,
          passed: false,
          last_accessed_at: 'Baru saja',
        },
      }));
    } finally {
      setIsGrading(false);
      setPlayerMode('lesson');
      setCurrentStepIndex(0);
    }
  };

  // Step Navigation in Lesson
  const handleNextStep = async () => {
    if (!activePlayerModule) return;
    const nextIdx = currentStepIndex + 1;

    if (nextIdx < activePlayerModule.steps.length) {
      setCurrentStepIndex(nextIdx);

      // Save progress
      try {
        await fetch('/api/learning/save-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
          },
          body: JSON.stringify({
            module_id: activePlayerModule.id,
            current_step: nextIdx + 1,
            status: 'sedang_belajar',
          }),
        });
      } catch {}

      setUserProgress((prev) => ({
        ...prev,
        [activePlayerModule.id]: {
          ...prev[activePlayerModule.id],
          current_step: nextIdx + 1,
        },
      }));
    } else {
      // Finished all steps -> go to post-test
      setPlayerMode('post_test');
      setUserPostAnswers({});
      showToast('Semua langkah materi selesai! Saatnya tes akhir untuk menguji pemahaman.');
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Submit Post-test
  const handleSubmitPostTest = async () => {
    if (!activePlayerModule) return;
    setIsGrading(true);

    const p = userProgress[activePlayerModule.id];
    const preScore = p ? p.pre_test_score : null;

    try {
      const res = await fetch('/api/learning/grade-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
        body: JSON.stringify({
          module_id: activePlayerModule.id,
          test_type: 'post',
          answers: userPostAnswers,
          pre_test_score: preScore,
        }),
      });

      const data = await res.json();
      setQuizResult(data);
      setPlayerMode('result');

      // Update local state
      const isPassed = data.passed;
      setUserProgress((prev) => {
        const cur = prev[activePlayerModule.id] || {
          module_id: activePlayerModule.id,
          total_steps: activePlayerModule.steps.length,
          pre_test_score: preScore,
        };
        return {
          ...prev,
          [activePlayerModule.id]: {
            ...cur,
            status: isPassed ? 'selesai' : 'sedang_belajar',
            current_step: activePlayerModule.steps.length,
            post_test_score: data.score,
            best_post_test_score: Math.max(cur.best_post_test_score || 0, data.score),
            attempts_count: (cur.attempts_count || 0) + 1,
            passed: isPassed,
            last_accessed_at: 'Baru saja',
            completed_at: isPassed ? 'Hari ini' : cur.completed_at,
          },
        };
      });

      if (isPassed) {
        // Unlock badge
        setBadges((prev) =>
          prev.map((b) =>
            b.id === activePlayerModule.badge_id
              ? { ...b, is_unlocked: true, unlocked_at: 'Hari ini', progress_percent: 100 }
              : b
          )
        );

        // Add new activity
        const newAct: LearningActivity = {
          id: `act-${Date.now()}`,
          title: `Menyelesaikan Modul "${activePlayerModule.title}"`,
          type: 'module_completed',
          description: `Skor tes akhir ${data.score}%! Lencana "${activePlayerModule.badge_title}" berhasil diperoleh.`,
          date: 'Baru saja',
          score: data.score,
        };
        setActivities((prev) => [newAct, ...prev]);

        showToast(`🎉 Selamat! Kamu lulus modul "${activePlayerModule.title}" dengan skor ${data.score}%!`);
      } else {
        showToast(`Skor tes akhirmu: ${data.score}%. Jangan berkecil hati, kamu bisa mengulang kapan saja!`);
      }
    } catch {
      showToast('Gagal memproses nilai tes. Silakan coba kembali.');
    } finally {
      setIsGrading(false);
    }
  };

  // Re-take post test
  const handleRetakePostTest = () => {
    setUserPostAnswers({});
    setQuizResult(null);
    setPlayerMode('post_test');
  };

  // =========================================================================
  // CHARTS INITIALIZATION (PROGRES SAYA)
  // =========================================================================
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const barChartInstance = useRef<Chart | null>(null);
  const radarChartRef = useRef<HTMLCanvasElement | null>(null);
  const radarChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (activeTab !== 'progres') return;

    // 1. Grouped Bar Chart: Pre-test vs Post-test comparison
    if (barChartRef.current) {
      if (barChartInstance.current) barChartInstance.current.destroy();
      const ctx = barChartRef.current.getContext('2d');
      if (ctx) {
        const completedMods = modules.filter((m) => {
          const p = userProgress[m.id];
          return p && p.status === 'selesai' && p.post_test_score !== null;
        });

        const labels = completedMods.map((m) => m.title.split(' ')[0] + ' ' + (m.title.split(' ')[1] || ''));
        const preData = completedMods.map((m) => userProgress[m.id]?.pre_test_score || 0);
        const postData = completedMods.map((m) => userProgress[m.id]?.post_test_score || 0);

        barChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels.length > 0 ? labels : ['Modul 1', 'Modul 2', 'Modul 3'],
            datasets: [
              {
                label: 'Tes Awal (Pre-test)',
                data: preData.length > 0 ? preData : [67, 33, 67],
                backgroundColor: '#cbd5e1',
                borderRadius: 6,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
              },
              {
                label: 'Tes Akhir (Post-test)',
                data: postData.length > 0 ? postData : [100, 100, 100],
                backgroundColor: '#8b5cf6',
                borderRadius: 6,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: { boxWidth: 12, boxHeight: 12, font: { family: "'Plus Jakarta Sans'", size: 11 } },
              },
              tooltip: {
                callbacks: {
                  label: (context) => ` ${context.dataset.label}: ${context.raw}%`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: (v) => `${v}%`,
                  font: { size: 10 },
                },
                grid: { color: '#f1f5f9' },
                border: { display: false },
              },
              x: {
                grid: { display: false },
                ticks: { font: { size: 10 } },
                border: { display: false },
              },
            },
          },
        });
      }
    }

    // 2. Competency Radar / Horizontal Bar Chart
    if (radarChartRef.current) {
      if (radarChartInstance.current) radarChartInstance.current.destroy();
      const ctx = radarChartRef.current.getContext('2d');
      if (ctx) {
        radarChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Dasar Digital', 'Foto Produk', 'Media Sosial', 'Branding/Kemasan', 'Pembukuan'],
            datasets: [
              {
                label: 'Tingkat Pemahaman (%)',
                data: [100, 100, 85, 40, 30],
                backgroundColor: [
                  '#8b5cf6',
                  '#10b981',
                  '#3b82f6',
                  '#f59e0b',
                  '#94a3b8',
                ],
                borderRadius: 6,
              },
            ],
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => ` Penguasaan: ${context.raw}%`,
                },
              },
            },
            scales: {
              x: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: (v) => `${v}%`,
                  font: { size: 10 },
                },
                grid: { color: '#f1f5f9' },
                border: { display: false },
              },
              y: {
                grid: { display: false },
                ticks: { font: { size: 11 } },
                border: { display: false },
              },
            },
          },
        });
      }
    }

    return () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (radarChartInstance.current) radarChartInstance.current.destroy();
    };
  }, [activeTab, modules, userProgress]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb] font-sans text-slate-700 antialiased print:bg-white print:text-black">
      <Head title="Belajar & Modul Mikro UMKM - Lapak Digital" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="animate-fade-in fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl print:hidden">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible">
        <AppSidebar
          current="belajar"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          counts={{ modules: `${stats.modules_completed}/${stats.total_modules}` }}
          onShowToast={showToast}
        />

        {/* ================= MAIN CONTENT WRAPPER ================= */}
        <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible">
          {/* Header Navbar */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-6 print:hidden">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 lg:hidden"
                title="Buka/Tutup Menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>
              <nav className="hidden items-center space-x-1.5 text-xs text-slate-400 sm:flex">
                <Link href="/dashboard" className="transition hover:text-slate-600">
                  Beranda
                </Link>
                <span>/</span>
                <span className="font-medium text-slate-700">Pojok Belajar UMKM</span>
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden items-center space-x-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#8b5cf6] sm:flex">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Mikro-Modul 5-10 Menit</span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-50 sm:flex"
                title="Layar Penuh"
              >
                <Maximize className="h-4 w-4" />
              </button>

              <div className="flex items-center space-x-2 pl-1">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
                  alt="Ibu Siti"
                  className="h-7 w-7 rounded-full border border-slate-200 object-cover"
                />
                <span className="hidden text-xs font-semibold text-slate-700 md:inline-block">
                  Ibu Siti (Dapur Bu Siti)
                </span>
              </div>
            </div>
          </header>

          {/* Main Scroll Content */}
          <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 print:overflow-visible print:p-0">
            <div className="mx-auto max-w-7xl space-y-5">
              {/* ================= 1. HEADER HALAMAN & METRIK CEPAT ================= */}
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                    Pojok Belajar Mandiri
                  </h1>
                  <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                    Kumpulan materi praktis 5-10 menit untuk memajukan tokomu selangkah demi selangkah.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
                    <Flame className="h-4 w-4 text-amber-500" />
                    <span>Streak: {stats.streak_learning_days} Hari Berturut-turut!</span>
                  </div>
                </div>
              </div>

              {/* 3 Ringkasan Kecil + Kartu Lanjutkan Belajar */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 print:hidden">
                {/* 3 Metric Cards (5 Cols) */}
                <div className="grid grid-cols-3 gap-3 lg:col-span-5">
                  <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">Modul Selesai</span>
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-50 text-[#8b5cf6]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline space-x-1">
                      <span className="text-xl font-bold text-slate-800">{stats.modules_completed}</span>
                      <span className="text-xs text-slate-400">/ {stats.total_modules}</span>
                    </div>
                    <p className="mt-1 text-[10px] text-emerald-600 font-medium">
                      {Math.round((stats.modules_completed / stats.total_modules) * 100)}% terselesaikan
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">Jam Belajar</span>
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline space-x-1">
                      <span className="text-xl font-bold text-slate-800">{stats.total_learning_hours}</span>
                      <span className="text-xs text-slate-400">jam</span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Waktu hemat & padat
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">Lencana</span>
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <Award className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline space-x-1">
                      <span className="text-xl font-bold text-slate-800">{stats.badges_earned}</span>
                      <span className="text-xs text-slate-400">/ {stats.total_badges}</span>
                    </div>
                    <p className="mt-1 text-[10px] text-amber-600 font-medium">
                      Pencapaian aktif
                    </p>
                  </div>
                </div>

                {/* Kartu Lanjutkan Belajar / Mulai dari Sini (7 Cols) */}
                <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50/90 to-indigo-50/70 p-4 shadow-sm lg:col-span-7">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold uppercase tracking-wider text-[#8b5cf6]">
                        <Sparkles className="h-3 w-3" />
                        <span>{resumeModule.progress ? 'Lanjutkan Belajar' : 'Mulai dari Sini'}</span>
                      </span>
                      <h3 className="mt-1 text-sm font-bold text-slate-800 sm:text-base">
                        {resumeModule.module.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                        {resumeModule.module.description}
                      </p>

                      {resumeModule.progress && (
                        <div className="mt-2 flex items-center space-x-3 text-xs">
                          <div className="h-1.5 w-32 rounded-full bg-purple-200 overflow-hidden">
                            <div
                              className="h-full bg-[#8b5cf6]"
                              style={{
                                width: `${Math.round(
                                  (resumeModule.progress.current_step / resumeModule.progress.total_steps) * 100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-[11px] font-semibold text-purple-700">
                            Langkah {resumeModule.progress.current_step} dari {resumeModule.progress.total_steps}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleStartLearning(resumeModule.module, resumeModule.progress ? 'lesson' : 'pre_test')}
                      className="inline-flex shrink-0 items-center justify-center space-x-1.5 rounded-xl bg-[#8b5cf6] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#7c3aed]"
                    >
                      <span>{resumeModule.progress ? 'Lanjutkan Modul' : 'Mulai Modul'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ================= TAB NAVIGATION ================= */}
              <div className="flex border-b border-slate-200 print:hidden">
                <div className="flex space-x-2 overflow-x-auto pb-1 text-xs font-semibold sm:space-x-4 sm:text-sm">
                  <button
                    onClick={() => setActiveTab('modul')}
                    className={`flex shrink-0 items-center space-x-2 border-b-2 px-3 py-2.5 transition ${
                      activeTab === 'modul'
                        ? 'border-[#8b5cf6] text-[#8b5cf6]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Katalog Modul ({modules.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('progres')}
                    className={`flex shrink-0 items-center space-x-2 border-b-2 px-3 py-2.5 transition ${
                      activeTab === 'progres'
                        ? 'border-[#8b5cf6] text-[#8b5cf6]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LineChart className="h-4 w-4" />
                    <span>Progres Saya</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('lencana')}
                    className={`flex shrink-0 items-center space-x-2 border-b-2 px-3 py-2.5 transition ${
                      activeTab === 'lencana'
                        ? 'border-[#8b5cf6] text-[#8b5cf6]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Award className="h-4 w-4" />
                    <span>Lencana & Sertifikat</span>
                    <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-[#8b5cf6]">
                      {stats.badges_earned}
                    </span>
                  </button>
                </div>
              </div>

              {/* ================= TAB 1: KATALOG MODUL ================= */}
              {activeTab === 'modul' && (
                <div className="space-y-5">
                  {/* Banner Rekomendasi Modul (Rule-based) */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-2xs">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                          <Lightbulb className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-amber-900">Direkomendasikan untukmu</span>
                            <span className="rounded bg-amber-200/80 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800">
                              {recommendation.category}
                            </span>
                          </div>
                          <h4 className="mt-0.5 text-sm font-bold text-slate-800">{recommendation.module_title}</h4>
                          <p className="mt-0.5 text-xs text-amber-800 leading-relaxed">
                            💡 <em>{recommendation.reason}</em>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const target = modules.find((m) => m.id === recommendation.module_id);
                          if (target) handleOpenDetail(target);
                        }}
                        className="inline-flex shrink-0 items-center space-x-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700"
                      >
                        <span>Pelajari Sekarang</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Filter Chips & Search Bar */}
                  <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari modul (contoh: foto produk, pembukuan, instagram, logo)..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-[#8b5cf6] focus:outline-none"
                      />
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs font-semibold">
                      {[
                        'Semua',
                        'Dasar Digital',
                        'Foto dan Konten',
                        'Media Sosial',
                        'Branding dan Kemasan',
                        'Pembukuan',
                      ].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`shrink-0 rounded-xl px-3 py-1.5 transition ${
                            selectedCategory === cat
                              ? 'bg-[#8b5cf6] text-white shadow-xs'
                              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-400 mr-2">Status:</span>
                        {['Semua', 'Belum Dimulai', 'Sedang Belajar', 'Selesai'].map((st) => (
                          <button
                            key={st}
                            onClick={() => setSelectedStatus(st)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                              selectedStatus === st
                                ? 'bg-purple-100 text-[#8b5cf6]'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      <span className="text-[11px] text-slate-400">
                        Menampilkan {filteredModules.length} dari {modules.length} modul
                      </span>
                    </div>
                  </div>

                  {/* Empty State jika filter kosong */}
                  {filteredModules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-xs">
                      <BookOpen className="mb-2 h-10 w-10 text-slate-300" />
                      <h4 className="text-sm font-bold text-slate-800">Tidak Menemukan Modul yang Cocok</h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Coba gunakan kata kunci lain atau setel ulang filter kategori.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedCategory('Semua');
                          setSelectedStatus('Semua');
                          setSearchQuery('');
                        }}
                        className="mt-3 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-[#8b5cf6] hover:bg-purple-100"
                      >
                        Reset Filter
                      </button>
                    </div>
                  ) : (
                    /* Module Cards Grid */
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredModules.map((mod) => {
                        const p = userProgress[mod.id];
                        const isCompleted = p && p.status === 'selesai';
                        const isInProgress = p && p.status === 'sedang_belajar';
                        const progressPct = p
                          ? Math.round((p.current_step / (p.total_steps || mod.steps.length)) * 100)
                          : 0;

                        return (
                          <div
                            key={mod.id}
                            onClick={() => handleOpenDetail(mod)}
                            className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-purple-200 hover:shadow-md"
                          >
                            <div>
                              {/* Category & Status Badges */}
                              <div className="flex items-center justify-between">
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                                  {mod.category}
                                </span>

                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    isCompleted
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : isInProgress
                                      ? 'bg-purple-100 text-[#8b5cf6]'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {isCompleted
                                    ? '✓ Selesai'
                                    : isInProgress
                                    ? `Langkah ${p.current_step}/${mod.steps.length}`
                                    : 'Belum Dimulai'}
                                </span>
                              </div>

                              {/* Title & Desc */}
                              <h4 className="mt-2.5 text-sm font-bold text-slate-800 group-hover:text-[#8b5cf6] transition">
                                {mod.title}
                              </h4>
                              <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                {mod.description}
                              </p>

                              {/* Prerequisite notice */}
                              {mod.prerequisite_title && !isCompleted && (
                                <p className="mt-2 text-[10px] text-amber-700 font-medium">
                                  💡 <em>Saran: Baik dipelajari setelah "{mod.prerequisite_title}"</em>
                                </p>
                              )}

                              {/* Meta Info: Durasi & Level */}
                              <div className="mt-3 flex items-center space-x-3 text-xs text-slate-400">
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{mod.duration_minutes} menit</span>
                                </span>
                                <span>•</span>
                                <span>{mod.steps.length} langkah</span>
                                <span>•</span>
                                <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#8b5cf6]">
                                  {mod.level}
                                </span>
                              </div>
                            </div>

                            {/* Bottom Progress Bar & Button */}
                            <div className="mt-4 border-t border-slate-100 pt-3">
                              <div className="mb-2 flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">Progres Modul:</span>
                                <span className="font-bold text-slate-700">{progressPct}%</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    isCompleted ? 'bg-emerald-500' : 'bg-[#8b5cf6]'
                                  }`}
                                  style={{ width: `${progressPct}%` }}
                                ></div>
                              </div>

                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-[#8b5cf6] flex items-center space-x-1">
                                  <span>Buka Detail</span>
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                                {isCompleted && p.post_test_score && (
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    Skor: {p.post_test_score}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 2: PROGRES SAYA ================= */}
              {activeTab === 'progres' && (
                <div className="space-y-5">
                  {/* 4 Kartu Ringkasan Progres */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <span className="text-xs font-semibold text-slate-500">Modul Selesai</span>
                      <h3 className="mt-1 text-2xl font-bold text-slate-800">
                        {stats.modules_completed} <span className="text-sm font-normal text-slate-400">/ {stats.total_modules}</span>
                      </h3>
                      <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                        {Math.round((stats.modules_completed / stats.total_modules) * 100)}% kurikulum dasar
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <span className="text-xs font-semibold text-slate-500">Rata-rata Skor Tes Akhir</span>
                      <h3 className="mt-1 text-2xl font-bold text-[#8b5cf6]">
                        {stats.avg_post_test_score}%
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Batas kelulusan: 70%
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <span className="text-xs font-semibold text-slate-500">Rata-rata Kenaikan Skor</span>
                      <h3 className="mt-1 text-2xl font-bold text-emerald-600">
                        +{stats.avg_score_increase}%
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Peningkatan pemahaman nyata
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <span className="text-xs font-semibold text-slate-500">Hari Belajar Beruntun</span>
                      <h3 className="mt-1 text-2xl font-bold text-amber-600 flex items-center space-x-1">
                        <span>{stats.streak_learning_days}</span>
                        <Flame className="h-5 w-5 text-amber-500" />
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Konsisten tiap hari
                      </p>
                    </div>
                  </div>

                  {/* CHARTS ROW */}
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                    {/* Bar Chart: Kenaikan Pre-test vs Post-test (7 Cols) */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:col-span-7">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">
                            Perbandingan Pemahaman (Sebelum vs Sesudah Belajar)
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Mengukur efektivitas kenaikan skor dari pre-test ke post-test
                          </p>
                        </div>
                      </div>
                      <div className="relative h-64 w-full">
                        <canvas ref={barChartRef}></canvas>
                      </div>
                    </div>

                    {/* Horizontal Bar: Penguasaan per Kategori (5 Cols) */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:col-span-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">
                            Penguasaan Keterampilan per Bidang
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Kekuatan dan bagian yang bisa diperdalam
                          </p>
                        </div>
                      </div>
                      <div className="relative h-64 w-full">
                        <canvas ref={radarChartRef}></canvas>
                      </div>
                    </div>
                  </div>

                  {/* Riwayat Aktivitas Belajar */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Linimasa Aktivitas Belajar Terkini</h3>
                    <div className="divide-y divide-slate-100">
                      {activities.map((act) => (
                        <div key={act.id} className="flex items-start space-x-3 py-3">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#8b5cf6]">
                            {act.type === 'badge_earned' ? (
                              <Award className="h-4 w-4 text-amber-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-800">{act.title}</h4>
                              <span className="text-[10px] text-slate-400">{act.date}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{act.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 3: LENCANA & SERTIFIKAT ================= */}
              {activeTab === 'lencana' && (
                <div className="space-y-5">
                  <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Galeri Lencana & Penghargaan</h3>
                      <p className="text-xs text-slate-500">
                        Kumpulkan lencana atas setiap modul yang kamu kuasai dan cetak sertifikat penyelesaian toko.
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-[#8b5cf6]">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span>{badges.filter((b) => b.is_unlocked).length} dari {badges.length} Terbuka</span>
                    </div>
                  </div>

                  {/* Badges Grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {badges.map((badge) => {
                      return (
                        <div
                          key={badge.id}
                          className={`flex flex-col justify-between rounded-2xl border p-4 shadow-sm transition ${
                            badge.is_unlocked
                              ? 'border-purple-200 bg-white'
                              : 'border-slate-100 bg-slate-50/70 opacity-75'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                                  badge.is_unlocked
                                    ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-200'
                                    : 'bg-slate-200 text-slate-400'
                                }`}
                              >
                                <Award className="h-6 w-6" />
                              </div>

                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  badge.is_unlocked
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {badge.is_unlocked ? '✓ Terbuka' : 'Terkunci'}
                              </span>
                            </div>

                            <h4 className="mt-3 text-sm font-bold text-slate-800">{badge.title}</h4>
                            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{badge.description}</p>
                            <p className="mt-2 text-[10px] text-slate-400">
                              <strong>Syarat:</strong> {badge.requirement}
                            </p>
                          </div>

                          <div className="mt-4 border-t border-slate-100 pt-3">
                            {badge.is_unlocked ? (
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>Terbuka: {badge.unlocked_at}</span>
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                              </div>
                            ) : (
                              <div>
                                <div className="mb-1 flex justify-between text-[10px] text-slate-500">
                                  <span>Progres</span>
                                  <span>{badge.progress_percent}%</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                                  <div
                                    className="h-full bg-[#8b5cf6]"
                                    style={{ width: `${badge.progress_percent}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Section Sertifikat Penyelesaian Modul */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Sertifikat Penyelesaian Modul</h4>
                        <p className="text-xs text-slate-500">
                          Setiap modul yang kamu selesaikan memiliki sertifikat pencapaian yang bisa dicetak untuk dipajang di tokomu.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {modules
                        .filter((m) => userProgress[m.id]?.status === 'selesai')
                        .map((mod) => (
                          <div
                            key={mod.id}
                            className="flex items-center justify-between rounded-xl border border-purple-100 bg-purple-50/40 p-3"
                          >
                            <div>
                              <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{mod.title}</h5>
                              <span className="text-[10px] text-slate-500">
                                Nilai: {userProgress[mod.id].post_test_score}% • Lulus
                              </span>
                            </div>

                            <button
                              onClick={() => setCertificateModule(mod)}
                              className="inline-flex shrink-0 items-center space-x-1 rounded-lg bg-[#8b5cf6] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#7c3aed]"
                            >
                              <Printer className="h-3 w-3" />
                              <span>Cetak</span>
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ================= MODAL 1: DETAIL MODAL ================= */}
      {selectedDetailModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-[#8b5cf6]">
                  {selectedDetailModule.category}
                </span>
                <h3 className="mt-1 text-base font-bold text-slate-800">{selectedDetailModule.title}</h3>
              </div>
              <button
                onClick={() => setSelectedDetailModule(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">{selectedDetailModule.description}</p>

              {/* 3 Objectives */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
                <h4 className="font-bold text-emerald-900 mb-1.5">Setelah menyelesaikan modul ini, kamu bisa:</h4>
                <ul className="space-y-1 text-emerald-800">
                  {selectedDetailModule.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps Outline */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Langkah Pembelajaran ({selectedDetailModule.steps.length} Langkah):</h4>
                <div className="space-y-1.5">
                  {selectedDetailModule.steps.map((st, i) => (
                    <div key={st.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-[#8b5cf6]">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-slate-700">{st.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">~2 menit</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pre-test explanation */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-[11px] text-blue-900 leading-relaxed">
                💡 <strong>Catatan:</strong> Modul ini diawali dengan tes awal singkat (3 soal). Tes awal hanya untuk melihat posisimu sekarang, bukan penilaian. Tidak ada nilai buruk atau hukuman.
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-5 flex items-center justify-end space-x-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setSelectedDetailModule(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 text-xs"
              >
                Tutup
              </button>
              <button
                onClick={() => handleStartLearning(selectedDetailModule, 'pre_test')}
                className="rounded-xl bg-[#8b5cf6] px-4 py-2 font-bold text-white shadow-xs hover:bg-[#7c3aed] text-xs"
              >
                {userProgress[selectedDetailModule.id]?.status === 'selesai'
                  ? 'Ulangi Modul'
                  : userProgress[selectedDetailModule.id]?.status === 'sedang_belajar'
                  ? 'Lanjutkan Belajar'
                  : 'Mulai dengan Tes Awal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: INTERACTIVE LEARNING PLAYER ================= */}
      {activePlayerModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl max-h-[92vh] overflow-y-auto flex flex-col justify-between">
            {/* Header Player */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-[#8b5cf6]">
                    {playerMode === 'pre_test'
                      ? 'Tes Awal (Pre-Test)'
                      : playerMode === 'lesson'
                      ? `Materi Belajar (${currentStepIndex + 1}/${activePlayerModule.steps.length})`
                      : playerMode === 'post_test'
                      ? 'Tes Akhir (Post-Test)'
                      : 'Hasil Evaluasi'}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-600 truncate max-w-[200px] sm:max-w-xs">
                    {activePlayerModule.title}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Yakin ingin keluar dari ruang belajar? Progres langkahmu sudah tersimpan otomatis.')) {
                      setActivePlayerModule(null);
                      setQuizResult(null);
                    }
                  }}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content Body Based on Player Mode */}
              <div className="py-4">
                {/* 1. PRE-TEST MODE */}
                {playerMode === 'pre_test' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-900 leading-relaxed">
                      Jawab pertanyaan berikut sesuai pengetahuanmu saat ini. Jika belum tahu, pilih yang menurutmu paling masuk akal atau klik <strong>Lewati</strong>.
                    </div>

                    <div className="space-y-4">
                      {activePlayerModule.pre_test_questions.map((q, idx) => (
                        <div key={q.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs">
                          <p className="font-bold text-slate-800 mb-2">
                            {idx + 1}. {q.question}
                          </p>
                          <div className="space-y-1.5">
                            {q.options.map((opt) => (
                              <label
                                key={opt.id}
                                className={`flex items-start space-x-2.5 rounded-lg border p-2 cursor-pointer transition ${
                                  userPreAnswers[q.id] === opt.id
                                    ? 'border-[#8b5cf6] bg-purple-50/60 font-semibold text-purple-900'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`pre_${q.id}`}
                                  value={opt.id}
                                  checked={userPreAnswers[q.id] === opt.id}
                                  onChange={() => setUserPreAnswers({ ...userPreAnswers, [q.id]: opt.id })}
                                  className="mt-0.5 text-[#8b5cf6] focus:ring-[#8b5cf6]"
                                />
                                <span className="leading-relaxed">{opt.text}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. LESSON STEP MODE */}
                {playerMode === 'lesson' && (
                  <div className="space-y-4 text-xs">
                    {/* Step Title & Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>Langkah {currentStepIndex + 1} dari {activePlayerModule.steps.length}</span>
                        <span>{Math.round(((currentStepIndex + 1) / activePlayerModule.steps.length) * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#8b5cf6] transition-all"
                          style={{ width: `${Math.round(((currentStepIndex + 1) / activePlayerModule.steps.length) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-800">
                      {activePlayerModule.steps[currentStepIndex].title}
                    </h3>

                    {/* Step Body Content */}
                    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-2xs leading-relaxed text-slate-700 whitespace-pre-line text-xs sm:text-sm">
                      {activePlayerModule.steps[currentStepIndex].content}
                    </div>

                    {/* Practical Task Box */}
                    <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4">
                      <div className="flex items-center space-x-1.5 font-bold text-purple-900 mb-1">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        <span>Praktik Kecil (1-2 Menit):</span>
                      </div>
                      <p className="text-xs text-purple-800 leading-relaxed font-medium">
                        {activePlayerModule.steps[currentStepIndex].practical_task}
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. POST-TEST MODE */}
                {playerMode === 'post_test' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 text-xs text-purple-900 leading-relaxed">
                      Bagus sekali sudah membaca seluruh materi! Jawab 3 pertanyaan berikut untuk melihat peningkatan pemahamanmu.
                    </div>

                    <div className="space-y-4">
                      {activePlayerModule.post_test_questions.map((q, idx) => (
                        <div key={q.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs">
                          <p className="font-bold text-slate-800 mb-2">
                            {idx + 1}. {q.question}
                          </p>
                          <div className="space-y-1.5">
                            {q.options.map((opt) => (
                              <label
                                key={opt.id}
                                className={`flex items-start space-x-2.5 rounded-lg border p-2 cursor-pointer transition ${
                                  userPostAnswers[q.id] === opt.id
                                    ? 'border-[#8b5cf6] bg-purple-50/60 font-semibold text-purple-900'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`post_${q.id}`}
                                  value={opt.id}
                                  checked={userPostAnswers[q.id] === opt.id}
                                  onChange={() => setUserPostAnswers({ ...userPostAnswers, [q.id]: opt.id })}
                                  className="mt-0.5 text-[#8b5cf6] focus:ring-[#8b5cf6]"
                                />
                                <span className="leading-relaxed">{opt.text}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. RESULT MODE */}
                {playerMode === 'result' && quizResult && (
                  <div className="space-y-4 text-xs">
                    {/* Score Card */}
                    <div
                      className={`rounded-2xl border p-5 text-center ${
                        quizResult.passed
                          ? 'border-emerald-200 bg-emerald-50/60'
                          : 'border-amber-200 bg-amber-50/60'
                      }`}
                    >
                      <span className="text-xs font-semibold text-slate-600">Hasil Tes Akhir:</span>
                      <h2 className={`mt-1 text-4xl font-extrabold ${quizResult.passed ? 'text-emerald-600' : 'text-amber-700'}`}>
                        {quizResult.score}%
                      </h2>

                      {quizResult.gain_message && (
                        <p className="mt-2 text-xs font-bold text-slate-700">
                          {quizResult.gain_message}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-slate-500">
                        {quizResult.passed
                          ? 'Kamu berhasil menguasai materi modul ini dengan baik! Lencana telah ditambahkan ke profilmu.'
                          : 'Pemahamanmu sudah meningkat! Kamu bisa membaca ulang langkah tertentu dan mengulang tes akhir tanpa batas.'}
                      </p>
                    </div>

                    {/* Question by Question Review */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-800">Pembahasan Jawaban:</h4>
                      {quizResult.breakdown.map((item, idx) => (
                        <div
                          key={item.question_id}
                          className={`rounded-xl border p-3 ${
                            item.is_correct ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'
                          }`}
                        >
                          <div className="flex items-center space-x-2 font-semibold">
                            {item.is_correct ? (
                              <span className="text-emerald-600 font-bold">✓ Soal {idx + 1} Benar</span>
                            ) : (
                              <span className="text-rose-600 font-bold">✕ Soal {idx + 1} Perlu Diperhatikan</span>
                            )}
                          </div>
                          <p className="mt-1 text-slate-700 leading-relaxed font-medium">
                            💡 {item.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              {playerMode === 'pre_test' && (
                <>
                  <button
                    onClick={handleSkipPreTest}
                    className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-500 hover:bg-slate-50 text-xs"
                  >
                    Lewati Tes Awal
                  </button>
                  <button
                    onClick={handleSubmitPreTest}
                    disabled={isGrading}
                    className="rounded-xl bg-[#8b5cf6] px-4 py-2 font-bold text-white shadow-xs hover:bg-[#7c3aed] text-xs"
                  >
                    {isGrading ? 'Menilai...' : 'Kirim Jawaban & Lanjut'}
                  </button>
                </>
              )}

              {playerMode === 'lesson' && (
                <>
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStepIndex === 0}
                    className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 text-xs flex items-center space-x-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Sebelumnya</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="rounded-xl bg-[#8b5cf6] px-4 py-2 font-bold text-white shadow-xs hover:bg-[#7c3aed] text-xs flex items-center space-x-1"
                  >
                    <span>
                      {currentStepIndex + 1 === activePlayerModule.steps.length
                        ? 'Selesai & Mulai Tes Akhir'
                        : 'Langkah Berikutnya'}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}

              {playerMode === 'post_test' && (
                <>
                  <button
                    onClick={() => setPlayerMode('lesson')}
                    className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-500 hover:bg-slate-50 text-xs"
                  >
                    Baca Materi Lagi
                  </button>
                  <button
                    onClick={handleSubmitPostTest}
                    disabled={isGrading}
                    className="rounded-xl bg-[#8b5cf6] px-4 py-2 font-bold text-white shadow-xs hover:bg-[#7c3aed] text-xs"
                  >
                    {isGrading ? 'Menghitung Nilai...' : 'Kumpulkan Jawaban'}
                  </button>
                </>
              )}

              {playerMode === 'result' && (
                <div className="flex items-center justify-end space-x-2 w-full">
                  {!quizResult?.passed && (
                    <button
                      onClick={handleRetakePostTest}
                      className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 font-bold text-amber-800 hover:bg-amber-100 text-xs flex items-center space-x-1"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Ulangi Tes Akhir</span>
                    </button>
                  )}

                  {quizResult?.passed && (
                    <button
                      onClick={() => {
                        setCertificateModule(activePlayerModule);
                        setActivePlayerModule(null);
                      }}
                      className="rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2 font-bold text-[#8b5cf6] hover:bg-purple-100 text-xs flex items-center space-x-1"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Lihat Sertifikat</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActivePlayerModule(null);
                      setQuizResult(null);
                    }}
                    className="rounded-xl bg-[#8b5cf6] px-4 py-2 font-bold text-white shadow-xs hover:bg-[#7c3aed] text-xs"
                  >
                    Kembali ke Katalog
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: SERTIFIKAT PENYELESAIAN (PRINT-READY) ================= */}
      {certificateModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl print:border-none print:shadow-none">
            {/* Header Control */}
            <div className="flex items-center justify-between border-b pb-3 print:hidden">
              <span className="text-xs font-bold text-slate-800">Pratinjau Sertifikat</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-[#8b5cf6] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#7c3aed]"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Cetak / Unduh PDF</span>
                </button>
                <button
                  onClick={() => setCertificateModule(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* CERTIFICATE CANVAS */}
            <div className="mt-4 border-4 border-double border-purple-200 bg-gradient-to-b from-purple-50/40 via-white to-purple-50/20 p-8 text-center rounded-xl">
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-[#8b5cf6]">
                <GraduationCap className="h-7 w-7" />
              </div>

              <h2 className="text-xl font-extrabold uppercase tracking-widest text-[#8b5cf6]">
                Sertifikat Penyelesaian
              </h2>
              <p className="text-[11px] text-slate-400 tracking-wider uppercase mt-0.5">
                Pojok Belajar Digital Pendampingan UMKM
              </p>

              <div className="my-6">
                <p className="text-xs text-slate-500">Diberikan dengan bangga kepada:</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">Ibu Siti Aminah</h3>
                <p className="text-xs font-semibold text-purple-700">Pemilik Usaha "Dapur Bu Siti"</p>
              </div>

              <div className="my-4 border-t border-b border-purple-100 py-3 text-xs">
                <p className="text-slate-500">Atas keberhasilannya menguasai modul:</p>
                <h4 className="mt-1 text-base font-bold text-slate-800">
                  {certificateModule.title}
                </h4>
                <p className="mt-1 text-[11px] text-emerald-700 font-bold">
                  Nilai Kelulusan: {userProgress[certificateModule.id]?.post_test_score || 100}%
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs text-slate-500 px-4">
                <div>
                  <p className="text-[10px]">Tanggal Penyelesaian:</p>
                  <p className="font-bold text-slate-800">26 Oktober 2026</p>
                </div>

                <div className="text-right">
                  <p className="text-[10px]">Disahkan oleh Platform:</p>
                  <p className="font-bold text-[#8b5cf6]">Lapak Digital UMKM</p>
                </div>
              </div>

              <p className="mt-6 text-[9px] text-slate-400 italic">
                * Sertifikat ini adalah penanda resmi penyelesaian modul belajar mandiri di platform Lapak Digital UMKM, bukan sertifikasi profesi atau izin edar pemerintah.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
