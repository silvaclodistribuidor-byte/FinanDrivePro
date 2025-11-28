import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingDown, 
  Car, 
  History,
  Menu,
  X as CloseIcon,
  Clock,
  Gauge,
  CalendarClock,
  Target,
  Play,
  Pause,
  StopCircle,
  Fuel,
  Plus,
  Trash2,
  Edit2,
  Settings,
  Eye,
  EyeOff,
  PieChart as PieChartIcon,
  Filter,
  CalendarRange,
  ChevronRight,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { StatCard } from './components/StatCard';
import { TransactionModal } from './components/TransactionModal';
import { ShiftModal } from './components/ShiftModal';
import { ShiftEntryModal } from './components/ShiftEntryModal';
import { BillModal } from './components/BillModal';
import { SettingsModal } from './components/SettingsModal';
import { AiAdvisor } from './components/AiAdvisor';
import { ReportsTab } from './components/ReportsTab';
import { Transaction, TransactionType, ExpenseCategory, Bill, ShiftState, DEFAULT_CATEGORIES } from './types';
import { loadAppData, saveAppData } from "./services/firestoreService";

// --- Date Helpers to Fix Timezone Issues ---
const getTodayString = () => {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');
};

const getFutureDateString = (daysToAdd: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
};

const parseDateFromInput = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatDateBr = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = parseDateFromInput(dateStr);
  return date.toLocaleDateString('pt-BR');
};

// --- Chart Helpers ---
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// --- Initial Data (Dynamic based on Today) ---
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', type: TransactionType.INCOME, amount: 250.50, description: 'Turno Manhã (Ontem)', date: getFutureDateString(-1), mileage: 120, durationHours: 5 },
  { id: '2', type: TransactionType.EXPENSE, amount: 150.00, description: 'Tanque Cheio', category: 'Combustível', date: getFutureDateString(-1) },
  { id: '3', type: TransactionType.INCOME, amount: 320.00, description: 'Turno Hoje Cedo', date: getTodayString(), mileage: 180, durationHours: 8 },
];

const INITIAL_BILLS: Bill[] = [
  { id: '101', description: 'Manutenção Preventiva', amount: 850.00, dueDate: getFutureDateString(2), isPaid: false, category: 'Manutenção' },
  { id: '102', description: 'Seguro do Carro', amount: 210.90, dueDate: getFutureDateString(3), isPaid: false, category: 'Seguro/Impostos' },
  { id: '103', description: 'IPVA Parcela', amount: 3558.00, dueDate: getFutureDateString(4), isPaid: false, category: 'Seguro/Impostos' },
];

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Default to Mon-Sat (1-6). Sunday (0) is off by default to match driver scenario.
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5, 6]); 
  const [showValues, setShowValues] = useState(true);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'bills' | 'history' | 'shift' | 'reports'>('dashboard');
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- History Filter State ---
  const [historyRange, setHistoryRange] = useState<'today' | 'week' | 'month' | 'all' | 'custom'>('all');
  const [historyCustomStart, setHistoryCustomStart] = useState('');
  const [historyCustomEnd, setHistoryCustomEnd] = useState('');

  // --- Shift Logic ---
  const [shiftState, setShiftState] = useState<ShiftState>({
    isActive: false,
    isPaused: false,
    startTime: null,
    elapsedSeconds: 0,
    earnings: { uber: 0, n99: 0, indrive: 0, private: 0 },
    expenses: 0,
    expenseList: [],
    km: 0
  });
  
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [entryCategory, setEntryCategory] = useState<'uber' | '99' | 'indrive' | 'private' | 'km' | 'expense' | null>(null);

  const timerRef = useRef<number | null>(null);

  // --- Firestore: carregar dados ao abrir ---
  useEffect(() => {
    (async () => {
      try {
        const data = await loadAppData();
        if (data) {
          if (data.transactions) setTransactions(data.transactions);
          if (data.bills) setBills(data.bills);
          if (data.categories) setCategories(data.categories);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do Firestore:", err);
      } finally {
        setIsLoadingData(false);
      }
    })();
  }, []);

  // --- Firestore: salvar sempre que algo mudar ---
  useEffect(() => {
    if (isLoadingData) return; // evita salvar estado inicial antes de carregar
    const payload = { transactions, bills, categories };
    saveAppData(payload).catch(err => {
      console.error("Erro ao salvar dados no Firestore:", err);
    });
  }, [transactions, bills, categories, isLoadingData]);

  // --- Cronômetro do turno ---
  useEffect(() => {
    if (shiftState.isActive && !shiftState.isPaused) {
      timerRef.current = window.setInterval(() => {
        setShiftState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [shiftState.isActive, shiftState.isPaused]);

  // --- Category Management Handlers ---
  const handleAddCategory = (name: string) => {
    if (name && !categories.includes(name)) {
      setCategories([...categories, name]);
    }
  };

  const handleEditCategory = (oldName: string, newName: string) => {
    if (!newName || categories.includes(newName)) return;
    setCategories(prev => prev.map(c => c === oldName ? newName : c));
    setTransactions(prev => prev.map(t => t.category === oldName ? { ...t, category: newName } : t));
    setBills(prev => prev.map(b => b.category === oldName ? { ...b, category: newName } : b));
  };

  const handleDeleteCategory = (name: string) => {
    setCategories(prev => prev.filter(c => c !== name));
  };

  const handleOpenEntry = (category: 'uber' | '99' | 'indrive' | 'private' | 'km' | 'expense') => {
    if (!shiftState.isActive || shiftState.isPaused) {
      return; 
    }
    setEntryCategory(category);
    setEntryModalOpen(true);
  };

  const handleEntrySave = (value: number, description?: string, expenseCategory?: ExpenseCategory) => {
    if (!entryCategory) return;

    setShiftState(prev => {
      const newState = { ...prev };
      if (entryCategory === 'uber') newState.earnings.uber += value;
      else if (entryCategory === '99') newState.earnings.n99 += value;
      else if (entryCategory === 'indrive') newState.earnings.indrive += value;
      else if (entryCategory === 'private') newState.earnings.private += value;
      else if (entryCategory === 'km') newState.km += value;
      else if (entryCategory === 'expense') {
        newState.expenses += value;
        if (description && expenseCategory) {
          newState.expenseList = [
            ...newState.expenseList, 
            { 
              amount: value, 
              description, 
              category: expenseCategory,
              timestamp: Date.now()
            }
          ];
        }
      }
      return newState;
    });
  };

  const handleStartShift = () => {
    setShiftState(prev => ({ ...prev, isActive: true, isPaused: false, startTime: Date.now() }));
  };

  const handlePauseShift = () => {
    setShiftState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleStopShift = () => {
    setShiftState(prev => ({ ...prev, isPaused: true }));
    setIsShiftModalOpen(true);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  const formatCurrency = (val: number, forceShow = false) => {
    if (!showValues && !forceShow) return 'R$ ****';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // --- Logic & Calculations ---

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const incomeTransactions = transactions.filter(t => t.type === TransactionType.INCOME);
    const totalKm = incomeTransactions.reduce((acc, curr) => acc + (curr.mileage || 0), 0);
    const totalHours = incomeTransactions.reduce((acc, curr) => acc + (curr.durationHours || 0), 0);

    const earningsPerKm = totalKm > 0 ? totalIncome / totalKm : 0;
    const earningsPerHour = totalHours > 0 ? totalIncome / totalHours : 0;

    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    const pendingBillsTotal = bills
      .filter(b => !b.isPaid)
      .reduce((acc, b) => acc + b.amount, 0);

    // --- REVISED DAILY GOAL ALGORITHM ---
    const sortedUnpaidBills = [...bills]
      .filter(b => !b.isPaid)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const todayStr = getTodayString();
    const earningsToday = transactions
      .filter(t => t.type === TransactionType.INCOME && t.date === todayStr)
      .reduce((acc, t) => acc + t.amount, 0);

    let maxRequiredDailyRate = 0;
    let goalExplanation = "";
    let cumulativeBillTotal = 0;
    
    const startingCash = Math.max(0, netProfit); 

    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);

    if (sortedUnpaidBills.length === 0) {
      maxRequiredDailyRate = 0;
      goalExplanation = "Parabéns! Nenhuma conta pendente.";
    } else {
      for (const bill of sortedUnpaidBills) {
        cumulativeBillTotal += bill.amount;
        const totalNeededForThisMilestone = cumulativeBillTotal - startingCash;

        if (totalNeededForThisMilestone <= 0) {
          continue;
        }

        const dueDate = parseDateFromInput(bill.dueDate);
        let workingDays = 0;
        const tempDate = new Date(todayDate);
        
        if (dueDate < todayDate) {
          workingDays = 1; 
        } else {
          const iterDate = new Date(tempDate);
          while (iterDate <= dueDate) {
            if (workDays.includes(iterDate.getDay())) {
              workingDays++;
            }
            iterDate.setDate(iterDate.getDate() + 1);
          }
        }

        if (workingDays === 0) workingDays = 1; 

        const requiredRateForThisBill = totalNeededForThisMilestone / workingDays;

        if (requiredRateForThisBill > maxRequiredDailyRate) {
          maxRequiredDailyRate = requiredRateForThisBill;
          const dayLabel = workingDays === 1 ? 'dia' : 'dias';
          goalExplanation = `Foco: Quitar ${bill.description} em ${workingDays} ${dayLabel}.`;
        }
      }
    }

    if (maxRequiredDailyRate > 0 && !goalExplanation) {
      goalExplanation = "Calculada para garantir o pagamento de todas as contas.";
    }

    const dailyGoal = maxRequiredDailyRate;

    return { 
      totalIncome, 
      totalExpense, 
      netProfit, 
      profitMargin, 
      earningsPerKm, 
      earningsPerHour,
      dailyGoal,
      pendingBillsTotal,
      earningsToday,
      goalExplanation
    };
  }, [transactions, bills, workDays]);

  // --- History Filtering Logic ---
  const filteredHistory = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let start: Date | null = null;
    let end: Date | null = new Date(today);
    end.setHours(23,59,59,999);

    if (historyRange === 'today') {
      start = today;
    } else if (historyRange === 'week') {
      const d = new Date(today);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
      d.setDate(diff);
      start = d;
    } else if (historyRange === 'month') {
      const d = new Date(today);
      d.setDate(1);
      start = d;
    } else if (historyRange === 'custom') {
      if (historyCustomStart && historyCustomEnd) {
        start = parseDateFromInput(historyCustomStart);
        end = parseDateFromInput(historyCustomEnd);
        end.setHours(23,59,59,999);
      } else {
        return transactions;
      }
    } else {
      return transactions;
    }

    return transactions
      .filter(t => {
        const tDate = parseDateFromInput(t.date);
        return start ? (tDate >= start && tDate <= end!) : true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  }, [transactions, historyRange, historyCustomStart, historyCustomEnd]);

  const historySummary = useMemo(() => {
    const income = filteredHistory.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredHistory.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredHistory]);

  // Current Shift Derived Stats
  const currentShiftTotal = shiftState.earnings.uber + shiftState.earnings.n99 + shiftState.earnings.indrive + shiftState.earnings.private;
  const currentShiftLiquid = currentShiftTotal - shiftState.expenses;
  const currentShiftHoursPrecise = shiftState.elapsedSeconds / 3600;
  const currentShiftMinutes = Math.floor(shiftState.elapsedSeconds / 60);
  const currentShiftHoursForRate = currentShiftMinutes > 0 ? currentShiftMinutes / 60 : 0;
  const currentShiftRph = currentShiftHoursForRate > 0 ? currentShiftTotal / currentShiftHoursForRate : 0;
  const currentShiftRpk = shiftState.km > 0 ? currentShiftTotal / shiftState.km : 0;

  // Pie Chart Data
  const pieData = useMemo(() => [
    { name: 'Ganhos', value: stats.totalIncome, color: '#3b82f6' },
    { name: 'Despesas', value: stats.totalExpense, color: '#f43f5e' }
  ], [stats]);

  // --- Handlers ---

  const handleAddTransaction = (data: any) => {
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      ...data
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleSaveShift = (data: { amount: number; description: string; date: string; mileage: number; durationHours: number }) => {
    const incomeTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: TransactionType.INCOME,
      category: undefined,
      ...data
    };

    const expenseTransactions: Transaction[] = shiftState.expenseList.map(exp => ({
      id: Math.random().toString(36).substr(2, 9),
      type: TransactionType.EXPENSE,
      amount: exp.amount,
      description: `${exp.description} (Turno)`,
      category: exp.category,
      date: data.date 
    }));

    setTransactions(prev => [incomeTransaction, ...expenseTransactions, ...prev]);
    
    setShiftState({
      isActive: false,
      isPaused: false,
      startTime: null,
      elapsedSeconds: 0,
      earnings: { uber: 0, n99: 0, indrive: 0, private: 0 },
      expenses: 0,
      expenseList: [],
      km: 0
    });
  };

  const handleSaveBill = (billData: Omit<Bill, 'id'>) => {
    if (editingBill) {
      setBills(prev => prev.map(b => b.id === editingBill.id ? { ...b, ...billData } : b));
      setEditingBill(null);
    } else {
      setBills(prev => [...prev, { ...billData, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setIsBillModalOpen(false);
  };

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setIsBillModalOpen(true);
  };

  const toggleBillPaid = (id: string) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, isPaid: !b.isPaid } : b));
  };

  const handleDeleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // --- RENDER ---

  return (
    <div className="h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-900 overflow-hidden">
      {activeTab !== 'shift' && (
        <div className="md:hidden bg-slate-900 shadow-md p-4 flex justify-between items-center z-30 shrink-0">
          <div className="flex items-center justify-center w-full relative">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="absolute left-0 text-slate-300">
              {mobileMenuOpen ? <CloseIcon /> : <Menu />}
            </button>
            <span className="font-bold text-lg text-white tracking-tight">FinanDrive</span>
            <button onClick={() => setShowValues(!showValues)} className="absolute right-0 text-slate-400">
              {showValues ? <Eye size={22} /> : <EyeOff size={22} />}
            </button>
          </div>
        </div>
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 shrink-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${activeTab === 'shift' ? 'md:w-20 lg:w-64' : ''} 
        `}
      >
        <div className="p-6 hidden md:flex justify-center items-center border-b border-slate-800 h-20">
          <span className={`font-extrabold text-2xl tracking-tight text-white ${activeTab === 'shift' ? 'md:hidden lg:block' : ''}`}>
            FinanDrive
          </span>
          {activeTab === 'shift' && <span className="hidden md:block lg:hidden font-bold text-white text-xl">FD</span>}
        </div>

        <nav className="p-4 space-y-2 mt-4 flex flex-col h-[calc(100%-6rem)]">
          <button 
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className={`${activeTab === 'shift' ? 'md:hidden lg:inline' : ''}`}>Visão Geral</span>
          </button>
          <button 
            onClick={() => { setActiveTab('shift'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'shift' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Play size={20} />
            <span className={`${activeTab === 'shift' ? 'md:hidden lg:inline' : ''}`}>Turno Atual</span>
          </button>
          <button 
            onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <PieChartIcon size={20} />
            <span className={`${activeTab === 'shift' ? 'md:hidden lg:inline' : ''}`}>Relatórios</span>
          </button>
          <button 
            onClick={() => { setActiveTab('bills'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'bills' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <CalendarClock size={20} />
            <span className={`${activeTab === 'shift' ? 'md:hidden lg:inline' : ''}`}>Contas</span>
          </button>
          <button 
            onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <History size={20} />
            <span className={`${activeTab === 'shift' ? 'md:hidden lg:inline' : ''}`}>Histórico</span>
          </button>

          <div className="mt-auto">
            <button 
              onClick={() => { setIsSettingsModalOpen(true); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium hover:bg-slate-800 hover:text-white text-slate-300`}
            >
              <Settings size={20} />
              <span className={`${activeTab === 'shift' ? 'md:hidden lg:inline' : ''}`}>Configurações</span>
            </button>
          </div>
        </nav>
      </aside>

      <main className={`flex-1 overflow-y-auto h-full ${activeTab === 'shift' ? 'bg-slate-950' : 'p-4 md:p-8'}`}>
        {activeTab !== 'shift' && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {activeTab === 'dashboard' ? 'Painel de Controle' : 
                   activeTab === 'reports' ? 'Relatórios de Ganhos' :
                   activeTab === 'bills' ? 'Contas & Planejamento' : 'Histórico Completo'}
                </h1>
                <p className="text-slate-500 text-sm flex items-center gap-1">
                  {activeTab === 'dashboard' && stats.pendingBillsTotal > 0 ? (
                    <span className="text-rose-500 font-medium">Você tem {formatCurrency(stats.pendingBillsTotal)} em contas pendentes.</span>
                  ) : (
                    <span>Gestão profissional para motoristas.</span>
                  )}
                </p>
              </div>
              <button 
                onClick={() => setShowValues(!showValues)}
                className="hidden md:flex p-2 text-slate-400 hover:text-indigo-600 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                title={showValues ? "Ocultar Valores" : "Mostrar Valores"}
              >
                {showValues ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button 
                onClick={() => setIsTransModalOpen(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-medium text-sm"
              >
                <TrendingDown size={16} className="text-rose-500" />
                Novo Lançamento
              </button>
              <button 
                onClick={() => {setActiveTab('shift'); handleStartShift();}}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-300 active:scale-95 font-medium"
              >
                <Play size={18} />
                Iniciar Turno
              </button>
            </div>
          </div>
        )}

        {/* ... resto do JSX (shift, dashboard, reports, bills, history) permanece igual 
             — como ele já está no seu código, omiti aqui para não estourar espaço,
             mas você pode manter exatamente o mesmo JSX que já tem abaixo desta linha. */}
        {/* IMPORTANTE: não mexi na lógica dessas telas, só acrescentei Firestore lá em cima. */}

        {/* === AQUI você cola TODO o restante do seu JSX exatamente como está
              a partir do bloco:
              {activeTab === 'shift' && ( ... ) 
              até o final do componente (antes do "export default App") === */}

        {/* Por limitação de tamanho da mensagem, não consigo repetir TODA essa parte aqui,
            mas nada nela precisa mudar para o Firestore funcionar.
            O essencial foi: imports no topo + useStates + useEffects de Firestore + handlers. */}
      </main>

      {/* Modais */}
      <TransactionModal 
        isOpen={isTransModalOpen} 
        onClose={() => setIsTransModalOpen(false)} 
        onSave={handleAddTransaction}
        onSaveBill={handleSaveBill}
        categories={categories}
      />
      
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        onSave={handleSaveShift}
        initialData={shiftState.isActive || shiftState.isPaused ? {
          amount: currentShiftTotal,
          mileage: shiftState.km,
          durationHours: currentShiftHoursPrecise
        } : null}
      />

      <ShiftEntryModal 
        isOpen={entryModalOpen}
        onClose={() => setEntryModalOpen(false)}
        category={entryCategory}
        onSave={handleEntrySave}
        categories={categories}
      />

      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => { setIsBillModalOpen(false); setEditingBill(null); }}
        onSave={handleSaveBill}
        initialData={editingBill}
        categories={categories}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        workDays={workDays}
        onSaveWorkDays={setWorkDays}
        categories={categories}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}

export default App;
