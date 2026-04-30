'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register } = useAppStore();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      login(email, password);
    } else {
      register(name, email, password);
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">BestVersion</h1>
          <p className="text-muted mt-2">Sê a tua melhor versão, todos os dias.</p>
        </div>

        {/* Form Card */}
        <div className="bg-card-bg border border-card-border rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">
            {isLogin ? 'Entrar na conta' : 'Criar conta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-background border border-card-border rounded-xl focus:outline-none focus:border-primary transition"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-background border border-card-border rounded-xl focus:outline-none focus:border-primary transition"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-background border border-card-border rounded-xl focus:outline-none focus:border-primary transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            >
              {isLogin ? 'Entrar' : 'Criar conta'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary-hover text-sm transition"
            >
              {isLogin ? 'Não tens conta? Criar agora' : 'Já tens conta? Entrar'}
            </button>
          </div>
        </div>

        {/* Features preview */}
        <div className="mt-8 grid grid-cols-2 gap-3 text-center text-xs text-muted">
          <div className="bg-card-bg/50 border border-card-border/50 rounded-xl p-3">
            🎯 Objetivos & Metas
          </div>
          <div className="bg-card-bg/50 border border-card-border/50 rounded-xl p-3">
            📈 Investimentos
          </div>
          <div className="bg-card-bg/50 border border-card-border/50 rounded-xl p-3">
            💪 Treino & Saúde
          </div>
          <div className="bg-card-bg/50 border border-card-border/50 rounded-xl p-3">
            🤖 AI Personalizada
          </div>
        </div>
      </div>
    </div>
  );
}
