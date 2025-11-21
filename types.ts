
export type Platform = 'uber' | 'n99' | 'indrive' | 'particular';

export interface Break {
  startISO: string;
  endISO?: string;
}

export interface Cost {
  description: string;
  value: number;
}

export interface Shift {
  startISO: string;
  endISO?: string;
  breaks: Break[];
  costs: Cost[];
  platforms: Record<Platform, number>;
  paused: boolean;
  odoStart?: number;
  odoEnd?: number;
  kmManual?: number;
  kmSet?: number;
  gross: number;
  driverId: string | null;
}

export interface AppState {
  currentShift: Shift | null;
  history: Shift[];
}

export interface Metrics {
  hours: number;
  km: number;
  gross: number;
  cost: number;
  net: number;
  rph: number | null;
  rpkm: number | null;
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  html?: boolean;
}

export type GeminiCommand = 
  | { command: 'START_SHIFT'; payload: { time: string | null }; }
  | { command: 'END_SHIFT'; payload: { time: string | null }; }
  | { command: 'PAUSE_SHIFT'; payload: { time: string | null }; }
  | { command: 'RESUME_SHIFT'; payload: { time: string | null }; }
  | { command: 'LOG_EARNINGS'; payload: { platform: Platform; value: number }; }
  | { command: 'LOG_KM'; payload: { value: number }; }
  | { command: 'GET_STATUS'; payload: {}; }
  | { command: 'EXPORT'; payload: {}; }
  | { command: 'UNKNOWN'; payload: {}; };