import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  Gauge, 
  DollarSign, 
  Filter,
  CalendarRange,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Transaction, TransactionType } from '../types';

interface ReportsTabProps {
  transactions: Transaction[];
  showValues: boolean;
}

type TimeRange = 'today' | 'week' | 'month' | 'custom';

export const ReportsTab: React.FC<ReportsTabProps> = ({ transactions, showValues }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Helpers de Data
  const getToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const parseDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const getStartOfWeek = () => {
    const d = getToday();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    d.setDate(diff);
    return d;
  };

  const getStartOfMonth = () => {
    const d = getToday();
    d.setDate(1);
    return d;
  };

  // Filtragem
  const filteredData = useMemo(() => {
    const today = getToday();
    let start: Date;
    let end: Date = new Date(today);
    end.setHours(23, 59, 59, 999);

    switch (timeRange) {
      case 'today':
        start = today;
        break;
      case 'week':
        start = getStartOfWeek();
        break;
      case 'month':
        start = getStartOfMonth();
        break;
      case 'custom':
        if (!customStart || !customEnd) return [];
        start = parseDate(customStart);
        end = parseDate(customEnd);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = getStartOfWeek();
    }

    return transactions.filter(t => {
      const tDate = parseDate(t.date);
      return tDate >= start && tDate <= end;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, timeRange, customStart, customEnd]);

  // Cálculos
  const stats = useMemo(() => {
    const incomeTrans = filteredData.filter(t => t.type === TransactionType.INCOME);
    const expenseTrans = filteredData.filter(t => t.type === TransactionType.EXPENSE);

    const totalIncome = incomeTrans.reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = expenseTrans.reduce((acc, t) => acc + t.amount, 0);
    const totalKm = incomeTrans.reduce((acc, t) => acc + (t.mileage || 0), 0);
    const totalHours = incomeTrans.reduce((acc, t) => acc + (t.durationHours || 0), 0);

    const rPerKm = totalKm > 0 ? totalIncome / totalKm : 0;
    const rPerHour = totalHours > 0 ? totalIncome / totalHours : 0;
    const netProfit = totalIncome - totalExpense;

    return { totalIncome, totalExpense, totalKm, totalHours, rPerKm, rPerHour, netProfit };
  }, [filteredData]);

  // Dados para o Gráfico
  const chartData = useMemo(() => {
    const grouped = filteredData.reduce((acc, t) => {
        const date = t.date;
        if (!acc[date]) {
            acc[date] = { 
                date, 
                displayDate: new Date(parseDate(date)).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                income: 0, 
                expense: 0 
            };
        }
        if (t.type === TransactionType.INCOME) acc[date].income += t.amount;
        else acc[date].expense += t.amount;
        return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredData]);

  const formatCurrency = (val: number) => {
    if (!showValues) return 'R$ ****';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" /> Relatórios de Desempenho
            </h2>
            <p className="text-slate-500 text-sm">Analise sua eficiência em diferentes períodos.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['today', 'week', 'month', 'custom'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  timeRange === range 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {range === 'today' && 'Hoje'}
                {range === 'week' && 'Semana'}
                {range === 'month' && 'Mês'}
                {range === 'custom' && 'Outro'}
              </button>
            ))}
          </div>
        </div>

        {timeRange === 'custom' && (
          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 justify-center animate-in fade-in slide-in-from-top-2">
            <input 
              type="date" 
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-slate-400"><ChevronRight size={16} /></span>
            <input 
              type="date" 
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Faturamento */}
        <div className="col-span-2 bg-indigo-600 text-white p-5 rounded-xl shadow-lg shadow-indigo-200">
           <div className="flex items-center gap-2 mb-2 opacity-90">
              <DollarSign size={18} />
              <span className="text-sm font-medium">Faturamento</span>
           </div>
           <div className="text-3xl font-bold">{formatCurrency(stats.totalIncome)}</div>
           <div className="mt-2 text-indigo-200 text-xs">
              Lucro Líquido: {formatCurrency(stats.netProfit)}
           </div>
        </div>

        {/* Eficiência R$/KM */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-emerald-200 transition-colors">
            <div className="flex justify-between items-start">
                <span className="text-slate-500 text-xs font-bold uppercase">R$ / KM</span>
                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Gauge size={16} />
                </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-2">
                {showValues ? `R$ ${stats.rPerKm.toFixed(2)}` : '****'}
            </div>
        </div>

        {/* Eficiência R$/Hora */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-blue-200 transition-colors">
            <div className="flex justify-between items-start">
                <span className="text-slate-500 text-xs font-bold uppercase">R$ / Hora</span>
                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Clock size={16} />
                </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-2">
                 {showValues ? `R$ ${stats.rPerHour.toFixed(2)}` : '****'}
            </div>
        </div>

        {/* Total KM */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase">KM Total</span>
            <div className="text-2xl font-bold text-slate-800 mt-2">
                {stats.totalKm.toFixed(1)} <span className="text-sm font-normal text-slate-400">km</span>
            </div>
        </div>

        {/* Total Horas */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase">Horas Totais</span>
            <div className="text-2xl font-bold text-slate-800 mt-2">
                {stats.totalHours.toFixed(1)} <span className="text-sm font-normal text-slate-400">h</span>
            </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6">Evolução do Faturamento no Período</h3>
            <div className="h-80 w-full">
               {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="displayDate" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#64748b', fontSize: 12}} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#64748b', fontSize: 12}} 
                            tickFormatter={(val) => `R$${val}`}
                        />
                        <Tooltip 
                            cursor={{fill: '#f1f5f9'}}
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                            formatter={(value: number) => [showValues ? `R$ ${value.toFixed(2)}` : 'R$ ****', '']}
                        />
                        <Bar dataKey="income" name="Faturamento" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="#4f46e5" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
               ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400">
                       <Filter size={48} className="mb-2 opacity-20" />
                       <p>Sem dados para o período selecionado.</p>
                   </div>
               )}
            </div>
         </div>
      </div>

    </div>
  );
};
