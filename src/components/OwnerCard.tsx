import { Mail, Phone, Building } from 'lucide-react';
import type { Owner } from '@/types';

interface Props {
  owner: Owner;
  compact?: boolean;
}

export default function OwnerCard({ owner, compact = false }: Props) {
  return (
    <div className="glass-card p-4 gradient-border">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 glow-cyan">
          {owner.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-slate-100">{owner.name}</div>
          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <Building className="w-3 h-3" />
            {owner.department}
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate">{owner.email}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            <span>{owner.phone}</span>
          </div>
        </div>
      )}
    </div>
  );
}
