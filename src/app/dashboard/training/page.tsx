'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Dumbbell, Heart, Moon, Droplets, Footprints, CheckCircle2, Plus, Brain } from 'lucide-react';

export default function TrainingPage() {
  const { workouts, healthMetrics, toggleWorkoutComplete, addHealthMetric } = useAppStore();
  const [activeTab, setActiveTab] = useState<'training' | 'health'>('training');
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [newMetric, setNewMetric] = useState({ date: new Date().toISOString().split('T')[0], weight: 0, sleep: 0, water: 0, steps: 0 });

  const handleAddMetric = (e: React.FormEvent) => {
    e.preventDefault();
    addHealthMetric(newMetric);
    setShowHealthForm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Treino & Saúde</h1>
        <p className="text-muted mt-1">Gere os teus planos de treino e acompanha a tua saúde</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('training')} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'training' ? 'bg-primary text-white' : 'bg-card-bg border border-card-border text-muted'}`}>
          <Dumbbell className="w-4 h-4 inline mr-2" />Plano de Treino
        </button>
        <button onClick={() => setActiveTab('health')} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'health' ? 'bg-primary text-white' : 'bg-card-bg border border-card-border text-muted'}`}>
          <Heart className="w-4 h-4 inline mr-2" />Métricas de Saúde
        </button>
      </div>

      {/* AI Training Tip */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-primary">Sugestão AI</h3>
        </div>
        <p className="text-sm">
          {activeTab === 'training'
            ? 'Com base no teu progresso, sugiro aumentar o peso no Bench Press em 2.5kg esta semana. O teu volume de treino está ótimo - mantém a consistência!'
            : 'Os teus dados mostram uma média de 7.5h de sono. Para otimizar a recuperação muscular, tenta aumentar para 8h. A hidratação de ontem estava abaixo do ideal - objetivo: 3L/dia.'
          }
        </p>
      </div>

      {activeTab === 'training' ? (
        /* Training Plan */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.map((workout) => (
            <div key={workout.id} className={`bg-card-bg border border-card-border rounded-2xl p-5 ${workout.completed ? 'border-success/30' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{workout.name}</h3>
                  <p className="text-xs text-muted">{workout.day}</p>
                </div>
                <button
                  onClick={() => toggleWorkoutComplete(workout.id)}
                  className={`p-2 rounded-full transition ${workout.completed ? 'bg-success/20 text-success' : 'bg-card-border/30 text-muted hover:text-foreground'}`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {workout.exercises.map((ex, i) => (
                  <div key={i} className="flex justify-between text-sm py-1.5 border-b border-card-border/50 last:border-0">
                    <span>{ex.name}</span>
                    <span className="text-muted">{ex.sets}×{ex.reps}{ex.weight ? ` ${ex.weight}kg` : ''}</span>
                  </div>
                ))}
              </div>
              {workout.completed && (
                <div className="mt-3 text-xs text-success font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completo
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Health Metrics */
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowHealthForm(!showHealthForm)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition">
              <Plus className="w-4 h-4" /> Registar Dados
            </button>
          </div>

          {showHealthForm && (
            <form onSubmit={handleAddMetric} className="bg-card-bg border border-card-border rounded-2xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <input type="date" value={newMetric.date} onChange={(e) => setNewMetric({ ...newMetric, date: e.target.value })} className="px-3 py-2 bg-background border border-card-border rounded-xl text-sm" />
                <input type="number" step="0.1" placeholder="Peso (kg)" onChange={(e) => setNewMetric({ ...newMetric, weight: Number(e.target.value) })} className="px-3 py-2 bg-background border border-card-border rounded-xl text-sm" />
                <input type="number" step="0.1" placeholder="Sono (h)" onChange={(e) => setNewMetric({ ...newMetric, sleep: Number(e.target.value) })} className="px-3 py-2 bg-background border border-card-border rounded-xl text-sm" />
                <input type="number" step="0.1" placeholder="Água (L)" onChange={(e) => setNewMetric({ ...newMetric, water: Number(e.target.value) })} className="px-3 py-2 bg-background border border-card-border rounded-xl text-sm" />
                <input type="number" placeholder="Passos" onChange={(e) => setNewMetric({ ...newMetric, steps: Number(e.target.value) })} className="px-3 py-2 bg-background border border-card-border rounded-xl text-sm" />
              </div>
              <button type="submit" className="mt-4 px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition">Guardar</button>
            </form>
          )}

          {/* Health Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard icon={<Heart className="w-5 h-5" />} label="Peso" value={`${healthMetrics[0]?.weight || '-'} kg`} color="text-danger" />
            <MetricCard icon={<Moon className="w-5 h-5" />} label="Sono" value={`${healthMetrics[0]?.sleep || '-'} h`} color="text-primary-hover" />
            <MetricCard icon={<Droplets className="w-5 h-5" />} label="Água" value={`${healthMetrics[0]?.water || '-'} L`} color="text-primary" />
            <MetricCard icon={<Footprints className="w-5 h-5" />} label="Passos" value={`${healthMetrics[0]?.steps?.toLocaleString() || '-'}`} color="text-success" />
          </div>

          {/* History Table */}
          <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border text-left text-xs text-muted uppercase">
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Peso</th>
                  <th className="px-6 py-4">Sono</th>
                  <th className="px-6 py-4">Água</th>
                  <th className="px-6 py-4">Passos</th>
                </tr>
              </thead>
              <tbody>
                {healthMetrics.map((m) => (
                  <tr key={m.id} className="border-b border-card-border/50">
                    <td className="px-6 py-3 text-sm">{m.date}</td>
                    <td className="px-6 py-3 text-sm">{m.weight} kg</td>
                    <td className="px-6 py-3 text-sm">{m.sleep} h</td>
                    <td className="px-6 py-3 text-sm">{m.water} L</td>
                    <td className="px-6 py-3 text-sm">{m.steps?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-card-bg border border-card-border rounded-2xl p-4">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
