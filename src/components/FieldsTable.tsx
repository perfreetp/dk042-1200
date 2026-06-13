import type { Field } from '@/types';
import SensitivityBadge from './SensitivityBadge';
import { Key } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  fields: Field[];
}

export default function FieldsTable({ fields }: Props) {
  return (
    <div className="glass-card overflow-hidden gradient-border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">字段名</th>
              <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">类型</th>
              <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">说明</th>
              <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">敏感等级</th>
              <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">属性</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, idx) => (
              <tr
                key={idx}
                className={cn(
                  'border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]',
                  idx % 2 === 0 ? 'bg-white/[0.01]' : ''
                )}
              >
                <td className="px-5 py-3">
                  <code className="font-mono text-cyan-300 text-xs bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                    {field.name}
                  </code>
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs font-mono text-slate-300 bg-slate-800/50 px-2 py-1 rounded border border-white/[0.05]">
                    {field.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-slate-400 max-w-xs">{field.description}</td>
                <td className="px-5 py-3">
                  <SensitivityBadge level={field.sensitivity} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {field.isPrimary && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium
                                       bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <Key className="w-2.5 h-2.5" />
                        PK
                      </span>
                    )}
                    {field.isNullable && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-500 bg-white/[0.03] border border-white/[0.06]">
                        NULL
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
