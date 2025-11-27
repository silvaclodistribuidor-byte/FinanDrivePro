
import React, { useState } from 'react';
import { X, Calendar, Wallet } from 'lucide-react';
import { TransactionType, ExpenseCategory } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { type: TransactionType; amount: number; description: string; category?: ExpenseCategory; date: string }) => void;
  onSaveBill: (data: { description: string; amount: number; dueDate: string; isPaid: boolean; category?: ExpenseCategory }) => void;
  categories: string[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, onSaveBill, categories }) => {
  const [mode, setMode] = useState<'expense' | 'bill'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(categories[0] || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    // Parse amount handling comma as decimal separator (common in Brazil)
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (mode === 'expense') {
        onSave({
            type: TransactionType.EXPENSE,
            amount: parsedAmount,
            description,
            category,
            date
        });
    } else {
        onSaveBill({
            description,
            amount: parsedAmount,
            dueDate: date,
            isPaid: false,
            category
        });
    }
    
    // Reset form
    setAmount('');
    setDescription('');
    setMode('expense');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Toggle Header */}
        <div className="grid grid-cols-2 p-1 bg-slate-100">
             <button 
                type="button"
                onClick={() => setMode('expense')}
                className={`py-3 text-sm font-bold rounded-xl transition-all ${mode === 'expense' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Gasto (Histórico)
             </button>
             <button 
                type="button"
                onClick={() => setMode('bill')}
                className={`py-3 text-sm font-bold rounded-xl transition-all ${mode === 'bill' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Conta a Pagar
             </button>
        </div>

        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className={`text-xl font-bold ${mode === 'expense' ? 'text-rose-800' : 'text-indigo-800'}`}>
            {mode === 'expense' ? 'Nova Despesa' : 'Agendar Conta'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              required
              value={amount}
              onChange={(e) => {
                  // Allow numbers and comma/dot
                  const val = e.target.value.replace(/[^0-9,.]/g, '');
                  setAmount(val);
              }}
              className={`w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 outline-none transition-all text-lg ${mode === 'expense' ? 'focus:ring-rose-500 focus:border-rose-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 outline-none ${mode === 'expense' ? 'focus:ring-rose-500' : 'focus:ring-indigo-500'}`}
              placeholder={mode === 'expense' ? "Ex: Combustível, Lanche..." : "Ex: IPVA, Manutenção..."}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
            <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 outline-none bg-white ${mode === 'expense' ? 'focus:ring-rose-500' : 'focus:ring-indigo-500'}`}
            >
            {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
            ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                {mode === 'expense' ? 'Data da Despesa' : 'Data de Vencimento'}
            </label>
            <div className="relative">
                <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 outline-none ${mode === 'expense' ? 'focus:ring-rose-500' : 'focus:ring-indigo-500'}`}
                />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 mt-4 text-white font-medium rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${mode === 'expense' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {mode === 'expense' ? 'Confirmar Gasto' : (
                <>
                 <Calendar size={18} /> Salvar em Contas
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
