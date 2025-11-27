
export type ExpenseCategory = string;

export const DEFAULT_CATEGORIES = [
  'Combustível',
  'Manutenção',
  'Alimentação',
  'Seguro/Impostos',
  'Aluguel do Veículo',
  'Outros'
];

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category?: ExpenseCategory;
  date: string;
  // New fields for specific metrics
  mileage?: number; 
  durationHours?: number;
}

export interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  category?: ExpenseCategory;
}

export interface WorkSettings {
  workDays: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
  earningsPerKm: number;
  earningsPerHour: number;
  dailyGoal: number;
}

export interface ShiftExpenseItem {
  amount: number;
  description: string;
  category: ExpenseCategory;
  timestamp: number;
}

export interface ShiftState {
  isActive: boolean;
  isPaused: boolean;
  startTime: number | null;
  elapsedSeconds: number;
  earnings: {
    uber: number;
    n99: number; // 99 is not a valid var name
    indrive: number;
    private: number;
  };
  expenses: number;
  expenseList: ShiftExpenseItem[]; // New field to track individual expenses
  km: number;
}
