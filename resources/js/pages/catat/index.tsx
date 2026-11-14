import AppSidebar from '@/Components/AppSidebar';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgePercent,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  ExternalLink,
  Gift,
  HelpCircle,
  Home,
  Info,
  LineChart,
  LogOut,
  Maximize,
  MessageCircle,
  Mic,
  Moon,
  PenLine,
  PieChart,
  PiggyBank,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Trash2,
  TrendingUp,
  TriangleAlert,
  Trophy,
  User,
  Users,
  Volume2,
  Wallet,
  WifiOff,
  X,
} from 'lucide-react';

export interface CatatTransactionItem {
  id: number | string;
  type: 'income' | 'expense';
  item: string;
  quantity: number;
  category: string;
  amount: number;
  formatted_amount: string;
  formatted_time: string;
  occurred_at: string;
  source: 'voice' | 'manual';
  voice_recorded: boolean;
  note?: string | null;
}

interface Props {
  business?: {
    id: number;
    owner_name: string;
    business_name: string;
    business_type: string;
  };
  dailySummary: {
    date: string;
    date_label: string;
    is_today: boolean;
    total_income: number;
    formatted_income: string;
    total_expense: number;
    formatted_expense: string;
    net_profit: number;
    formatted_profit: string;
    income_count: number;
    expense_count: number;
  };
  transactions: CatatTransactionItem[];
  editTransaction?: {
    id: number | string;
    type: 'income' | 'expense';
    amount: number;
    item: string;
    quantity: number;
    category?: string | null;
    note?: string | null;
    occurred_at: string;
  } | null;
  editNotFound?: boolean;
  autoStartRecording?: boolean;
}

export default function CatatIndex({
  business,
  dailySummary: initialSummary,
  transactions: initialTransactions = [],
  editTransaction = null,
  editNotFound = false,
  autoStartRecording = false,
}: Props) {
  // Shell layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [dailySummary, setDailySummary] = useState(initialSummary);
  const [transactions, setTransactions] = useState<CatatTransactionItem[]>(initialTransactions);

  useEffect(() => {
    setTransactions(initialTransactions);
    setDailySummary(initialSummary);
  }, [initialTransactions, initialSummary]);

  // Offline state
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [undoData, setUndoData] = useState<CatatTransactionItem | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string, undoItem?: CatatTransactionItem) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    setUndoData(undoItem || null);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      setUndoData(null);
    }, 5000);
  }, []);

  // Handle Edit Not Found toast
  useEffect(() => {
    if (editNotFound) {
      showToast('Transaksi tidak ditemukan.');
      const url = new URL(window.location.href);
      url.searchParams.delete('edit');
      window.history.replaceState({}, '', url.toString());
    }
  }, [editNotFound, showToast]);

  // Voice State (Section 3)
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'processing' | 'confirmed'>('idle');
  const recordingStateRef = useRef<'idle' | 'recording' | 'processing' | 'confirmed'>('idle');
  useEffect(() => {
    recordingStateRef.current = recordingState;
  }, [recordingState]);

  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [transcriptText, setTranscriptText] = useState('');
  const capturedTranscriptRef = useRef<string>('');

  const [pendingTransaction, setPendingTransaction] = useState<{
    type: 'income' | 'expense' | null;
    item: string;
    quantity: number;
    category: string;
    amount: number | null;
    occurred_at: string;
    needs_review: boolean;
    multiple_detected: boolean;
    voice_log_id?: number;
    idempotency_key: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Audio recording references
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const secondsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const speechRecognitionRef = useRef<any>(null);

  // Stop and release media stream so microphone indicator in browser turns off
  const releaseMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (secondsIntervalRef.current) {
      clearInterval(secondsIntervalRef.current);
      secondsIntervalRef.current = null;
    }
  }, []);

  // Cleanup microphone on unmount
  useEffect(() => {
    return () => {
      releaseMediaStream();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch {}
      }
    };
  }, [releaseMediaStream]);

  // Send audio or transcript to server parse endpoint
  const sendAudioOrTranscriptForParsing = useCallback(
    async (audioBlob?: Blob, fallbackTranscript?: string) => {
      setRecordingState('processing');
      setRecordingError(null);

      const effectiveTranscript = (fallbackTranscript || capturedTranscriptRef.current || '').trim();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      try {
        const formData = new FormData();
        if (audioBlob && audioBlob.size > 0) {
          formData.append('audio', audioBlob, 'recording.webm');
        }
        if (effectiveTranscript) {
          formData.append('transcript', effectiveTranscript);
        }

        const response = await fetch('/api/catat/parse', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN':
              (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
          },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorJson = await response.json().catch(() => ({}));
          throw new Error(errorJson.message || 'Gagal memproses catatan suara.');
        }

        const data = await response.json();

        // Generate unique idempotency key for this confirmation card
        const idempotencyKey = 'voice_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

        setTranscriptText(data.transcript || effectiveTranscript || 'Catatan terdeteksi');
        setPendingTransaction({
          type: data.type,
          item: data.item || '',
          quantity: data.quantity || 1,
          category: data.category || 'Penjualan',
          amount: data.amount,
          occurred_at: data.occurred_at || new Date().toISOString(),
          needs_review: data.needs_review || false,
          multiple_detected: data.multiple_detected || false,
          voice_log_id: data.voice_log_id,
          idempotency_key: idempotencyKey,
        });

        setRecordingState('confirmed');
        setConsecutiveFailures(0);
      } catch (err: any) {
        clearTimeout(timeoutId);
        const isAbort = err.name === 'AbortError';
        const msg = isAbort
          ? 'Pemrosesan terlalu lama. Coba lagi atau ketik saja.'
          : err.message || 'Maaf, ada gangguan. Coba lagi sebentar lagi.';
        setRecordingError(msg);
        setRecordingState('idle');
        setConsecutiveFailures((prev) => prev + 1);
      } finally {
        releaseMediaStream();
      }
    },
    [releaseMediaStream]
  );

  // Toggle Recording Action
  const handleToggleRecording = useCallback(
    async (overridePrompt?: string) => {
      if (isOffline) {
        setRecordingError('Kamu sedang offline. Mode suara dinonaktifkan.');
        return;
      }

      if (overridePrompt) {
        sendAudioOrTranscriptForParsing(undefined, overridePrompt);
        return;
      }

      // If already recording -> STOP and process
      if (recordingStateRef.current === 'recording') {
        const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
        if (speechRecognitionRef.current) {
          try {
            speechRecognitionRef.current.stop();
          } catch {}
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        } else {
          releaseMediaStream();
          if (duration < 0.7) {
            setRecordingError('Hmm, aku kurang jelas dengar. Coba ulangi ya?');
            setRecordingState('idle');
            setConsecutiveFailures((prev) => prev + 1);
          } else {
            sendAudioOrTranscriptForParsing(undefined, capturedTranscriptRef.current);
          }
        }
        return;
      }

      // Start recording
      setRecordingError(null);
      capturedTranscriptRef.current = '';

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setRecordingError('Browser tidak mendukung perekaman suara. Silakan ketik saja.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Web Speech API for fallback live transcription in Indonesian
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          try {
            const recognition = new SpeechRecognition();
            recognition.lang = 'id-ID';
            recognition.interimResults = true;
            recognition.continuous = true;
            recognition.onresult = (event: any) => {
              let interim = '';
              for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                  capturedTranscriptRef.current += ' ' + event.results[i][0].transcript;
                } else {
                  interim += event.results[i][0].transcript;
                }
              }
            };
            recognition.start();
            speechRecognitionRef.current = recognition;
          } catch {}
        }

        // Determine supported audio MIME type
        let mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported('audio/webm')) {
          if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            mimeType = 'audio/ogg';
          } else {
            mimeType = '';
          }
        }

        const options = mimeType ? { mimeType } : undefined;
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
          releaseMediaStream();

          if (duration < 0.7) {
            setRecordingError('Hmm, aku kurang jelas dengar. Coba ulangi ya?');
            setRecordingState('idle');
            setConsecutiveFailures((prev) => prev + 1);
            return;
          }

          const blob = new Blob(audioChunksRef.current, {
            type: mimeType || 'audio/webm',
          });
          sendAudioOrTranscriptForParsing(blob, capturedTranscriptRef.current);
        };

        recordingStartTimeRef.current = Date.now();
        setRecordingSeconds(0);
        setRecordingState('recording');
        mediaRecorder.start(250);

        // Timer counter
        secondsIntervalRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);

        // Max 30 seconds auto-stop
        recordingTimerRef.current = setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }, 30000);
      } catch (err: any) {
        releaseMediaStream();
        setRecordingState('idle');
        setRecordingError(
          'Izin mikrofon belum diberikan. Silakan aktifkan mikrofon di pengaturan browsermu atau ketik saja.'
        );
      }
    },
    [isOffline, releaseMediaStream, sendAudioOrTranscriptForParsing]
  );

  // Auto start recording when ?mulai=1
  useEffect(() => {
    if (autoStartRecording && recordingState === 'idle') {
      const url = new URL(window.location.href);
      url.searchParams.delete('mulai');
      window.history.replaceState({}, '', url.toString());
      handleToggleRecording();
    }
  }, [autoStartRecording, handleToggleRecording, recordingState]);

  // Quick simulation sample prompts
  const quickPrompts = [
    'Jual dua nasi goreng tiga puluh ribu',
    'Beli gula dua puluh ribu',
    'Terjual es kopi goceng',
    'Bayar listrik limabelas rebu',
    'Beli bensin ceban',
    'Jual tiga kue masing-masing lima ribu',
  ];

  // =========================================================================
  // MODAL / MANUAL ENTRY STATE
  // =========================================================================
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTrxId, setEditingTrxId] = useState<number | string | null>(null);

  const [formType, setFormType] = useState<'income' | 'expense'>('income');
  const [formItem, setFormItem] = useState('');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formAmountStr, setFormAmountStr] = useState('');
  const [formCategory, setFormCategory] = useState('Penjualan');
  const [formOccurredAt, setFormOccurredAt] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete Dialog State
  const [deleteDialogTrx, setDeleteDialogTrx] = useState<CatatTransactionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle Edit Transaction from props (?edit={id})
  useEffect(() => {
    if (editTransaction) {
      setEditingTrxId(editTransaction.id);
      setFormType(editTransaction.type);
      setFormItem(editTransaction.item);
      setFormQuantity(editTransaction.quantity || 1);
      setFormAmountStr(editTransaction.amount.toLocaleString('id-ID'));
      setFormCategory(editTransaction.category || (editTransaction.type === 'income' ? 'Penjualan' : 'Operasional'));
      setFormNote(editTransaction.note || '');
      setFormOccurredAt(editTransaction.occurred_at || new Date().toISOString().slice(0, 16));
      setIsFormModalOpen(true);
    }
  }, [editTransaction]);

  // Open Manual Entry
  const handleOpenManualEntry = () => {
    setEditingTrxId(null);
    setFormType('income');
    setFormItem('');
    setFormQuantity(1);
    setFormAmountStr('');
    setFormCategory('Penjualan');
    setFormNote('');
    const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setFormOccurredAt(nowLocal);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Form from Confirmation Card "Ubah"
  const handleOpenEditFromCard = () => {
    if (!pendingTransaction) return;
    setEditingTrxId('from_card');
    setFormType(pendingTransaction.type || 'income');
    setFormItem(pendingTransaction.item);
    setFormQuantity(pendingTransaction.quantity || 1);
    setFormAmountStr(pendingTransaction.amount !== null ? pendingTransaction.amount.toLocaleString('id-ID') : '');
    setFormCategory(pendingTransaction.category || 'Penjualan');
    setFormNote('');
    setFormOccurredAt(new Date().toISOString().slice(0, 16));
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Save Transaction from Confirmation Card "Benar"
  const handleConfirmSave = async () => {
    if (!pendingTransaction) return;
    if (pendingTransaction.amount === null || pendingTransaction.type === null) return;

    setIsSaving(true);
    try {
      const response = await fetch('/catat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN':
            (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
        body: JSON.stringify({
          type: pendingTransaction.type,
          amount: pendingTransaction.amount,
          item: pendingTransaction.item,
          quantity: pendingTransaction.quantity,
          category: pendingTransaction.category,
          source: 'voice',
          occurred_at: pendingTransaction.occurred_at,
          idempotency_key: pendingTransaction.idempotency_key,
          voice_log_id: pendingTransaction.voice_log_id,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || 'Gagal menyimpan transaksi.');
      }

      const resData = await response.json();
      const newTrx = resData.transaction;

      // Update state locally
      const formattedItem: CatatTransactionItem = {
        id: newTrx.id,
        type: newTrx.type,
        item: newTrx.item,
        quantity: newTrx.quantity,
        category: newTrx.category,
        amount: newTrx.amount,
        formatted_amount: (newTrx.type === 'expense' ? '-Rp ' : 'Rp ') + newTrx.amount.toLocaleString('id-ID'),
        formatted_time: 'Baru saja',
        occurred_at: newTrx.occurred_at,
        source: 'voice',
        voice_recorded: true,
        note: newTrx.note,
      };

      setTransactions((prev) => [formattedItem, ...prev]);
      setDailySummary((prev) => {
        const isIncome = newTrx.type === 'income';
        const newInc = isIncome ? prev.total_income + newTrx.amount : prev.total_income;
        const newExp = !isIncome ? prev.total_expense + newTrx.amount : prev.total_expense;
        const newProfit = newInc - newExp;
        return {
          ...prev,
          total_income: newInc,
          formatted_income: 'Rp ' + newInc.toLocaleString('id-ID'),
          total_expense: newExp,
          formatted_expense: 'Rp ' + newExp.toLocaleString('id-ID'),
          net_profit: newProfit,
          formatted_profit: (newProfit < 0 ? '-Rp ' : 'Rp ') + Math.abs(newProfit).toLocaleString('id-ID'),
          income_count: isIncome ? prev.income_count + 1 : prev.income_count,
          expense_count: !isIncome ? prev.expense_count + 1 : prev.expense_count,
        };
      });

      setPendingTransaction(null);
      setRecordingState('idle');
      showToast('Tercatat');

      // Clean ?mulai parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('mulai');
      window.history.replaceState({}, '', url.toString());
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan transaksi. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Modal Form (Manual or Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    const rawDigits = formAmountStr.replace(/[^0-9]/g, '');
    const amountVal = rawDigits ? parseInt(rawDigits, 10) : null;

    if (!formItem.trim()) {
      errors.item = 'Nama barang atau transaksi belum diisi.';
    }
    if (amountVal === null) {
      errors.amount = 'Nominal belum diisi.';
    } else if (amountVal < 0) {
      errors.amount = 'Nominal tidak boleh kurang dari 0.';
    } else if (amountVal > 1000000000) {
      errors.amount = 'Nominal melebihi batas maksimal Rp 1.000.000.000.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);

    try {
      // If editing from confirmation card
      if (editingTrxId === 'from_card') {
        const payload = {
          type: formType,
          amount: amountVal!,
          item: formItem.trim(),
          quantity: formQuantity || 1,
          category: formCategory,
          note: formNote.trim() || null,
          source: 'voice',
          occurred_at: formOccurredAt ? new Date(formOccurredAt).toISOString() : new Date().toISOString(),
          idempotency_key: pendingTransaction?.idempotency_key,
          voice_log_id: pendingTransaction?.voice_log_id,
          corrected_by_user: true,
        };

        const response = await fetch('/catat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN':
              (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Gagal menyimpan perubahan');
        const resData = await response.json();
        const newTrx = resData.transaction;

        const formattedItem: CatatTransactionItem = {
          id: newTrx.id,
          type: newTrx.type,
          item: newTrx.item,
          quantity: newTrx.quantity,
          category: newTrx.category,
          amount: newTrx.amount,
          formatted_amount: (newTrx.type === 'expense' ? '-Rp ' : 'Rp ') + newTrx.amount.toLocaleString('id-ID'),
          formatted_time: 'Baru saja',
          occurred_at: newTrx.occurred_at,
          source: 'voice',
          voice_recorded: true,
          note: newTrx.note,
        };

        setTransactions((prev) => [formattedItem, ...prev]);
        setPendingTransaction(null);
        setRecordingState('idle');
        setIsFormModalOpen(false);
        showToast('Tercatat');
      } else if (editingTrxId) {
        // Edit existing transaction
        const response = await fetch(`/catat/${editingTrxId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN':
              (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
          },
          body: JSON.stringify({
            type: formType,
            amount: amountVal,
            item: formItem.trim(),
            quantity: formQuantity,
            category: formCategory,
            note: formNote.trim() || null,
            occurred_at: formOccurredAt ? new Date(formOccurredAt).toISOString() : null,
          }),
        });

        if (!response.ok) throw new Error('Gagal memperbarui transaksi.');
        const resData = await response.json();
        const updated = resData.transaction;

        setTransactions((prev) =>
          prev.map((t) =>
            t.id === editingTrxId
              ? {
                  ...t,
                  type: updated.type,
                  amount: updated.amount,
                  item: updated.item,
                  quantity: updated.quantity,
                  category: updated.category,
                  note: updated.note,
                  formatted_amount: (updated.type === 'expense' ? '-Rp ' : 'Rp ') + updated.amount.toLocaleString('id-ID'),
                }
              : t
          )
        );

        // Remove ?edit={id} from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('edit');
        window.history.replaceState({}, '', url.toString());

        setIsFormModalOpen(false);
        showToast('Transaksi berhasil diperbarui');
      } else {
        // Create manual transaction
        const idempotencyKey = 'manual_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        const payload = {
          type: formType,
          amount: amountVal!,
          item: formItem.trim(),
          quantity: formQuantity,
          category: formCategory,
          note: formNote.trim() || null,
          source: 'manual',
          occurred_at: formOccurredAt ? new Date(formOccurredAt).toISOString() : new Date().toISOString(),
          idempotency_key: idempotencyKey,
        };

        const response = await fetch('/catat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN':
              (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Gagal menyimpan transaksi.');
        const resData = await response.json();
        const newTrx = resData.transaction;

        const formattedItem: CatatTransactionItem = {
          id: newTrx.id,
          type: newTrx.type,
          item: newTrx.item,
          quantity: newTrx.quantity,
          category: newTrx.category,
          amount: newTrx.amount,
          formatted_amount: (newTrx.type === 'expense' ? '-Rp ' : 'Rp ') + newTrx.amount.toLocaleString('id-ID'),
          formatted_time: 'Baru saja',
          occurred_at: newTrx.occurred_at,
          source: 'manual',
          voice_recorded: false,
          note: newTrx.note,
        };

        setTransactions((prev) => [formattedItem, ...prev]);
        setDailySummary((prev) => {
          const isIncome = newTrx.type === 'income';
          const newInc = isIncome ? prev.total_income + newTrx.amount : prev.total_income;
          const newExp = !isIncome ? prev.total_expense + newTrx.amount : prev.total_expense;
          const newProfit = newInc - newExp;
          return {
            ...prev,
            total_income: newInc,
            formatted_income: 'Rp ' + newInc.toLocaleString('id-ID'),
            total_expense: newExp,
            formatted_expense: 'Rp ' + newExp.toLocaleString('id-ID'),
            net_profit: newProfit,
            formatted_profit: (newProfit < 0 ? '-Rp ' : 'Rp ') + Math.abs(newProfit).toLocaleString('id-ID'),
            income_count: isIncome ? prev.income_count + 1 : prev.income_count,
            expense_count: !isIncome ? prev.expense_count + 1 : prev.expense_count,
          };
        });

        setIsFormModalOpen(false);
        showToast('Tercatat');
      }
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete transaction handler
  const handleConfirmDelete = async () => {
    if (!deleteDialogTrx) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/catat/${deleteDialogTrx.id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN':
            (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
      });

      if (!response.ok) throw new Error('Gagal menghapus transaksi.');

      const deletedItem = deleteDialogTrx;
      setTransactions((prev) => prev.filter((t) => t.id !== deletedItem.id));
      setDeleteDialogTrx(null);
      showToast('Transaksi dihapus', deletedItem);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus transaksi.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Undo delete
  const handleUndoDelete = async () => {
    if (!undoData) return;
    try {
      const payload = {
        type: undoData.type,
        amount: undoData.amount,
        item: undoData.item,
        quantity: undoData.quantity,
        category: undoData.category,
        note: undoData.note,
        source: undoData.source,
        occurred_at: undoData.occurred_at,
      };

      const res = await fetch('/catat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN':
            (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setTransactions((prev) => [
          {
            ...undoData,
            id: data.transaction.id,
          },
          ...prev,
        ]);
        setUndoData(null);
        setToastMessage('Penghapusan berhasil diurungkan');
      }
    } catch {}
  };

  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const filteredMobileTransactions = useMemo(() => {
    if (!mobileSearchQuery.trim()) return transactions;
    const q = mobileSearchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.item.toLowerCase().includes(q) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.note && t.note.toLowerCase().includes(q))
    );
  }, [transactions, mobileSearchQuery]);

  const handleOpenManualEntryWith = (type: 'income' | 'expense') => {
    setEditingTrxId(null);
    setFormType(type);
    setFormItem('');
    setFormQuantity(1);
    setFormAmountStr('');
    setFormCategory(type === 'income' ? 'Penjualan' : 'Bahan Baku');
    setFormNote('');
    const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setFormOccurredAt(nowLocal);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb] font-sans text-slate-700 antialiased print:bg-white print:text-black">
      <Head title="Catat Transaksi Suara & Kas - Lapak UMKM" />

      {/* Accessible status announcements */}
      <div aria-live="polite" className="sr-only">
        {recordingState === 'recording' && 'Sedang merekam suara'}
        {recordingState === 'processing' && 'Sedang memproses suara'}
        {recordingState === 'confirmed' && 'Kartu konfirmasi transaksi siap diperiksa'}
        {recordingError && recordingError}
        {toastMessage && toastMessage}
      </div>

      {/* Offline Banner */}
      {isOffline && (
        <div className="sticky top-0 z-50 flex items-center justify-center space-x-2 bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md">
          <WifiOff className="h-4 w-4" />
          <span>Kamu sedang offline. Mode suara dinonaktifkan. Kamu tetap bisa mencatat manual.</span>
        </div>
      )}

      {/* Toast Notification with Undo */}
      {toastMessage && (
        <div className="animate-fade-in fixed bottom-6 right-6 z-50 flex items-center space-x-3 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
          {undoData && (
            <button
              onClick={handleUndoDelete}
              className="ml-2 rounded-lg bg-purple-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-purple-700"
            >
              Urungkan
            </button>
          )}
        </div>
      )}

      <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible">
        <AppSidebar
          current="catat"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onShowToast={showToast}
          customWidget={
            <div className="rounded-xl border border-purple-100 bg-purple-50/70 p-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#8b5cf6]">
                <Sparkles className="h-4 w-4" />
                <span>Suara Pintar UMKM</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                Ucapkan "Jual 2 kopi 20 ribu" atau "Beli bensin ceban" untuk mencatat otomatis.
              </p>
            </div>
          }
        />

        {/* ================= DESKTOP MAIN CONTENT AREA (>= 768px) ================= */}
        <div className="hidden md:flex flex-1 flex-col overflow-y-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur sm:px-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 lg:hidden"
                title="Buka / Tutup Menu"
              >
                <PenLine className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-base font-bold text-slate-800 sm:text-lg">Catat Transaksi Suara</h1>
                <p className="hidden text-xs text-slate-500 sm:block">
                  Cukup bicara dengan santai untuk mencatat uang masuk dan uang keluar
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenManualEntry}
                className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <PenLine className="h-3.5 w-3.5 text-[#8b5cf6]" />
                <span>Ketik saja</span>
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 space-y-6">
            {/* ================= TOTAL HARIAN RINGKASAN ================= */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Uang Masuk ({dailySummary.date_label})
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <h3 className="text-lg font-bold text-emerald-600">{dailySummary.formatted_income}</h3>
                  <span className="text-xs text-slate-400">{dailySummary.income_count} transaksi</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Uang Keluar ({dailySummary.date_label})
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <h3 className="text-lg font-bold text-red-600">
                    {dailySummary.total_expense > 0 ? `-${dailySummary.formatted_expense}` : dailySummary.formatted_expense}
                  </h3>
                  <span className="text-xs text-slate-400">{dailySummary.expense_count} transaksi</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Laba Bersih ({dailySummary.date_label})
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <h3
                    className={`text-lg font-bold ${
                      dailySummary.net_profit >= 0 ? 'text-[#8b5cf6]' : 'text-red-600'
                    }`}
                  >
                    {dailySummary.formatted_profit}
                  </h3>
                  <span className="text-xs text-slate-400">Selisih Kas</span>
                </div>
              </div>
            </div>

            {/* ================= PEREKAMAN SUARA SECTION (SECTION 3) ================= */}
            <div className="rounded-2xl border border-purple-100 bg-gradient-to-b from-white via-purple-50/20 to-white p-6 shadow-sm text-center">
              <h2 className="text-base font-bold text-slate-800">Tekan Mikrofon Lalu Bicara</h2>
              <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                Katakan apa yang kamu jual atau beli, misalnya "Jual dua nasi goreng tiga puluh ribu"
              </p>

              {/* Big Mic Button */}
              <div className="my-6 flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleToggleRecording()}
                  disabled={recordingState === 'processing'}
                  aria-label={
                    recordingState === 'recording'
                      ? 'Hentikan rekaman suara'
                      : recordingState === 'processing'
                      ? 'Sedang memproses suara'
                      : 'Mulai merekam suara transaksi'
                  }
                  className={`group relative flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-purple-300 ${
                    recordingState === 'recording'
                      ? 'bg-red-500 text-white animate-pulse shadow-red-200'
                      : recordingState === 'processing'
                      ? 'bg-amber-500 text-white shadow-amber-200'
                      : 'bg-[#8b5cf6] text-white hover:bg-purple-700 shadow-purple-200 hover:scale-105'
                  }`}
                >
                  {recordingState === 'recording' ? (
                    <div className="flex flex-col items-center">
                      <Mic className="h-8 w-8 animate-bounce" />
                      <span className="text-[10px] font-bold mt-1">{recordingSeconds}s</span>
                    </div>
                  ) : recordingState === 'processing' ? (
                    <RefreshCw className="h-8 w-8 animate-spin" />
                  ) : (
                    <Mic className="h-9 w-9" />
                  )}
                </button>

                {/* Status text */}
                <p className="mt-3 text-xs font-semibold text-slate-600">
                  {recordingState === 'recording' && 'Mendengarkan... Tekan lagi untuk selesai'}
                  {recordingState === 'processing' && 'Sedang memahami ucapan tokomu...'}
                  {recordingState === 'idle' && 'Tekan untuk mulai merekam'}
                  {recordingState === 'confirmed' && 'Periksa hasil di bawah'}
                </p>

                {/* Error message */}
                {recordingError && (
                  <div className="mt-3 flex items-center space-x-1.5 rounded-xl bg-red-50 px-3.5 py-2 text-xs font-medium text-red-700 max-w-md">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                    <span>{recordingError}</span>
                  </div>
                )}

                {/* Failure fallback suggestion */}
                {consecutiveFailures >= 2 && (
                  <div className="mt-2 text-xs text-slate-500">
                    Kesulitan merekam?{' '}
                    <button
                      onClick={handleOpenManualEntry}
                      className="font-bold text-[#8b5cf6] hover:underline"
                    >
                      Ketik saja di sini
                    </button>
                  </div>
                )}
              </div>

              {/* Quick simulation prompt chips */}
              <div className="border-t border-purple-50 pt-4">
                <span className="text-[11px] font-semibold text-slate-400">Atau coba klik contoh ucapan ini:</span>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleToggleRecording(prompt)}
                      className="rounded-full border border-purple-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-[#8b5cf6] hover:bg-purple-50 hover:text-[#8b5cf6]"
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ================= KARTU KONFIRMASI (SECTION 6) ================= */}
            {recordingState === 'confirmed' && pendingTransaction && (
              <div className="rounded-2xl border-2 border-purple-300 bg-white p-5 shadow-xl transition-all">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-[#8b5cf6]" />
                    <h3 className="text-sm font-bold text-slate-800">Konfirmasi Catatan Transaksi</h3>
                  </div>
                  <button
                    onClick={() => {
                      setPendingTransaction(null);
                      setRecordingState('idle');
                    }}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                    title="Tutup tanpa menyimpan"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-500 italic">
                  Ucapan terdeteksi: "{transcriptText}"
                </p>

                {pendingTransaction.multiple_detected && (
                  <div className="mt-2 rounded-xl bg-blue-50 p-2.5 text-xs text-blue-700">
                    Aku menangkap lebih dari satu transaksi. Catat satu per satu ya. Menampilkan yang pertama.
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {/* Jenis */}
                  <div
                    className={`rounded-xl p-3 border ${
                      !pendingTransaction.type ? 'border-amber-300 bg-amber-50/50' : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jenis</span>
                    <div className="mt-1">
                      {pendingTransaction.type === 'income' ? (
                        <span className="inline-flex items-center font-bold text-emerald-600 text-xs sm:text-sm">
                          <ArrowDownRight className="h-4 w-4 mr-0.5" /> Pemasukan
                        </span>
                      ) : pendingTransaction.type === 'expense' ? (
                        <span className="inline-flex items-center font-bold text-red-600 text-xs sm:text-sm">
                          <ArrowUpRight className="h-4 w-4 mr-0.5" /> Pengeluaran
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-700">Perlu dicek</span>
                      )}
                    </div>
                  </div>

                  {/* Barang & Jumlah */}
                  <div
                    className={`rounded-xl p-3 border ${
                      !pendingTransaction.item ? 'border-amber-300 bg-amber-50/50' : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Barang & Qty</span>
                    <div className="mt-1 font-bold text-slate-800 text-xs sm:text-sm truncate">
                      {pendingTransaction.item
                        ? `${pendingTransaction.item} × ${pendingTransaction.quantity}`
                        : 'Perlu dicek'}
                    </div>
                  </div>

                  {/* Nominal */}
                  <div
                    className={`rounded-xl p-3 border ${
                      pendingTransaction.amount === null ? 'border-amber-300 bg-amber-50/50' : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nominal</span>
                    <div className="mt-1 font-bold text-slate-800 text-xs sm:text-sm">
                      {pendingTransaction.amount !== null
                        ? 'Rp ' + pendingTransaction.amount.toLocaleString('id-ID')
                        : 'Perlu dicek'}
                    </div>
                  </div>

                  {/* Kategori */}
                  <div className="rounded-xl p-3 border border-slate-100 bg-slate-50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kategori</span>
                    <div className="mt-1 font-bold text-slate-800 text-xs sm:text-sm truncate">
                      {pendingTransaction.category || 'Penjualan'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleOpenEditFromCard}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSave}
                    disabled={isSaving || pendingTransaction.amount === null || pendingTransaction.type === null}
                    className="flex items-center space-x-1.5 rounded-xl bg-[#8b5cf6] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    <span>{isSaving ? 'Menyimpan...' : 'Benar'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================= DAFTAR TRANSAKSI (SECTION 8) ================= */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Daftar Transaksi {dailySummary.date_label}
                  </h3>
                  <p className="text-xs text-slate-500">Urut dari waktu transaksi paling baru</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      window.location.href = `/catat?tanggal=${yesterday.toISOString().slice(0, 10)}`;
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Kemarin
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = '/catat';
                    }}
                    className="rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-[#8b5cf6] hover:bg-purple-100"
                  >
                    Hari ini
                  </button>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
                  <p className="text-xs text-slate-400">
                    Belum ada catatan hari ini. Tekan mikrofon untuk mulai.
                  </p>
                  <button
                    onClick={() => handleToggleRecording()}
                    className="mt-3 inline-flex items-center space-x-1.5 rounded-xl bg-purple-50 px-3.5 py-1.5 text-xs font-bold text-[#8b5cf6] hover:bg-purple-100"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <span>Mulai Catat</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {transactions.map((trx) => (
                    <div
                      key={trx.id}
                      onClick={() => {
                        setEditingTrxId(trx.id);
                        setFormType(trx.type);
                        setFormItem(trx.item);
                        setFormQuantity(trx.quantity);
                        setFormAmountStr(trx.amount.toLocaleString('id-ID'));
                        setFormCategory(trx.category);
                        setFormNote(trx.note || '');
                        setFormOccurredAt(new Date(trx.occurred_at).toISOString().slice(0, 16));
                        setIsFormModalOpen(true);
                      }}
                      className="group flex cursor-pointer items-center justify-between py-3.5 px-2 hover:bg-slate-50/70 rounded-xl transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            trx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {trx.type === 'income' ? (
                            <ArrowDownRight className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#8b5cf6]">
                              {trx.item} {trx.quantity > 1 ? `× ${trx.quantity}` : ''}
                            </h4>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                              {trx.category}
                            </span>
                            {trx.source === 'voice' && (
                              <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] text-[#8b5cf6]">
                                Suara
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">{trx.formatted_time}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            trx.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {trx.formatted_amount}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialogTrx(trx);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Hapus transaksi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>

        {/* =========================================================================
             2. TAMPILAN MOBILE (< 768px) - KONSEP PERSIS SESUAI index.html
             ========================================================================= */}
        <div className="md:hidden flex-1 overflow-y-auto bg-[#F5F5F9] pb-28">

          {/* HERO PURPLE SECTION (Mengadaptasi gaya Hero Biru pada foto pertama dengan tema Ungu) */}
          <div
            className="text-white pt-6 pb-20 px-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #7C4DFF 0%, #6534FF 100%)',
              backgroundImage:
                'radial-gradient(circle at 85% 50%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.08) 28%, transparent 28%), radial-gradient(circle at 12% 75%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.06) 22%, transparent 22%), linear-gradient(135deg, #7C4DFF 0%, #6534FF 100%)',
            }}
          >
            {/* Ornamen Latar Belakang Samar */}
            <Mic className="w-36 h-36 text-white/5 absolute -bottom-6 left-4 pointer-events-none" />
            <Wallet className="w-40 h-40 text-white/5 absolute top-12 -right-8 pointer-events-none" />
            <Sparkles className="w-16 h-16 text-white/5 absolute bottom-6 left-1/3 pointer-events-none" />

            {/* Top Bar: Ikon Toko/Trophy, Search Bar Transparan, Ikon Notifikasi */}
            <div className="flex items-center justify-between gap-3 mb-7 relative z-10">
              <Link href="/dashboard" className="text-white hover:opacity-80 transition" title="Dashboard Usaha">
                <Trophy className="w-6 h-6 fill-white/90" />
              </Link>
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-white/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  placeholder='Cari "Transaksi Suara"'
                  className="w-full bg-white/25 text-white placeholder-white/80 rounded-full py-2 pl-10 pr-4 text-xs focus:outline-none focus:bg-white/30 backdrop-blur-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => showToast('Tidak ada notifikasi baru')}
                className="text-white hover:opacity-80 transition relative"
                title="Notifikasi"
              >
                <Bell className="w-6 h-6 fill-white/90" />
                <span className="w-2 h-2 bg-rose-400 rounded-full absolute top-0 right-0"></span>
              </button>
            </div>

            {/* Info Saldo / Laba Bersih Tengah (Posisi Available Balance) */}
            <div className="text-center relative z-10 my-1">
              {/* Pill Kategori Suara Pintar */}
              <div className="inline-flex items-center gap-1.5 text-xs text-white/95 font-medium mb-1.5 bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm">
                <span>🎙️</span>
                <span>Catat Transaksi Suara</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>

              {/* Nominal Laba Bersih Hari Ini */}
              <h1 className="text-4xl font-extrabold tracking-tight mb-1">
                {dailySummary.formatted_profit || 'Rp 0'}
              </h1>
              <p className="text-xs text-white/80 font-normal mb-5">
                Laba Bersih ({dailySummary.date_label || 'Hari Ini'}) • Selisih Kas
              </p>

              {/* Tombol Kapsul Utama Mulai Merekam */}
              <button
                type="button"
                onClick={() => handleToggleRecording()}
                disabled={recordingState === 'processing'}
                className="inline-flex items-center gap-2 border border-white/85 hover:bg-white hover:text-[#7C4DFF] text-white text-xs font-semibold py-2.5 px-6 rounded-full transition duration-200 shadow-sm cursor-pointer"
              >
                <Mic className={`w-4 h-4 ${recordingState === 'recording' ? 'animate-ping text-rose-300' : ''}`} />
                <span>
                  {recordingState === 'recording'
                    ? `Merekam (${recordingSeconds}s)... Ketuk Selesai`
                    : recordingState === 'processing'
                    ? 'Memproses Suara...'
                    : 'Tekan Mulai Merekam'}
                </span>
              </button>
            </div>
          </div>

          {/* OVERLAPPING CARD 3 KOLOM */}
          <div className="px-5 -mt-12 relative z-20">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 py-4 px-2 grid grid-cols-3 divide-x divide-slate-200/70">
              {/* Kolom 1: Uang Masuk */}
              <button
                type="button"
                onClick={() => handleOpenManualEntryWith('income')}
                className="flex flex-col items-center justify-center gap-1.5 group py-1 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-slate-500 font-medium block">Uang Masuk</span>
                  <span className="text-xs font-bold text-emerald-600">
                    {dailySummary.formatted_income || 'Rp 0'}
                  </span>
                </div>
              </button>

              {/* Kolom 2: Uang Keluar */}
              <button
                type="button"
                onClick={() => handleOpenManualEntryWith('expense')}
                className="flex flex-col items-center justify-center gap-1.5 group py-1 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-slate-500 font-medium block">Uang Keluar</span>
                  <span className="text-xs font-bold text-rose-600">
                    {dailySummary.formatted_expense || 'Rp 0'}
                  </span>
                </div>
              </button>

              {/* Kolom 3: Ketik Manual */}
              <button
                type="button"
                onClick={handleOpenManualEntry}
                className="flex flex-col items-center justify-center gap-1.5 group py-1 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-purple-50 text-[#7C4DFF] flex items-center justify-center group-hover:scale-105 transition">
                  <PenLine className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-slate-500 font-medium block">Input Manual</span>
                  <span className="text-xs font-bold text-[#7C4DFF]">Ketik Saja</span>
                </div>
              </button>
            </div>
          </div>

          {/* DAFTAR TRANSAKSI HARI INI ATAU CONTOH UCAPAN */}
          <div className="px-5 mt-6">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2 className="text-[16px] font-bold text-slate-800">
                  {filteredMobileTransactions.length > 0 ? 'Daftar Transaksi Hari Ini' : 'Contoh Ucapan Suara'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {filteredMobileTransactions.length > 0
                    ? `Urut dari waktu transaksi paling baru (${filteredMobileTransactions.length} transaksi)`
                    : 'Klik contoh di bawah untuk langsung mencatat otomatis'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenManualEntry()}
                className="text-slate-600 hover:text-[#7C4DFF] transition p-1"
                title="Tambah Transaksi"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* List Card Putih (Persis gaya Spending, Income, Bills, Savings dari index.html) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-1.5 divide-y divide-slate-100">
              {filteredMobileTransactions.length > 0 ? (
                filteredMobileTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3.5 pr-2 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                          t.type === 'income'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {t.type === 'income' ? (
                          <Coins className="w-5 h-5" />
                        ) : (
                          <ShoppingBag className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 text-xs block truncate">
                          {t.item}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                          {t.type === 'income' ? 'Uang Masuk' : 'Uang Keluar'} • {t.category || 'Kas'}
                          {t.formatted_time ? ` • ${t.formatted_time}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-bold text-xs ${
                          t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}{t.formatted_amount}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(t)}
                        className="text-slate-400 hover:text-[#7C4DFF] p-1 cursor-pointer"
                        title="Edit Transaksi"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                /* 4 Contoh dari index.html jika transaksi kosong */
                <>
                  <button
                    type="button"
                    onClick={() => handleToggleRecording('Jual dua nasi goreng tiga puluh ribu')}
                    className="w-full flex items-center justify-between py-3.5 text-left cursor-pointer hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3.5 pr-2">
                      <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 text-xs block">"Jual dua nasi goreng"</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">Uang Masuk • Otomatis</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-emerald-600 text-xs">+Rp 30.000</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleRecording('Beli gula dua puluh ribu')}
                    className="w-full flex items-center justify-between py-3.5 text-left cursor-pointer hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3.5 pr-2">
                      <div className="w-11 h-11 rounded-full bg-indigo-50 text-[#3A57E8] flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 text-xs block">"Beli gula dua puluh ribu"</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">Uang Keluar • Bahan Baku</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-rose-600 text-xs">-Rp 20.000</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleRecording('Bayar listrik limabelas rebu')}
                    className="w-full flex items-center justify-between py-3.5 text-left cursor-pointer hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3.5 pr-2">
                      <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 text-xs block">"Bayar listrik limabelas rebu"</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">Uang Keluar • Operasional</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-rose-600 text-xs">-Rp 15.000</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleRecording('Terjual es kopi goceng')}
                    className="w-full flex items-center justify-between py-3.5 text-left cursor-pointer hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3.5 pr-2">
                      <div className="w-11 h-11 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                        <PiggyBank className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 text-xs block">"Terjual es kopi goceng"</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">Uang Masuk • Penjualan</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-amber-500 text-xs">+Rp 5.000</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* FLOATING BOTTOM NAVIGATION BAR (Persis konsep foto pertama) */}
          <div className="fixed bottom-4 left-5 right-5 z-30">
            <nav className="bg-white rounded-2xl shadow-lg shadow-slate-300/50 border border-slate-100 px-3 py-2 flex items-center justify-around">
              {/* Ringkasan Usaha (Home) */}
              <Link
                href="/dashboard"
                className="flex flex-col items-center justify-center py-1 px-3 text-slate-700 hover:text-[#7C4DFF] transition"
                title="Ringkasan Usaha"
              >
                <Home className="w-6 h-6" />
              </Link>

              {/* Laporan Laba Rugi */}
              <Link
                href="/catat/laporan"
                className="flex flex-col items-center justify-center py-1 px-3 text-slate-700 hover:text-[#7C4DFF] transition"
                title="Laporan Kas"
              >
                <PieChart className="w-6 h-6" />
              </Link>

              {/* Tombol Tengah Menonjol: Rekam Suara */}
              <button
                type="button"
                onClick={() => handleToggleRecording()}
                className="w-12 h-12 rounded-xl bg-[#7C4DFF] text-white flex items-center justify-center shadow-md shadow-[#7C4DFF]/35 hover:bg-[#6839ed] transition cursor-pointer"
                title="Rekam Suara"
              >
                <Mic className="w-6 h-6" />
              </button>

              {/* Tanya Mentor / Asisten AI */}
              <Link
                href="/konsultasi"
                className="flex flex-col items-center justify-center py-1 px-3 text-slate-700 hover:text-[#7C4DFF] transition"
                title="Tanya Mentor"
              >
                <MessageCircle className="w-6 h-6" />
              </Link>

              {/* Akun / Pengaturan Usaha */}
              <Link
                href="/pengaturan"
                className="flex flex-col items-center justify-center py-1 px-3 text-slate-700 hover:text-[#7C4DFF] transition"
                title="Pengaturan Akun"
              >
                <User className="w-6 h-6" />
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* ================= FORM MODAL (MANUAL / UBAH / EDIT) ================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                {editingTrxId && editingTrxId !== 'from_card'
                  ? 'Edit Transaksi'
                  : editingTrxId === 'from_card'
                  ? 'Ubah Hasil Suara'
                  : 'Catat Manual'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-3.5">
              {/* Jenis Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700">Jenis Transaksi</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('income');
                      setFormCategory('Penjualan');
                    }}
                    className={`rounded-xl py-2 text-xs font-bold border transition ${
                      formType === 'income'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Uang Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('expense');
                      setFormCategory('Operasional');
                    }}
                    className={`rounded-xl py-2 text-xs font-bold border transition ${
                      formType === 'expense'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Uang Keluar
                  </button>
                </div>
              </div>

              {/* Nama Barang & Qty */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label htmlFor="formItemInput" className="block text-xs font-bold text-slate-700">
                    Nama Barang / Transaksi
                  </label>
                  <input
                    id="formItemInput"
                    type="text"
                    value={formItem}
                    onChange={(e) => setFormItem(e.target.value)}
                    placeholder="Contoh: Nasi Goreng, Bensin"
                    maxLength={100}
                    aria-describedby={formErrors.item ? 'formItemError' : undefined}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                    required
                  />
                  {formErrors.item && (
                    <p id="formItemError" className="mt-1 text-[11px] text-red-600">
                      {formErrors.item}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="formQtyInput" className="block text-xs font-bold text-slate-700">
                    Jumlah
                  </label>
                  <input
                    id="formQtyInput"
                    type="number"
                    min={1}
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(parseInt(e.target.value, 10) || 1)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                  />
                </div>
              </div>

              {/* Nominal */}
              <div>
                <label htmlFor="formAmountInput" className="block text-xs font-bold text-slate-700">
                  Nominal (Rp)
                </label>
                <input
                  id="formAmountInput"
                  type="text"
                  value={formAmountStr}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    const n = raw ? parseInt(raw, 10) : 0;
                    setFormAmountStr(n ? n.toLocaleString('id-ID') : '');
                  }}
                  placeholder="Rp 15.000"
                  aria-describedby={formErrors.amount ? 'formAmountError' : undefined}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none font-bold"
                  required
                />
                {formErrors.amount && (
                  <p id="formAmountError" className="mt-1 text-[11px] text-red-600">
                    {formErrors.amount}
                  </p>
                )}
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-xs font-bold text-slate-700">Kategori</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                >
                  {formType === 'income' ? (
                    <>
                      <option value="Penjualan">Penjualan</option>
                      <option value="Jasa">Jasa</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option value="Bahan baku">Bahan baku</option>
                      <option value="Operasional">Operasional</option>
                      <option value="Transportasi">Transportasi</option>
                      <option value="Gaji">Gaji</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  )}
                </select>
              </div>

              {/* Waktu */}
              <div>
                <label className="block text-xs font-bold text-slate-700">Waktu Transaksi</label>
                <input
                  type="datetime-local"
                  value={formOccurredAt}
                  onChange={(e) => setFormOccurredAt(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                />
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-xs font-bold text-slate-700">Catatan (Opsional)</label>
                <textarea
                  rows={2}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Keterangan tambahan..."
                  maxLength={300}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-[#8b5cf6] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      {deleteDialogTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800">Hapus transaksi ini?</h3>
            <p className="mt-1 text-xs text-slate-500">
              Tindakan ini tidak bisa dibatalkan. Catatan "{deleteDialogTrx.item}" sebesar{' '}
              {deleteDialogTrx.formatted_amount} akan dihapus dari kas.
            </p>

            <div className="mt-5 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeleteDialogTrx(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
