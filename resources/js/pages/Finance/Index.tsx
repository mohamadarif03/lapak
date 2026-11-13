import AppSidebar from '@/Components/AppSidebar';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Chart from 'chart.js/auto';
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgePercent,
  BookOpen,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Gift,
  GraduationCap,
  Home,
  Info,
  Lightbulb,
  LineChart,
  LogOut,
  Maximize,
  MinusCircle,
  Moon,
  MoreVertical,
  Package,
  Plus,
  PlusCircle,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sliders,
  Sparkles,
  Store,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
  AlertTriangle,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { initialProducts } from '../../data/mockProducts';
import {
  initialTransactions,
  initialDebts,
  initialFinanceSettings,
} from '../../data/mockFinance';
import {
  TransactionItem,
  TransactionType,
  AccountType,
  PaymentMethod,
  DebtItem,
  DebtPayment,
  FinanceSettings,
} from '../../types/finance';
import {
  formatRupiah,
  parseRupiahInput,
  calculateFinanceSummary,
  generateCashFlowReport,
  generateProfitLossReport,
  EXPENSE_CATEGORY_COLORS,
} from '../../services/financeSummaryService';

export default function FinanceIndex() {
  // Shell Layout State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'transaksi' | 'utang_piutang' | 'laporan'>('ringkasan');

  // Filter Periode
  const [selectedPeriod, setSelectedPeriod] = useState<'hari_ini' | 'minggu_ini' | 'bulan_ini' | 'kustom'>('bulan_ini');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: '2026-10-01',
    end: '2026-10-31',
  });

  // Data State (Tersimpan di client state agar CRUD interaktif langsung bekerja)
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);
  const [debts, setDebts] = useState<DebtItem[]>(initialDebts);
  const [settings, setSettings] = useState<FinanceSettings>(initialFinanceSettings);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // =========================================================================
  // SUMMARY CALCULATION (Deterministic via FinanceSummaryService)
  // =========================================================================
  const summary = useMemo(() => {
    return calculateFinanceSummary(
      transactions,
      debts,
      settings.initial_business_cash,
      selectedPeriod,
      customDateRange
    );
  }, [transactions, debts, settings.initial_business_cash, selectedPeriod, customDateRange]);

  // =========================================================================
  // CHART REFS & RENDER
  // =========================================================================
  const trendChartRef = useRef<HTMLCanvasElement | null>(null);
  const trendChartInstance = useRef<Chart | null>(null);
  const donutChartRef = useRef<HTMLCanvasElement | null>(null);
  const donutChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (activeTab !== 'ringkasan') return;

    // 1. Chart Tren Masuk vs Keluar
    if (trendChartRef.current) {
      if (trendChartInstance.current) {
        trendChartInstance.current.destroy();
      }
      const ctx = trendChartRef.current.getContext('2d');
      if (ctx) {
        trendChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: summary.income_vs_expense_timeline.labels,
            datasets: [
              {
                label: 'Uang Masuk Usaha',
                data: summary.income_vs_expense_timeline.masuk,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                fill: true,
                tension: 0.35,
                borderWidth: 2.5,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
              },
              {
                label: 'Uang Keluar Usaha',
                data: summary.income_vs_expense_timeline.keluar,
                borderColor: '#ec4899',
                backgroundColor: 'rgba(236, 72, 153, 0.06)',
                fill: true,
                tension: 0.35,
                borderWidth: 2.5,
                pointBackgroundColor: '#ec4899',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  boxWidth: 10,
                  boxHeight: 10,
                  font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
                },
              },
              tooltip: {
                backgroundColor: '#1e293b',
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: function (context) {
                    return ` ${context.dataset.label}: ${formatRupiah(context.raw as number)}`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => {
                    const num = Number(value);
                    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} jt`;
                    if (num >= 1000) return `${num / 1000} rb`;
                    return String(num);
                  },
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

    // 2. Donut Chart Komposisi Pengeluaran
    if (donutChartRef.current) {
      if (donutChartInstance.current) {
        donutChartInstance.current.destroy();
      }
      const ctx = donutChartRef.current.getContext('2d');
      if (ctx && summary.expense_composition.length > 0) {
        donutChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: summary.expense_composition.map((c) => c.category),
            datasets: [
              {
                data: summary.expense_composition.map((c) => c.amount),
                backgroundColor: summary.expense_composition.map((c) => c.color),
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1e293b',
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: function (context) {
                    const val = context.raw as number;
                    const total = summary.uang_keluar_usaha || 1;
                    const pct = Math.round((val / total) * 100);
                    return ` ${context.label}: ${formatRupiah(val)} (${pct}%)`;
                  },
                },
              },
            },
            cutout: '72%',
          },
        });
      }
    }

    return () => {
      if (trendChartInstance.current) trendChartInstance.current.destroy();
      if (donutChartInstance.current) donutChartInstance.current.destroy();
    };
  }, [activeTab, summary]);

  // =========================================================================
  // TAB 2: TRANSAKSI (Filter, Search, Form CRUD)
  // =========================================================================
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<'semua' | 'masuk' | 'keluar'>('semua');
  const [txAccountFilter, setTxAccountFilter] = useState<'semua' | 'usaha' | 'pribadi'>('semua');
  const [txCategoryFilter, setTxCategoryFilter] = useState<string>('semua');
  const [txSortBy, setTxSortBy] = useState<'terbaru' | 'terlama' | 'nominal_terbesar' | 'nominal_terkecil'>('terbaru');

  // Filtered & Grouped Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.description.toLowerCase().includes(txSearch.toLowerCase()) ||
        t.category.toLowerCase().includes(txSearch.toLowerCase()) ||
        (t.product_name && t.product_name.toLowerCase().includes(txSearch.toLowerCase()));

      const matchType = txTypeFilter === 'semua' || t.type === txTypeFilter;
      const matchAccount = txAccountFilter === 'semua' || t.account === txAccountFilter;
      const matchCat = txCategoryFilter === 'semua' || t.category === txCategoryFilter;

      return matchSearch && matchType && matchAccount && matchCat;
    }).sort((a, b) => {
      if (txSortBy === 'terbaru') return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
      if (txSortBy === 'terlama') return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
      if (txSortBy === 'nominal_terbesar') return b.amount - a.amount;
      if (txSortBy === 'nominal_terkecil') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, txSearch, txTypeFilter, txAccountFilter, txCategoryFilter, txSortBy]);

  // Kelompokkan per tanggal
  const groupedTransactionsByDate = useMemo(() => {
    const groups: Record<string, { date: string; items: TransactionItem[]; subtotalMasuk: number; subtotalKeluar: number }> = {};
    filteredTransactions.forEach((t) => {
      if (!groups[t.date]) {
        groups[t.date] = { date: t.date, items: [], subtotalMasuk: 0, subtotalKeluar: 0 };
      }
      groups[t.date].items.push(t);
      if (t.type === 'masuk') groups[t.date].subtotalMasuk += t.amount;
      else groups[t.date].subtotalKeluar += t.amount;
    });
    return Object.values(groups);
  }, [filteredTransactions]);

  // Modal Form Transaksi State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionItem | null>(null);

  const [formType, setFormType] = useState<TransactionType>('masuk');
  const [formAmountStr, setFormAmountStr] = useState<string>('');
  const [formAccount, setFormAccount] = useState<AccountType>('usaha');
  const [formCategory, setFormCategory] = useState<string>('Penjualan');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [formDate, setFormDate] = useState<string>('2026-10-26');
  const [formTime, setFormTime] = useState<string>('12:00');
  const [formProductId, setFormProductId] = useState<string>('');
  const [formProductQty, setFormProductQty] = useState<number>(1);

  const openAddTxModal = (initialType: TransactionType = 'masuk') => {
    setEditingTx(null);
    setFormType(initialType);
    setFormAmountStr('');
    setFormAccount('usaha');
    setFormCategory(initialType === 'masuk' ? 'Penjualan' : 'Bahan Baku');
    setFormDescription('');
    setFormPaymentMethod('Tunai');
    setFormDate('2026-10-26');
    setFormTime('12:00');
    setFormProductId('');
    setFormProductQty(1);
    setIsTxModalOpen(true);
  };

  const openEditTxModal = (tx: TransactionItem) => {
    setEditingTx(tx);
    setFormType(tx.type);
    setFormAmountStr(formatRupiah(tx.amount).replace('Rp ', ''));
    setFormAccount(tx.account);
    setFormCategory(tx.category);
    setFormDescription(tx.description);
    setFormPaymentMethod(tx.payment_method);
    setFormDate(tx.date);
    setFormTime(tx.time);
    setFormProductId(tx.product_id ? String(tx.product_id) : '');
    setFormProductQty(tx.product_qty || 1);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = (keepOpen: boolean = false) => {
    const nominal = parseRupiahInput(formAmountStr);
    if (!nominal || nominal <= 0) {
      alert('Jumlah nominal uang belum diisi.');
      return;
    }
    if (!formCategory) {
      alert('Kategori transaksi wajib dipilih.');
      return;
    }

    const matchedProd = initialProducts.find((p) => String(p.id) === formProductId);

    if (editingTx) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingTx.id
            ? {
                ...t,
                type: formType,
                amount: nominal,
                account: formAccount,
                category: formCategory,
                description: formDescription || (formType === 'masuk' ? 'Pemasukan Kas' : 'Pengeluaran Kas'),
                payment_method: formPaymentMethod,
                date: formDate,
                time: formTime,
                product_id: matchedProd ? matchedProd.id : null,
                product_name: matchedProd ? matchedProd.name : null,
                product_qty: matchedProd ? formProductQty : null,
              }
            : t
        )
      );
      showToast('Transaksi berhasil diperbarui!');
    } else {
      const newTx: TransactionItem = {
        id: `tx-${Date.now()}`,
        type: formType,
        amount: nominal,
        account: formAccount,
        category: formCategory,
        description: formDescription || (formType === 'masuk' ? 'Pemasukan Kas' : 'Pengeluaran Kas'),
        payment_method: formPaymentMethod,
        date: formDate,
        time: formTime,
        product_id: matchedProd ? matchedProd.id : null,
        product_name: matchedProd ? matchedProd.name : null,
        product_qty: matchedProd ? formProductQty : null,
        created_at: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast('Transaksi baru berhasil dicatat!');
    }

    if (keepOpen) {
      setFormAmountStr('');
      setFormDescription('');
      setFormProductId('');
      setFormProductQty(1);
    } else {
      setIsTxModalOpen(false);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Yakin ingin menghapus catatan transaksi ini?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast('Transaksi berhasil dihapus');
    }
  };

  const handleDuplicateTransaction = (tx: TransactionItem) => {
    const dup: TransactionItem = {
      ...tx,
      id: `tx-${Date.now()}`,
      description: `${tx.description} (Salinan)`,
      time: '12:00',
      created_at: new Date().toISOString(),
    };
    setTransactions((prev) => [dup, ...prev]);
    showToast('Transaksi berhasil digandakan!');
  };

  // =========================================================================
  // TAB 3: UTANG & PIUTANG (Kelola, Cicilan, Sinkronisasi Kas)
  // =========================================================================
  const [debtTypeFilter, setDebtTypeFilter] = useState<'semua' | 'piutang' | 'utang'>('semua');
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtItem | null>(null);

  // Form Utang/Piutang
  const [formDebtType, setFormDebtType] = useState<'piutang' | 'utang'>('piutang');
  const [formDebtPerson, setFormDebtPerson] = useState('');
  const [formDebtPhone, setFormDebtPhone] = useState('');
  const [formDebtAmountStr, setFormDebtAmountStr] = useState('');
  const [formDebtDueDate, setFormDebtDueDate] = useState('2026-11-02');
  const [formDebtNote, setFormDebtNote] = useState('');

  // Modal Pembayaran Cicilan Utang/Piutang
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<DebtItem | null>(null);
  const [paymentAmountStr, setPaymentAmountStr] = useState('');
  const [paymentDate, setPaymentDate] = useState('2026-10-26');
  const [paymentNote, setPaymentNote] = useState('');
  const [syncToCashTransaction, setSyncToCashTransaction] = useState(true);

  const openAddDebtModal = (type: 'piutang' | 'utang') => {
    setEditingDebt(null);
    setFormDebtType(type);
    setFormDebtPerson('');
    setFormDebtPhone('');
    setFormDebtAmountStr('');
    setFormDebtDueDate('2026-11-05');
    setFormDebtNote('');
    setIsDebtModalOpen(true);
  };

  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const nominal = parseRupiahInput(formDebtAmountStr);
    if (!formDebtPerson.trim() || !nominal || nominal <= 0) {
      alert('Nama pihak dan total nominal wajib diisi.');
      return;
    }

    if (editingDebt) {
      setDebts((prev) =>
        prev.map((d) =>
          d.id === editingDebt.id
            ? {
                ...d,
                type: formDebtType,
                person_name: formDebtPerson,
                phone: formDebtPhone,
                total_amount: nominal,
                remaining_amount: nominal - d.paid_amount,
                due_date: formDebtDueDate,
                note: formDebtNote,
              }
            : d
        )
      );
      showToast('Catatan utang/piutang berhasil diperbarui!');
    } else {
      const newDebt: DebtItem = {
        id: `debt-${Date.now()}`,
        type: formDebtType,
        person_name: formDebtPerson,
        phone: formDebtPhone,
        total_amount: nominal,
        paid_amount: 0,
        remaining_amount: nominal,
        due_date: formDebtDueDate,
        status: 'belum_lunas',
        note: formDebtNote,
        payments: [],
        created_at: new Date().toISOString(),
      };
      setDebts((prev) => [newDebt, ...prev]);
      showToast(`Catatan ${formDebtType === 'piutang' ? 'Piutang' : 'Utang'} berhasil disimpan!`);
    }
    setIsDebtModalOpen(false);
  };

  const handleRecordDebtPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtForPayment) return;
    const nominal = parseRupiahInput(paymentAmountStr);
    if (!nominal || nominal <= 0) {
      alert('Nominal pembayaran belum diisi.');
      return;
    }

    const debt = selectedDebtForPayment;
    const newPaid = debt.paid_amount + nominal;
    const newRemaining = Math.max(0, debt.total_amount - newPaid);
    const newStatus = newRemaining === 0 ? 'lunas' : 'sebagian';

    const paymentRecord: DebtPayment = {
      id: `pay-${Date.now()}`,
      debt_id: debt.id,
      date: paymentDate,
      amount: nominal,
      note: paymentNote || `Pembayaran cicilan dari ${debt.person_name}`,
    };

    // Update state utang/piutang
    setDebts((prev) =>
      prev.map((d) =>
        d.id === debt.id
          ? {
              ...d,
              paid_amount: newPaid,
              remaining_amount: newRemaining,
              status: newStatus,
              payments: [paymentRecord, ...d.payments],
            }
          : d
      )
    );

    // Otomatis sinkronisasi ke buku kas transaksi jika dicentang
    if (syncToCashTransaction) {
      const isPiutang = debt.type === 'piutang';
      const autoTx: TransactionItem = {
        id: `tx-sync-${Date.now()}`,
        date: paymentDate,
        time: '12:00',
        type: isPiutang ? 'masuk' : 'keluar',
        amount: nominal,
        account: 'usaha',
        category: isPiutang ? 'Pesanan/Titipan' : 'Bahan Baku',
        description: isPiutang
          ? `Pembayaran piutang dari ${debt.person_name}`
          : `Pembayaran utang ke ${debt.person_name}`,
        payment_method: 'Transfer Bank',
        debt_id: debt.id,
        created_at: new Date().toISOString(),
      };
      setTransactions((prev) => [autoTx, ...prev]);
      showToast(`Pembayaran Rp ${nominal.toLocaleString('id-ID')} dicatat & disinkronkan ke Kas Usaha!`);
    } else {
      showToast('Pembayaran berhasil dicatat!');
    }

    setSelectedDebtForPayment(null);
    setPaymentAmountStr('');
    setPaymentNote('');
  };

  const handleMarkDebtAsPaid = (debt: DebtItem) => {
    if (confirm(`Tandai seluruh sisa utang/piutang ${debt.person_name} sebesar ${formatRupiah(debt.remaining_amount)} sebagai LUNAS?`)) {
      const remaining = debt.remaining_amount;
      const paymentRecord: DebtPayment = {
        id: `pay-${Date.now()}`,
        debt_id: debt.id,
        date: '2026-10-26',
        amount: remaining,
        note: 'Pelunasan langsung',
      };

      setDebts((prev) =>
        prev.map((d) =>
          d.id === debt.id
            ? {
                ...d,
                paid_amount: d.total_amount,
                remaining_amount: 0,
                status: 'lunas',
                payments: [paymentRecord, ...d.payments],
              }
            : d
        )
      );

      // Sinkronkan ke kas usaha
      const isPiutang = debt.type === 'piutang';
      const autoTx: TransactionItem = {
        id: `tx-sync-${Date.now()}`,
        date: '2026-10-26',
        time: '12:00',
        type: isPiutang ? 'masuk' : 'keluar',
        amount: remaining,
        account: 'usaha',
        category: isPiutang ? 'Pesanan/Titipan' : 'Bahan Baku',
        description: isPiutang
          ? `Pelunasan piutang dari ${debt.person_name}`
          : `Pelunasan utang ke ${debt.person_name}`,
        payment_method: 'Tunai',
        debt_id: debt.id,
        created_at: new Date().toISOString(),
      };
      setTransactions((prev) => [autoTx, ...prev]);
      showToast(`Lunas! Transaksi otomatis masuk ke Kas Usaha.`);
    }
  };

  const handleDeleteDebt = (id: string) => {
    if (confirm('Hapus catatan utang/piutang ini?')) {
      setDebts((prev) => prev.filter((d) => d.id !== id));
      showToast('Catatan berhasil dihapus.');
    }
  };

  // =========================================================================
  // TAB 4: LAPORAN (Arus Kas, Laba Rugi, Unduh CSV & Print PDF)
  // =========================================================================
  const [reportPeriod, setReportPeriod] = useState<'bulan_ini' | 'bulan_lalu' | 'tiga_bulan'>('bulan_ini');
  const [reportTypeView, setReportTypeView] = useState<'arus_kas' | 'laba_rugi'>('arus_kas');

  const cashFlowReport = useMemo(() => {
    return generateCashFlowReport(
      transactions,
      settings.initial_business_cash,
      reportPeriod === 'bulan_ini' ? 'Bulan Oktober 2026' : reportPeriod === 'bulan_lalu' ? 'Bulan September 2026' : '3 Bulan Terakhir'
    );
  }, [transactions, settings.initial_business_cash, reportPeriod]);

  const profitLossReport = useMemo(() => {
    return generateProfitLossReport(
      transactions,
      reportPeriod === 'bulan_ini' ? 'Bulan Oktober 2026' : reportPeriod === 'bulan_lalu' ? 'Bulan September 2026' : '3 Bulan Terakhir'
    );
  }, [transactions, reportPeriod]);

  // Export CSV
  const handleDownloadCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // UTF-8 BOM
    csvContent += 'LAPORAN KEUANGAN UMKM - DAPUR BU SITI\n';
    csvContent += `Periode: ${cashFlowReport.period_label}\n`;
    csvContent += `Tanggal Cetak: 26 Oktober 2026\n\n`;

    csvContent += '--- LAPORAN ARUS KAS USAHA ---\n';
    csvContent += `Saldo Awal Kas Usaha,${cashFlowReport.saldo_awal}\n`;
    csvContent += `Total Uang Masuk,${cashFlowReport.total_masuk}\n`;
    cashFlowReport.masuk_by_category.forEach((m) => {
      csvContent += `  Masuk: ${m.category},${m.amount},(${m.percentage}%)\n`;
    });
    csvContent += `Total Uang Keluar,${cashFlowReport.total_keluar}\n`;
    cashFlowReport.keluar_by_category.forEach((k) => {
      csvContent += `  Keluar: ${k.category},${k.amount},(${k.percentage}%)\n`;
    });
    csvContent += `Saldo Akhir Kas Usaha,${cashFlowReport.saldo_akhir}\n\n`;

    csvContent += '--- LAPORAN LABA RUGI USAHA ---\n';
    csvContent += `Total Pendapatan Usaha,${profitLossReport.total_pendapatan}\n`;
    csvContent += `Total Pengeluaran Beban,${profitLossReport.total_beban}\n`;
    csvContent += `Laba Bersih Usaha,${profitLossReport.laba_bersih}\n`;
    csvContent += `Margin Laba Bersih,${profitLossReport.margin_persen}%\n\n`;

    csvContent += '--- DAFTAR TRANSAKSI USAHA ---\n';
    csvContent += 'Tanggal,Kategori,Keterangan,Tipe,Metode,Jumlah (Rp)\n';
    transactions.filter((t) => t.account === 'usaha').forEach((t) => {
      csvContent += `"${t.date}","${t.category}","${t.description.replace(/"/g, '""')}","${t.type}","${t.payment_method}",${t.type === 'masuk' ? t.amount : -t.amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_Bu_Siti_${reportPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan Excel / CSV berhasil diunduh!');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // =========================================================================
  // MODAL PENGATURAN KEUANGAN
  // =========================================================================
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsInitialCashStr, setSettingsInitialCashStr] = useState(
    formatRupiah(settings.initial_business_cash).replace('Rp ', '')
  );
  const [settingsReminderTime, setSettingsReminderTime] = useState(settings.reminder_time);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'masuk' | 'keluar'>('keluar');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newCash = parseRupiahInput(settingsInitialCashStr);
    setSettings((prev) => ({
      ...prev,
      initial_business_cash: newCash,
      reminder_time: settingsReminderTime,
    }));
    setIsSettingsModalOpen(false);
    showToast('Pengaturan keuangan berhasil disimpan!');
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    if (newCatType === 'masuk') {
      if (!settings.categories_masuk.includes(newCatName.trim())) {
        setSettings((prev) => ({
          ...prev,
          categories_masuk: [...prev.categories_masuk, newCatName.trim()],
        }));
      }
    } else {
      if (!settings.categories_keluar.includes(newCatName.trim())) {
        setSettings((prev) => ({
          ...prev,
          categories_keluar: [...prev.categories_keluar, newCatName.trim()],
        }));
      }
    }
    setNewCatName('');
    showToast('Kategori baru ditambahkan!');
  };

  // Fullscreen Helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb] font-sans text-slate-700 antialiased print:bg-white print:text-black">
      <Head title="Keuangan & Catatan Kas - Lapak Digital UMKM" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="animate-fade-in fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl print:hidden">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible">
        <AppSidebar
          current="keuangan"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          counts={{ transactions: transactions.length, products: initialProducts.length }}
          onShowToast={showToast}
          customWidget={
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs">
              <div className="mb-1 flex items-center space-x-1.5 font-bold text-emerald-700">
                <Flame className="h-4 w-4 text-amber-500" />
                <span>{summary.streak_recording_days} Hari Tercatat Bulan Ini!</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Hebat Bu Siti! Rutin mencatat bikin uang usahamu aman dan laba bersih terlihat nyata.
              </p>
            </div>
          }
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
                <span className="font-medium text-slate-700">Keuangan & Kas</span>
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                title="Pengaturan Keuangan"
              >
                <Settings className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Pengaturan Kas</span>
              </button>

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

          {/* Printable Watermark/Header on Print */}
          <div className="hidden print:block mb-4 border-b pb-3">
            <h1 className="text-xl font-bold">Laporan Keuangan Resmi UMKM - Dapur Bu Siti</h1>
            <p className="text-xs text-gray-500">Dicetak pada: 26 Oktober 2026 • Laporan Internal Pemilik Usaha</p>
          </div>

          {/* Main Scroll Content */}
          <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 print:overflow-visible print:p-0">
            <div className="mx-auto max-w-7xl space-y-5">
              {/* ================= 1. HEADER HALAMAN & AKSI PINTAS ================= */}
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                    Keuangan & Catatan Kas
                  </h1>
                  <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                    Catat uang masuk & keluar usahamu dengan mudah, pisahkan uang pribadi, dan ketahui laba bersih nyata.
                  </p>
                </div>

                {/* Filter Periode & Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 text-xs font-semibold shadow-2xs">
                    {(['hari_ini', 'minggu_ini', 'bulan_ini'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setSelectedPeriod(p)}
                        className={`rounded-lg px-3 py-1.5 transition ${
                          selectedPeriod === p ? 'bg-[#8b5cf6] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {p === 'hari_ini' ? 'Hari Ini' : p === 'minggu_ini' ? 'Minggu Ini' : 'Bulan Ini'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => openAddTxModal('masuk')}
                    className="inline-flex min-h-[38px] items-center space-x-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Uang Masuk</span>
                  </button>

                  <button
                    onClick={() => openAddTxModal('keluar')}
                    className="inline-flex min-h-[38px] items-center space-x-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700"
                  >
                    <MinusCircle className="h-4 w-4" />
                    <span>+ Uang Keluar</span>
                  </button>
                </div>
              </div>

              {/* ================= TAB NAVIGATION ================= */}
              <div className="flex border-b border-slate-200 print:hidden">
                <div className="flex space-x-2 overflow-x-auto pb-1 text-xs font-semibold sm:space-x-4 sm:text-sm">
                  <button
                    onClick={() => setActiveTab('ringkasan')}
                    className={`flex shrink-0 items-center space-x-2 border-b-2 px-3 py-2.5 transition ${
                      activeTab === 'ringkasan'
                        ? 'border-[#8b5cf6] text-[#8b5cf6]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LineChart className="h-4 w-4" />
                    <span>Ringkasan</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('transaksi')}
                    className={`flex shrink-0 items-center space-x-2 border-b-2 px-3 py-2.5 transition ${
                      activeTab === 'transaksi'
                        ? 'border-[#8b5cf6] text-[#8b5cf6]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Wallet className="h-4 w-4" />
                    <span>Daftar Transaksi</span>
                    <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-[#8b5cf6]">
                      {filteredTransactions.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('utang_piutang')}
                    className={`flex shrink-0 items-center space-x-2 border-b-2 px-3 py-2.5 transition ${
                      activeTab === 'utang_piutang'
                        ? 'border-[#8b5cf6] text-[#8b5cf6]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Utang & Piutang</span>
                    {(summary.piutang_jatuh_tempo_count > 0 || summary.utang_jatuh_tempo_count > 0) && (
                      <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                        {summary.piutang_jatuh_tempo_count + summary.utang_jatuh_tempo_count} Perlu Atensi
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('laporan')}
                    className={`flex shrink-0 items-center space-x-2 border-b-2 px-3 py-2.5 transition ${
                      activeTab === 'laporan'
                        ? 'border-[#8b5cf6] text-[#8b5cf6]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Laporan Sederhana</span>
                  </button>
                </div>
              </div>

              {/* ================= TAB 1: RINGKASAN ================= */}
              {activeTab === 'ringkasan' && (
                <div className="space-y-5">
                  {/* 4 KARTU RINGKASAN UTAMA (KAS USAHA) */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {/* 1. Uang Masuk Usaha */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Uang Masuk Usaha</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-slate-800 sm:text-xl">
                        {formatRupiah(summary.uang_masuk_usaha)}
                      </h3>
                      <div className="mt-1 flex items-center text-[11px] font-medium text-emerald-600">
                        <TrendingUp className="mr-0.5 h-3 w-3" />
                        <span>naik {summary.uang_masuk_diff_percent}% dari periode lalu</span>
                      </div>
                    </div>

                    {/* 2. Uang Keluar Usaha */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Uang Keluar Usaha</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                          <ArrowDownRight className="h-4 w-4" />
                        </div>
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-slate-800 sm:text-xl">
                        {formatRupiah(summary.uang_keluar_usaha)}
                      </h3>
                      <div className="mt-1 flex items-center text-[11px] font-medium text-emerald-600">
                        <TrendingDown className="mr-0.5 h-3 w-3" />
                        <span>turun 8% lebih hemat</span>
                      </div>
                    </div>

                    {/* 3. Laba Usaha */}
                    <div className="relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8b5cf6]"></div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Laba Usaha (Bersih)</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-[#8b5cf6]">
                          <Sparkles className="h-4 w-4" />
                        </div>
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-[#8b5cf6] sm:text-xl">
                        {formatRupiah(summary.laba_usaha)}
                      </h3>
                      <div className="mt-1 text-[11px] font-medium text-slate-400">
                        Uang masuk dikurangi keluar
                      </div>
                    </div>

                    {/* 4. Saldo Kas Usaha */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Saldo Kas Usaha</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Wallet className="h-4 w-4" />
                        </div>
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-slate-800 sm:text-xl">
                        {formatRupiah(summary.saldo_kas_usaha)}
                      </h3>
                      <div className="mt-1 text-[11px] font-medium text-slate-400">
                        Siap dipakai operasional toko
                      </div>
                    </div>
                  </div>

                  {/* KARTU TERPISAH: KAS PRIBADI (EDUKASI PEMISAHAN KAS) */}
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-2xs">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-bold text-slate-800">Kas Pribadi (Rumah Tangga)</h4>
                            <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              Tidak Dihitung ke Laba Usaha
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">
                            💡 <strong>Penting:</strong> Uang belanja rumah & saku keluarga sengaja dipisah dari kas usaha agar keuntungan tokomu terlihat jelas dan tidak terpakai secara tidak sadar.
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center space-x-4 border-t border-slate-200 pt-2 sm:border-0 sm:pt-0">
                        <div>
                          <span className="block text-[10px] text-slate-400">Pengeluaran Pribadi:</span>
                          <span className="text-xs font-bold text-slate-700">
                            {formatRupiah(summary.uang_keluar_pribadi)}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setTxAccountFilter('pribadi');
                            setActiveTab('transaksi');
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Lihat Kas Pribadi →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CHARTS ROW (TREN PENJUALAN & KOMPOSISI PENGELUARAN) */}
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                    {/* Line Chart Tren Masuk vs Keluar (7 Cols) */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:col-span-7">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">Tren Pemasukan vs Pengeluaran</h3>
                          <p className="text-[11px] text-slate-400">Arus kas usaha pada periode aktif</p>
                        </div>
                        <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#8b5cf6]">
                          Kas Usaha
                        </span>
                      </div>
                      <div className="relative h-64 w-full">
                        <canvas ref={trendChartRef}></canvas>
                      </div>
                    </div>

                    {/* Donut Chart Komposisi Pengeluaran (5 Cols) */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:col-span-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">Komposisi Pengeluaran</h3>
                          <p className="text-[11px] text-slate-400">Ke mana uang usahamu paling banyak keluar</p>
                        </div>
                      </div>

                      {summary.expense_composition.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center text-center text-xs text-slate-400">
                          <ShoppingBag className="mb-2 h-8 w-8 text-slate-300" />
                          <span>Belum ada pengeluaran pada periode ini</span>
                        </div>
                      ) : (
                        <div>
                          <div className="relative mx-auto h-44 w-44">
                            <canvas ref={donutChartRef}></canvas>
                          </div>
                          {/* Legend Categories */}
                          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                            {summary.expense_composition.slice(0, 6).map((item) => (
                              <div key={item.category} className="flex items-center space-x-1.5">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }}></span>
                                <span className="truncate text-slate-600">{item.category}:</span>
                                <span className="font-bold text-slate-800">{item.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* KARTU "PERLU PERHATIAN" & "KEBIASAAN MENCATAT" */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Perlu Perhatian */}
                    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-2xs">
                      <div className="mb-2 flex items-center space-x-2 text-xs font-bold text-amber-800">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span>Perlu Perhatian Minggu Ini</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        {summary.utang_jatuh_tempo_count > 0 && (
                          <div className="flex items-center justify-between rounded-xl bg-white p-2.5 shadow-2xs">
                            <span className="text-slate-700">
                              ⚠️ <strong>{summary.utang_jatuh_tempo_count} Utang ke supplier</strong> jatuh tempo dalam 7 hari
                            </span>
                            <button
                              onClick={() => {
                                setDebtTypeFilter('utang');
                                setActiveTab('utang_piutang');
                              }}
                              className="font-bold text-[#8b5cf6] hover:underline"
                            >
                              Lihat →
                            </button>
                          </div>
                        )}

                        {summary.piutang_jatuh_tempo_count > 0 && (
                          <div className="flex items-center justify-between rounded-xl bg-white p-2.5 shadow-2xs">
                            <span className="text-slate-700">
                              💰 <strong>{summary.piutang_jatuh_tempo_count} Piutang pelanggan</strong> mendekati batas bayar
                            </span>
                            <button
                              onClick={() => {
                                setDebtTypeFilter('piutang');
                                setActiveTab('utang_piutang');
                              }}
                              className="font-bold text-[#8b5cf6] hover:underline"
                            >
                              Tagih →
                            </button>
                          </div>
                        )}

                        {summary.days_without_recording > 0 ? (
                          <div className="flex items-center justify-between rounded-xl bg-white p-2.5 shadow-2xs">
                            <span className="text-slate-700">
                              📝 Ada {summary.days_without_recording} hari di minggu ini tanpa catatan. Yuk lengkapi!
                            </span>
                            <button
                              onClick={() => openAddTxModal('masuk')}
                              className="font-bold text-emerald-600 hover:underline"
                            >
                              + Catat →
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-emerald-700 font-medium">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>Semua transaksi harianmu sudah tercatat rapi minggu ini. Mantap!</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Kebiasaan Mencatat */}
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 shadow-2xs">
                      <div className="mb-2 flex items-center space-x-2 text-xs font-bold text-purple-900">
                        <Flame className="h-4 w-4 text-amber-500" />
                        <span>Kebiasaan Mencatat (Kedisiplinan Usaha)</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Kamu sudah mencatat transaksi selama <strong>{summary.streak_recording_days} hari</strong> di bulan Oktober ini!
                      </p>
                      <div className="mt-3 flex items-center space-x-2">
                        <div className="h-2 flex-1 rounded-full bg-purple-200 overflow-hidden">
                          <div
                            className="h-full bg-[#8b5cf6] transition-all"
                            style={{ width: `${Math.min(100, Math.round((summary.streak_recording_days / 31) * 100))}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-bold text-[#8b5cf6]">
                          {Math.round((summary.streak_recording_days / 31) * 100)}%
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] text-slate-500">
                        Target UMKM Sehat: Catat minimal 1 kali transaksi per hari untuk mendeteksi kebocoran kas sedini mungkin.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: TRANSAKSI ================= */}
              {activeTab === 'transaksi' && (
                <div className="space-y-4">
                  {/* Toolbar Filter & Search */}
                  <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      {/* Search */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={txSearch}
                          onChange={(e) => setTxSearch(e.target.value)}
                          placeholder="Cari transaksi berdasarkan keterangan / nama barang..."
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-[#8b5cf6] focus:outline-none"
                        />
                      </div>

                      {/* Filter Jenis */}
                      <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-semibold">
                        {[
                          { id: 'semua', label: 'Semua Jenis' },
                          { id: 'masuk', label: 'Uang Masuk (+)' },
                          { id: 'keluar', label: 'Uang Keluar (-)' },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => setTxTypeFilter(btn.id as typeof txTypeFilter)}
                            className={`shrink-0 rounded-xl px-3 py-1.5 transition ${
                              txTypeFilter === btn.id
                                ? 'bg-[#8b5cf6] text-white'
                                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Secondary Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Kas Usaha vs Pribadi */}
                        <select
                          value={txAccountFilter}
                          onChange={(e) => setTxAccountFilter(e.target.value as typeof txAccountFilter)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-[#8b5cf6] focus:outline-none"
                        >
                          <option value="semua">Semua Kas (Usaha & Pribadi)</option>
                          <option value="usaha">Hanya Kas Usaha</option>
                          <option value="pribadi">Hanya Kas Pribadi</option>
                        </select>

                        {/* Kategori */}
                        <select
                          value={txCategoryFilter}
                          onChange={(e) => setTxCategoryFilter(e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-[#8b5cf6] focus:outline-none"
                        >
                          <option value="semua">Semua Kategori</option>
                          {[...settings.categories_masuk, ...settings.categories_keluar].map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>

                        {/* Urutkan */}
                        <select
                          value={txSortBy}
                          onChange={(e) => setTxSortBy(e.target.value as typeof txSortBy)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-[#8b5cf6] focus:outline-none"
                        >
                          <option value="terbaru">Terbaru</option>
                          <option value="terlama">Terlama</option>
                          <option value="nominal_terbesar">Nominal Terbesar</option>
                          <option value="nominal_terkecil">Nominal Terkecil</option>
                        </select>
                      </div>

                      <span className="text-[11px] font-medium text-slate-400">
                        Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
                      </span>
                    </div>
                  </div>

                  {/* Empty State */}
                  {groupedTransactionsByDate.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-xs">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-[#8b5cf6]">
                        <Wallet className="h-7 w-7" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">Belum Ada Catatan Transaksi</h4>
                      <p className="mt-1 max-w-sm text-xs text-slate-500">
                        Catat uang masuk pertama usahamu agar pembukuan tokomu langsung tertata rapi sejak awal.
                      </p>
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => openAddTxModal('masuk')}
                          className="inline-flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                        >
                          <Plus className="h-4 w-4" />
                          <span>+ Uang Masuk</span>
                        </button>
                        <button
                          onClick={() => openAddTxModal('keluar')}
                          className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
                        >
                          <MinusCircle className="h-4 w-4" />
                          <span>+ Uang Keluar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Grouped Transaction List */
                    <div className="space-y-4">
                      {groupedTransactionsByDate.map((group) => (
                        <div key={group.date} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                          {/* Group Header (Tanggal & Subtotal Harian) */}
                          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-xs">
                            <span className="font-bold text-slate-800">
                              📅 {group.date === '2026-10-26' ? 'Hari Ini (26 Okt 2026)' : group.date}
                            </span>
                            <div className="flex items-center space-x-3 text-[11px] font-semibold">
                              {group.subtotalMasuk > 0 && (
                                <span className="text-emerald-600">
                                  Masuk: +{formatRupiah(group.subtotalMasuk)}
                                </span>
                              )}
                              {group.subtotalKeluar > 0 && (
                                <span className="text-rose-600">
                                  Keluar: -{formatRupiah(group.subtotalKeluar)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Transaction Rows */}
                          <div className="divide-y divide-slate-100">
                            {group.items.map((tx) => (
                              <div
                                key={tx.id}
                                className="group flex flex-col justify-between gap-2.5 p-3.5 transition hover:bg-purple-50/20 sm:flex-row sm:items-center"
                              >
                                {/* Left Info */}
                                <div className="flex items-start space-x-3">
                                  <div
                                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-white ${
                                      tx.type === 'masuk' ? 'bg-emerald-600' : 'bg-rose-600'
                                    }`}
                                  >
                                    {tx.type === 'masuk' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                                  </div>

                                  <div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="font-bold text-slate-800 text-xs sm:text-sm">
                                        {tx.description}
                                      </span>
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                          tx.account === 'usaha'
                                            ? 'bg-purple-100 text-[#8b5cf6]'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        {tx.account === 'usaha' ? 'Kas Usaha' : 'Kas Pribadi'}
                                      </span>
                                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                        {tx.category}
                                      </span>
                                    </div>

                                    {/* Sub detail: Jam, Metode, Produk */}
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                                      <span>⏰ {tx.time} WIB</span>
                                      <span>•</span>
                                      <span>💳 {tx.payment_method}</span>
                                      {tx.product_name && (
                                        <>
                                          <span>•</span>
                                          <span className="font-semibold text-purple-600">
                                            📦 {tx.product_qty}x {tx.product_name}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Nominal & Actions */}
                                <div className="flex shrink-0 items-center justify-between space-x-3 sm:justify-end">
                                  <span
                                    className={`text-sm font-bold sm:text-base ${
                                      tx.type === 'masuk' ? 'text-emerald-600' : 'text-rose-600'
                                    }`}
                                  >
                                    {tx.type === 'masuk' ? '+' : '-'} {formatRupiah(tx.amount)}
                                  </span>

                                  {/* Quick Actions */}
                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={() => openEditTxModal(tx)}
                                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                      title="Edit transaksi"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDuplicateTransaction(tx)}
                                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                      title="Gandakan transaksi"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTransaction(tx.id)}
                                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                      title="Hapus transaksi"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Floating Action Button (FAB) on Mobile */}
                  <div className="fixed bottom-6 right-6 z-40 sm:hidden">
                    <button
                      onClick={() => openAddTxModal('masuk')}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8b5cf6] text-white shadow-xl transition active:scale-95"
                      title="Catat Transaksi"
                    >
                      <Plus className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              )}

              {/* ================= TAB 3: UTANG & PIUTANG ================= */}
              {activeTab === 'utang_piutang' && (
                <div className="space-y-5">
                  {/* Header Sub & Ringkasan Total Belum Lunas */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Ringkasan Piutang */}
                    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-slate-500">Piutang Pelanggan (Uang Saya)</span>
                          <h3 className="mt-1 text-xl font-bold text-emerald-600">
                            {formatRupiah(summary.total_piutang_belum_lunas)}
                          </h3>
                          <p className="text-[11px] text-slate-400">Total yang belum ditagih / dilunasi</p>
                        </div>
                        <button
                          onClick={() => openAddDebtModal('piutang')}
                          className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                        >
                          + Catat Piutang
                        </button>
                      </div>
                    </div>

                    {/* Ringkasan Utang */}
                    <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-slate-500">Utang Saya (Ke Supplier / Pihak Lain)</span>
                          <h3 className="mt-1 text-xl font-bold text-rose-600">
                            {formatRupiah(summary.total_utang_belum_lunas)}
                          </h3>
                          <p className="text-[11px] text-slate-400">Kewajiban yang harus dibayarkan</p>
                        </div>
                        <button
                          onClick={() => openAddDebtModal('utang')}
                          className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                        >
                          + Catat Utang
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Filter Sub-Section */}
                  <div className="flex items-center space-x-2 text-xs font-semibold">
                    {[
                      { id: 'semua', label: 'Semua Catatan' },
                      { id: 'piutang', label: 'Piutang (Uang di Orang)' },
                      { id: 'utang', label: 'Utang (Kewajiban Saya)' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setDebtTypeFilter(btn.id as typeof debtTypeFilter)}
                        className={`rounded-xl px-3.5 py-1.5 transition ${
                          debtTypeFilter === btn.id
                            ? 'bg-[#8b5cf6] text-white shadow-xs'
                            : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Daftar Item Utang / Piutang */}
                  <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                    {debts
                      .filter((d) => debtTypeFilter === 'semua' || d.type === debtTypeFilter)
                      .map((debt) => {
                        const isPiutang = debt.type === 'piutang';
                        const isDueSoon = debt.status !== 'lunas' && new Date(debt.due_date) <= new Date('2026-11-02');
                        const isOverdue = debt.status === 'terlambat';

                        return (
                          <div
                            key={debt.id}
                            className={`flex flex-col justify-between rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
                              isOverdue
                                ? 'border-rose-300 bg-rose-50/10'
                                : isDueSoon
                                ? 'border-amber-300'
                                : 'border-slate-100'
                            }`}
                          >
                            <div>
                              {/* Top Badge & Nama */}
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                        isPiutang ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      {isPiutang ? 'Piutang (Uang Saya)' : 'Utang Saya'}
                                    </span>
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                        debt.status === 'lunas'
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : debt.status === 'terlambat'
                                          ? 'bg-rose-100 text-rose-700 font-bold'
                                          : 'bg-amber-100 text-amber-700'
                                      }`}
                                    >
                                      {debt.status === 'lunas'
                                        ? 'Lunas'
                                        : debt.status === 'terlambat'
                                        ? 'Terlambat Bayar'
                                        : debt.status === 'sebagian'
                                        ? 'Dicicil Sebagian'
                                        : 'Belum Lunas'}
                                    </span>
                                  </div>
                                  <h4 className="mt-1 text-sm font-bold text-slate-800">{debt.person_name}</h4>
                                  {debt.phone && (
                                    <span className="text-[11px] text-slate-500">📞 {debt.phone}</span>
                                  )}
                                </div>

                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400">Sisa Nominal:</span>
                                  <h5
                                    className={`text-base font-bold ${
                                      isPiutang ? 'text-emerald-600' : 'text-rose-600'
                                    }`}
                                  >
                                    {formatRupiah(debt.remaining_amount)}
                                  </h5>
                                  <span className="text-[10px] text-slate-400">
                                    dari total {formatRupiah(debt.total_amount)}
                                  </span>
                                </div>
                              </div>

                              {/* Due Date & Catatan */}
                              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs">
                                <div>
                                  <span className="text-[10px] text-slate-400">Jatuh Tempo:</span>
                                  <p className="font-semibold text-slate-700">
                                    📅 {debt.due_date} {isOverdue && <span className="text-rose-600 font-bold">(Lewat)</span>}
                                  </p>
                                </div>
                                {debt.note && (
                                  <div className="max-w-[200px] text-right truncate text-[11px] text-slate-500">
                                    "{debt.note}"
                                  </div>
                                )}
                              </div>

                              {/* Riwayat Pembayaran Sebelumnya */}
                              {debt.payments.length > 0 && (
                                <div className="mt-2 text-[10px] text-slate-500">
                                  <span className="font-semibold">Riwayat cicilan:</span> {debt.payments.length}x dibayar ({formatRupiah(debt.paid_amount)})
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                              <button
                                onClick={() => handleDeleteDebt(debt.id)}
                                className="text-slate-400 hover:text-rose-600"
                                title="Hapus catatan"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                              <div className="flex items-center space-x-1.5">
                                {debt.status !== 'lunas' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedDebtForPayment(debt);
                                        setPaymentAmountStr(formatRupiah(debt.remaining_amount).replace('Rp ', ''));
                                        setPaymentDate('2026-10-26');
                                      }}
                                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50"
                                    >
                                      Catat Bayar / Cicil
                                    </button>

                                    <button
                                      onClick={() => handleMarkDebtAsPaid(debt)}
                                      className="rounded-xl bg-[#8b5cf6] px-3 py-1.5 font-bold text-white hover:bg-[#7c3aed]"
                                    >
                                      Tandai Lunas
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* ================= TAB 4: LAPORAN SEDERHANA ================= */}
              {activeTab === 'laporan' && (
                <div className="space-y-5">
                  {/* Top Bar Laporan: Filter Periode & Tombol Unduh */}
                  <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center print:hidden">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-500">Pilih Periode Laporan:</span>
                      <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
                        {(['bulan_ini', 'bulan_lalu', 'tiga_bulan'] as const).map((rp) => (
                          <button
                            key={rp}
                            onClick={() => setReportPeriod(rp)}
                            className={`rounded-lg px-3 py-1.5 transition ${
                              reportPeriod === rp ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
                            }`}
                          >
                            {rp === 'bulan_ini' ? 'Bulan Ini' : rp === 'bulan_lalu' ? 'Bulan Lalu' : '3 Bulan Terakhir'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleDownloadCSV}
                        className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                      >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                        <span>Unduh Excel / CSV</span>
                      </button>

                      <button
                        onClick={handlePrintPDF}
                        className="inline-flex items-center space-x-1.5 rounded-xl bg-[#8b5cf6] px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-[#7c3aed]"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Cetak / Unduh PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Switcher Jenis Laporan: Arus Kas vs Laba Rugi */}
                  <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-2xs max-w-xs print:hidden">
                    <button
                      onClick={() => setReportTypeView('arus_kas')}
                      className={`flex-1 rounded-lg py-1.5 text-center transition ${
                        reportTypeView === 'arus_kas' ? 'bg-[#8b5cf6] text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Laporan Arus Kas
                    </button>
                    <button
                      onClick={() => setReportTypeView('laba_rugi')}
                      className={`flex-1 rounded-lg py-1.5 text-center transition ${
                        reportTypeView === 'laba_rugi' ? 'bg-[#8b5cf6] text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Laporan Laba Rugi
                    </button>
                  </div>

                  {/* LAPORAN 1: ARUS KAS USAHA */}
                  {reportTypeView === 'arus_kas' && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm print:border-none print:shadow-none">
                      <div className="border-b border-slate-100 pb-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-slate-800">Laporan Arus Kas Usaha</h3>
                          <span className="rounded bg-purple-50 px-2.5 py-1 text-xs font-bold text-[#8b5cf6]">
                            {cashFlowReport.period_label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Menunjukkan perputaran uang tunai riil yang benar-benar masuk dan keluar dari kantong tokomu.
                        </p>
                      </div>

                      {/* Detail Tabel Arus Kas */}
                      <div className="mt-4 space-y-4 text-xs">
                        {/* 1. Saldo Awal */}
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 font-semibold text-slate-700">
                          <span>1. Saldo Awal Kas Usaha</span>
                          <span className="font-bold text-slate-900">{formatRupiah(cashFlowReport.saldo_awal)}</span>
                        </div>

                        {/* 2. Uang Masuk per Kategori */}
                        <div className="rounded-xl border border-emerald-100 p-3.5">
                          <div className="flex items-center justify-between border-b border-emerald-100 pb-2 font-bold text-emerald-800">
                            <span>2. Total Uang Masuk Usaha (+)</span>
                            <span>+{formatRupiah(cashFlowReport.total_masuk)}</span>
                          </div>
                          <div className="mt-2.5 space-y-2">
                            {cashFlowReport.masuk_by_category.map((m) => (
                              <div key={m.category} className="flex items-center justify-between text-slate-600 pl-2">
                                <span>• {m.category}</span>
                                <span className="font-semibold text-slate-800">
                                  {formatRupiah(m.amount)} ({m.percentage}%)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3. Uang Keluar per Kategori */}
                        <div className="rounded-xl border border-rose-100 p-3.5">
                          <div className="flex items-center justify-between border-b border-rose-100 pb-2 font-bold text-rose-800">
                            <span>3. Total Uang Keluar Usaha (-)</span>
                            <span>-{formatRupiah(cashFlowReport.total_keluar)}</span>
                          </div>
                          <div className="mt-2.5 space-y-2">
                            {cashFlowReport.keluar_by_category.map((k) => (
                              <div key={k.category} className="flex items-center justify-between text-slate-600 pl-2">
                                <span>• {k.category}</span>
                                <span className="font-semibold text-slate-800">
                                  {formatRupiah(k.amount)} ({k.percentage}%)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 4. Saldo Akhir */}
                        <div className="flex items-center justify-between rounded-xl bg-purple-50 p-3.5 text-sm font-bold text-purple-900">
                          <span>4. Saldo Akhir Kas Usaha</span>
                          <span className="text-base text-[#8b5cf6]">{formatRupiah(cashFlowReport.saldo_akhir)}</span>
                        </div>
                      </div>

                      {/* Penjelasan Edukatif Bahasa Manusia */}
                      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-blue-900 leading-relaxed">
                        <div className="flex items-center space-x-1.5 font-bold mb-1">
                          <Info className="h-4 w-4 text-blue-600" />
                          <span>Cara Membaca Arus Kas:</span>
                        </div>
                        <p>
                          Jika <strong>Saldo Akhir</strong> lebih besar daripada <strong>Saldo Awal</strong>, usahamu menghasilkan arus kas positif (sehat). Ini berarti kas toko bertambah dan siap dipakai untuk menyetok bahan atau cadangan darurat.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* LAPORAN 2: LABA RUGI USAHA */}
                  {reportTypeView === 'laba_rugi' && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm print:border-none print:shadow-none">
                      <div className="border-b border-slate-100 pb-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-slate-800">Laporan Laba Rugi Sederhana</h3>
                          <span className="rounded bg-purple-50 px-2.5 py-1 text-xs font-bold text-[#8b5cf6]">
                            {profitLossReport.period_label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Menghitung keuntungan bersih yang didapat dari penjualan setelah dipotong seluruh beban operasional.
                        </p>
                      </div>

                      <div className="mt-4 space-y-4 text-xs">
                        {/* Pendapatan */}
                        <div className="rounded-xl border border-emerald-100 p-3.5">
                          <div className="flex items-center justify-between border-b border-emerald-100 pb-2 font-bold text-emerald-800">
                            <span>A. Total Pendapatan Usaha</span>
                            <span>{formatRupiah(profitLossReport.total_pendapatan)}</span>
                          </div>
                          <div className="mt-2.5 space-y-1.5 pl-2">
                            {profitLossReport.pendapatan_by_category.map((p) => (
                              <div key={p.category} className="flex items-center justify-between text-slate-600">
                                <span>• {p.category}</span>
                                <span className="font-semibold text-slate-800">{formatRupiah(p.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Beban / Pengeluaran */}
                        <div className="rounded-xl border border-rose-100 p-3.5">
                          <div className="flex items-center justify-between border-b border-rose-100 pb-2 font-bold text-rose-800">
                            <span>B. Total Beban Operasional Usaha</span>
                            <span>{formatRupiah(profitLossReport.total_beban)}</span>
                          </div>
                          <div className="mt-2.5 space-y-1.5 pl-2">
                            {profitLossReport.beban_by_category.map((b) => (
                              <div key={b.category} className="flex items-center justify-between text-slate-600">
                                <span>• {b.category}</span>
                                <span className="font-semibold text-slate-800">{formatRupiah(b.amount)} ({b.percentage}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Laba Bersih */}
                        <div className="flex items-center justify-between rounded-xl bg-purple-50 p-4 font-bold text-purple-900">
                          <div>
                            <span className="block text-sm">Laba Bersih Usaha (A - B)</span>
                            <span className="text-[11px] font-normal text-purple-700">Margin Laba: {profitLossReport.margin_persen}%</span>
                          </div>
                          <span className="text-xl text-[#8b5cf6]">{formatRupiah(profitLossReport.laba_bersih)}</span>
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-blue-900 leading-relaxed">
                        <div className="flex items-center space-x-1.5 font-bold mb-1">
                          <Info className="h-4 w-4 text-blue-600" />
                          <span>Cara Membaca Laba Bersih:</span>
                        </div>
                        <p>
                          Laba bersih adalah uang murni hak pemilik usaha setelah semua biaya dibayar. Dengan margin <strong>{profitLossReport.margin_persen}%</strong>, artinya setiap omzet Rp 100.000 menghasilkan laba bersih Rp {(profitLossReport.margin_persen * 1000).toLocaleString('id-ID')}.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Ringkasan Utang Piutang di Laporan */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-800 mb-2">Ringkasan Utang-Piutang Akhir Periode</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="text-slate-500">Total Piutang Belum Tertagih:</span>
                        <p className="mt-1 font-bold text-emerald-600 text-sm">
                          {formatRupiah(summary.total_piutang_belum_lunas)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="text-slate-500">Total Utang Belum Terbayar:</span>
                        <p className="mt-1 font-bold text-rose-600 text-sm">
                          {formatRupiah(summary.total_utang_belum_lunas)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Catatan Privasi & Legal Disclaimer */}
                  <div className="text-center text-[11px] text-slate-400">
                    * Catatan: Laporan ini hanya mencakup transaksi kas Usaha. Transaksi pribadi sengaja dipisahkan agar perhitungan akurat. Laporan ini bersifat sederhana untuk evaluasi internal pemilik UMKM dan bukan dokumen audit atau laporan perpajakan resmi.
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ================= MODAL 1: FORM TAMBAH / EDIT TRANSAKSI ================= */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {editingTx ? 'Ubah Catatan Transaksi' : 'Catat Transaksi Baru'}
              </h3>
              <button
                onClick={() => setIsTxModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveTransaction(false);
              }}
              className="space-y-3.5 text-xs"
            >
              {/* 1. Tombol Besar: Uang Masuk vs Uang Keluar */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormType('masuk');
                    if (formCategory === 'Bahan Baku') setFormCategory('Penjualan');
                  }}
                  className={`flex items-center justify-center space-x-2 rounded-xl py-2.5 font-bold transition ${
                    formType === 'masuk'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Uang Masuk (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormType('keluar');
                    if (formCategory === 'Penjualan') setFormCategory('Bahan Baku');
                  }}
                  className={`flex items-center justify-center space-x-2 rounded-xl py-2.5 font-bold transition ${
                    formType === 'keluar'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownRight className="h-4 w-4" />
                  <span>Uang Keluar (-)</span>
                </button>
              </div>

              {/* 2. Jumlah Nominal (Format Rupiah Otomatis) */}
              <div>
                <label className="mb-1 block font-semibold text-slate-700">Jumlah Uang (Rupiah)*</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formAmountStr}
                    onChange={(e) => {
                      const num = parseRupiahInput(e.target.value);
                      setFormAmountStr(num > 0 ? num.toLocaleString('id-ID') : '');
                    }}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-base font-bold text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* 3. Kas: Usaha vs Pribadi (Pemisahan) */}
              <div>
                <label className="mb-1 block font-semibold text-slate-700">Pilih Rekening / Kas*</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAccount('usaha')}
                    className={`rounded-xl border p-2 text-left transition ${
                      formAccount === 'usaha'
                        ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <span className="block font-bold">🏢 Kas Usaha</span>
                    <span className="text-[10px] text-slate-500">Dihitung ke Laba Toko</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormAccount('pribadi')}
                    className={`rounded-xl border p-2 text-left transition ${
                      formAccount === 'pribadi'
                        ? 'border-slate-700 bg-slate-100 text-slate-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <span className="block font-bold">🏠 Kas Pribadi</span>
                    <span className="text-[10px] text-slate-500">Terpisah dari Toko</span>
                  </button>
                </div>
              </div>

              {/* 4. Kategori & Metode Pembayaran */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                  >
                    {(formType === 'masuk' ? settings.categories_masuk : settings.categories_keluar).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Metode Bayar</label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                  >
                    <option value="Tunai">Tunai</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="QRIS">QRIS</option>
                    <option value="E-wallet">E-wallet (GoPay/OVO/ShopeePay)</option>
                  </select>
                </div>
              </div>

              {/* 5. Produk Terkait (Opsional jika penjualan) */}
              {formType === 'masuk' && formCategory === 'Penjualan' && (
                <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-2.5">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="mb-1 block text-[11px] font-semibold text-purple-900">
                        Produk Terjual (Opsional)
                      </label>
                      <select
                        value={formProductId}
                        onChange={(e) => setFormProductId(e.target.value)}
                        className="w-full rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-xs focus:outline-none"
                      >
                        <option value="">-- Pilih Produk Etalase --</option>
                        {initialProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatRupiah(p.price)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-purple-900">Qty Terjual</label>
                      <input
                        type="number"
                        min="1"
                        value={formProductQty}
                        onChange={(e) => setFormProductQty(parseInt(e.target.value, 10) || 1)}
                        className="w-full rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-xs text-center focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Tanggal & Jam */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Tanggal</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-[#8b5cf6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Jam</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-[#8b5cf6] focus:outline-none"
                  />
                </div>
              </div>

              {/* 7. Keterangan */}
              <div>
                <label className="mb-1 block font-semibold text-slate-700">Keterangan / Catatan</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Contoh: Beli minyak goreng 5 liter di pasar"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                />
              </div>

              {/* Tombol Simpan */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>

                {!editingTx && (
                  <button
                    type="button"
                    onClick={() => handleSaveTransaction(true)}
                    className="rounded-xl border border-[#8b5cf6] bg-purple-50 px-3 py-2 font-bold text-[#8b5cf6] hover:bg-purple-100"
                  >
                    Simpan & Tambah Lagi
                  </button>
                )}

                <button
                  type="submit"
                  className="rounded-xl bg-[#8b5cf6] px-4 py-2 font-bold text-white shadow-xs hover:bg-[#7c3aed]"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CATAT UTANG / PIUTANG BARU ================= */}
      {isDebtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {editingDebt ? 'Edit Catatan' : formDebtType === 'piutang' ? 'Catat Piutang Pelanggan' : 'Catat Utang ke Supplier'}
              </h3>
              <button
                onClick={() => setIsDebtModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDebt} className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-slate-700">Nama Pihak (Pelanggan / Toko)*</label>
                <input
                  type="text"
                  value={formDebtPerson}
                  onChange={(e) => setFormDebtPerson(e.target.value)}
                  placeholder="Contoh: Ibu Ratna (Kantor BPN)"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Nomor Kontak WhatsApp / HP (Opsional)</label>
                <input
                  type="text"
                  value={formDebtPhone}
                  onChange={(e) => setFormDebtPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Total Nominal Uang*</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formDebtAmountStr}
                    onChange={(e) => {
                      const num = parseRupiahInput(e.target.value);
                      setFormDebtAmountStr(num > 0 ? num.toLocaleString('id-ID') : '');
                    }}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 py-1.5 pl-10 pr-3 text-sm font-bold text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Tanggal Jatuh Tempo Pembayaran</label>
                <input
                  type="date"
                  value={formDebtDueDate}
                  onChange={(e) => setFormDebtDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-[#8b5cf6] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Catatan / Rincian Barang</label>
                <input
                  type="text"
                  value={formDebtNote}
                  onChange={(e) => setFormDebtNote(e.target.value)}
                  placeholder="Contoh: Pesanan katering 30 bento belum bayar"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDebtModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#8b5cf6] px-4 py-2 font-bold text-white hover:bg-[#7c3aed]"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: PEMBAYARAN CICILAN / PELUNASAN SINKRON ================= */}
      {selectedDebtForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Catat Pembayaran: {selectedDebtForPayment.person_name}
                </h3>
                <span className="text-[11px] text-slate-500">
                  Sisa yang harus dibayar: <strong>{formatRupiah(selectedDebtForPayment.remaining_amount)}</strong>
                </span>
              </div>
              <button
                onClick={() => setSelectedDebtForPayment(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordDebtPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-slate-700">Nominal yang Dibayarkan Sekarang*</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={paymentAmountStr}
                    onChange={(e) => {
                      const num = parseRupiahInput(e.target.value);
                      setPaymentAmountStr(num > 0 ? num.toLocaleString('id-ID') : '');
                    }}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 py-1.5 pl-10 pr-3 text-base font-bold text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Tanggal Pembayaran</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-[#8b5cf6] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Catatan Bukti Pembayaran (Opsional)</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Contoh: Transfer Mandiri jam 10 pagi"
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-[#8b5cf6] focus:outline-none"
                />
              </div>

              {/* FITUR TOGGLE SINKRONISASI KAS (ATURAN WAJIB) */}
              <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncToCashTransaction}
                    onChange={(e) => setSyncToCashTransaction(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-purple-300 text-[#8b5cf6] focus:ring-[#8b5cf6]"
                  />
                  <div>
                    <span className="font-bold text-slate-800">
                      Otomatis catat ke Transaksi {selectedDebtForPayment.type === 'piutang' ? 'Uang Masuk (+)' : 'Uang Keluar (-)'} Kas Usaha
                    </span>
                    <p className="mt-0.5 text-[10px] text-slate-500 leading-relaxed">
                      Sangat direkomendasikan agar saldo kas usahamu langsung bertambah/berkurang secara akurat tanpa perlu mencatat ulang manual.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDebtForPayment(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#8b5cf6] px-4 py-2 font-bold text-white hover:bg-[#7c3aed]"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: PENGATURAN KEUANGAN ================= */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Pengaturan Keuangan Toko</h3>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              {/* 1. Saldo Awal Kas Usaha */}
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Saldo Awal Modal Kas Usaha (Rupiah)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={settingsInitialCashStr}
                    onChange={(e) => {
                      const num = parseRupiahInput(e.target.value);
                      setSettingsInitialCashStr(num > 0 ? num.toLocaleString('id-ID') : '');
                    }}
                    className="w-full rounded-xl border border-slate-200 py-1.5 pl-10 pr-3 text-sm font-bold text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Uang tunai kas awal yang dimiliki toko saat pertama kali mulai pembukuan.
                </p>
              </div>

              {/* 2. Pengingat Mencatat Jam Berapa */}
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Jam Pengingat Mencatat Harian (WIB)
                </label>
                <input
                  type="time"
                  value={settingsReminderTime}
                  onChange={(e) => setSettingsReminderTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-[#8b5cf6] focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  {/* TODO: Hubungkan ke push notification / Web Push API saat server notification siap */}
                  Aplikasi akan mengingatkan Anda untuk merekap transaksi hari ini sebelum tidur.
                </p>
              </div>

              {/* 3. Kelola Kategori */}
              <div className="border-t border-slate-100 pt-3">
                <label className="mb-2 block font-semibold text-slate-700">Tambah Kategori Baru</label>
                <div className="flex gap-2">
                  <select
                    value={newCatType}
                    onChange={(e) => setNewCatType(e.target.value as 'masuk' | 'keluar')}
                    className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="keluar">Pengeluaran</option>
                    <option value="masuk">Pemasukan</option>
                  </select>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Nama kategori baru..."
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-[#8b5cf6] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="rounded-xl bg-purple-100 px-3 py-1.5 font-bold text-[#8b5cf6] hover:bg-purple-200"
                  >
                    + Tambah
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#8b5cf6] px-4 py-2 font-bold text-white hover:bg-[#7c3aed]"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
