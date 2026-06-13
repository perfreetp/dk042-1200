import { X, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: number;
  accent?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
  className?: string;
}

const accentColors = {
  cyan: 'from-cyan-500/20 to-blue-500/10 text-cyan-300 border-cyan-500/20',
  violet: 'from-violet-500/20 to-fuchsia-500/10 text-violet-300 border-violet-500/20',
  emerald: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/20',
  amber: 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/20',
  rose: 'from-rose-500/20 to-pink-500/10 text-rose-300 border-rose-500/20',
};

export default function StatsCard({ title, value, subtitle, icon, trend, accent = 'cyan', className }: Props) {
  return (
    <div className={cn(
      'glass-card p-5 gradient-border',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">{title}</div>
          <div className="mt-2 font-display font-bold text-3xl text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {subtitle && (
            <div className="mt-1 text-xs text-slate-400">{subtitle}</div>
          )}
          {typeof trend === 'number' && (
            <div className={cn(
              'mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg',
              trend >= 0 ? 'text-emerald-300 bg-emerald-500/10' : 'text-rose-300 bg-rose-500/10'
            )}>
              <TrendingUp className={cn('w-3 h-3', trend < 0 && 'rotate-180')} />
              {trend >= 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br border',
            accentColors[accent]
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
