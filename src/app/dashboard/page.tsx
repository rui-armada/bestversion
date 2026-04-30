'use client';

import { useAppStore } from '@/store/useAppStore';
import { Target, TrendingUp, Dumbbell, Brain, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardPage() {
  const { goals, investments, workouts, healthMetrics, news } = useAppStore();

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
