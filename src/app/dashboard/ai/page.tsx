'use client';

import { useState, useRef, useEffect } from 'react';
import { Brain, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

const WELCOME_MESSAGE = 'Olá! 👋 Sou o teu BestVersion AI, powered by Gemini. Posso analisar os teus dados reais de treino, investimentos, objetivos e saúde para te dar conselhos personalizados.\n\nO que gostarias de saber?';

export default function AIPage() {
  const { goals, investments, workouts, healthMetrics, user } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', content: WELCOME_MESSAGE }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getUserContext = () => ({
    user: { name: user?.name, interests: user?.interests },
    goals: goals.map(g => ({ title: g.title, type: g.type, progress: g.progress, deadline: g.deadline, category: g.category, completed: g.completed })),
    investments: investments.map(i => ({ name: i.name, type: i.type, amount: i.amount, currentValue: i.currentValue, change: i.change })),
    workouts: workouts.map(w => ({ name: w.name, day: w.day, completed: w.completed, exercises: w.exercises })),
    healthMetrics: healthMetrics.slice(0, 7),
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = newMessages
        .filter(m => m.id !== '1')
        .map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, userContext: getUserContext() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro na API');
      }

      setMessages([...newMessages, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.message,
      }]);
    } catch (error) {
      setMessages([...newMessages, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `⚠️ ${error instanceof Error ? error.message : 'Erro ao comunicar com a AI. Verifica a API key.'}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    'Como está o meu treino?',
    'Analisa os meus investimentos',
    'Como vão os meus objetivos?',
    'Sugere-me hábitos para melhorar',
    'Como está a minha saúde?',
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold">AI Assistant</h1>
        <p className="text-muted mt-1">O teu coach pessoal inteligente</p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-card-bg border border-card-border rounded-2xl flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[70%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-card-border/30'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card-border/30 rounded-2xl p-4">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="px-3 py-1.5 bg-card-border/30 hover:bg-primary/20 hover:text-primary text-sm rounded-full transition"
                >
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-card-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? 'A pensar...' : 'Pergunta algo ao teu AI coach...'}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-background border border-card-border rounded-xl focus:outline-none focus:border-primary transition disabled:opacity-50"
            />
            <button type="submit" disabled={isLoading} className="px-4 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl transition disabled:opacity-50">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
