import type { AssetType } from '@/types';
import { Database, BarChart3, PlugZap } from 'lucide-react';

export const typeConfig: Record<AssetType, { label: string; icon: typeof Database; className: string; bgClass: string }> = {
  table: {
    label: '数据表',
    icon: Database,
    className: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
    bgClass: 'bg-gradient-to-br from-cyan-400 to-blue-500',
  },
  report: {
    label: '报表',
    icon: BarChart3,
    className: 'text-violet-300 bg-violet-500/10 border-violet-500/30',
    bgClass: 'bg-gradient-to-br from-violet-400 to-fuchsia-500',
  },
  api: {
    label: '接口',
    icon: PlugZap,
    className: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
    bgClass: 'bg-gradient-to-br from-amber-400 to-orange-500',
  },
};

interface Props {
  type: AssetType;
}

export default function AssetTypeBadge({ type }: Props) {
  const cfg = typeConfig[type];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-lg border font-medium ${cfg.className}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}
