'use client';

import { useAppStore } from '@/store/useAppStore';
import { Newspaper, Tag, X, Plus, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const allTopics = ['Investimentos', 'Tecnologia', 'Saúde', 'Desenvolvimento Pessoal', 'Fitness', 'Crypto', 'Startups', 'Ciência', 'Nutrição', 'Mindfulness'];

export default function NewsPage() {
  const { news, subscribedTopics, subscribeTopic, unsubscribeTopic } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTopics, setShowTopics] = useState(false);

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(n => n.category === selectedCategory);

  const availableTopics = allTopics.filter(t => !subscribedTopics.includes(t));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notícias</h1>
          <p className="text-muted mt-1">Informação personalizada sobre os teus interesses</p>
        </div>
        <button onClick={() => setShowTopics(!showTopics)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition">
          <Tag className="w-4 h-4" />
          Gerir Temas
        </button>
      </div>

      {/* Subscribed Topics */}
      <div className="flex flex-wrap gap-2">
        {subscribedTopics.map((topic) => (
          <span key={topic} className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-full text-sm">
            {topic}
            <button onClick={() => unsubscribeTopic(topic)} className="hover:text-danger transition">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Add Topics Panel */}
      {showTopics && (
        <div className="bg-card-bg border border-card-border rounded-2xl p-5">
          <h3 className="font-semibold mb-3">Adicionar Temas</h3>
          <div className="flex flex-wrap gap-2">
            {availableTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => subscribeTopic(topic)}
                className="flex items-center gap-1 px-3 py-1.5 bg-card-border/30 hover:bg-primary/20 hover:text-primary rounded-full text-sm transition"
              >
                <Plus className="w-3 h-3" />
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setSelectedCategory('all')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${selectedCategory === 'all' ? 'bg-primary text-white' : 'bg-card-bg border border-card-border text-muted'}`}>
          Todos
        </button>
        {subscribedTopics.map((topic) => (
          <button key={topic} onClick={() => setSelectedCategory(topic)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${selectedCategory === topic ? 'bg-primary text-white' : 'bg-card-bg border border-card-border text-muted'}`}>
            {topic}
          </button>
        ))}
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.map((article) => (
          <article key={article.id} className="bg-card-bg border border-card-border rounded-2xl p-5 hover:border-primary/30 transition">
            <div className="flex items-center gap-2 mb-3">
              <Newspaper className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted">{article.source}</span>
              <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">{article.category}</span>
            </div>
            <h3 className="font-semibold text-lg leading-tight">{article.title}</h3>
            <p className="text-sm text-muted mt-2 line-clamp-2">{article.summary}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted">{article.publishedAt}</span>
              <a href={article.url} className="flex items-center gap-1 text-primary text-sm hover:text-primary-hover transition">
                Ler mais <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </article>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12 text-muted">
          <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma notícia encontrada para esta categoria.</p>
        </div>
      )}
    </div>
  );
}
