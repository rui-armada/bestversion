import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  interests: string[];
  avatar?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'short' | 'medium' | 'long';
  progress: number;
  deadline: string;
  category: string;
  completed: boolean;
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  currentValue: number;
  change: number;
  currency: string;
}

export interface Workout {
  id: string;
  name: string;
  day: string;
  exercises: Exercise[];
  completed: boolean;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

export interface HealthMetric {
  id: string;
  date: string;
  weight?: number;
  sleep?: number;
  water?: number;
  steps?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  url: string;
  publishedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  rating: number;
  description: string;
  coverUrl: string;
  aiReason: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  goals: Goal[];
  investments: Investment[];
  workouts: Workout[];
  healthMetrics: HealthMetric[];
  news: NewsArticle[];
  books: Book[];
  subscribedTopics: string[];
  
  // Auth actions
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  
  // Goals actions
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Investment actions
  addInvestment: (investment: Omit<Investment, 'id'>) => void;
  updateInvestment: (id: string, data: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  
  // Workout actions
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  toggleWorkoutComplete: (id: string) => void;
  
  // Health actions
  addHealthMetric: (metric: Omit<HealthMetric, 'id'>) => void;
  
  // News actions
  subscribeTopic: (topic: string) => void;
  unsubscribeTopic: (topic: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const mockNews: NewsArticle[] = [
  { id: '1', title: 'Mercados europeus em alta após dados positivos', summary: 'Os principais índices europeus registaram ganhos significativos hoje, impulsionados por dados económicos favoráveis.', source: 'Económico', category: 'Investimentos', url: '#', publishedAt: '2026-04-29' },
  { id: '2', title: 'Novo estudo revela benefícios do treino intervalado', summary: 'Investigadores confirmam que HIIT melhora a saúde cardiovascular em apenas 4 semanas.', source: 'Saúde Hoje', category: 'Saúde', url: '#', publishedAt: '2026-04-29' },
  { id: '3', title: 'Inteligência Artificial revoluciona produtividade pessoal', summary: 'Novas ferramentas de IA estão a ajudar milhões de pessoas a gerir melhor o seu tempo e objetivos.', source: 'TechNews', category: 'Tecnologia', url: '#', publishedAt: '2026-04-28' },
  { id: '4', title: 'Bitcoin atinge novo máximo histórico', summary: 'A criptomoeda líder ultrapassou a barreira dos $150,000 pela primeira vez na história.', source: 'CryptoDaily', category: 'Investimentos', url: '#', publishedAt: '2026-04-28' },
  { id: '5', title: '5 hábitos matinais que podem mudar a tua vida', summary: 'Especialistas partilham as rotinas que os mais bem-sucedidos praticam todos os dias.', source: 'MindGrowth', category: 'Desenvolvimento Pessoal', url: '#', publishedAt: '2026-04-27' },
];

const mockBooks: Book[] = [
  { id: '1', title: 'Atomic Habits', author: 'James Clear', category: 'Hábitos', rating: 4.9, description: 'Um guia prático para criar bons hábitos e eliminar os maus.', coverUrl: '', aiReason: 'Baseado no teu interesse em desenvolvimento de hábitos e metas pessoais.' },
  { id: '2', title: 'The Psychology of Money', author: 'Morgan Housel', category: 'Finanças', rating: 4.8, description: 'Lições atemporais sobre riqueza, ganância e felicidade.', coverUrl: '', aiReason: 'Perfeito para complementar a tua gestão de investimentos.' },
  { id: '3', title: 'Can\'t Hurt Me', author: 'David Goggins', category: 'Mindset', rating: 4.7, description: 'A história de superação de um dos homens mais resistentes do mundo.', coverUrl: '', aiReason: 'Alinha-se com o teu foco em treino e superação pessoal.' },
  { id: '4', title: 'Deep Work', author: 'Cal Newport', category: 'Produtividade', rating: 4.6, description: 'Regras para foco e sucesso num mundo distraído.', coverUrl: '', aiReason: 'Vai ajudar-te a alcançar os teus objetivos com mais foco.' },
  { id: '5', title: 'The Intelligent Investor', author: 'Benjamin Graham', category: 'Investimentos', rating: 4.5, description: 'O guia definitivo para investimento em valor.', coverUrl: '', aiReason: 'Recomendado pela IA com base no teu portfolio de investimentos.' },
];

export const useAppStore = create<AppState>()(persist((set) => ({
  user: null,
  isAuthenticated: false,
  goals: [
    { id: '1', title: 'Correr uma maratona', description: 'Completar uma maratona em menos de 4 horas', type: 'long', progress: 35, deadline: '2026-12-31', category: 'Fitness', completed: false },
    { id: '2', title: 'Ler 24 livros este ano', description: 'Ler 2 livros por mês sobre diversos temas', type: 'medium', progress: 60, deadline: '2026-12-31', category: 'Desenvolvimento Pessoal', completed: false },
    { id: '3', title: 'Poupar €10.000', description: 'Poupar para fundo de emergência', type: 'medium', progress: 75, deadline: '2026-09-30', category: 'Finanças', completed: false },
    { id: '4', title: 'Meditar todos os dias', description: '10 minutos de meditação diária', type: 'short', progress: 90, deadline: '2026-05-31', category: 'Saúde Mental', completed: false },
  ],
  investments: [
    { id: '1', name: 'ETF S&P 500', type: 'ETF', amount: 5000, currentValue: 5750, change: 15, currency: '€' },
    { id: '2', name: 'Bitcoin', type: 'Crypto', amount: 2000, currentValue: 3200, change: 60, currency: '€' },
    { id: '3', name: 'Ethereum', type: 'Crypto', amount: 1500, currentValue: 1800, change: 20, currency: '€' },
    { id: '4', name: 'Certificados de Aforro', type: 'Obrigações', amount: 3000, currentValue: 3150, change: 5, currency: '€' },
    { id: '5', name: 'IWDA', type: 'ETF', amount: 4000, currentValue: 4600, change: 15, currency: '€' },
  ],
  workouts: [
    { id: '1', name: 'Push Day', day: 'Segunda', exercises: [{ name: 'Bench Press', sets: 4, reps: 8, weight: 80 }, { name: 'Shoulder Press', sets: 3, reps: 10, weight: 40 }, { name: 'Tricep Dips', sets: 3, reps: 12 }, { name: 'Lateral Raises', sets: 3, reps: 15, weight: 12 }], completed: false },
    { id: '2', name: 'Pull Day', day: 'Terça', exercises: [{ name: 'Deadlift', sets: 4, reps: 6, weight: 120 }, { name: 'Pull-ups', sets: 4, reps: 8 }, { name: 'Barbell Row', sets: 3, reps: 10, weight: 70 }, { name: 'Bicep Curls', sets: 3, reps: 12, weight: 14 }], completed: true },
    { id: '3', name: 'Leg Day', day: 'Quarta', exercises: [{ name: 'Squats', sets: 4, reps: 8, weight: 100 }, { name: 'Leg Press', sets: 3, reps: 12, weight: 180 }, { name: 'Lunges', sets: 3, reps: 10, weight: 20 }, { name: 'Calf Raises', sets: 4, reps: 15, weight: 60 }], completed: false },
    { id: '4', name: 'Cardio + Core', day: 'Quinta', exercises: [{ name: 'Running', sets: 1, reps: 1 }, { name: 'Plank', sets: 3, reps: 60 }, { name: 'Russian Twists', sets: 3, reps: 20 }, { name: 'Mountain Climbers', sets: 3, reps: 30 }], completed: false },
    { id: '5', name: 'Upper Body', day: 'Sexta', exercises: [{ name: 'Incline Bench', sets: 4, reps: 8, weight: 70 }, { name: 'Chin-ups', sets: 3, reps: 8 }, { name: 'Face Pulls', sets: 3, reps: 15, weight: 20 }, { name: 'Hammer Curls', sets: 3, reps: 12, weight: 14 }], completed: false },
  ],
  healthMetrics: [
    { id: '1', date: '2026-04-29', weight: 78, sleep: 7.5, water: 2.5, steps: 8500 },
    { id: '2', date: '2026-04-28', weight: 78.2, sleep: 6.8, water: 2.0, steps: 10200 },
    { id: '3', date: '2026-04-27', weight: 78.5, sleep: 8.0, water: 3.0, steps: 12000 },
    { id: '4', date: '2026-04-26', weight: 78.3, sleep: 7.2, water: 2.2, steps: 6800 },
    { id: '5', date: '2026-04-25', weight: 78.6, sleep: 7.8, water: 2.8, steps: 9400 },
  ],
  news: mockNews,
  books: mockBooks,
  subscribedTopics: ['Investimentos', 'Tecnologia', 'Saúde', 'Desenvolvimento Pessoal'],

  login: (email, _password) => set({
    isAuthenticated: true,
    user: { id: '1', name: 'Utilizador', email, interests: ['Fitness', 'Investimentos', 'Tecnologia'] },
  }),

  register: (name, email, _password) => set({
    isAuthenticated: true,
    user: { id: generateId(), name, email, interests: [] },
  }),

  logout: () => set({ isAuthenticated: false, user: null }),

  updateProfile: (data) => set((state) => ({
    user: state.user ? { ...state.user, ...data } : null,
  })),

  addGoal: (goal) => set((state) => ({
    goals: [...state.goals, { ...goal, id: generateId() }],
  })),

  updateGoal: (id, data) => set((state) => ({
    goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
  })),

  deleteGoal: (id) => set((state) => ({
    goals: state.goals.filter((g) => g.id !== id),
  })),

  addInvestment: (investment) => set((state) => ({
    investments: [...state.investments, { ...investment, id: generateId() }],
  })),

  updateInvestment: (id, data) => set((state) => ({
    investments: state.investments.map((i) => (i.id === id ? { ...i, ...data } : i)),
  })),

  deleteInvestment: (id) => set((state) => ({
    investments: state.investments.filter((i) => i.id !== id),
  })),

  addWorkout: (workout) => set((state) => ({
    workouts: [...state.workouts, { ...workout, id: generateId() }],
  })),

  toggleWorkoutComplete: (id) => set((state) => ({
    workouts: state.workouts.map((w) => (w.id === id ? { ...w, completed: !w.completed } : w)),
  })),

  addHealthMetric: (metric) => set((state) => ({
    healthMetrics: [...state.healthMetrics, { ...metric, id: generateId() }],
  })),

  subscribeTopic: (topic) => set((state) => ({
    subscribedTopics: [...state.subscribedTopics, topic],
  })),

  unsubscribeTopic: (topic) => set((state) => ({
    subscribedTopics: state.subscribedTopics.filter((t) => t !== topic),
  })),
}), { name: 'bestversion-storage' }));
