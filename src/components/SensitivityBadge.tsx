import { cn } from '@/lib/utils';
import type { SensitivityLevel } from '@/types';
import { Lock, Shield, Unlock, Globe } from 'lucide-react';

const config: Record<SensitivityLevel, { label: string; className: string; glowClass: string; icon: typeof Lock }> = {
  high: {
    label: '高敏感',
    className: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
    glowClass: 'glow-red',
    icon: Lock,
  },
  medium: {
    label: '中敏感',
    className: 'bg-violet-500/10 text-violet-300 border border-violet-500/30',
    glowClass: 'glow-violet',
    icon: Shield,
  },
  low: {
    label: '低敏感',
    className: 'bg-sky-500/10 text-sky-300 border border-sky-500/30',
    glowClass: 'glow-sky',
    icon: Unlock,
  },
  public: {
    label: '公开',
    className: 'bg-slate-500/10 text-slate-300 border border-slate-500/30',
    glowClass: '',
    icon: Globe,
  },
};

interface Props {
  level: SensitivityLevel;
  withGlow?: boolean;
  size?: 'sm' | 'md';
}

export default function SensitivityBadge({ level, withGlow = false, size = 'sm' }: Props) {
  const cfg = config[level];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border font-medium transition-all',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        cfg.className,
        withGlow && cfg.glowClass
      )}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {cfg.label}
    </span>
  );
}
