import { cn } from '@/lib/utils';
import type { ApplicationStatus } from '@/types';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const config: Record<ApplicationStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: {
    label: '待审批',
    className: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    icon: Clock,
  },
  approved: {
    label: '已通过',
    className: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    icon: CheckCircle,
  },
  rejected: {
    label: '已驳回',
    className: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
    icon: XCircle,
  },
};

interface Props {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const cfg = config[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        cfg.className
      )}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {cfg.label}
    </span>
  );
}
