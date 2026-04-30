'use client';

import { useAppStore } from '@/store/useAppStore';
import { BookOpen, Star, Brain, Sparkles } from 'lucide-react';
import { useState } from 'react';

const categories = ['Todos', 'Hábitos', 'Finanças', 'Mindset', 'Produtividade', 'Investimentos'];

export default function BooksPage() {
  const { books } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filtered = selectedCategory === 'Todos' 
    ? books 
    : books.filter(b => b.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sugestões de Livros</h1>
        <p className="text-muted mt-1">Recomendações personalizadas pela AI com base nos teus interesses</p>
      </div>

      {/* AI Note */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-primary">Curado pela AI</h3>
        </div>
        <p className="text-sm">
          Estas recomendações foram selecionadas com base nos teus objetivos, interesses e atividade na app. 
          A AI analisa os teus planos de treino, investimentos e metas para sugerir leituras que te ajudam a crescer.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              selectedCategory === cat ? 'bg-primary text-white' : 'bg-card-bg border border-card-border text-muted'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((book) => (
          <div key={book.id} className="bg-card-bg border border-card-border rounded-2xl p-5 hover:border-primary/30 transition group">
            {/* Book Cover Placeholder */}
            <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-12 h-12 text-primary/40 group-hover:text-primary/60 transition" />
            </div>

            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">{book.category}</span>
            <h3 className="font-semibold text-lg mt-2">{book.title}</h3>
            <p className="text-sm text-muted">{book.author}</p>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(book.rating) ? 'text-warning fill-warning' : 'text-card-border'}`} />
              ))}
              <span className="text-xs text-muted ml-1">{book.rating}</span>
            </div>

            <p className="text-sm text-muted mt-3 line-clamp-2">{book.description}</p>

            {/* AI Reason */}
            <div className="mt-4 p-3 bg-primary/5 rounded-xl">
              <div className="flex items-center gap-1 mb-1">
                <Brain className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-primary">Porquê esta sugestão</span>
              </div>
              <p className="text-xs text-muted">{book.aiReason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
