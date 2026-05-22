'use client';

import { useAppStore } from '@/store/useAppStore';
import { Target, TrendingUp, Dumbbell, Brain, ArrowUpRight, ArrowDownRight, Flame, Heart, Zap, CheckCircle2 } from 'lucide-react';

// Calculate life score per area (0-100)
function useLifeScores() {
  const { goals, investments, workouts, healthMetrics, dailyHabits } = useAppStore();

  const today = new Date().toISOString().split('T')[0];

  // Daily habits score: % completed today (heavy weight — this is the daily driver)
  const dailyScore = dailyHabits.length > 0
    ? Math.round(
        (dailyHabits.filter(h => h.completedDates.includes(today)).length / dailyHabits.length) * 100
      )
    : 50;

  // Goals score: weighted by progress + completion
  const goalsScore = goals.length > 0
    ? Math.round(
        goals.reduce((acc, g) => acc + (g.completed ? 100 : g.progress), 0) / goals.length
      )
    : 50;

  // Investments score: based on portfolio performance
  const totalInvested = investments.reduce((acc, i) => acc + i.amount, 0);
  const totalCurrent = investments.reduce((acc, i) => acc + i.currentValue, 0);
  const returnPct = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0;
  // -10% or worse = 0, +20% or better = 100
  const investScore = Math.min(100, Math.max(0, Math.round((returnPct + 10) * (100 / 30))));

  // Fitness score: workouts completed this week
  const completedWorkouts = workouts.filter(w => w.completed).length;
  const fitnessScore = workouts.length > 0
    ? Math.round((completedWorkouts / workouts.length) * 100)
    : 50;

  // Health score: based on latest metrics (sleep, steps, water)
  const latest = healthMetrics[0];
  let healthScore = 50;
  if (latest) {
    let points = 0;
    let total = 0;
    if (latest.sleep) { points += Math.min(100, (latest.sleep / 8) * 100); total++; }
    if (latest.steps) { points += Math.min(100, (latest.steps / 10000) * 100); total++; }
    if (latest.water) { points += Math.min(100, (latest.water / 3) * 100); total++; }
    if (total > 0) healthScore = Math.round(points / total);
  }

  // Overall: daily habits count 30%, rest 17.5% each
  const overall = Math.round(
    dailyScore * 0.30 + goalsScore * 0.175 + investScore * 0.175 + fitnessScore * 0.175 + healthScore * 0.175
  );

  return { overall, daily: dailyScore, goals: goalsScore, investments: investScore, fitness: fitnessScore, health: healthScore };
}

function getGlobalStreak(dailyHabits: { completedDates: string[] }[]) {
  if (!dailyHabits.length) return 0;
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const allDone = dailyHabits.every(h => h.completedDates.includes(dateStr));
    if (allDone) {
      streak++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

function getLevel(streak: number) {
  if (streak >= 90) return { name: 'Lenda', emoji: '👑', next: null, color: 'text-yellow-400' };
  if (streak >= 60) return { name: 'Mestre', emoji: '⚡', next: 90, color: 'text-purple-400' };
  if (streak >= 30) return { name: 'Guerreiro', emoji: '🔥', next: 60, color: 'text-orange-400' };
  if (streak >= 14) return { name: 'Focado', emoji: '💪', next: 30, color: 'text-blue-400' };
  if (streak >= 7) return { name: 'Consistente', emoji: '✨', next: 14, color: 'text-emerald-400' };
  if (streak >= 3) return { name: 'A Crescer', emoji: '🌱', next: 7, color: 'text-green-400' };
  return { name: 'Iniciante', emoji: '🎯', next: 3, color: 'text-muted' };
}

function getScoreColor(score: number) {
  if (score >= 70) return { text: 'text-success', bg: 'bg-success', glow: 'shadow-success/30' };
  if (score >= 40) return { text: 'text-warning', bg: 'bg-warning', glow: 'shadow-warning/30' };
  return { text: 'text-danger', bg: 'bg-danger', glow: 'shadow-danger/30' };
}

function getScoreLabel(score: number) {
  if (score >= 90) return 'Excelente';
  if (score >= 70) return 'Muito Bom';
  if (score >= 50) return 'Bom';
  if (score >= 30) return 'Precisa Atenção';
  return 'Crítico';
}

export default function DashboardPage() {
  const { goals, investments, workouts, healthMetrics, news, dailyHabits, toggleDailyHabit } = useAppStore();
  const scores = useLifeScores();
  const today = new Date().toISOString().split('T')[0];
  const streak = getGlobalStreak(dailyHabits);
  const level = getLevel(streak);

  const totalInvested = investments.reduce((acc, i) => acc + i.amount, 0);
  const totalCurrent = investments.reduce((acc, i) => acc + i.currentValue, 0);
  const totalReturn = ((totalCurrent - totalInvested) / totalInvested) * 100;

  const completedGoals = goals.filter(g => g.completed).length;
  const avgProgress = goals.reduce((acc, g) => acc + g.progress, 0) / goals.length;

  const todayWorkout = workouts.find(w => !w.completed);
  const latestHealth = healthMetrics[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted mt-1">Visão geral do teu progresso</p>
      </div>

      {/* Life Thermometer */}
      <div className={`bg-card-bg border rounded-2xl p-6 transition-all duration-500 ${
        scores.overall >= 70 
          ? 'border-success/40 shadow-[0_0_30px_rgba(16,185,129,0.08)]' 
          : scores.overall >= 40 
          ? 'border-warning/30' 
          : 'border-danger/30'
      }`}>
        {/* Header with level + streak */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`text-2xl ${scores.daily === 100 ? 'animate-bounce' : ''}`}>
              {level.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Termómetro da Vida</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${level.color} bg-current/10`}
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  {level.name}
                </span>
              </div>
              {level.next && (
                <p className="text-xs text-muted mt-0.5">
                  Mais {level.next - streak} dia{level.next - streak !== 1 ? 's' : ''} para o próximo nível
                </p>
              )}
            </div>
          </div>
          {/* Streak badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
            streak >= 7 ? 'bg-warning/15 border border-warning/30' : 
            streak >= 3 ? 'bg-success/10 border border-success/20' : 
            'bg-card-border/50 border border-card-border'
          }`}>
            <Flame className={`w-4 h-4 ${streak >= 7 ? 'text-warning' : streak >= 3 ? 'text-success' : 'text-muted'}`} />
            <span className={`text-sm font-black ${streak >= 7 ? 'text-warning' : streak >= 3 ? 'text-success' : 'text-muted'}`}>
              {streak}
            </span>
            <span className="text-xs text-muted">dias</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Main circular score */}
          <div className="relative w-44 h-44 shrink-0">
            <svg className="w-44 h-44 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-card-border" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(scores.overall / 100) * 327} 327`}
                className={`${getScoreColor(scores.overall).text} transition-all duration-1000 ease-out`}
                style={{ filter: `drop-shadow(0 0 8px currentColor)` }}
              />
              {/* Inner ring for daily habits */}
              <circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" strokeWidth="4" className="text-card-border/50" />
              <circle
                cx="60" cy="60" r="42" fill="none"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(scores.daily / 100) * 264} 264`}
                className="text-warning transition-all duration-700 ease-out"
                style={{ filter: `drop-shadow(0 0 4px currentColor)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black tabular-nums ${getScoreColor(scores.overall).text}`}>
                {scores.overall}
              </span>
              <span className="text-[10px] text-muted mt-0.5 uppercase tracking-wider">score</span>
            </div>
          </div>

          {/* Right side: Today's habits quick toggle */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Hoje
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                scores.daily === 100 ? 'bg-success/20 text-success' :
                scores.daily >= 50 ? 'bg-warning/20 text-warning' :
                'bg-danger/20 text-danger'
              }`}>
                {dailyHabits.filter(h => h.completedDates.includes(today)).length}/{dailyHabits.length}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {dailyHabits.map((habit) => {
                const done = habit.completedDates.includes(today);
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleDailyHabit(habit.id, today)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                      done
                        ? 'bg-success/15 border border-success/40 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                        : 'bg-card-border/30 border border-card-border hover:border-primary/40 hover:bg-primary/5'
                    }`}
                  >
                    <span className={`text-base transition-transform duration-200 ${done ? 'scale-110' : 'grayscale opacity-60'}`}>
                      {habit.icon}
                    </span>
                    <span className={`text-xs font-medium truncate ${done ? 'text-success' : 'text-muted'}`}>
                      {habit.title}
                    </span>
                    {done && <CheckCircle2 className="w-3.5 h-3.5 text-success ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Progress bar underneath */}
            <div className="mt-3 h-1.5 bg-card-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  scores.daily === 100 ? 'bg-success' : scores.daily >= 50 ? 'bg-warning' : 'bg-danger'
                }`}
                style={{ width: `${scores.daily}%` }}
              />
            </div>
          </div>
        </div>

        {/* Area breakdown (collapsed) */}
        <div className="mt-6 pt-4 border-t border-card-border/50 grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniScore icon={<Target className="w-3.5 h-3.5" />} label="Objetivos" score={scores.goals} />
          <MiniScore icon={<TrendingUp className="w-3.5 h-3.5" />} label="Investimentos" score={scores.investments} />
          <MiniScore icon={<Dumbbell className="w-3.5 h-3.5" />} label="Fitness" score={scores.fitness} />
          <MiniScore icon={<Heart className="w-3.5 h-3.5" />} label="Saúde" score={scores.health} />
        </div>

        {/* Motivational nudge */}
        {scores.daily === 100 && scores.overall >= 70 && (
          <div className="mt-4 p-3 rounded-xl bg-success/5 border border-success/20 text-center">
            <p className="text-sm text-success font-medium">
              Dia perfeito! 🔥 Streak de {streak} dia{streak !== 1 ? 's' : ''}. Continua imparável!
            </p>
          </div>
        )}
        {scores.daily === 100 && scores.overall < 70 && (
          <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-sm text-primary">
              Hábitos feitos ✓ — agora melhora as outras áreas para chegar ao verde!
            </p>
          </div>
        )}
        {scores.daily < 100 && scores.daily > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-warning/5 border border-warning/20 flex items-center gap-2">
            <Zap className="w-4 h-4 text-warning shrink-0" />
            <p className="text-sm text-warning">
              Faltam {dailyHabits.length - dailyHabits.filter(h => h.completedDates.includes(today)).length} hábito{dailyHabits.length - dailyHabits.filter(h => h.completedDates.includes(today)).length !== 1 ? 's' : ''} para completar o dia!
              {streak > 0 && ` Não percas o streak de ${streak} dias!`}
            </p>
          </div>
        )}
        {scores.daily === 0 && dailyHabits.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-danger/5 border border-danger/20 flex items-center gap-2">
            <Flame className="w-4 h-4 text-danger shrink-0" />
            <p className="text-sm text-danger">
              {streak > 0 
                ? `⚠️ Vais perder o teu streak de ${streak} dias! Completa pelo menos um hábito.`
                : 'Começa o dia! Clica nos hábitos acima para ativar o modo verde.'}
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Objetivos"
          value={`${completedGoals}/${goals.length}`}
          subtitle={`${Math.round(avgProgress)}% progresso médio`}
          color="text-primary"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Portfolio"
          value={`€${totalCurrent.toLocaleString()}`}
          subtitle={
            <span className={totalReturn >= 0 ? 'text-success' : 'text-danger'}>
              {totalReturn >= 0 ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
              {totalReturn.toFixed(1)}%
            </span>
          }
          color="text-success"
        />
        <StatCard
          icon={<Dumbbell className="w-5 h-5" />}
          label="Treinos esta semana"
          value={`${workouts.filter(w => w.completed).length}/${workouts.length}`}
          subtitle={todayWorkout ? `Próximo: ${todayWorkout.name}` : 'Todos completos!'}
          color="text-warning"
        />
        <StatCard
          icon={<Brain className="w-5 h-5" />}
          label="Saúde"
          value={`${latestHealth?.weight || '-'} kg`}
          subtitle={`${latestHealth?.steps?.toLocaleString() || '-'} passos hoje`}
          color="text-primary-hover"
        />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Insights AI</h2>
          </div>
          <div className="space-y-3">
            <InsightCard text="O teu progresso no objetivo 'Poupar €10.000' está excelente! A este ritmo, vais atingir a meta 2 meses antes do prazo." type="success" />
            <InsightCard text="Reparei que dormiste menos de 7h nos últimos 2 dias. Tenta manter as 7-8h para melhor recuperação muscular." type="warning" />
            <InsightCard text="O ETF S&P 500 teve uma performance de +15%. Considera rebalancear o portfolio nos próximos meses." type="info" />
          </div>
        </div>

        {/* Recent News */}
        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Últimas Notícias</h2>
          <div className="space-y-3">
            {news.slice(0, 4).map((article) => (
              <div key={article.id} className="flex gap-3 p-3 rounded-xl hover:bg-card-border/30 transition">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{article.title}</p>
                  <p className="text-xs text-muted mt-1">{article.source} · {article.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Workout */}
        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Treino de Hoje</h2>
          {todayWorkout ? (
            <div className="space-y-2">
              <p className="text-primary font-medium">{todayWorkout.name} - {todayWorkout.day}</p>
              {todayWorkout.exercises.map((ex, i) => (
                <div key={i} className="flex justify-between text-sm py-2 border-b border-card-border/50">
                  <span>{ex.name}</span>
                  <span className="text-muted">{ex.sets}x{ex.reps} {ex.weight ? `@ ${ex.weight}kg` : ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">Nenhum treino pendente para hoje!</p>
          )}
        </div>

        {/* Goals Progress */}
        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Objetivos em Progresso</h2>
          <div className="space-y-4">
            {goals.filter(g => !g.completed).slice(0, 4).map((goal) => (
              <div key={goal.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{goal.title}</span>
                  <span className="text-muted">{goal.progress}%</span>
                </div>
                <div className="h-2 bg-card-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, color }: { 
  icon: React.ReactNode; label: string; value: string; subtitle: React.ReactNode; color: string 
}) {
  return (
    <div className="bg-card-bg border border-card-border rounded-2xl p-5">
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-muted mt-1">{subtitle}</p>
    </div>
  );
}

function InsightCard({ text, type }: { text: string; type: 'success' | 'warning' | 'info' }) {
  const colors = {
    success: 'border-l-success bg-success/5',
    warning: 'border-l-warning bg-warning/5',
    info: 'border-l-primary bg-primary/5',
  };
  return (
    <div className={`border-l-4 ${colors[type]} p-3 rounded-r-xl`}>
      <p className="text-sm">{text}</p>
    </div>
  );
}

function MiniScore({ icon, label, score }: { icon: React.ReactNode; label: string; score: number }) {
  const color = getScoreColor(score);
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card-border/20">
      <div className={`${color.text} shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] text-muted">{label}</span>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex-1 h-1.5 bg-card-border rounded-full overflow-hidden">
            <div
              className={`h-full ${color.bg} rounded-full transition-all duration-700`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className={`text-xs font-bold ${color.text} tabular-nums`}>{score}</span>
        </div>
      </div>
    </div>
  );
}