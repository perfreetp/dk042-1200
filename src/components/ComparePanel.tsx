import { useAppStore } from '@/store/useAppStore';
import { owners } from '@/data/owners';
import SensitivityBadge from '@/components/SensitivityBadge';
import AssetTypeBadge from '@/components/AssetTypeBadge';
import { cn } from '@/lib/utils';
import { X, GitCompare, Trash2, User, Eye, Database } from 'lucide-react';
import type { Field, SensitivityLevel } from '@/types';

function getOwnerName(ownerId: string) {
  return owners.find((o) => o.id === ownerId)?.name ?? '未知';
}

function getAllFieldNames(compareAssets: { fields: Field[] }[]) {
  const nameSet = new Set<string>();
  compareAssets.forEach((a) => a.fields.forEach((f) => nameSet.add(f.name)));
  return Array.from(nameSet);
}

function sensitivityRank(level: SensitivityLevel): number {
  const map: Record<SensitivityLevel, number> = { high: 3, medium: 2, low: 1, public: 0 };
  return map[level];
}

export default function ComparePanel() {
  const compareIds = useAppStore((s) => s.compareIds);
  const assets = useAppStore((s) => s.assets);
  const removeFromCompare = useAppStore((s) => s.removeFromCompare);
  const clearCompare = useAppStore((s) => s.clearCompare);
  const showComparePanel = useAppStore((s) => s.showComparePanel);
  const setShowComparePanel = useAppStore((s) => s.setShowComparePanel);

  const compareAssets = compareIds
    .map((id) => assets.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => a !== undefined);

  if (!showComparePanel || compareAssets.length === 0) return null;

  const allFieldNames = getAllFieldNames(compareAssets);
  const colCount = compareAssets.length;

  const sensitivityDiffBg = (fieldName: string) => {
    const levels = compareAssets.map((a) => {
      const f = a.fields.find((f) => f.name === fieldName);
      return f ? f.sensitivity : null;
    });
    const unique = new Set(levels.filter((l): l is SensitivityLevel => l !== null));
    if (unique.size <= 1) return '';
    const maxRank = Math.max(...[...unique].map(sensitivityRank));
    if (maxRank === 3) return 'bg-rose-500/10';
    if (maxRank === 2) return 'bg-violet-500/10';
    return 'bg-sky-500/10';
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowComparePanel(false)}
      />
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full glass-card',
          'bg-slate-900/95 border-l border-white/10',
          'shadow-2xl shadow-black/40',
          'flex flex-col',
          'w-[900px] max-w-[calc(100vw-48px)]',
          'animate-in slide-in-from-right duration-300'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <GitCompare className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">资产对比</h2>
            <span className="text-xs text-slate-400">{compareAssets.length} 项</span>
          </div>
          <button
            onClick={() => setShowComparePanel(false)}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-4 space-y-6">
          {/* Asset Headers */}
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
          >
            {compareAssets.map((asset) => (
              <div
                key={asset.id}
                className="glass-card p-4 rounded-xl bg-white/5 border border-white/10 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-white truncate pr-2">
                    {asset.name}
                  </h3>
                  <button
                    onClick={() => removeFromCompare(asset.id)}
                    className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <AssetTypeBadge type={asset.type} />
                  <SensitivityBadge level={asset.sensitivity} size="sm" />
                </div>
              </div>
            ))}
          </div>

          {/* Owner / Visit / Row Info */}
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
          >
            {compareAssets.map((asset) => (
              <div
                key={asset.id}
                className="space-y-2 rounded-xl p-4 bg-white/[0.03] border border-white/5"
              >
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500">负责人:</span>
                  <span>{getOwnerName(asset.ownerId)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500">访问量:</span>
                  <span>{asset.visitCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500">最近访问:</span>
                  <span>{asset.lastVisitTime}</span>
                </div>
                {asset.rowCount !== undefined && (
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Database className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-500">数据行数:</span>
                    <span>{asset.rowCount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Field Comparison Table */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">字段对比</h3>
            <div className="rounded-xl border border-white/10 overflow-hidden">
              {/* Table Header */}
              <div
                className="grid bg-white/5 border-b border-white/10"
                style={{ gridTemplateColumns: `160px repeat(${colCount}, 1fr)` }}
              >
                <div className="px-3 py-2 text-xs font-medium text-slate-400 border-r border-white/5">
                  字段名称
                </div>
                {compareAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="px-3 py-2 text-xs font-medium text-slate-300 border-r border-white/5 last:border-r-0 truncate"
                  >
                    {asset.name}
                  </div>
                ))}
              </div>

              {/* Table Rows */}
              {allFieldNames.map((fieldName) => {
                const diffBg = sensitivityDiffBg(fieldName);
                return (
                  <div
                    key={fieldName}
                    className={cn(
                      'grid border-b border-white/5 last:border-b-0',
                      diffBg
                    )}
                    style={{ gridTemplateColumns: `160px repeat(${colCount}, 1fr)` }}
                  >
                    <div className="px-3 py-2 text-xs text-slate-300 border-r border-white/5 font-mono">
                      {fieldName}
                    </div>
                    {compareAssets.map((asset) => {
                      const field = asset.fields.find((f) => f.name === fieldName);
                      if (!field) {
                        return (
                          <div
                            key={`${asset.id}-${fieldName}`}
                            className="px-3 py-2 text-xs text-slate-600 border-r border-white/5 last:border-r-0"
                          >
                            —
                          </div>
                        );
                      }
                      return (
                        <div
                          key={`${asset.id}-${fieldName}`}
                          className="px-3 py-2 border-r border-white/5 last:border-r-0 space-y-1"
                        >
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500">类型:</span>
                            <span className="text-slate-300 font-mono">{field.type}</span>
                          </div>
                          <SensitivityBadge level={field.sensitivity} size="sm" />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <button
            onClick={clearCompare}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            清空对比
          </button>
        </div>
      </div>
    </>
  );
}
