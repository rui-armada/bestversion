'use client';

import { useState } from 'react';
import { useAppStore, Goal } from '@/store/useAppStore';
import { Target, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [newGoal, setNewGoal] = useState({ title: '', description: '', type: 'short' as Goal['type'], deadline: '', category: '' });

  const filtered = filter === 'all' ? goals : goals.filter(g => g.type === filter);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addGoal({ ...newGoal, progress: 0, completed: false });
    setNewGoal({ title: '', description: '', type: 'short', deadline: '', category: '' });
    setShowForm(false);
  };

  const typeLabels = { short: 'Curto Prazo', medium: 'Médio Prazo', long: 'Longo Prazo' };
  const typeColors = { short: 'bg-success/20 text-success', medium: 'bg-warning/20 text-warning', long: 'bg-primary/20 text-primary' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Objetivos & Metas</h1>
          <p className="text-muted mt-1">Gere os teus objetivos de curto, médio e longo prazo</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition">
          <Plus className="w-4 h-4" />
          Novo Objetivo
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'short', 'medium', 'long'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === f ? 'bg-primary text-white' : 'bg-card-bg border border-card-border text-muted hover:text-foreground'}`}
          >
            {f === 'all' ? 'Todos' : typeLabels[f]}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Título do objetivo"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              className="px-4 py-3 bg-background border border-card-border rounded-xl focus:outline-none focus:border-primary"
              required
            />
            <input
              type="text"
              placeholder="Categoria (ex: Fitness, Finanças)"
              value={newGoal.category}
              onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
              className="px-4 py-3 bg-background border border-card-border rounded-xl focus:outline-none focus:border-primary"
              required
            />
            <textarea
              placeholder="Descrição"
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              className="px-4 py-3 bg-background border border-card-border rounded-xl focus:outline-none focus:border-primary"
            />
            <div className="space-y-4">
              <select
                value={newGoal.type}
                onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as Goal['type'] })}
                className="w-full px-4 py-3 bg-background border border-card-border rounded-xl focus:outline-none focus:border-primary"
              >
                <option value="short">Curto Prazo</option>
                <option value="medium">Médio Prazo</option>
                <option value="long">Longo Prazo</option>
              </select>
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-card-border rounded-xl focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>
          <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition">
            Adicionar Objetivo
          </button>
        </form>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((goal) => (
          <div key={goal.id} className={`bg-card-bg border border-card-border rounded-2xl p-5 ${goal.completed ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <span className={`text-xs px-2 py-1 rounded-full ${typeColors[goal.type]}`}>
                  {typeLabels[goal.type]}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => updateGoal(goal.id, { completed: !goal.completed })} className="p-1 hover:text-success transition">
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteGoal(goal.id)} className="p-1 hover:text-danger transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold mt-3">{goal.title}</h3>
            <p className="text-sm text-muted mt-1">{goal.description}</p>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">{goal.category}</span>
                <span className="font-medium">{goal.progress}%</span>
              </div>
              <div className="h-2 bg-card-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs text-muted">Prazo: {goal.deadline}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={goal.progress}
                onChange={(e) => updateGoal(goal.id, { progress: Number(e.target.value) })}
                className="w-20 h-1 accent-primary"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
