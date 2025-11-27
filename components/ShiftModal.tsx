
import React, { useState, useEffect } from 'react';
import { X, Car, Clock, DollarSign } from 'lucide-react';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { amount: number; description: string; date: string; mileage: number; durationHours: number }) => void;
  initialData?: {
    amount: number;
    mileage: number;
    durationHours: number;
  } | null;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [amount, setAmount] = useState('');
  const [mileage, setMileage] = useState('');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Load initial data when available (e.g., coming from the live tracker)
  useEffect(() => {
    if (isOpen && initialData) {
      setAmount(initialData.amount.toFixed(2));
      setMileage(initialData.mileage.toFixed(1));
      setHours(initialData.durationHours.toFixed(2));
    } else if (isOpen && !initialData) {
      // Reset if opening manually without data
      setAmount('');
      setMileage('');
      setHours('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !mileage || !hours) return;

    onSave({
      amount: parseFloat(amount),
      description: 'Faturamento do Turno',
      date,
      mileage: parseFloat(mileage),
      durationHours: parseFloat(hours),
    });
    
    setAmount('');
    setMileage('');
    setHours('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 p-6 flex justify-between items-center">
          <div className="text-white">
            <h2 className="text-xl font-bold">Encerrar Turno</h2>
            <p className="text-indigo-200 text-sm">Confirme os dados para salvar</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <DollarSign size={16} className="text-emerald-500" />
              Faturamento Total (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-medium"
              placeholder="0,00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Car size={16} className="text-blue-500" />
                KM Rodados
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ex: 150"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Clock size={16} className="text-orange-500" />
                Horas Trabalhadas
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ex: 8.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Data do Turno</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            Salvar no Financeiro
          </button>
        </form>
      </div>
    </div>
  );
};
