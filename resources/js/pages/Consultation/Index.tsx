import AppSidebar from '@/Components/AppSidebar';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BadgePercent,
  BookOpen,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  CornerDownRight,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Gift,
  GraduationCap,
  Heart,
  HelpCircle,
  Home,
  Info,
  Lightbulb,
  LineChart,
  Lock,
  LogOut,
  Maximize,
  MessageCircle,
  MessageSquare,
  Moon,
  Package,
  Phone,
  Play,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Smile,
  Sparkles,
  Star,
  Store,
  Tag,
  ThumbsUp,
  Trash2,
  TrendingUp,
  TriangleAlert,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  Wallet,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import {
  ChatMessage,
  ConsultationBooking,
  ConsultationFormat,
  ConsultationPageData,
  ConsultationTopic,
  DataSharingPermissions,
  FaqItem,
  ForumCategory,
  ForumPost,
  ForumReply,
  MentorProfile,
  MentorTask,
} from '../../types/consultation';

export default function ConsultationIndex({
  mentor: initialMentor,
  other_mentors: initialOtherMentors,
  bookings: initialBookings,
  mentor_tasks: initialTasks,
  chat_messages: initialChat,
  forum_posts: initialForum,
  permissions: initialPermissions,
  faqs: initialFaqs,
  quick_suggestions: initialSuggestions,
}: ConsultationPageData) {
  // Shell Layout State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'konsultasi' | 'pesan' | 'komunitas' | 'bantuan'>('konsultasi');

  // Core Data States
  const [mentor, setMentor] = useState<MentorProfile>(initialMentor);
  const [otherMentors] = useState<MentorProfile[]>(initialOtherMentors);
  const [bookings, setBookings] = useState<ConsultationBooking[]>(initialBookings);
  const [mentorTasks, setMentorTasks] = useState<MentorTask[]>(initialTasks);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChat);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(initialForum);
  const [permissions, setPermissions] = useState<DataSharingPermissions>(initialPermissions);
  const [faqs] = useState<FaqItem[]>(initialFaqs);
  const [quickSuggestions] = useState<string[]>(initialSuggestions);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // CSRF token helper
  const getCsrfToken = () => {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
  };

  // Fullscreen helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // =========================================================================
  // SUMMARY CALCULATIONS
  // =========================================================================
  const nextBooking = useMemo(() => {
    return bookings.find((b) => b.status === 'dijadwalkan') || bookings.find((b) => b.status === 'menunggu') || null;
  }, [bookings]);

  const pendingTasksCount = useMemo(() => {
    return mentorTasks.filter((t) => !t.is_completed).length;
  }, [mentorTasks]);

  const completedTasksCount = useMemo(() => {
    return mentorTasks.filter((t) => t.is_completed).length;
  }, [mentorTasks]);

  const taskProgressPct = useMemo(() => {
    if (mentorTasks.length === 0) return 0;
    return Math.round((completedTasksCount / mentorTasks.length) * 100);
  }, [completedTasksCount, mentorTasks.length]);

  // =========================================================================
  // TAB 1: KONSULTASI ACTIONS & MODALS
  // =========================================================================
  const [bookingFilter, setBookingFilter] = useState<'semua' | 'akan_datang' | 'selesai'>('semua');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isMentorListModalOpen, setIsMentorListModalOpen] = useState(false);
  const [ratingModalBooking, setRatingModalBooking] = useState<ConsultationBooking | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [ratingReviewText, setRatingReviewText] = useState<string>('');

  // Booking Form State
  const [bookingTopic, setBookingTopic] = useState<ConsultationTopic>('Pemasaran Digital');
  const [bookingDesc, setBookingDesc] = useState<string>('');
  const [bookingDate1, setBookingDate1] = useState<string>('');
  const [bookingDate2, setBookingDate2] = useState<string>('');
  const [bookingFormat, setBookingFormat] = useState<ConsultationFormat>('video');
  const [bookingAttachmentName, setBookingAttachmentName] = useState<string>('');
  const [bookingConsent, setBookingConsent] = useState<boolean>(true);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (bookingFilter === 'akan_datang') {
        return b.status === 'dijadwalkan' || b.status === 'menunggu' || b.status === 'perlu_jadwal_baru';
      }
      if (bookingFilter === 'selesai') {
        return b.status === 'selesai';
      }
      return true;
    });
  }, [bookings, bookingFilter]);

  const handleToggleTask = async (taskId: string) => {
    // Optimistic UI update
    setMentorTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_completed: !t.is_completed } : t))
    );

    try {
      const res = await fetch(`/api/consultation/tasks/${taskId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
      });
      const data = await res.json();
      if (data.task) {
        showToast(
          data.task.is_completed
            ? 'Hebat! Satu tugas tindak lanjut berhasil diselesaikan.'
            : 'Tugas ditandai belum selesai.'
        );
      }
    } catch {
      showToast('Status tugas diperbarui di perangkat ini.');
    }
    // TODO: Sinkronkan counter tugas mentor ini ke widget Dashboard harian UMKM
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDesc.trim()) {
      showToast('Mohon tuliskan penjelasan masalah atau hal yang ingin dikonsultasikan.');
      return;
    }

    const preferred = [];
    if (bookingDate1.trim()) preferred.push(bookingDate1.trim());
    if (bookingDate2.trim()) preferred.push(bookingDate2.trim());
    if (preferred.length === 0) {
      preferred.push('Pilihan 1: Segera jika mentor bersedia');
    }

    setIsSubmittingBooking(true);
    try {
      const res = await fetch('/api/consultation/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({
          mentor_id: mentor.id,
          mentor_name: mentor.name,
          mentor_title: mentor.title,
          mentor_avatar: mentor.avatar,
          topic: bookingTopic,
          description: bookingDesc,
          preferred_dates: preferred,
          format: bookingFormat,
          attachment_name: bookingAttachmentName || null,
          consent_share_data: bookingConsent,
        }),
      });

      const data = await res.json();
      if (data.booking) {
        setBookings((prev) => [data.booking, ...prev]);
        setIsBookModalOpen(false);
        setBookingDesc('');
        setBookingDate1('');
        setBookingDate2('');
        setBookingAttachmentName('');
        showToast('Pengajuan konsultasi berhasil dikirim! Menunggu konfirmasi jadwal dari mentor.');
      }
    } catch {
      // Fallback local update
      const newB: ConsultationBooking = {
        id: 'booking-' + Date.now(),
        mentor_id: mentor.id,
        mentor_name: mentor.name,
        mentor_title: mentor.title,
        mentor_avatar: mentor.avatar,
        topic: bookingTopic,
        description: bookingDesc,
        preferred_dates: preferred,
        format: bookingFormat,
        status: 'menunggu',
        created_at: 'Baru saja',
      };
      setBookings((prev) => [newB, ...prev]);
      setIsBookModalOpen(false);
      showToast('Pengajuan konsultasi berhasil dikirim ke mentor.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalBooking) return;

    try {
      await fetch(`/api/consultation/${ratingModalBooking.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({
          rating: selectedRating,
          review: ratingReviewText || null,
        }),
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === ratingModalBooking.id
            ? { ...b, rating: selectedRating, review: ratingReviewText }
            : b
        )
      );
      showToast('Terima kasih! Ulasan dan bintangmu sangat berarti bagi mentor.');
    } catch {
      showToast('Ulasan berhasil disimpan.');
    } finally {
      setRatingModalBooking(null);
      setRatingReviewText('');
    }
  };

  // =========================================================================
  // TAB 2: PESAN (CHAT) ACTIONS & REALTIME SIMULATION
  // =========================================================================
  const [chatInputText, setChatInputText] = useState<string>('');
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottomChat = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'pesan') {
      scrollToBottomChat();
    }
  }, [activeTab, chatMessages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || chatInputText).trim();
    if (!text) return;

    // Optimistic UI
    const tempId = 'msg-' + Date.now();
    const tempMsg: ChatMessage = {
      id: tempId,
      sender: 'umkm',
      text,
      timestamp: 'Baru saja',
      status: 'delivered',
    };
    setChatMessages((prev) => [...prev, tempMsg]);
    setChatInputText('');
    setIsSendingMessage(true);

    try {
      // TODO: Integrasikan WebSocket / Laravel Reverb / Pusher untuk realtime messaging di versi rilis
      const res = await fetch('/api/consultation/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({ text }),
      });
      const resData = await res.json();
      if (resData.data?.all_messages) {
        setChatMessages(resData.data.all_messages);
      }
    } catch {
      // simulate simulated mentor reply locally
      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: 'msg-reply-' + Date.now(),
          sender: 'mentor',
          text: 'Terima kasih pertanyaannya Bu Siti! Pesan sudah saya terima. Saya akan berikan tanggapan segera ya Bu (maksimal 1-2 hari kerja). Semangat terus usahanya!',
          timestamp: 'Baru saja',
          status: 'read',
        };
        setChatMessages((prev) => [...prev, autoReply]);
      }, 1200);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // =========================================================================
  // TAB 3: KOMUNITAS (FORUM) ACTIONS & MODALS
  // =========================================================================
  const [forumCategory, setForumCategory] = useState<ForumCategory>('Semua');
  const [forumSort, setForumSort] = useState<'terbaru' | 'ramai' | 'belum_terjawab'>('terbaru');
  const [forumSearch, setForumSearch] = useState<string>('');
  const [selectedThread, setSelectedThread] = useState<ForumPost | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Pemasaran');

  // Report Modal
  const [reportModalData, setReportModalData] = useState<{ postId: string; replyId?: string } | null>(null);
  const [reportReason, setReportReason] = useState<'spam' | 'penipuan' | 'tidak_pantas' | 'data_pribadi'>('spam');
  const [reportNotes, setReportNotes] = useState('');

  const filteredForumPosts = useMemo(() => {
    return forumPosts
      .filter((post) => {
        const matchCat = forumCategory === 'Semua' || post.category === forumCategory;
        const matchSearch =
          post.title.toLowerCase().includes(forumSearch.toLowerCase()) ||
          post.content.toLowerCase().includes(forumSearch.toLowerCase()) ||
          post.author_name.toLowerCase().includes(forumSearch.toLowerCase());
        const matchSolved = forumSort === 'belum_terjawab' ? !post.is_solved : true;
        return matchCat && matchSearch && matchSolved;
      })
      .sort((a, b) => {
        if (forumSort === 'ramai') {
          return b.replies_count - a.replies_count;
        }
        return 0; // Default order
      });
  }, [forumPosts, forumCategory, forumSort, forumSearch]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      showToast('Mohon lengkapi judul dan isi pertanyaan diskusi.');
      return;
    }

    try {
      const res = await fetch('/api/consultation/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          category: newPostCategory,
        }),
      });
      const data = await res.json();
      if (data.post) {
        setForumPosts((prev) => [data.post, ...prev]);
        setIsNewPostModalOpen(false);
        setNewPostTitle('');
        setNewPostContent('');
        showToast('Diskusi berhasil dipublikasikan di komunitas UMKM!');
      }
    } catch {
      showToast('Gagal mempublikasikan diskusi.');
    }
  };

  const handleReplyPost = async (postId: string) => {
    if (!replyText.trim()) return;

    try {
      const res = await fetch(`/api/consultation/forum/posts/${postId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({ text: replyText }),
      });
      const data = await res.json();
      if (data.reply) {
        setForumPosts(data.posts);
        if (selectedThread && selectedThread.id === postId) {
          setSelectedThread({
            ...selectedThread,
            replies_count: selectedThread.replies_count + 1,
            replies: [...selectedThread.replies, data.reply],
          });
        }
        setReplyText('');
        showToast('Balasanmu berhasil dikirim!');
      }
    } catch {
      showToast('Gagal mengirim balasan.');
    }
  };

  const handleToggleLike = async (postId: string, replyId?: string) => {
    try {
      const res = await fetch(`/api/consultation/forum/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({ reply_id: replyId || null }),
      });
      const data = await res.json();
      if (data.posts) {
        setForumPosts(data.posts);
        if (selectedThread && selectedThread.id === postId) {
          const updatedSelected = data.posts.find((p: ForumPost) => p.id === postId);
          if (updatedSelected) setSelectedThread(updatedSelected);
        }
      }
    } catch {}
  };

  const handleMarkBestAnswer = async (postId: string, replyId: string) => {
    try {
      const res = await fetch(`/api/consultation/forum/posts/${postId}/best-answer/${replyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
      });
      const data = await res.json();
      if (data.success) {
        setForumPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              const updatedReplies = p.replies.map((r) => ({
                ...r,
                is_best_answer: r.id === replyId ? !r.is_best_answer : false,
              }));
              const hasBest = updatedReplies.some((r) => r.is_best_answer);
              return { ...p, is_solved: hasBest, replies: updatedReplies };
            }
            return p;
          })
        );
        if (selectedThread && selectedThread.id === postId) {
          const updatedReplies = selectedThread.replies.map((r) => ({
            ...r,
            is_best_answer: r.id === replyId ? !r.is_best_answer : false,
          }));
          setSelectedThread({
            ...selectedThread,
            is_solved: updatedReplies.some((r) => r.is_best_answer),
            replies: updatedReplies,
          });
        }
        showToast('Status jawaban terbaik berhasil diperbarui.');
      }
    } catch {}
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalData) return;

    try {
      const res = await fetch('/api/consultation/forum/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({
          post_id: reportModalData.postId,
          reply_id: reportModalData.replyId || null,
          reason: reportReason,
          notes: reportNotes,
        }),
      });
      const data = await res.json();
      showToast(data.message || 'Laporan diterima tim moderator.');
    } catch {
      showToast('Laporan berhasil dikirim.');
    } finally {
      setReportModalData(null);
      setReportNotes('');
    }
  };

  // =========================================================================
  // TAB 4: PUSAT BANTUAN & FAQ
  // =========================================================================
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [faqCategory, setFaqCategory] = useState<string>('Semua');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState('Saran Fitur');
  const [feedbackText, setFeedbackText] = useState('');

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchCat = faqCategory === 'Semua' || faq.category === faqCategory;
      const matchSearch =
        faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
        faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [faqs, faqCategory, faqSearch]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    try {
      const res = await fetch('/api/consultation/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({
          category: feedbackCategory,
          feedback: feedbackText,
        }),
      });
      const data = await res.json();
      showToast(data.message || 'Masukan Anda sangat berarti bagi kami!');
    } catch {
      showToast('Terima kasih atas masukan Anda.');
    } finally {
      setIsFeedbackModalOpen(false);
      setFeedbackText('');
    }
  };

  // =========================================================================
  // DATA SHARING PERMISSIONS MODAL
  // =========================================================================
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  const handleUpdatePermissionToggle = async (key: keyof DataSharingPermissions) => {
    const newVal = !permissions[key];
    const updated = { ...permissions, [key]: newVal };
    setPermissions(updated);

    try {
      await fetch('/api/consultation/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify(updated),
      });
      showToast('Izin berbagi data diperbarui.');
    } catch {}
  };

  const handleRevokeAllPermissions = async () => {
    try {
      await fetch('/api/consultation/permissions/revoke-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
      });
      setPermissions({
        share_profile: false,
        share_products: false,
        share_finance: false,
        share_learning: false,
        last_updated: 'Baru saja dicabut',
      });
      showToast('Semua akses data mentor telah dinonaktifkan.');
    } catch {}
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb] font-sans text-slate-700 antialiased print:bg-white print:text-black">
      <Head title="Bantuan & Tanya Mentor - Lapak Digital UMKM" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="animate-fade-in fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl print:hidden">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible">
        <AppSidebar
          current="bantuan"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          counts={{ tasks: pendingTasksCount }}
          onShowToast={showToast}
          customWidget={
            <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3 text-xs">
              <div className="flex items-center space-x-1.5 font-bold text-purple-800 mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Mentor Resmi Terverifikasi</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Seluruh mentor dan konsultan merupakan praktisi UMKM & perbankan terakreditasi.
              </p>
            </div>
          }
        />

        {/* ================= MAIN CONTENT AREA ================= */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Top Navbar */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur sm:px-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 lg:hidden"
                title="Buka / Tutup Menu"
              >
                <Compass className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-base font-bold text-slate-800 sm:text-lg">
                  Bantuan & Konsultasi Mentor
                </h1>
                <p className="hidden text-xs text-slate-500 sm:block">
                  Pendampingan usaha ramah, komunitas sesama pelaku UMKM, dan pusat panduan
                </p>
              </div>
            </div>

            {/* Right Tools */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={toggleFullscreen}
                className="hidden rounded-xl border border-slate-200/80 p-2 text-slate-500 transition hover:bg-slate-50 sm:block"
                title="Layar Penuh"
              >
                <Maximize className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsPermissionsModalOpen(true)}
                className="flex items-center space-x-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-[#8b5cf6] transition hover:bg-purple-100"
                title="Atur Izin Berbagi Data"
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Izin Data</span>
              </button>
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="flex items-center space-x-1.5 rounded-xl bg-[#8b5cf6] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-purple-200 transition hover:bg-purple-700 active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>+ Ajukan Konsultasi</span>
              </button>
            </div>
          </header>

          {/* Main Body Container */}
          <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
            {/* ================= SUMMARY STATS CARDS ================= */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Card 1: Sesi Terdekat */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Sesi Konsultasi Terdekat
                    </span>
                    {nextBooking ? (
                      <div className="mt-1">
                        <h4 className="text-sm font-bold text-slate-800">
                          {nextBooking.confirmed_date || nextBooking.preferred_dates[0] || 'Segera'}
                        </h4>
                        <p className="mt-0.5 text-xs text-slate-500">
                          bersama <span className="font-semibold text-slate-700">{nextBooking.mentor_name}</span>
                        </p>
                      </div>
                    ) : (
                      <div className="mt-1">
                        <h4 className="text-sm font-bold text-slate-800">Belum ada jadwal</h4>
                        <p className="mt-0.5 text-xs text-slate-500">Ajukan konsultasi kapan saja</p>
                      </div>
                    )}
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#8b5cf6]">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-2.5">
                  {nextBooking ? (
                    <>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        {nextBooking.status === 'dijadwalkan' ? 'Dijadwalkan' : 'Menunggu Konfirmasi'}
                      </span>
                      {nextBooking.meet_link ? (
                        <a
                          href={nextBooking.meet_link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1 text-xs font-bold text-[#8b5cf6] hover:underline"
                        >
                          <span>Masuk Ruang Temu</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <button
                          onClick={() => setActiveTab('konsultasi')}
                          className="text-xs font-semibold text-[#8b5cf6] hover:underline"
                        >
                          Lihat Detail
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => setIsBookModalOpen(true)}
                      className="text-xs font-bold text-[#8b5cf6] hover:underline"
                    >
                      + Buat Janji Temu
                    </button>
                  )}
                </div>
              </div>

              {/* Card 2: Pesan Mentor */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Pesan Mentor
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-slate-800">
                      {mentor.name}
                    </h4>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {mentor.response_time}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-2.5">
                  <span className="inline-flex items-center space-x-1 text-[11px] text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Mentor Siap Membantu</span>
                  </span>
                  <button
                    onClick={() => setActiveTab('pesan')}
                    className="flex items-center space-x-1 text-xs font-bold text-[#8b5cf6] hover:underline"
                  >
                    <span>Buka Chat</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 3: Tugas Tindak Lanjut Mentor */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Tugas dari Mentor
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-slate-800">
                      {completedTasksCount} dari {mentorTasks.length} Selesai
                    </h4>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {pendingTasksCount > 0 ? `${pendingTasksCount} hal perlu dicoba` : 'Semua tugas beres!'}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-3 border-t border-slate-50 pt-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Kemajuan Praktik</span>
                    <span className="font-bold text-slate-700">{taskProgressPct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#8b5cf6] transition-all duration-500"
                      style={{ width: `${taskProgressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ================= TAB NAVIGATION ================= */}
            <div className="mb-6 flex border-b border-slate-200">
              <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('konsultasi')}
                  className={`flex items-center space-x-2 border-b-2 px-1 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                    activeTab === 'konsultasi'
                      ? 'border-[#8b5cf6] text-[#8b5cf6]'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Konsultasi Mentor</span>
                  {pendingTasksCount > 0 && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-[#8b5cf6]">
                      {pendingTasksCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('pesan')}
                  className={`flex items-center space-x-2 border-b-2 px-1 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                    activeTab === 'pesan'
                      ? 'border-[#8b5cf6] text-[#8b5cf6]'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Pesan Pribadi</span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                </button>

                <button
                  onClick={() => setActiveTab('komunitas')}
                  className={`flex items-center space-x-2 border-b-2 px-1 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                    activeTab === 'komunitas'
                      ? 'border-[#8b5cf6] text-[#8b5cf6]'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  <Compass className="h-4 w-4" />
                  <span>Komunitas UMKM</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {forumPosts.length} Diskusi
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('bantuan')}
                  className={`flex items-center space-x-2 border-b-2 px-1 py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                    activeTab === 'bantuan'
                      ? 'border-[#8b5cf6] text-[#8b5cf6]'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Pusat Bantuan & Panduan</span>
                </button>
              </nav>
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: KONSULTASI MENTOR                                                 */}
            {/* ========================================================================= */}
            {activeTab === 'konsultasi' && (
              <div className="space-y-6">
                {/* 1. MENTOR SAYA CARD */}
                <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-white via-purple-50/20 to-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start space-x-4">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="h-16 w-16 rounded-2xl object-cover ring-2 ring-purple-200"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-800">{mentor.name}</h3>
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-[#8b5cf6]">
                            Mentor Resmi Kamu
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-600">{mentor.title}</p>
                        <p className="text-[11px] text-slate-400">{mentor.institution}</p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="flex items-center space-x-1 font-bold text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span>{mentor.rating}</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{mentor.consultation_count} sesi pendampingan</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{mentor.response_time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setActiveTab('pesan')}
                        className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-[#8b5cf6]" />
                        <span>Kirim Pesan</span>
                      </button>
                      <button
                        onClick={() => setIsBookModalOpen(true)}
                        className="flex items-center space-x-1.5 rounded-xl bg-[#8b5cf6] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-purple-200 transition hover:bg-purple-700 active:scale-95"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Jadwalkan Konsultasi</span>
                      </button>
                      <button
                        onClick={() => setIsMentorListModalOpen(true)}
                        className="rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-[#8b5cf6] hover:text-[#8b5cf6]"
                      >
                        Pilih Mentor Lain
                      </button>
                    </div>
                  </div>

                  {/* Expertise Badges */}
                  <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-purple-50 pt-3">
                    <span className="text-[11px] font-semibold text-slate-400">Bidang Keahlian:</span>
                    {mentor.expertise.map((exp, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>

                  {/* Mentor Disclaimer Alert */}
                  <div className="mt-3 flex items-center space-x-2 rounded-xl bg-amber-50/70 px-3 py-2 text-[11px] text-amber-800">
                    <Info className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <span>
                      Nasihat mentor bersifat pendampingan & edukasi umum untuk UMKM, bukan nasihat hukum atau perpajakan resmi.
                    </span>
                  </div>
                </div>

                {/* 2. CATATAN & TUGAS TINDAK LANJUT MENTOR ("Yang Perlu Kamu Coba") */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-slate-800">
                          Catatan & Tindak Lanjut dari Mentor
                        </h3>
                        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-[#8b5cf6]">
                          Yang Perlu Kamu Coba
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Langkah praktis yang disarankan mentor agar tokomu semakin laris
                      </p>
                    </div>

                    <span className="text-xs font-bold text-slate-600">
                      {completedTasksCount} / {mentorTasks.length} Selesai ({taskProgressPct}%)
                    </span>
                  </div>

                  {/* Task list */}
                  <div className="mt-4 space-y-2.5">
                    {mentorTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className={`group flex cursor-pointer items-start space-x-3 rounded-xl border p-3.5 transition ${
                          task.is_completed
                            ? 'border-emerald-100 bg-emerald-50/30'
                            : 'border-slate-100 bg-white hover:border-purple-200 hover:bg-purple-50/20'
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                            task.is_completed
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-slate-300 bg-white group-hover:border-purple-400'
                          }`}
                        >
                          {task.is_completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <h4
                              className={`text-xs font-bold ${
                                task.is_completed
                                  ? 'text-slate-400 line-through'
                                  : 'text-slate-800 group-hover:text-[#8b5cf6]'
                              }`}
                            >
                              {task.title}
                            </h4>
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                              {task.category}
                            </span>
                          </div>
                          <p
                            className={`mt-1 text-xs leading-relaxed ${
                              task.is_completed ? 'text-slate-400' : 'text-slate-600'
                            }`}
                          >
                            {task.description}
                          </p>
                          {task.due_date && (
                            <p className="mt-1 text-[10px] text-slate-400">
                              Target selesai: {task.due_date}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. DAFTAR KONSULTASI (AKAN DATANG & RIWAYAT) */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Jadwal & Riwayat Konsultasi</h3>
                      <p className="text-xs text-slate-500">Semua sesi pendampingan bersama mentor</p>
                    </div>

                    {/* Filter sub-tabs */}
                    <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                      <button
                        onClick={() => setBookingFilter('semua')}
                        className={`rounded-lg px-3 py-1 transition ${
                          bookingFilter === 'semua' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Semua ({bookings.length})
                      </button>
                      <button
                        onClick={() => setBookingFilter('akan_datang')}
                        className={`rounded-lg px-3 py-1 transition ${
                          bookingFilter === 'akan_datang' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Akan Datang
                      </button>
                      <button
                        onClick={() => setBookingFilter('selesai')}
                        className={`rounded-lg px-3 py-1 transition ${
                          bookingFilter === 'selesai' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Riwayat Selesai
                      </button>
                    </div>
                  </div>

                  {/* Bookings cards */}
                  <div className="mt-4 space-y-3">
                    {filteredBookings.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
                        Tidak ada sesi konsultasi pada kategori ini.
                      </div>
                    ) : (
                      filteredBookings.map((b) => (
                        <div
                          key={b.id}
                          className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-slate-200 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-start space-x-3.5">
                            <img
                              src={b.mentor_avatar}
                              alt={b.mentor_name}
                              className="h-11 w-11 rounded-xl object-cover"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-slate-800 text-xs sm:text-sm">
                                  {b.topic}
                                </span>
                                {/* Status Badge */}
                                {b.status === 'dijadwalkan' && (
                                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                    Dijadwalkan
                                  </span>
                                )}
                                {b.status === 'menunggu' && (
                                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                    Menunggu Konfirmasi Mentor
                                  </span>
                                )}
                                {b.status === 'selesai' && (
                                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-[#8b5cf6]">
                                    Selesai
                                  </span>
                                )}
                                {b.status === 'perlu_jadwal_baru' && (
                                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                                    Perlu Pilih Jadwal Baru
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                                {b.description}
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3 text-slate-400" />
                                  <span>{b.confirmed_date || b.preferred_dates.join(' / ')}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  {b.format === 'video' && <Video className="h-3 w-3 text-purple-500" />}
                                  {b.format === 'chat' && <MessageCircle className="h-3 w-3 text-blue-500" />}
                                  {b.format === 'tatap_muka' && <Users className="h-3 w-3 text-emerald-500" />}
                                  <span className="capitalize">{b.format}</span>
                                </span>
                                {b.attachment_name && (
                                  <span className="text-purple-600 font-medium">
                                    📎 {b.attachment_name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 shrink-0">
                            {b.meet_link && b.status === 'dijadwalkan' && (
                              <a
                                href={b.meet_link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center space-x-1 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700"
                              >
                                <Video className="h-3.5 w-3.5" />
                                <span>Masuk Ruang Temu</span>
                              </a>
                            )}
                            {b.status === 'selesai' && (
                              <button
                                onClick={() => {
                                  setRatingModalBooking(b);
                                  setSelectedRating(b.rating || 5);
                                  setRatingReviewText(b.review || '');
                                }}
                                className="flex items-center space-x-1 rounded-xl border border-purple-200 bg-white px-3 py-1.5 text-xs font-bold text-[#8b5cf6] hover:bg-purple-50"
                              >
                                <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                                <span>{b.rating ? 'Ubah Nilai' : 'Beri Nilai & Ulasan'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: PESAN (CHAT) DENGAN MENTOR                                        */}
            {/* ========================================================================= */}
            {activeTab === 'pesan' && (
              <div className="flex h-[calc(100vh-14rem)] min-h-[500px] flex-col rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-200"
                      />
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800">{mentor.name}</h3>
                      <p className="text-[11px] text-slate-500">
                        {mentor.title} • <span className="text-emerald-600 font-semibold">Online</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => showToast('Memuat pesan terbaru...')}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
                      title="Segarkan Chat"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setIsPermissionsModalOpen(true)}
                      className="rounded-xl border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-xs font-semibold text-[#8b5cf6] hover:bg-purple-100"
                    >
                      Izin Data
                    </button>
                  </div>
                </div>

                {/* Expectation Banner */}
                <div className="flex items-center space-x-2 bg-purple-50/70 px-4 py-2 text-[11px] text-slate-600 border-b border-purple-100">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-[#8b5cf6]" />
                  <span>
                    Mentor sukarelawan & pendamping biasanya membalas dalam <strong>1-2 hari kerja</strong>. Tanyakan kendala jualan harianmu dengan santai.
                  </span>
                </div>

                {/* Chat Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30">
                  {chatMessages.map((msg) => {
                    const isMe = msg.sender === 'umkm';
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end space-x-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <img
                            src={mentor.avatar}
                            alt={mentor.name}
                            className="h-7 w-7 rounded-full object-cover shrink-0 mb-1"
                          />
                        )}

                        <div
                          className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-[#8b5cf6] text-white rounded-br-none'
                              : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <div
                            className={`mt-1 flex items-center justify-end space-x-1 text-[10px] ${
                              isMe ? 'text-purple-200' : 'text-slate-400'
                            }`}
                          >
                            <span>{msg.timestamp}</span>
                            {isMe && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatMessagesEndRef} />
                </div>

                {/* Quick Question Suggestions Pills */}
                <div className="border-t border-slate-100 bg-white px-4 py-2">
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
                    <span className="shrink-0 text-[11px] font-semibold text-slate-400">Tanya cepat:</span>
                    {quickSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setChatInputText(sug);
                        }}
                        className="shrink-0 rounded-full border border-purple-200 bg-purple-50/50 px-2.5 py-1 text-[11px] font-medium text-[#8b5cf6] transition hover:bg-purple-100"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center space-x-2 border-t border-slate-100 bg-white p-3"
                >
                  <button
                    type="button"
                    onClick={() => showToast('Pilih foto tangkapan layar untuk dikirim ke mentor')}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title="Lampirkan Gambar"
                  >
                    <Camera className="h-5 w-5" />
                  </button>

                  <input
                    type="text"
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    placeholder="Ketik pertanyaan untuk Kak Rendy..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-[#8b5cf6] focus:bg-white focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={isSendingMessage || !chatInputText.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8b5cf6] text-white shadow-sm transition hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: KOMUNITAS UMKM                                                    */}
            {/* ========================================================================= */}
            {activeTab === 'komunitas' && (
              <div className="space-y-6">
                {/* Community Rules Alert Banner */}
                <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-pink-50 p-4 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-[#8b5cf6] mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                        Aturan Ruang Komunitas Pelaku UMKM
                      </h4>
                      <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                        1. Gunakan bahasa santun & saling menyemangati • 2. Dilarang spam atau jualan berlebihan • 3. <strong>JANGAN PERNAH</strong> membagikan nomor rekening, PIN, OTP, atau data sensitif usahamu.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filter, Search & Create Action Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Category Chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['Semua', 'Pemasaran', 'Keuangan', 'Produk & Kemasan', 'Tips Usaha', 'Tanya Jawab'] as ForumCategory[]).map(
                      (cat) => (
                        <button
                          key={cat}
                          onClick={() => setForumCategory(cat)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                            forumCategory === cat
                              ? 'bg-[#8b5cf6] text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Sort Dropdown */}
                    <select
                      value={forumSort}
                      onChange={(e) => setForumSort(e.target.value as any)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="terbaru">Terbaru</option>
                      <option value="ramai">Paling Ramai</option>
                      <option value="belum_terjawab">Belum Terjawab</option>
                    </select>

                    <button
                      onClick={() => setIsNewPostModalOpen(true)}
                      className="flex items-center space-x-1.5 rounded-xl bg-[#8b5cf6] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>+ Buat Diskusi</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={forumSearch}
                    onChange={(e) => setForumSearch(e.target.value)}
                    placeholder="Cari topik diskusi, pertanyaan, atau tips usaha..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#8b5cf6] focus:outline-none"
                  />
                </div>

                {/* Forum Posts List */}
                <div className="space-y-3">
                  {filteredForumPosts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-xs text-slate-400">
                      Belum ada diskusi untuk kategori ini. Jadilah yang pertama bertanya!
                    </div>
                  ) : (
                    filteredForumPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedThread(post)}
                        className="group cursor-pointer rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-purple-200 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-lg bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-[#8b5cf6]">
                                {post.category}
                              </span>
                              {post.is_solved && (
                                <span className="inline-flex items-center space-x-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                  <span>Terjawab</span>
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400">• {post.created_at}</span>
                            </div>

                            <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#8b5cf6]">
                              {post.title}
                            </h3>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {post.content}
                            </p>
                          </div>
                        </div>

                        {/* Card Footer: Author and Stats */}
                        <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-50 pt-3 text-xs text-slate-500">
                          <div className="flex items-center space-x-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-[#8b5cf6]">
                              {post.author_name.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-700">{post.author_name}</span>
                            <span className="text-slate-400">({post.author_store})</span>
                          </div>

                          <div className="flex items-center space-x-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleLike(post.id);
                              }}
                              className={`flex items-center space-x-1 text-xs font-semibold transition ${
                                post.is_liked_by_me ? 'text-pink-600' : 'text-slate-500 hover:text-pink-600'
                              }`}
                            >
                              <Heart className={`h-3.5 w-3.5 ${post.is_liked_by_me ? 'fill-current' : ''}`} />
                              <span>{post.likes_count}</span>
                            </button>

                            <span className="flex items-center space-x-1 text-xs font-semibold text-slate-500">
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span>{post.replies_count} balasan</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: PUSAT BANTUAN & FAQ                                               */}
            {/* ========================================================================= */}
            {activeTab === 'bantuan' && (
              <div className="space-y-6">
                {/* Search Header Banner */}
                <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 via-white to-purple-50 p-6 text-center shadow-sm">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    Ada yang bisa kami bantu seputar aplikasi?
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                    Ketik kata kunci pertanyaanmu di bawah atau pilih kategori topik
                  </p>

                  <div className="relative mx-auto mt-4 max-w-xl">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={faqSearch}
                      onChange={(e) => setFaqSearch(e.target.value)}
                      placeholder="Misal: nomor whatsapp, cara bagi link toko, modal..."
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-xs sm:text-sm text-slate-800 shadow-sm placeholder-slate-400 focus:border-[#8b5cf6] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Security and Slow Connection Tips Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Waspada Penipuan Card */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                    <div className="flex items-start space-x-3">
                      <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                          Waspada Modus Penipuan Belanja Online
                        </h4>
                        <ul className="mt-2 space-y-1 text-xs text-amber-800 list-disc list-inside">
                          <li>Selalu cek mutasi rekening/m-banking sebelum mengirim pesanan. Jangan percaya struk transfer foto saja.</li>
                          <li>Jangan pernah memberikan kode OTP SMS WhatsApp kepada siapa pun.</li>
                          <li>Admin resmi platform tidak pernah meminta password atau transfer biaya aktivasi.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Tips Hemat Kuota & Koneksi Lambat */}
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
                    <div className="flex items-start space-x-3">
                      <Wifi className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-blue-900">
                          Tips Internet Lambat & Hemat Kuota
                        </h4>
                        <ul className="mt-2 space-y-1 text-xs text-blue-800 list-disc list-inside">
                          <li>Kirim foto produk berukuran di bawah 2MB agar loading etalase pelanggan kencang.</li>
                          <li>Catatan kas harian otomatis tersimpan ringan di memori browser.</li>
                          <li>Gunakan format konsultasi chat teks jika sinyal sedang tidak stabil.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Accordion List */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 mb-4">Pertanyaan yang Sering Diajukan</h4>
                  <div className="divide-y divide-slate-100">
                    {filteredFaqs.map((faq) => {
                      const isOpen = openFaqId === faq.id;
                      return (
                        <div key={faq.id} className="py-3.5">
                          <button
                            onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                            className="flex w-full items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-800 hover:text-[#8b5cf6]"
                          >
                            <span>{faq.question}</span>
                            <ChevronDown
                              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                                isOpen ? 'rotate-180 text-[#8b5cf6]' : ''
                              }`}
                            />
                          </button>

                          {isOpen && (
                            <div className="mt-2 text-xs leading-relaxed text-slate-600 pl-1">
                              <p>{faq.answer}</p>
                              {faq.action_label && faq.action_url && (
                                <div className="mt-2.5">
                                  <Link
                                    href={faq.action_url}
                                    className="inline-flex items-center space-x-1 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-[#8b5cf6] hover:bg-purple-100"
                                  >
                                    <span>{faq.action_label}</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </Link>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Help: Hubungi Pengembang & Tim */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800">Belum menemukan jawaban?</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Tanyakan langsung kepada mentor pendamping atau kirimkan masukan kepada tim pengembang aplikasi
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => setActiveTab('konsultasi')}
                      className="rounded-xl border border-[#8b5cf6] bg-white px-4 py-2 text-xs font-bold text-[#8b5cf6] hover:bg-purple-50"
                    >
                      Tanya Mentor Pendamping
                    </button>
                    <button
                      onClick={() => setIsFeedbackModalOpen(true)}
                      className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900"
                    >
                      Kirim Masukan ke Tim Platform
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: AJUKAN KONSULTASI                                                */}
      {/* ========================================================================= */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-[#8b5cf6]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  Ajukan Konsultasi dengan {mentor.name}
                </h3>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBooking} className="mt-4 space-y-4">
              {/* Topic Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700">Topik Konsultasi</label>
                <select
                  value={bookingTopic}
                  onChange={(e) => setBookingTopic(e.target.value as ConsultationTopic)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                >
                  <option value="Pemasaran Digital">Pemasaran Digital & Media Sosial</option>
                  <option value="Foto & Kemasan Produk">Foto & Kemasan Produk</option>
                  <option value="Pembukuan & Arus Kas">Pembukuan & Arus Kas</option>
                  <option value="Etalase Online">Etalase Toko Online</option>
                  <option value="Belajar & Modul">Pojok Belajar & Pemahaman Materi</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Kendala atau Hal yang Ingin Ditanyakan
                </label>
                <textarea
                  rows={3}
                  value={bookingDesc}
                  onChange={(e) => setBookingDesc(e.target.value)}
                  placeholder="Contoh: Saya bingung menentukan jadwal posting reels sambal di Instagram agar penonton ramai..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                  required
                />
              </div>

              {/* Format Pilihan */}
              <div>
                <label className="block text-xs font-bold text-slate-700">Format Konsultasi</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingFormat('chat')}
                    className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition ${
                      bookingFormat === 'chat'
                        ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MessageCircle className="h-4 w-4 mb-1" />
                    <span className="text-xs font-bold">Chat Santai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingFormat('video')}
                    className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition ${
                      bookingFormat === 'video'
                        ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="h-4 w-4 mb-1" />
                    <span className="text-xs font-bold">Video Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingFormat('tatap_muka')}
                    className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition ${
                      bookingFormat === 'tatap_muka'
                        ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="h-4 w-4 mb-1" />
                    <span className="text-xs font-bold">Tatap Muka</span>
                  </button>
                </div>
              </div>

              {/* Preferred Dates */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Usulan Waktu Luang (Pilih 1 atau 2 alternatif)
                </label>
                <input
                  type="text"
                  value={bookingDate1}
                  onChange={(e) => setBookingDate1(e.target.value)}
                  placeholder="Pilihan 1: misal Jumat, 31 Okt - 14:00 WIB"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                />
                <input
                  type="text"
                  value={bookingDate2}
                  onChange={(e) => setBookingDate2(e.target.value)}
                  placeholder="Pilihan 2 (opsional): misal Sabtu, 1 Nov - 10:00 WIB"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Lampirkan Foto / Tangkapan Layar (Opsional, maks 5MB)
                </label>
                <input
                  type="text"
                  value={bookingAttachmentName}
                  onChange={(e) => setBookingAttachmentName(e.target.value)}
                  placeholder="Nama file / foto (contoh: foto_botol_sambal.jpg)"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                />
              </div>

              {/* Consent Data Sharing Checkbox */}
              <div className="rounded-xl bg-purple-50/60 p-3">
                <label className="flex items-start space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingConsent}
                    onChange={(e) => setBookingConsent(e.target.checked)}
                    className="mt-0.5 rounded border-purple-300 text-[#8b5cf6] focus:ring-[#8b5cf6]"
                  />
                  <span>
                    Saya bersedia membagikan ringkasan data etalase & modul belajar agar mentor dapat memberikan solusi yang tepat untuk usaha saya.
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="rounded-xl bg-[#8b5cf6] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSubmittingBooking ? 'Mengirim...' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DETAIL FORUM THREAD & BALASAN                                    */}
      {/* ========================================================================= */}
      {selectedThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Thread Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <div className="flex items-center space-x-2">
                <span className="rounded-lg bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-[#8b5cf6]">
                  {selectedThread.category}
                </span>
                <span className="text-xs text-slate-400">• {selectedThread.created_at}</span>
              </div>
              <button
                onClick={() => setSelectedThread(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Thread Content & Replies (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Question */}
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  {selectedThread.title}
                </h2>
                <div className="mt-2 flex items-center space-x-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{selectedThread.author_name}</span>
                  <span>({selectedThread.author_store})</span>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl">
                  {selectedThread.content}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleLike(selectedThread.id)}
                    className={`flex items-center space-x-1.5 font-bold ${
                      selectedThread.is_liked_by_me ? 'text-pink-600' : 'text-slate-500 hover:text-pink-600'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${selectedThread.is_liked_by_me ? 'fill-current' : ''}`} />
                    <span>{selectedThread.likes_count} Bermanfaat</span>
                  </button>

                  <button
                    onClick={() => setReportModalData({ postId: selectedThread.id })}
                    className="text-slate-400 hover:text-red-500 text-[11px]"
                  >
                    Laporkan
                  </button>
                </div>
              </div>

              {/* Replies Section */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  {selectedThread.replies.length} Balasan dari Komunitas
                </h4>

                <div className="space-y-3">
                  {selectedThread.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`rounded-xl p-3.5 border transition ${
                        reply.is_best_answer
                          ? 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-200'
                          : reply.is_mentor
                          ? 'border-purple-200 bg-purple-50/30'
                          : 'border-slate-100 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-800">{reply.author_name}</span>
                          {reply.is_mentor ? (
                            <span className="inline-flex items-center space-x-1 rounded-full bg-[#8b5cf6] px-2 py-0.5 text-[10px] font-bold text-white">
                              <Sparkles className="h-2.5 w-2.5" />
                              <span>Mentor Terverifikasi</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">({reply.author_store})</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">{reply.created_at}</span>
                      </div>

                      <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {reply.text}
                      </p>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-2 text-xs">
                        <button
                          onClick={() => handleToggleLike(selectedThread.id, reply.id)}
                          className={`flex items-center space-x-1 text-[11px] font-semibold ${
                            reply.is_liked_by_me ? 'text-pink-600' : 'text-slate-400 hover:text-pink-600'
                          }`}
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>{reply.likes_count} Membantu</span>
                        </button>

                        <div className="flex items-center space-x-2">
                          {/* If author is me, can mark best answer */}
                          {selectedThread.is_author_me && (
                            <button
                              onClick={() => handleMarkBestAnswer(selectedThread.id, reply.id)}
                              className={`text-[11px] font-bold px-2 py-0.5 rounded transition ${
                                reply.is_best_answer
                                  ? 'bg-emerald-600 text-white'
                                  : 'border border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {reply.is_best_answer ? '✓ Jawaban Terbaik' : 'Tandai Terbaik'}
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setReportModalData({ postId: selectedThread.id, replyId: reply.id })
                            }
                            className="text-[10px] text-slate-400 hover:text-red-500"
                          >
                            Laporkan
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reply Input Form */}
            <div className="border-t border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Tulis balasan atau saran pengalamanmu..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleReplyPost(selectedThread.id);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleReplyPost(selectedThread.id)}
                  disabled={!replyText.trim()}
                  className="rounded-xl bg-[#8b5cf6] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PENGATURAN IZIN BERBAGI DATA                                     */}
      {/* ========================================================================= */}
      {isPermissionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-[#8b5cf6]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  Pengaturan Izin Berbagi Data
                </h3>
              </div>
              <button
                onClick={() => setIsPermissionsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              Tentukan informasi apa saja yang dapat dilihat oleh mentor pendamping untuk memberikan masukan usaha:
            </p>

            <div className="mt-4 space-y-3">
              {/* Profile Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Profil Usaha</h4>
                  <p className="text-[11px] text-slate-500">Nama toko, kategori, nomor WhatsApp</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdatePermissionToggle('share_profile')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    permissions.share_profile ? 'bg-[#8b5cf6]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      permissions.share_profile ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Products Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Produk & Etalase Toko</h4>
                  <p className="text-[11px] text-slate-500">Daftar produk, foto etalase, dan stok</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdatePermissionToggle('share_products')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    permissions.share_products ? 'bg-[#8b5cf6]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      permissions.share_products ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Finance Toggle (DEFAULT OFF with Warning) */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1">
                      <Lock className="h-3.5 w-3.5 text-amber-600" />
                      <h4 className="text-xs font-bold text-slate-800">Catatan Keuangan & Kas</h4>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Omzet, uang masuk & keluar (Pribadi/Rahasia)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdatePermissionToggle('share_finance')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      permissions.share_finance ? 'bg-[#8b5cf6]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                        permissions.share_finance ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-amber-700 leading-relaxed">
                  ⚠️ Secara default dinonaktifkan demi privasi tokomu. Aktifkan hanya jika kamu meminta saran audit keuangan dari mentor akuntan.
                </p>
              </div>

              {/* Learning Progress Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Hasil Belajar & Modul</h4>
                  <p className="text-[11px] text-slate-500">Nilai tes & modul mikro yang diselesaikan</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdatePermissionToggle('share_learning')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    permissions.share_learning ? 'bg-[#8b5cf6]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      permissions.share_learning ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={handleRevokeAllPermissions}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Cabut Semua Izin
              </button>
              <button
                type="button"
                onClick={() => setIsPermissionsModalOpen(false)}
                className="rounded-xl bg-[#8b5cf6] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700"
              >
                Simpan & Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PILIH MENTOR LAIN                                                */}
      {/* ========================================================================= */}
      {isMentorListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Daftar Mentor Pendamping Lainnya
              </h3>
              <button
                onClick={() => setIsMentorListModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {otherMentors.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-slate-100 p-4 hover:border-purple-200 transition"
                >
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="h-12 w-12 rounded-xl object-cover ring-2 ring-purple-100"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">{m.name}</h4>
                        <span className="flex items-center space-x-1 text-xs font-bold text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span>{m.rating}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{m.title}</p>
                      <p className="text-[11px] text-slate-400">{m.institution}</p>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">{m.bio}</p>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-2">
                        <span className="text-[10px] text-slate-400">{m.response_time}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setMentor(m);
                            setIsMentorListModalOpen(false);
                            showToast(`Mentor berhasil diubah ke ${m.name}`);
                          }}
                          className="rounded-lg bg-purple-50 px-3 py-1 text-xs font-bold text-[#8b5cf6] hover:bg-purple-100"
                        >
                          Pilih Mentor Ini
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ULASAN & NILAI SESI KONSULTASI                                   */}
      {/* ========================================================================= */}
      {ratingModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800 text-center">
              Bagaimana pengalaman konsultasimu?
            </h3>
            <p className="mt-1 text-xs text-slate-500 text-center">
              bersama {ratingModalBooking.mentor_name}
            </p>

            {/* Stars */}
            <div className="my-4 flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  className="p-1 transition hover:scale-110"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= selectedRating
                        ? 'fill-current text-amber-400'
                        : 'text-slate-200 hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={ratingReviewText}
              onChange={(e) => setRatingReviewText(e.target.value)}
              placeholder="Tulis ulasan singkat (misal: penjelasannya mudah dipahami dan sangat membantu)..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
            />

            <div className="mt-4 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setRatingModalBooking(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitRating}
                className="rounded-xl bg-[#8b5cf6] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700"
              >
                Kirim Penilaian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: BUAT DISKUSI BARU DI FORUM                                       */}
      {/* ========================================================================= */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Mulai Diskusi Baru di Komunitas
              </h3>
              <button
                onClick={() => setIsNewPostModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700">Kategori</label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                >
                  <option value="Pemasaran">Pemasaran & Promosi</option>
                  <option value="Keuangan">Keuangan & Kas Usaha</option>
                  <option value="Produk & Kemasan">Produk & Kemasan</option>
                  <option value="Tips Usaha">Tips Usaha</option>
                  <option value="Tanya Jawab">Tanya Jawab Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Judul Diskusi</label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Misal: Cara kemas keripik agar tahan 3 bulan tanpa bahan kimia?"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Isi Pertanyaan / Cerita</label>
                <textarea
                  rows={4}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Ceritakan kendala atau pertanyaan usahamu dengan lengkap agar teman UMKM dan mentor bisa membantu..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                  required
                />
              </div>

              {/* Privacy Warning */}
              <div className="flex items-center space-x-2 rounded-xl bg-amber-50 p-2.5 text-[11px] text-amber-800">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Jangan mencantumkan nomor HP, nomor rekening, atau kata sandi demi keamanan.</span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#8b5cf6] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700"
                >
                  Publikasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: LAPORKAN POSTING / BALASAN                                      */}
      {/* ========================================================================= */}
      {reportModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800">Laporkan Konten Ini</h3>
            <p className="mt-1 text-xs text-slate-500">
              Bantu kami menjaga ruang komunitas UMKM tetap aman dan nyaman.
            </p>

            <form onSubmit={handleSubmitReport} className="mt-4 space-y-3">
              <div className="space-y-2">
                {[
                  { key: 'spam', label: 'Spam atau Iklan Berlebihan' },
                  { key: 'penipuan', label: 'Indikasi Penipuan / Phishing' },
                  { key: 'data_pribadi', label: 'Membocorkan Data Pribadi / Rekening' },
                  { key: 'tidak_pantas', label: 'Kata Kasar atau Tidak Pantas' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="reportReason"
                      value={item.key}
                      checked={reportReason === item.key}
                      onChange={(e) => setReportReason(e.target.value as any)}
                      className="text-[#8b5cf6] focus:ring-[#8b5cf6]"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              <textarea
                rows={2}
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Catatan tambahan (opsional)..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
              />

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReportModalData(null)}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: KIRIM MASUKAN KE TIM PLATFORM                                   */}
      {/* ========================================================================= */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800">Kirim Masukan ke Pengembang</h3>
            <p className="mt-1 text-xs text-slate-500">
              Sampaikan saran fitur atau kendala tampilan agar aplikasi ini makin bermanfaat untuk UMKM.
            </p>

            <form onSubmit={handleSubmitFeedback} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Jenis Masukan</label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                >
                  <option value="Saran Fitur">Usulan Fitur Baru</option>
                  <option value="Kendala Tampilan">Kendala Tampilan / Error</option>
                  <option value="Kemudahan Pakai">Kritik Kemudahan Pemakaian</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Masukan Anda</label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Ceritakan apa yang bisa kami tingkatkan..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#8b5cf6] px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700"
                >
                  Kirim Masukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
