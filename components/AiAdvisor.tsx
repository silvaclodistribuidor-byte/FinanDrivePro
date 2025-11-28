import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Transaction } from "../types";
import { getFinancialAdvice } from "../services/geminiService";

export interface AiAdvisorProps {
  transactions: Transaction[];
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({ transactions }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getFinancialAdvice(transactions);
      setAdvice(result);
    } catch (err) {
      console.error(err);
      setError(
        "Não foi possível gerar a análise neste momento. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Consultor financeiro
          </h2>
          <p className="text-xs text-slate-400">
            Gera uma análise automática com base nos seus lançamentos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || transactions.length === 0}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 transition-colors"
        >
          {loading ? "Analisando..." : "Gerar análise"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-lg p-2">
          {error}
        </p>
      )}

      {advice && (
        <div className="max-h-64 overflow-auto rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-xs prose prose-invert prose-sm">
          <ReactMarkdown>{advice}</ReactMarkdown>
        </div>
      )}

      {!advice && !error && (
        <p className="text-xs text-slate-500">
          Toque em <span className="font-semibold">“Gerar análise”</span> para
          ver sugestões baseadas nos seus ganhos e gastos.
        </p>
      )}
    </div>
  );
};

export default AiAdvisor;
