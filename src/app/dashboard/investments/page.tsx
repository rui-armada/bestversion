'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { TrendingUp, Plus, Trash2, ArrowUpRight, ArrowDownRight, PieChart } from 'lucide-react';

export default function InvestmentsPage() {
  const { investments, addInvestment, deleteInvestment } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [newInv, setNewInv] = useState({ name: '', type: '', amount: 0, currentValue: 0, change: 0, currency: '€' });

  const totalInvested = investments.reduce((acc, i) => acc + i.amount, 0);
  const totalCurrent = investments.reduce((acc, i) => acc + i.currentValue, 0);
  const totalProfit = totalCurrent - totalInvested;
  const totalReturn = (totalProfit / totalInvested) * 100;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addInvestment(newInv);
    setNewInv({ name: '', type: '', amount: 0, currentValue: 0, change: 0, currency: '€' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Investimentos</h1>
          <p className="text-muted mt-1">Acompanha e gere o teu portfolio</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition">
          <Plus className="w-4 h-4" />
          Novo Investimento
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card-bg border border-card-border rounded-2xl p-5">
          <p className="text-xs text-muted uppercase tracking-wide">Total Investido</p>
          <p className="text-2xl font-bold mt-1">€{totalInvested.toLocaleString()}</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-5">
          <p className="text-xs text-muted uppercase tracking-wide">Valor Atual</p>
          <p className="text-2xl font-bold mt-1">€{totalCurrent.toLocaleString()}</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-5">
          <p className="text-xs text-muted uppercase tracking-wide">Retorno Total</p>
          <p className={`text-2xl font-bold mt-1 ${totalReturn >= 0 ? 'text-success' : 'text-danger'}`}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
          </p>
          <p className={`text-sm ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
            {totalProfit >= 0 ? '+' : ''}€{totalProfit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <PieChart className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-primary">Recomendação AI</h3>
        </div>
        <p className="text-sm">
          O teu portfolio está concentrado em ativos de risco (60% crypto + ETFs). Considera diversificar com mais 10-15% em obrigações ou fundos de rendimento fixo para reduzir a volatilidade. O teu perfil sugere que uma alocação 70/30 (crescimento/defensivo) seria mais adequada para os teus objetivos de médio prazo.
        </p>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Nome do ativo" value={newInv.name} onChange={(e) => setNewInv({ ...newInv, name: e.target.value })} className="px-4 py-3 bg-background border border-card-border rounded-xl focus:outline-none focus:border-primary" required />
            <input type="text" placeholder="Tipo (ETF, Crypto, Ações)" value={newInv.type} onChange={(e) => setNewInv({ ...newInv, type: e.target.value })} className="px-4 py-3 bg-background border border-card-border rounded-xl focus:outline-none focus:border-primary" required />
            <input type="number" placeholder="Valor investido (€)" value={newInv.amount || ''} onChange={(e) => setNewInv({ ...newInv, amount: Number(e.target.value), currentValue: Number(e.target.value) })} className="px-4 py-3 bg-background border border-card-border rounded-xl focus:outline-none focus:border-primary" required />
          </div>
          <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition">
            Adicionar
          </button>
        </form>
      )}

      {/* Investments Table */}
      <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-card-border text-left text-xs text-muted uppercase">
              <th className="px-6 py-4">Ativo</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Investido</th>
              <th className="px-6 py-4">Valor Atual</th>
              <th className="px-6 py-4">Retorno</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {investments.map((inv) => (
              <tr key={inv.id} className="border-b border-card-border/50 hover:bg-card-border/20 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{inv.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted">{inv.type}</td>
                <td className="px-6 py-4 text-sm">€{inv.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-medium">€{inv.currentValue.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1 text-sm ${inv.change >= 0 ? 'text-success' : 'text-danger'}`}>
                    {inv.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {inv.change >= 0 ? '+' : ''}{inv.change}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => deleteInvestment(inv.id)} className="p-1 text-muted hover:text-danger transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
