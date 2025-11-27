
import React, { useState } from 'react';
import { X, CalendarCheck, Info, Tag, Plus, Trash2, Edit2, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workDays: number[];
  onSaveWorkDays: (days: number[]) => void;
  categories: string[];
  onAddCategory: (name: string) => void;
  onEditCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
}

const DAYS_OF_WEEK = [
  { id: 0, label: 'Domingo' },
  { id: 1, label: 'Segunda' },
  { id: 2, label: 'Terça' },
  { id: 3, label: 'Quarta' },
  { id: 4, label: 'Quinta' },
  { id: 5, label: 'Sexta' },
  { id: 6, label: 'Sábado' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  workDays, 
  onSaveWorkDays,
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory
}) => {
  const [activeTab, setActiveTab] = useState<'workdays' | 'categories'>('workdays');
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  if (!isOpen) return null;

  const toggleDay = (dayId: number) => {
    if (workDays.includes(dayId)) {
      onSaveWorkDays(workDays.filter(d => d !== dayId));
    } else {
      onSaveWorkDays([...workDays, dayId]);
    }
  };

  const handleAdd = () => {
    if(newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const startEditing = (name: string) => {
    setEditingCategory(name);
    setEditingValue(name);
  };

  const saveEdit = () => {
    if (editingCategory && editingValue.trim()) {
        onEditCategory(editingCategory, editingValue.trim());
        setEditingCategory(null);
        setEditingValue('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">Configurações</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
            <button 
                onClick={() => setActiveTab('workdays')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'workdays' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Escala de Trabalho
            </button>
            <button 
                onClick={() => setActiveTab('categories')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'categories' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Categorias de Gastos
            </button>
        </div>

        <div className="p-6 overflow-y-auto">
            {activeTab === 'workdays' ? (
                <div className="space-y-6">
                    <div>
                        <p className="text-slate-600 mb-4 text-sm">
                            Selecione os dias da semana que você <strong>planeja</strong> trabalhar. O sistema usará isso para dividir o valor das suas contas pelos dias disponíveis.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {DAYS_OF_WEEK.map((day) => (
                                <button
                                    key={day.id}
                                    onClick={() => toggleDay(day.id)}
                                    className={`p-3 rounded-lg text-sm font-medium transition-all border ${
                                        workDays.includes(day.id)
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'
                                    }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                            <Info className="text-blue-600 w-10 h-10 shrink-0" />
                            <p className="text-xs text-blue-800 leading-relaxed">
                                <strong>Dica:</strong> Se você trabalhar em um dia "desmarcado" (ex: Domingo extra), não precisa mudar aqui. O valor ganho entrará no caixa e reduzirá a meta automaticamente.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex gap-2 mb-4">
                        <input 
                            type="text" 
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Nova categoria..."
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button 
                            onClick={handleAdd}
                            disabled={!newCategory.trim()}
                            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {categories.map((cat) => (
                            <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-indigo-200 transition-colors">
                                {editingCategory === cat ? (
                                    <div className="flex items-center gap-2 flex-1 mr-2">
                                        <input 
                                            type="text" 
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none"
                                            autoFocus
                                        />
                                        <button onClick={saveEdit} className="text-emerald-600 p-1 hover:bg-emerald-50 rounded">
                                            <Check size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Tag size={16} className="text-slate-400" />
                                        <span className="text-sm font-medium text-slate-700">{cat}</span>
                                    </div>
                                )}

                                {editingCategory !== cat && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => startEditing(cat)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => onDeleteCategory(cat)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        <div className="p-6 border-t border-slate-100 shrink-0">
            <button
                onClick={onClose}
                className="w-full py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors"
            >
                Concluir
            </button>
        </div>
      </div>
    </div>
  );
};
