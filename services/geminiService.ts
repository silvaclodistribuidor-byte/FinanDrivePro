import { Transaction, TransactionType } from "../types";

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  if (!transactions || transactions.length === 0) {
    return "Adicione algumas transações (ganhos e gastos) para que eu possa analisar seus dados.";
  }

  const income = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expenses;

  const expenseByCategory: Record<string, number> = {};
  transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .forEach(t => {
      const cat = t.category || "Outros";
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + t.amount;
    });

  const topCategories = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  let advice = `# Visão geral das suas finanças\n\n`;
  advice += `- **Ganhos totais:** R$ ${income.toFixed(2)}\n`;
  advice += `- **Gastos totais:** R$ ${expenses.toFixed(2)}\n`;
  advice += `- **Saldo do período:** R$ ${balance.toFixed(2)}\n\n`;

  if (topCategories.length > 0) {
    advice += `## Principais categorias de gastos\n`;
    topCategories.forEach(([cat, value]) => {
      advice += `- **${cat}:** R$ ${value.toFixed(2)}\n`;
    });
    advice += `\n`;
  }

  advice += `## Sugestões práticas\n`;

  if (balance < 0) {
    advice += `- Seu saldo está **negativo** neste período. Tente reduzir gastos nas categorias que mais consomem dinheiro.\n`;
  } else if (balance < income * 0.2) {
    advice += `- Você está com saldo **positivo**, mas poderia guardar uma parte maior. Considere definir uma meta de poupança mensal.\n`;
  } else {
    advice += `- Parabéns! Seu saldo está **bem positivo**. Continue mantendo esse padrão e pense em separar uma parte para reserva de emergência.\n`;
  }

  if (topCategories.length > 0) {
    advice += `- Revise com atenção as 2–3 categorias que mais pesam no seu bolso e veja o que dá para cortar ou otimizar.\n`;
  }

  advice += `\n> Esta análise é gerada automaticamente pelo app, **sem usar inteligência artificial externa**, com base apenas nos seus lançamentos.`;

  return advice;
};
