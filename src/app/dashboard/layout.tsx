'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, Target, TrendingUp, Dumbbell, 
  Newspaper, BookOpen, Brain, User, LogOut, Sparkles 
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/goals', label: 'Objetivos', icon: Target },
  { href: '/dashboard/investments', label: 'Investimentos', icon: TrendingUp },
  { href: '/dashboard/training', label: 'Treino & Saúde', icon: Dumbbell },
  { href: '/dashboard/news', label: 'Notícias', icon: Newspaper },
  { href: '/dashboard/books', label: 'Livros', icon: BookOpen },
  { href: '/dashboard/ai', label: 'AI Assistant', icon: Brain },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAppStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card-bg border-r border-card-border flex flex-col fixed h-full">
        <div className="p-6 border-b border-card-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold">BestVersion</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted hover:text-foreground hover:bg-card-border/30'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-card-border">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Utilizador'}</p>
              <p className="text-xs text-muted truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="flex items-center gap-3 px-4 py-2 mt-2 w-full text-sm text-muted hover:text-danger rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
