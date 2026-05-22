'use client';

import { useState } from 'react';
import { useAppStore, Goal } from '@/store/useAppStore';
import { Target, Plus, Trash2, CheckCircle2, Flame, X, Pencil, Calendar } from 'lucide-react';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getLast7Days() {
  const days: { date: string; label: string; dayName: string }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split('T')[0],
      label: d.getDate().toString(),
      dayName: d.toLocaleDateString('pt-PT', { weekday: 'short' }).replace('.', ''),
    });
  }
  return days;
}

function getLast30Days() {
  const days: string[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getStreak(completedDates: string[]) {
  if (!completedDates.length) return 0;
  const sorted = [...completedDates].sort().reverse();
  const today = getToday();
  let streak = 0;
  const d = new Date(today);

  while (true) {
    const dateStr = d.toISOString().split('T')[0];
    if (sorted.includes(dateStr)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (streak === 0) {
      d.setDate(d.getDate() - 1);
      const yesterday = d.toISOString().split('T')[0];
      if (sorted.includes(yesterday)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return streak;
}

function getScoreColor(pct: number) {
  if (pct >= 80) return { text: 'text-success', bg: 'bg-success', border: 'border-success' };
  if (pct >= 50) return { text: 'text-warning', bg: 'bg-warning', border: 'border-warning' };
  return { text: 'text-danger', bg: 'bg-danger', border: 'border-danger' };
}

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, dailyHabits, addDailyHabit, editDailyHabit, toggleDailyHabit, deleteDailyHabit } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: '', icon: '' });
  const [filter, setFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [newGoal, setNewGoal] = useState({ title: '', description: '', type: 'short' as Goal['type'], deadline: '', category: '' });
  const [newHabit, setNewHabit] = useState({ title: '', icon: '✅' });

  const filtered = filter === 'all' ? goals : goals.filter(g => g.type === filter);
  const today = getToday();
  const last7Days = getLast7Days();
  const last30Days = getLast30Days();

  // Score calculations
  const todayCompleted = dailyHabits.filter(h => h.completedDates.includes(today)).length;
  const todayTotal = dailyHabits.length;
  const todayPct = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  // Weekly: average of last 7 days
  const weeklyPct = todayTotal > 0 ? Math.round(
    last7Days.reduce((sum, day) => {
      const completed = dailyHabits.filter(h => h.completedDates.includes(day.date)).length;
      return sum + (completed / todayTotal) * 100;
    }, 0) / 7
  ) : 0;

  // Monthly: average of last 30 days
  const monthlyPct = todayTotal > 0 ? Math.round(
    last30Days.reduce((sum, day) => {
      const completed = dailyHabits.filter(h => h.completedDates.includes(day)).length;
      return sum + (completed / todayTotal) * 100;
    }, 0) / 30
  ) : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addGoal({ ...newGoal, progress: 0, completed: false });
    setNewGoal({ title: '', description: '', type: 'short', deadline: '', category: '' });
    setShowForm(false);
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.title.trim()) return;
    addDailyHabit({ title: newHabit.title, icon: newHabit.icon || '✅' });
    setNewHabit({ title: '', icon: '✅' });
    setShowHabitForm(false);
  };

  const handleEditHabit = (id: string) => {
    const habit = dailyHabits.find(h => h.id === id);
    if (!habit) return;
    setEditingHabit(id);
    setEditData({ title: habit.title, icon: habit.icon });
  };

  const handleSaveEdit = () => {
    if (editingHabit && editData.title.trim()) {
      editDailyHabit(editingHabit, { title: editData.title, icon: editData.icon });
      setEditingHabit(null);
    }
  };

  const typeLabels = { short: 'Curto Prazo', medium: 'Médio Prazo', long: 'Longo Prazo' };
  const typeColors = { short: 'bg-success/20 text-success', medium: 'bg-warning/20 text-warning', long: 'bg-primary/20 text-primary' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hábitos & Objetivos</h1>
        <p className="text-muted mt-1">Constrói a tua melhor versão, um dia de cada vez</p>
      </div>

      {/* Thermometers: Daily / Weekly / Monthly */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ThermometerCard label="Hoje" pct={todayPct} detail={`${todayCompleted}/${todayTotal} hábitos`} icon="🎯" />
        <ThermometerCard label="Semana" pct={weeklyPct} detail="Média últimos 7 dias" icon="📅" />
        <ThermometerCard label="Mês" pct={monthlyPct} detail="Média últimos 30 dias" icon="📊" />
      </div>

      {/* Daily Habits Section */}
      <div className="bg-card-bg border border-card-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-semibold">Hábitos Diários</h2>
          </div>
          <button
            onClick={() => setShowHabitForm(!showHabitForm)}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Hábito
          </button>
        </div>

        {/* Add Habit Form */}
        {showHabitForm && (
          <form onSubmit={handleAddHabit} className="flex gap-2 mb-4 p-3 bg-background/50 rounded-xl border border-card-border">
            <select
              value={newHabit.icon}
              onChange={(e) => setNewHabit({ ...newHabit, icon: e.target.value })}
              className="w-16 px-2 py-2 bg-background border border-card-border rounded-lg text-center"
            >
              {['✅', '🧘', '📖', '💧', '😴', '💪', '🏃', '🥗', '📝', '🎯', '💰', '🧠', '📵', '🚶', '🍎', '☀️'].map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Nome do hábito..."
              value={newHabit.title}
              onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
              className="flex-1 px-3 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary"
              required
            />
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition">
              Adicionar
            </button>
            <button type="button" onClick={() => setShowHabitForm(false)} className="px-2 py-2 text-muted hover:text-foreground transition">
              <X className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Habits Grid with 7-day tracker */}
        {dailyHabits.length > 0 ? (
          <div className="space-y-0">
            {/* Day headers */}
            <div className="flex items-center gap-2 mb-2 pl-[200px]">
              {last7Days.map((day) => (
                <div key={day.date} className="w-9 text-center">
                  <span className={`text-[10px] uppercase ${day.date === today ? 'text-primary font-bold' : 'text-muted'}`}>
                    {day.dayName}
                  </span>
                  <p className={`text-xs ${day.date === today ? 'text-primary font-bold' : 'text-muted'}`}>
                    {day.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Habit rows */}
            {dailyHabits.map((habit) => {
              const streak = getStreak(habit.completedDates);
              const isEditing = editingHabit === habit.id;

              return (
                <div key={habit.id} className="flex items-center gap-2 py-2.5 border-t border-card-border/30 group">
                  <div className="w-[200px] flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <select
                          value={editData.icon}
                          onChange={(e) => setEditData({ ...editData, icon: e.target.value })}
                          className="w-10 px-1 py-1 bg-background border border-primary rounded text-center text-sm"
                        >
                          {['✅', '🧘', '📖', '💧', '😴', '💪', '🏃', '🥗', '📝', '🎯', '💰', '🧠', '📵', '🚶', '🍎', '☀️'].map(e => (
                            <option key={e} value={e}>{e}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editData.title}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          className="flex-1 px-2 py-1 bg-background border border-primary rounded text-sm focus:outline-none min-w-0"
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingHabit(null); }}
                          autoFocus
                        />
                        <button onClick={handleSaveEdit} className="text-success hover:text-success/80 transition">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">{habit.icon}</span>
                        <span className="text-sm font-medium truncate">{habit.title}</span>
                        {streak >= 3 && (
                          <span className="text-xs bg-warning/20 text-warning px-1.5 py-0.5 rounded-full shrink-0">
                            🔥{streak}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {last7Days.map((day) => {
                    const done = habit.completedDates.includes(day.date);
                    const isToday = day.date === today;
                    return (
                      <button
                        key={day.date}
                        onClick={() => toggleDailyHabit(habit.id, day.date)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all text-sm shrink-0 ${
                          done
                            ? 'bg-success/20 text-success border border-success/30 shadow-[0_0_6px_rgba(16,185,129,0.15)]'
                            : isToday
                            ? 'bg-card-border/50 border border-card-border hover:border-primary/50 hover:bg-primary/10 text-muted'
                            : 'bg-card-border/20 border border-transparent text-card-border hover:bg-card-border/40'
                        }`}
                      >
                        {done ? '✓' : ''}
                      </button>
                    );
                  })}
                  {/* Action buttons */}
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition ml-1">
                    {!isEditing && (
                      <button
                        onClick={() => handleEditHabit(habit.id)}
                        className="p-1 text-muted hover:text-primary transition"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteDailyHabit(habit.id)}
                      className="p-1 text-muted hover:text-danger transition"
                      title="Eliminar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Today's progress bar */}
            <div className="mt-4 pt-3 border-t border-card-border/30">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted">Progresso de hoje</span>
                <span className={`font-bold ${getScoreColor(todayPct).text}`}>{todayPct}%</span>
              </div>
              <div className="h-2.5 bg-card-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${getScoreColor(todayPct).bg}`}
                  style={{ width: `${todayPct}%` }}
                />
              </div>
              {todayPct === 100 && (
                <p className="text-xs text-success mt-2 font-medium text-center">
                  🏆 Dia perfeito! Todos os hábitos completos!
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted">
            <p className="text-sm">Ainda não tens hábitos diários.</p>
            <p className="text-xs mt-1">Cria o teu primeiro para começar a acompanhar o teu progresso!</p>
          </div>
        )}
      </div>

      {/* Goals Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Objetivos & Metas
        </h2>
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
          <div className="flex gap-2">
            <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition">
              Adicionar Objetivo
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-muted hover:text-foreground transition text-sm">
              Cancelar
            </button>
          </div>
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
              <span className="text-xs text-muted flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {goal.deadline}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={goal.progress}
                onChange={(e) => updateGoal(goal.id, { progress: Number(e.target.value) })}
                className="w-24 h-1 accent-primary"
              />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted">
          <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Nenhum objetivo encontrado.</p>
        </div>
      )}
    </div>
  );
}

function ThermometerCard({ label, pct, detail, icon }: { label: string; pct: number; detail: string; icon: string }) {
  const color = getScoreColor(pct);
  return (
    <div className={`bg-card-bg border rounded-2xl p-5 transition-all ${
      pct >= 80 ? 'border-success/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]' :
      pct >= 50 ? 'border-warning/30' : 'border-card-border'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <span className={`text-2xl font-black tabular-nums ${color.text}`}>{pct}%</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="6" className="text-card-border" />
            <circle
              cx="30" cy="30" r="24" fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 151} 151`}
              className={`${color.text} transition-all duration-1000 ease-out`}
              style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {pct >= 80 ? <span className="text-lg">🟢</span> : pct >= 50 ? <span className="text-lg">🟡</span> : <span className="text-lg">🔴</span>}
          </div>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-card-border rounded-full overflow-hidden">
            <div
              className={`h-full ${color.bg} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-2">{detail}</p>
        </div>
      </div>
    </div>
  );
}
