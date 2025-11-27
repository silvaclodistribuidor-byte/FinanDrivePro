
import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag } from 'lucide-react';
import { Bill, ExpenseCategory } from '../types';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: Omit<Bill, 'id'>) => void;
  initialData?: Bill | null;
  categories: string[];
}

export const BillModal: React.FC<BillModalProps> = ({ isOpen, onClose, onSave, initialData, categories }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState<string>(categories[0] || '');

  useEffect(() => {
    if (isOpen && initialData) {
        setDescription(initialData.description);
        setAmount(initialData.amount.toString().replace('.', ','));
        setDueDate(initialData.dueDate);
        setCategory(initialData.category || categories[0] || '');
    } else if (isOpen) {
        // Reset defaults when opening for new entry
        setDescription('');
        setAmount('');
        setDueDate('');
        setCategory(categories[0] || '');
    }
  }, [isOpen, initialData, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !dueDate) return;

    // Fix: Handle comma as decimal separator
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount)) return;

    onSave({
      description,
      amount: parsedAmount,
      dueDate,
      isPaid: initialData ? initialData.isPaid : false,
      category
    });

    setDescription('');
    setAmount('');
    setDueDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Editar Conta' : 'Adicionar Conta a Pagar'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição da Conta</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 outline-none"
              placeholder="Ex: IPVA, Seguro, Manutenção Agendada..."
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
             <div className="relative">
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 outline-none appearance-none bg-white"
                >
                    {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <Tag size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9,.]/g, ''))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 outline-none"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data de Vencimento</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg shadow-md transition-all active:scale-95"
          >
            {initialData ? 'Atualizar Conta' : 'Agendar Pagamento'}
          </button>
        </form>
      </div>
    </div>
  );
};
