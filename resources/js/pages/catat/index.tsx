import { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    FileText,
    HelpCircle,
    Mic,
    PenLine,
    Plus,
    RefreshCw,
    Search,
    Sparkles,
    Trash2,
    TrendingUp,
    Users,
    Volume2,
    Wallet,
    WifiOff,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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

export interface DebtItem {
    id: string;
    customerName: string;
    item: string;
    amount: number;
    date: string;
    status: 'unpaid' | 'paid';
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
    dailySummary,
    transactions: initialTransactions = [],
    editTransaction = null,
    editNotFound = false,
    autoStartRecording = false,
}: Props) {
    const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
    const [transactions, setTransactions] = useState<CatatTransactionItem[]>(initialTransactions);

    // Keep transactions updated when server props change
    useEffect(() => {
        setTransactions(initialTransactions);
    }, [initialTransactions]);

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
            // Clean up ?edit from URL
            const url = new URL(window.location.href);
            url.searchParams.delete('edit');
            window.history.replaceState({}, '', url.toString());
        }
    }, [editNotFound, showToast]);

    // Voice State (FIN-01, FIN-02, FIN-03)
    const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'processing' | 'confirmed'>('idle');
    const [recordingError, setRecordingError] = useState<string | null>(null);
    const [consecutiveFailures, setConsecutiveFailures] = useState(0);
    const [transcriptText, setTranscriptText] = useState('');
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
    }, []);

    // Cleanup microphone on unmount
    useEffect(() => {
        return () => {
            releaseMediaStream();
            if (speechRecognitionRef.current) {
                try {
                    speechRecognitionRef.current.abort();
                } catch {
                    // Ignore
                }
            }
        };
    }, [releaseMediaStream]);

    // Send audio or transcript to server parse endpoint
    const sendAudioOrTranscriptForParsing = useCallback(
        async (audioBlob?: Blob, fallbackTranscript?: string) => {
            setRecordingState('processing');
            setRecordingError(null);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

            try {
                const formData = new FormData();
                if (audioBlob && audioBlob.size > 0) {
                    formData.append('audio', audioBlob, 'recording.webm');
                }
                if (fallbackTranscript) {
                    formData.append('transcript', fallbackTranscript);
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

                // Generate random unique idempotency key for this confirmation card
                const idempotencyKey = 'voice_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

                setTranscriptText(data.transcript || fallbackTranscript || 'Catatan terdeteksi');
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
                setRecordingError('Kamu sedang offline. Gunakan catat manual (ketik) untuk saat ini.');
                return;
            }

            // If overridePrompt passed (from simulation chips), send directly to parser
            if (overridePrompt) {
                await sendAudioOrTranscriptForParsing(undefined, overridePrompt);
                return;
            }

            // If already recording -> STOP and process
            if (recordingState === 'recording') {
                const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
                if (speechRecognitionRef.current) {
                    try {
                        speechRecognitionRef.current.stop();
                    } catch {
                        // Ignore
                    }
                }

                if (duration < 0.7) {
                    releaseMediaStream();
                    setRecordingState('idle');
                    setRecordingError('Hmm, aku kurang jelas dengar. Coba ulangi ya?');
                    setConsecutiveFailures((prev) => prev + 1);
                    return;
                }
                return;
            }

            // Check browser recording support
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setRecordingError('Browser tidak mendukung perekaman suara langsung. Silakan ketik saja.');
                setManualModalOpen(true);
                return;
            }

            // Start Recording
            try {
                setRecordingError(null);
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream;
                audioChunksRef.current = [];
                recordingStartTimeRef.current = Date.now();

                // Select supported MIME type
                const mimeTypes = [
                    'audio/webm;codecs=opus',
                    'audio/webm',
                    'audio/mp4',
                    'audio/ogg;codecs=opus',
                    'audio/wav',
                ];
                let chosenMime = '';
                for (const mime of mimeTypes) {
                    if (MediaRecorder.isTypeSupported(mime)) {
                        chosenMime = mime;
                        break;
                    }
                }

                const options = chosenMime ? { mimeType: chosenMime } : undefined;
                const recorder = new MediaRecorder(stream, options);
                mediaRecorderRef.current = recorder;

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                let capturedTranscript = '';

                // Try Web Speech API fallback in parallel for immediate Indonesian speech recognition
                const SpeechRecognition =
                    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                if (SpeechRecognition) {
                    try {
                        const recognition = new SpeechRecognition();
                        recognition.lang = 'id-ID';
                        recognition.continuous = false;
                        recognition.interimResults = false;
                        recognition.onresult = (e: any) => {
                            if (e.results?.[0]?.[0]?.transcript) {
                                capturedTranscript = e.results[0][0].transcript;
                            }
                        };
                        recognition.start();
                        speechRecognitionRef.current = recognition;
                    } catch {
                        // Ignore Web Speech errors and rely on audio blob
                    }
                }

                recorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, {
                        type: chosenMime || 'audio/webm',
                    });
                    await sendAudioOrTranscriptForParsing(audioBlob, capturedTranscript);
                };

                recorder.start(250);
                setRecordingState('recording');

                // Auto stop at max duration 30 seconds
                recordingTimerRef.current = setTimeout(() => {
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                        mediaRecorderRef.current.stop();
                    }
                }, 30000);
            } catch (err: any) {
                releaseMediaStream();
                setRecordingState('idle');
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setRecordingError(
                        'Izin mikrofon belum diberikan. Silakan aktifkan mikrofon di pengaturan browsermu atau ketik saja.'
                    );
                } else {
                    setRecordingError('Gagal mengakses mikrofon: ' + (err.message || 'Coba lagi.'));
                }
            }
        },
        [isOffline, recordingState, releaseMediaStream, sendAudioOrTranscriptForParsing]
    );

    // Auto start recording if ?mulai=1 was in URL
    useEffect(() => {
        if (autoStartRecording) {
            handleToggleRecording();
            // Clean up ?mulai=1 parameter from URL
            const url = new URL(window.location.href);
            url.searchParams.delete('mulai');
            window.history.replaceState({}, '', url.toString());
        }
    }, [autoStartRecording, handleToggleRecording]);

    // Confirm and Save from Voice Card (FIN-03)
    const handleConfirmSave = async () => {
        if (!pendingTransaction || !pendingTransaction.amount || !pendingTransaction.type || isSaving) {
            return;
        }

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
                    quantity: pendingTransaction.quantity || 1,
                    category: pendingTransaction.category || 'Penjualan',
                    source: 'voice',
                    occurred_at: pendingTransaction.occurred_at,
                    idempotency_key: pendingTransaction.idempotency_key,
                    voice_log_id: pendingTransaction.voice_log_id,
                    corrected_by_user: false,
                }),
            });

            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}));
                throw new Error(errJson.message || 'Gagal menyimpan transaksi.');
            }

            const data = await response.json();
            const savedTrx = data.transaction;

            // Prepend to local transactions list immediately
            const newTrxItem: CatatTransactionItem = {
                id: savedTrx.id,
                type: savedTrx.type,
                item: savedTrx.item,
                quantity: savedTrx.quantity,
                category: savedTrx.category,
                amount: savedTrx.amount,
                formatted_amount: `Rp ${savedTrx.amount.toLocaleString('id-ID')}`,
                formatted_time: 'Baru saja',
                occurred_at: savedTrx.occurred_at,
                source: 'voice',
                voice_recorded: true,
                note: savedTrx.note,
            };

            setTransactions((prev) => [newTrxItem, ...prev]);
            setPendingTransaction(null);
            setRecordingState('idle');
            showToast('Tercatat');

            // Refresh Inertia props in background for daily totals
            router.reload({ only: ['dailySummary', 'transactions'] });
        } catch (err: any) {
            setRecordingError(err.message || 'Gagal menyimpan transaksi.');
        } finally {
            setIsSaving(false);
        }
    };

    // Modal Input & Correction State (FIN-05)
    const [manualModalOpen, setManualModalOpen] = useState(false);
    const [editingTrxId, setEditingTrxId] = useState<number | string | null>(null);
    const [manualType, setManualType] = useState<'income' | 'expense'>('income');
    const [manualItem, setManualItem] = useState('');
    const [manualQuantity, setManualQuantity] = useState('1');
    const [manualAmount, setManualAmount] = useState('');
    const [manualCategory, setManualCategory] = useState('Penjualan');
    const [manualNote, setManualNote] = useState('');
    const [manualOccurredAt, setManualOccurredAt] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Check if ?edit={id} was passed from server
    useEffect(() => {
        if (editTransaction) {
            setEditingTrxId(editTransaction.id);
            setManualType(editTransaction.type);
            setManualItem(editTransaction.item);
            setManualQuantity(editTransaction.quantity?.toString() || '1');
            setManualAmount(editTransaction.amount.toString());
            setManualCategory(editTransaction.category || 'Penjualan');
            setManualNote(editTransaction.note || '');
            setManualOccurredAt(editTransaction.occurred_at || '');
            setManualModalOpen(true);
        }
    }, [editTransaction]);

    // Open clean manual creation modal
    const handleOpenCreateManual = () => {
        setEditingTrxId(null);
        setManualType('income');
        setManualItem('');
        setManualQuantity('1');
        setManualAmount('');
        setManualCategory('Penjualan');
        setManualNote('');
        setManualOccurredAt(new Date().toISOString().substring(0, 16));
        setFormErrors({});
        setManualModalOpen(true);
    };

    // Open correction from AI Voice Confirmation Card
    const handleOpenEditFromCard = () => {
        if (!pendingTransaction) return;
        setEditingTrxId('from_card');
        setManualType(pendingTransaction.type || 'income');
        setManualItem(pendingTransaction.item);
        setManualQuantity((pendingTransaction.quantity || 1).toString());
        setManualAmount(pendingTransaction.amount ? pendingTransaction.amount.toString() : '');
        setManualCategory(pendingTransaction.category || 'Penjualan');
        setManualNote('');
        setManualOccurredAt(
            pendingTransaction.occurred_at
                ? new Date(pendingTransaction.occurred_at).toISOString().substring(0, 16)
                : new Date().toISOString().substring(0, 16)
        );
        setFormErrors({});
        setManualModalOpen(true);
    };

    // Open edit for an existing transaction
    const handleOpenEditExisting = (trx: CatatTransactionItem) => {
        setEditingTrxId(trx.id);
        setManualType(trx.type);
        setManualItem(trx.item);
        setManualQuantity(trx.quantity.toString());
        setManualAmount(trx.amount.toString());
        setManualCategory(trx.category || 'Penjualan');
        setManualNote(trx.note || '');
        setManualOccurredAt(
            trx.occurred_at
                ? new Date(trx.occurred_at).toISOString().substring(0, 16)
                : new Date().toISOString().substring(0, 16)
        );
        setFormErrors({});
        setManualModalOpen(true);

        // Update URL query parameter
        const url = new URL(window.location.href);
        url.searchParams.set('edit', trx.id.toString());
        window.history.replaceState({}, '', url.toString());
    };

    // Save Manual or Edited Transaction
    const handleSaveManualForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});

        // Client-side validation
        const errors: Record<string, string> = {};
        if (!manualItem.trim()) {
            errors.item = 'Nama barang atau transaksi belum diisi.';
        }
        const numericAmount = parseInt(manualAmount.replace(/[^0-9]/g, ''), 10);
        if (isNaN(numericAmount) || numericAmount < 0) {
            errors.amount = 'Nominal belum diisi.';
        } else if (numericAmount > 1000000000) {
            errors.amount = 'Nominal melebihi batas maksimal Rp 1.000.000.000.';
        }

        const qty = parseInt(manualQuantity, 10);
        if (isNaN(qty) || qty < 1) {
            errors.quantity = 'Jumlah minimal 1.';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSaving(true);
        try {
            // Case 1: Updating pending card candidate
            if (editingTrxId === 'from_card' && pendingTransaction) {
                setPendingTransaction({
                    ...pendingTransaction,
                    type: manualType,
                    item: manualItem.trim(),
                    quantity: qty,
                    amount: numericAmount,
                    category: manualCategory,
                    occurred_at: manualOccurredAt ? new Date(manualOccurredAt).toISOString() : new Date().toISOString(),
                    needs_review: false,
                });
                setManualModalOpen(false);
                setIsSaving(false);
                return;
            }

            // Case 2: Updating existing transaction on server
            if (editingTrxId && editingTrxId !== 'from_card') {
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
                        type: manualType,
                        item: manualItem.trim(),
                        quantity: qty,
                        amount: numericAmount,
                        category: manualCategory,
                        note: manualNote.trim() || null,
                        occurred_at: manualOccurredAt ? new Date(manualOccurredAt).toISOString() : null,
                    }),
                });

                if (!response.ok) {
                    const errJson = await response.json().catch(() => ({}));
                    throw new Error(errJson.message || 'Gagal memperbarui transaksi.');
                }

                setTransactions((prev) =>
                    prev.map((t) =>
                        t.id === editingTrxId
                            ? {
                                  ...t,
                                  type: manualType,
                                  item: manualItem.trim(),
                                  quantity: qty,
                                  amount: numericAmount,
                                  formatted_amount: `Rp ${numericAmount.toLocaleString('id-ID')}`,
                                  category: manualCategory,
                                  note: manualNote.trim() || null,
                              }
                            : t
                    )
                );

                setManualModalOpen(false);
                showToast('Transaksi berhasil diperbarui');

                // Clean up ?edit parameter
                const url = new URL(window.location.href);
                url.searchParams.delete('edit');
                window.history.replaceState({}, '', url.toString());

                router.reload({ only: ['dailySummary', 'transactions'] });
                return;
            }

            // Case 3: Creating new manual transaction on server
            const idempotencyKey = 'manual_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
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
                    type: manualType,
                    item: manualItem.trim(),
                    quantity: qty,
                    amount: numericAmount,
                    category: manualCategory,
                    note: manualNote.trim() || null,
                    source: 'manual',
                    occurred_at: manualOccurredAt ? new Date(manualOccurredAt).toISOString() : new Date().toISOString(),
                    idempotency_key: idempotencyKey,
                }),
            });

            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}));
                throw new Error(errJson.message || 'Gagal menyimpan transaksi.');
            }

            const data = await response.json();
            const saved = data.transaction;

            const newTrxItem: CatatTransactionItem = {
                id: saved.id,
                type: saved.type,
                item: saved.item,
                quantity: saved.quantity,
                category: saved.category,
                amount: saved.amount,
                formatted_amount: `Rp ${saved.amount.toLocaleString('id-ID')}`,
                formatted_time: 'Baru saja',
                occurred_at: saved.occurred_at,
                source: 'manual',
                voice_recorded: false,
                note: saved.note,
            };

            setTransactions((prev) => [newTrxItem, ...prev]);
            setManualModalOpen(false);
            showToast('Tercatat');

            router.reload({ only: ['dailySummary', 'transactions'] });
        } catch (err: any) {
            setFormErrors({ submit: err.message || 'Terjadi kesalahan saat menyimpan.' });
        } finally {
            setIsSaving(false);
        }
    };

    // Close manual dialog
    const handleCloseManualDialog = () => {
        setManualModalOpen(false);
        if (editingTrxId && editingTrxId !== 'from_card') {
            const url = new URL(window.location.href);
            url.searchParams.delete('edit');
            window.history.replaceState({}, '', url.toString());
        }
    };

    // Delete Confirmation State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [trxToDelete, setTrxToDelete] = useState<CatatTransactionItem | null>(null);

    const handleConfirmDelete = async () => {
        if (!trxToDelete) return;
        const target = trxToDelete;
        setDeleteModalOpen(false);

        // Optimistically remove from state
        setTransactions((prev) => prev.filter((t) => t.id !== target.id));
        showToast('Transaksi dihapus', target);

        try {
            await fetch(`/catat/${target.id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN':
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
            router.reload({ only: ['dailySummary', 'transactions'] });
        } catch {
            // On failure, rollback
            setTransactions((prev) => [target, ...prev]);
            showToast('Gagal menghapus transaksi.');
        } finally {
            setTrxToDelete(null);
        }
    };

    // Undo delete action within 5 seconds
    const handleUndoDelete = async () => {
        if (!undoData) return;
        const itemToRestore = undoData;
        setUndoData(null);
        setToastMessage(null);

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
                    type: itemToRestore.type,
                    amount: itemToRestore.amount,
                    item: itemToRestore.item,
                    quantity: itemToRestore.quantity,
                    category: itemToRestore.category,
                    note: itemToRestore.note,
                    source: itemToRestore.source,
                    occurred_at: itemToRestore.occurred_at,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setTransactions((prev) => [{ ...itemToRestore, id: data.transaction.id }, ...prev]);
                showToast('Transaksi dipulihkan');
                router.reload({ only: ['dailySummary', 'transactions'] });
            }
        } catch {
            showToast('Gagal memulihkan transaksi.');
        }
    };

    // Sample Debts Data (FIN-12: Catatan Utang-Piutang Pelanggan)
    const [debts, setDebts] = useState<DebtItem[]>([
        {
            id: 'debt-1',
            customerName: 'Pak RT Bambang',
            item: '4 Kopi + 2 Roti',
            amount: 52000,
            date: '10 Okt 2026',
            status: 'unpaid',
        },
        {
            id: 'debt-2',
            customerName: 'Mas Agus Bengkel',
            item: '3 Es Teh Manis',
            amount: 15000,
            date: '09 Okt 2026',
            status: 'unpaid',
        },
    ]);

    const handleToggleDebtStatus = (id: string) => {
        setDebts((prev) =>
            prev.map((d) => (d.id === id ? { ...d, status: d.status === 'unpaid' ? 'paid' : 'unpaid' } : d))
        );
    };

    // Quick Voice Speech Prompts (FIN-04)
    const quickPrompts = [
        'Jual 3 kopi susu, empat puluh lima ribu',
        'Beli gula pasir dua kilo, tiga puluh ribu',
        'Tadi laku roti bakar ceban sama es teh goceng',
    ];

    // Search & Filter (FIN-06)
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTrx = transactions.filter((t) => {
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesQuery = t.item.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesQuery;
    });

    const categoryList = [
        'Penjualan',
        'Minuman',
        'Makanan',
        'Bahan baku',
        'Operasional',
        'Transportasi',
        'Gaji',
        'Jasa',
        'Lainnya',
    ];

    return (
        <>
            <Head title="Catat Transaksi Suara - LAPAK UMKM" />

            {/* Offline Alert Banner */}
            {isOffline && (
                <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-[#FBE3E1] px-4 py-2 text-xs font-bold text-[#B3261E] border-b border-[#B3261E]/20">
                    <WifiOff className="size-4 shrink-0" />
                    <span>Kamu sedang offline. Transaksi baru dapat dicatat manual.</span>
                </div>
            )}

            {/* Toast Message with Undo */}
            {toastMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-xl animate-in fade-in slide-in-from-bottom-4"
                >
                    <CheckCircle2 className="size-4 text-[#216E45]" />
                    <span>{toastMessage}</span>
                    {undoData && (
                        <button
                            type="button"
                            onClick={handleUndoDelete}
                            className="ml-2 rounded-lg bg-background/20 px-2.5 py-1 text-xs font-bold text-background hover:bg-background/30 cursor-pointer"
                        >
                            Urungkan
                        </button>
                    )}
                </div>
            )}

            <div className="w-full max-w-[1400px] mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header Welcome Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-0.5 text-xs font-bold text-primary mb-1.5">
                            <Sparkles className="size-3.5" />
                            Modul ISIS &bull; Asisten Suara
                        </div>
                        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Halo, {business?.owner_name || 'Pelaku Usaha'}! Mau catat apa hari ini?
                        </h1>
                        <p className="text-sm text-lapak-body">
                            Tekan tombol mikrofon di bawah atau ketik untuk mencatat transaksi keuangan tokomu.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleOpenCreateManual}
                            className="font-heading text-xs sm:text-sm"
                        >
                            <PenLine className="size-4" />
                            Ketik Manual
                        </Button>
                        <Button asChild size="sm" className="font-heading text-xs sm:text-sm">
                            <Link href="/laporan">
                                <FileText className="size-4" />
                                Buka Laporan
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* SECTION 1: Ringkasan Finansial Hari Ini / Periode (FIN-07) */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wallet className="size-5 text-primary" />
                            <h2 className="font-heading text-lg font-bold text-foreground">
                                Ringkasan Finansial {dailySummary.date_label}
                            </h2>
                        </div>

                        {/* Date / Period Filter */}
                        <div className="inline-flex items-center rounded-xl bg-muted p-1 border border-border text-xs font-semibold gap-1">
                            <button
                                type="button"
                                onClick={() => router.get('/catat', {}, { preserveScroll: true, preserveState: true })}
                                className={`rounded-lg px-3 py-1 cursor-pointer transition-colors ${
                                    dailySummary.is_today
                                        ? 'bg-card text-foreground shadow-xs font-bold'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                Hari Ini
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const y = new Date();
                                    y.setDate(y.getDate() - 1);
                                    const yStr = y.toISOString().substring(0, 10);
                                    router.get('/catat', { tanggal: yStr }, { preserveScroll: true, preserveState: true });
                                }}
                                className={`rounded-lg px-3 py-1 cursor-pointer transition-colors ${
                                    dailySummary.date_label === 'Kemarin'
                                        ? 'bg-card text-foreground shadow-xs font-bold'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                Kemarin
                            </button>
                            <div className="relative pl-1">
                                <input
                                    type="date"
                                    value={dailySummary.date}
                                    max={new Date().toISOString().substring(0, 10)}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            router.get('/catat', { tanggal: e.target.value }, { preserveScroll: true, preserveState: true });
                                        }
                                    }}
                                    className="bg-transparent text-xs text-muted-foreground focus:outline-hidden cursor-pointer"
                                    aria-label="Pilih tanggal"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {/* Pemasukan */}
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Total Pemasukan
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg bg-[#E4F3E8] text-[#216E45]">
                                    <ArrowUpRight className="size-4" />
                                </div>
                            </div>
                            <p className="font-heading text-2xl font-bold text-[#216E45] sm:text-3xl">
                                {dailySummary.formatted_income}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Dari <strong className="text-foreground">{dailySummary.income_count}</strong> penjualan tercatat
                            </p>
                        </div>

                        {/* Pengeluaran */}
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Total Pengeluaran
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg bg-[#FBE3E1] text-[#B3261E]">
                                    <ArrowDownRight className="size-4" />
                                </div>
                            </div>
                            <p className="font-heading text-2xl font-bold text-[#B3261E] sm:text-3xl">
                                {dailySummary.formatted_expense}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Dari <strong className="text-foreground">{dailySummary.expense_count}</strong> pos belanja toko
                            </p>
                        </div>

                        {/* Laba Bersih */}
                        <div className="rounded-2xl border border-primary/30 bg-secondary/40 p-5 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                    {dailySummary.net_profit < 0 ? 'Rugi Bersih' : 'Laba Bersih Estimasi'}
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                                    <TrendingUp className="size-4" />
                                </div>
                            </div>
                            <p
                                className={`font-heading text-2xl font-bold sm:text-3xl ${
                                    dailySummary.net_profit < 0 ? 'text-[#B3261E]' : 'text-primary'
                                }`}
                            >
                                {dailySummary.formatted_profit}
                            </p>
                            <p className="text-xs text-[#216E45] font-semibold">
                                {dailySummary.net_profit < 0
                                    ? 'Pengeluaran melebihi pemasukan hari ini'
                                    : `Margin Laba: ${
                                          dailySummary.total_income > 0
                                              ? Math.round((dailySummary.net_profit / dailySummary.total_income) * 100)
                                              : 0
                                      }% • Pertumbuhan Baik`}
                            </p>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: TOMBOL SUARA BESAR & KARTU KONFIRMASI (FIN-01, FIN-02, FIN-03) */}
                <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6 text-center">
                    <div className="space-y-1 max-w-lg mx-auto">
                        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                            Sentuh & Bicara untuk Mencatat
                        </h2>
                        <p className="text-xs sm:text-sm text-lapak-body">
                            Sebutkan nama barang dan nominal harga secara wajar. Mendukung dialek sehari-hari seperti ceban, goceng, dan bahasa santai.
                        </p>
                    </div>

                    {/* Microphone Circle Component */}
                    <div className="flex flex-col items-center justify-center space-y-3 py-2">
                        <div className="relative">
                            {recordingState === 'recording' && (
                                <>
                                    <div className="absolute -inset-4 rounded-full bg-primary/20 animate-ping pointer-events-none" />
                                    <div className="absolute -inset-2 rounded-full border-2 border-primary/40 animate-pulse pointer-events-none" />
                                </>
                            )}
                            <button
                                type="button"
                                onClick={() => handleToggleRecording()}
                                aria-label={
                                    recordingState === 'recording'
                                        ? 'Hentikan rekaman suara'
                                        : 'Mulai merekam suara pencatatan keuangan'
                                }
                                className={`size-20 sm:size-24 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 cursor-pointer ${
                                    recordingState === 'recording'
                                        ? 'bg-[#123C2D] ring-4 ring-[#E8F0E6]'
                                        : 'bg-primary hover:bg-[#123C2D]'
                                }`}
                            >
                                {recordingState === 'processing' ? (
                                    <RefreshCw className="size-10 animate-spin text-white" />
                                ) : (
                                    <Mic className="size-10 sm:size-11 text-white" />
                                )}
                            </button>
                        </div>

                        {/* Status Label announced via aria-live */}
                        <div className="space-y-1" aria-live="polite">
                            {recordingState === 'idle' && (
                                <p className="font-heading text-sm font-bold text-foreground">
                                    Mikrofon Siap &bull; Tekan untuk Mulai Bicara
                                </p>
                            )}
                            {recordingState === 'recording' && (
                                <div className="space-y-1">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-[#E4F3E8] px-3 py-1 text-xs font-bold text-[#216E45]">
                                        <span className="size-2 rounded-full bg-[#216E45] animate-ping" />
                                        Merekam suaramu... Bicara sekarang
                                    </span>
                                    <p className="text-xs text-muted-foreground">Tekan sekali lagi untuk menyelesaikan</p>
                                </div>
                            )}
                            {recordingState === 'processing' && (
                                <p className="font-heading text-sm font-bold text-primary animate-pulse">
                                    Sebentar ya... LAPAK sedang merapikan catatanmu
                                </p>
                            )}
                        </div>

                        {/* Error Message if any */}
                        {recordingError && (
                            <div className="mx-auto max-w-md rounded-xl bg-[#FBE3E1] p-3 text-xs text-[#B3261E] flex items-start gap-2 text-left">
                                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p>{recordingError}</p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleRecording()}
                                            className="font-bold underline cursor-pointer"
                                        >
                                            Coba lagi
                                        </button>
                                        <span>&bull;</span>
                                        <button
                                            type="button"
                                            onClick={handleOpenCreateManual}
                                            className="font-bold underline cursor-pointer"
                                        >
                                            Ketik saja
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {consecutiveFailures >= 2 && !recordingError && (
                            <p className="text-xs text-muted-foreground">
                                Mengalami kendala suara?{' '}
                                <button
                                    type="button"
                                    onClick={handleOpenCreateManual}
                                    className="font-bold text-primary underline cursor-pointer"
                                >
                                    Ketik saja
                                </button>
                            </p>
                        )}
                    </div>

                    {/* Quick Simulation Chips (FIN-04) */}
                    <div className="space-y-2 pt-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                            Atau pilih contoh ucapan cepat ini:
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {quickPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleToggleRecording(prompt)}
                                    className="rounded-full border border-border bg-muted/60 px-3.5 py-1.5 text-xs text-foreground font-medium hover:border-primary hover:bg-secondary cursor-pointer transition-all"
                                >
                                    <Volume2 className="inline size-3.5 mr-1 text-primary" />
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* KARTU KONFIRMASI HASIL AI (FIN-03 & design.md 6.2) */}
                    {recordingState === 'confirmed' && pendingTransaction && (
                        <div
                            tabIndex={-1}
                            role="region"
                            aria-label="Kartu Konfirmasi Hasil Catatan Suara"
                            className="mx-auto max-w-lg rounded-2xl border-2 border-primary bg-secondary/40 p-5 text-left space-y-4 shadow-md animate-in fade-in zoom-in-95 duration-200"
                        >
                            <div className="flex items-center justify-between border-b border-border/70 pb-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="size-5 text-[#216E45]" />
                                    <span className="font-heading text-sm font-bold text-foreground">
                                        Hasil Catatan AI Terdeteksi
                                    </span>
                                </div>
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                        pendingTransaction.type === 'income'
                                            ? 'bg-[#E4F3E8] text-[#216E45]'
                                            : pendingTransaction.type === 'expense'
                                            ? 'bg-[#FBE3E1] text-[#B3261E]'
                                            : 'bg-amber-100 text-amber-800'
                                    }`}
                                >
                                    {pendingTransaction.type === 'income'
                                        ? 'Pemasukan'
                                        : pendingTransaction.type === 'expense'
                                        ? 'Pengeluaran'
                                        : 'Perlu dicek (Pilih jenis)'}
                                </span>
                            </div>

                            {pendingTransaction.multiple_detected && (
                                <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-xs text-amber-900">
                                    Aku menangkap lebih dari satu transaksi. Catat satu per satu ya. Berikut transaksi pertama:
                                </div>
                            )}

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground italic">
                                    Transkrip audio: "{transcriptText}"
                                </p>
                                <div className="flex items-center justify-between pt-1">
                                    <div>
                                        <p className="font-heading text-base font-bold text-foreground">
                                            {pendingTransaction.item || (
                                                <span className="text-amber-800 italic">Nama barang belum jelas</span>
                                            )}
                                            {pendingTransaction.quantity > 1 && (
                                                <span className="text-xs text-muted-foreground ml-1.5">
                                                    × {pendingTransaction.quantity}
                                                </span>
                                            )}
                                        </p>
                                        <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                                            Kategori: {pendingTransaction.category}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        {pendingTransaction.amount !== null ? (
                                            <p className="font-heading text-xl font-bold text-primary">
                                                Rp {pendingTransaction.amount.toLocaleString('id-ID')}
                                            </p>
                                        ) : (
                                            <p className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                                                Perlu dicek (Nominal kosong)
                                            </p>
                                        )}
                                        <span className="text-[11px] text-[#216E45] font-semibold">Status: Lunas</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-lapak-body font-semibold">
                                Sudah benar catatannya?
                            </p>

                            <div className="flex items-center justify-between pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPendingTransaction(null);
                                        setRecordingState('idle');
                                    }}
                                    className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                                >
                                    Batal (Tutup)
                                </button>
                                <div className="flex items-center gap-2.5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleOpenEditFromCard}
                                        className="font-heading"
                                    >
                                        Ubah Catatan
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={
                                            pendingTransaction.amount === null ||
                                            pendingTransaction.type === null ||
                                            isSaving
                                        }
                                        onClick={handleConfirmSave}
                                        className="font-heading"
                                    >
                                        {isSaving ? (
                                            <RefreshCw className="size-4 animate-spin mr-1" />
                                        ) : (
                                            <Check className="size-4 mr-1" />
                                        )}
                                        Benar, Simpan Transaksi
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* SECTION 3: RIWAYAT TRANSAKSI TERAKHIR (FIN-06) */}
                <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h2 className="font-heading text-lg font-bold text-foreground">
                                Riwayat Transaksi {dailySummary.date_label}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Menampilkan seluruh arus kas keluar-masuk usaha
                            </p>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari transaksi..."
                                    className="h-9 w-44 pl-9 text-xs"
                                />
                            </div>

                            <div className="inline-flex rounded-lg bg-muted p-0.5 border border-border text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setFilterType('all')}
                                    className={`rounded px-2.5 py-1 cursor-pointer ${
                                        filterType === 'all'
                                            ? 'bg-card text-foreground font-bold shadow-xs'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    Semua
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterType('income')}
                                    className={`rounded px-2.5 py-1 cursor-pointer ${
                                        filterType === 'income'
                                            ? 'bg-card text-[#216E45] font-bold shadow-xs'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    Masuk
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterType('expense')}
                                    className={`rounded px-2.5 py-1 cursor-pointer ${
                                        filterType === 'expense'
                                            ? 'bg-card text-[#B3261E] font-bold shadow-xs'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    Keluar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                        {filteredTrx.length === 0 ? (
                            <div className="p-8 text-center space-y-2">
                                <HelpCircle className="size-8 mx-auto text-muted-foreground" />
                                <p className="font-heading text-sm font-bold text-foreground">
                                    Belum ada catatan {dailySummary.date_label.toLowerCase()}. Tekan mikrofon untuk mulai.
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Gunakan tombol mikrofon atau catat manual untuk menambah catatan.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {filteredTrx.map((trx) => (
                                    <div
                                        key={trx.id}
                                        onClick={() => handleOpenEditExisting(trx)}
                                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex size-10 items-center justify-center rounded-xl ${
                                                    trx.type === 'income'
                                                        ? 'bg-[#E4F3E8] text-[#216E45]'
                                                        : 'bg-[#FBE3E1] text-[#B3261E]'
                                                }`}
                                            >
                                                {trx.type === 'income' ? (
                                                    <ArrowUpRight className="size-5" />
                                                ) : (
                                                    <ArrowDownRight className="size-5" />
                                                )}
                                            </div>

                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-heading text-sm font-bold text-foreground">
                                                        {trx.item} {trx.quantity > 1 && `× ${trx.quantity}`}
                                                    </p>
                                                    {trx.voice_recorded && (
                                                        <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-primary flex items-center gap-0.5">
                                                            <Mic className="size-2.5" />
                                                            Suara
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{trx.category}</span>
                                                    <span>&bull;</span>
                                                    <span>{trx.formatted_time}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-right">
                                            <div>
                                                <p
                                                    className={`font-heading text-base font-bold ${
                                                        trx.type === 'income'
                                                            ? 'text-[#216E45]'
                                                            : 'text-[#B3261E]'
                                                    }`}
                                                >
                                                    {trx.type === 'income' ? '+' : '-'} {trx.formatted_amount}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground">Lunas</span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTrxToDelete(trx);
                                                    setDeleteModalOpen(true);
                                                }}
                                                className="p-1.5 text-muted-foreground hover:text-destructive cursor-pointer rounded-lg hover:bg-muted"
                                                title="Hapus transaksi"
                                                aria-label="Hapus transaksi"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* SECTION 4: CATATAN UTANG-PIUTANG PELANGGAN (FIN-12) */}
                <section className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="size-5 text-primary" />
                            <div>
                                <h2 className="font-heading text-base font-bold text-foreground">
                                    Buku Kasbon & Utang-Piutang Pelanggan
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Pantau tagihan yang belum dibayar pembeli tetap tokomu
                                </p>
                            </div>
                        </div>

                        <span className="rounded-full bg-lapak-gold-soft px-2.5 py-0.5 text-xs font-bold text-lapak-warning">
                            Total Kasbon: Rp {debts.filter((d) => d.status === 'unpaid').reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID')}
                        </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {debts.map((debt) => (
                            <div
                                key={debt.id}
                                className="flex items-center justify-between rounded-xl border border-border p-3.5 bg-muted/30"
                            >
                                <div className="space-y-0.5">
                                    <p className="font-heading text-sm font-bold text-foreground">
                                        {debt.customerName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {debt.item} &bull; {debt.date}
                                    </p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="font-heading text-sm font-bold text-primary">
                                        Rp {debt.amount.toLocaleString('id-ID')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleDebtStatus(debt.id)}
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
                                            debt.status === 'paid'
                                                ? 'bg-[#E4F3E8] text-[#216E45]'
                                                : 'bg-[#FFF1CF] text-[#8A5700] hover:bg-[#E4F3E8] hover:text-[#216E45]'
                                        }`}
                                    >
                                        {debt.status === 'paid' ? 'Lunas' : 'Tandai Lunas'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* MODAL INPUT MANUAL & EDIT (FIN-05) */}
            <Dialog open={manualModalOpen} onOpenChange={handleCloseManualDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-lg">
                            {editingTrxId && editingTrxId !== 'from_card'
                                ? 'Ubah Transaksi'
                                : editingTrxId === 'from_card'
                                ? 'Koreksi Catatan Suara'
                                : 'Catat Transaksi Manual (Ketik)'}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Masukkan detail transaksi jika sedang tidak bisa menggunakan suara.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveManualForm} className="space-y-4 pt-2">
                        {formErrors.submit && (
                            <div className="rounded-lg bg-[#FBE3E1] p-2.5 text-xs font-semibold text-[#B3261E]">
                                {formErrors.submit}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setManualType('income')}
                                className={`rounded-xl border p-2.5 text-center text-xs font-bold cursor-pointer transition-all ${
                                    manualType === 'income'
                                        ? 'border-[#216E45] bg-[#E4F3E8] text-[#216E45]'
                                        : 'border-border text-muted-foreground'
                                }`}
                            >
                                Pemasukan
                            </button>
                            <button
                                type="button"
                                onClick={() => setManualType('expense')}
                                className={`rounded-xl border p-2.5 text-center text-xs font-bold cursor-pointer transition-all ${
                                    manualType === 'expense'
                                        ? 'border-[#B3261E] bg-[#FBE3E1] text-[#B3261E]'
                                        : 'border-border text-muted-foreground'
                                }`}
                            >
                                Pengeluaran
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="m-item" className="text-xs font-semibold">
                                Nama Barang / Transaksi
                            </Label>
                            <Input
                                id="m-item"
                                value={manualItem}
                                onChange={(e) => setManualItem(e.target.value)}
                                placeholder="Contoh: 2 Kopi Susu, Beli Beras 5kg"
                                aria-describedby={formErrors.item ? 'err-item' : undefined}
                                required
                            />
                            {formErrors.item && (
                                <p id="err-item" className="text-xs text-[#B3261E]">
                                    {formErrors.item}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="m-quantity" className="text-xs font-semibold">
                                    Jumlah (Qty)
                                </Label>
                                <Input
                                    id="m-quantity"
                                    type="number"
                                    min="1"
                                    value={manualQuantity}
                                    onChange={(e) => setManualQuantity(e.target.value)}
                                    placeholder="1"
                                    required
                                />
                            </div>

                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor="m-amount" className="text-xs font-semibold">
                                    Nominal Total (Rp)
                                </Label>
                                <Input
                                    id="m-amount"
                                    type="text"
                                    value={manualAmount ? `Rp ${parseInt(manualAmount.replace(/[^0-9]/g, '') || '0', 10).toLocaleString('id-ID')}` : ''}
                                    onChange={(e) => {
                                        const cleanDigits = e.target.value.replace(/[^0-9]/g, '');
                                        setManualAmount(cleanDigits);
                                    }}
                                    placeholder="Rp 45.000"
                                    aria-describedby={formErrors.amount ? 'err-amount' : undefined}
                                    required
                                />
                                {formErrors.amount && (
                                    <p id="err-amount" className="text-xs text-[#B3261E]">
                                        {formErrors.amount}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Kategori</Label>
                            <div className="grid grid-cols-3 gap-1.5 text-xs">
                                {categoryList.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setManualCategory(cat)}
                                        className={`rounded-lg border p-1.5 text-center cursor-pointer transition-all ${
                                            manualCategory === cat
                                                ? 'border-primary bg-secondary text-primary font-bold'
                                                : 'border-border text-muted-foreground'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="m-occurred" className="text-xs font-semibold">
                                Tanggal & Jam
                            </Label>
                            <Input
                                id="m-occurred"
                                type="datetime-local"
                                value={manualOccurredAt}
                                max={new Date().toISOString().substring(0, 16)}
                                onChange={(e) => setManualOccurredAt(e.target.value)}
                                className="text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="m-note" className="text-xs font-semibold">
                                Catatan Tambahan (Opsional)
                            </Label>
                            <Input
                                id="m-note"
                                value={manualNote}
                                onChange={(e) => setManualNote(e.target.value)}
                                placeholder="Contoh: pelanggan minta sedotan kertas"
                                maxLength={300}
                                className="text-xs"
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={handleCloseManualDialog}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <RefreshCw className="size-4 animate-spin mr-1" /> : null}
                                {editingTrxId && editingTrxId !== 'from_card'
                                    ? 'Simpan Perubahan'
                                    : 'Simpan Catatan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DIALOG KONFIRMASI HAPUS */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-base text-[#B3261E]">
                            Hapus Transaksi?
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Hapus transaksi ini? Tindakan ini tidak bisa dibatalkan.
                        </DialogDescription>
                    </DialogHeader>

                    {trxToDelete && (
                        <div className="rounded-xl border border-border p-3 bg-muted/30 text-xs space-y-1">
                            <p className="font-bold text-foreground">{trxToDelete.item}</p>
                            <p className="text-primary font-bold">{trxToDelete.formatted_amount}</p>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmDelete}
                        >
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

CatatIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Catat Transaksi', href: '/catat' },
    ],
};
