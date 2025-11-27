
import React, { useState, useEffect, useRef } from 'react';
import { X, Check, DollarSign, Gauge, AlignLeft, Tag } from 'lucide-react';
import { ExpenseCategory } from '../types';

interface ShiftEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'uber' | '99' | 'indrive' | 'private' | 'km' | 'expense' | null;
  onSave: (val: number, description?: string, expenseCategory?: ExpenseCategory) => void;
  categories: string[];
}

export const ShiftEntryModal: React.FC<ShiftEntryModalProps> = ({ isOpen, onClose, category, onSave, categories }) => {
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<string>(categories[0] || '');
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setDescription('');
      setExpenseCategory(categories[0] || '');
      // Focus input after a small delay to ensure modal render
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, categories]);

  if (!isOpen || !category) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Support comma for decimals
    const num = parseFloat(value.replace(',', '.'));
    
    if (!isNaN(num) && num > 0) {
      if (category === 'expense') {
         if (!description) {
            alert('Por favor, insira uma descrição para o gasto.');
            return;
         }
         onSave(num, description, expenseCategory);
      } else {
         onSave(num);
      }
      onClose();
    }
  };

  const getCategoryConfig = () => {
    switch (category) {
      case 'uber': return { title: 'Adicionar Uber', color: 'bg-black', text: 'text-white', icon: <DollarSign /> };
      case '99': return { title: 'Adicionar 99', color: 'bg-yellow-400', text: 'text-black', icon: <DollarSign /> };
      case 'indrive': return { title: 'Adicionar InDrive', color: 'bg-green-600', text: 'text-white', icon: <DollarSign /> };
      case 'private': return { title: 'Adicionar Particular', color: 'bg-slate-600', text: 'text-white', icon: <DollarSign /> };
      case 'km': return { title: 'Lançar KM', color: 'bg-blue-600', text: 'text-white', icon: <Gauge /> };
      case 'expense': return { title: 'Lançar Gasto', color: 'bg-rose-600', text: 'text-white', icon: <DollarSign /> };
      default: return { title: 'Adicionar', color: 'bg-slate-800', text: 'text-white', icon: <DollarSign /> };
    }
  };

  const config = getCategoryConfig();

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-700 animate-in slide-in-from-bottom-10 fade-in duration-200">
        
        <div className={`${config.color} p-4 flex justify-between items-center`}>
          <div className={`flex items-center gap-2 font-bold text-xl ${config.text}`}>
            {config.icon}
            {config.title}
          </div>
          <button onClick={onClose} className={`p-1 rounded-full hover:bg-white/20 ${config.text}`}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-2 font-medium">
              {category === 'km' ? 'Quilometragem percorrida' : 'Valor (R$)'}
            </label>
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/[^0-9,.]/g, ''))}
              placeholder={category === 'km' ? "0,0" : "0,00"}
              className="w-full bg-slate-800 text-white text-4xl font-bold px-4 py-4 rounded-xl border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-center"
            />
          </div>

          {category === 'expense' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
               <div>
                  <label className="block text-slate-400 text-sm mb-2 font-medium flex items-center gap-2">
                     <AlignLeft size={14} /> Descrição
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Almoço, Café, Combustível"
                    className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
               </div>
               
               <div>
                  <label className="block text-slate-400 text-sm mb-2 font-medium flex items-center gap-2">
                     <Tag size={14} /> Categoria
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
               </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
             <button 
              type="button" 
              onClick={onClose}
              className="py-3.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
