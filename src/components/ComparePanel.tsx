import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { owners } from '@/data/owners';
import SensitivityBadge from '@/components/SensitivityBadge';
import AssetTypeBadge from '@/components/AssetTypeBadge';
import { cn } from '@/lib/utils';
import { X, GitCompare, Trash2, User, Eye, Database, Search, Columns, Diff } from 'lucide-react';
import type { DataAsset, Field, SensitivityLevel } from '@/types';

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

function sensitivityLabel(level: SensitivityLevel): string {
  const map: Record<SensitivityLevel, string> = { high: '高敏感', medium: '中敏感', low: '低敏感', public: '公开' };
  return map[level];
}

function isFieldDifferent(fieldName: string, compareAssets: DataAsset[]): boolean {
  const fields = compareAssets.map((a) => a.fields.find((f) => f.name === fieldName));
  const exists = fields.some((f) => f !== undefined) && fields.some((f) => f === undefined);
  if (exists) return true;
  const sensitivities = fields.filter((f) => f).map((f) => f!.sensitivity);
  if (new Set(sensitivities).size > 1) return true;
  const types = fields.filter((f) => f).map((f) => f!.type);
  if (new Set(types).size > 1) return true;
  return false;
}

export default function ComparePanel() {
  const compareIds = useAppStore((s) => s.compareIds);
  const assets = useAppStore((s) => s.assets);
  const removeFromCompare = useAppStore((s) => s.removeFromCompare);
  const clearCompare = useAppStore((s) => s.clearCompare);
  const showComparePanel = useAppStore((s) => s.showComparePanel);
  const setShowComparePanel = useAppStore((s) => s.setShowComparePanel);
  const addToCompare = useAppStore((s) => s.addToCompare);
  const isInCompare = useAppStore((s) => s.isInCompare);

  const [viewMode, setViewMode] = useState<'all' | 'diff'>('all');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  const compareAssets = compareIds
    .map((id) => assets.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => a !== undefined);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!showComparePanel || compareAssets.length === 0) return null;

  const allFieldNames = getAllFieldNames(compareAssets);
  const displayedFieldNames =
    viewMode === 'diff' ? allFieldNames.filter((name) => isFieldDifferent(name, compareAssets)) : allFieldNames;
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

  const searchResults = searchQuery.trim()
    ? assets.filter((a) => a.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : [];

  const hasSensitivityDiff = new Set(compareAssets.map((a) => a.sensitivity)).size > 1;
  const hasOwnerDiff = new Set(compareAssets.map((a) => a.ownerId)).size > 1;
  const visitCounts = compareAssets.map((a) => a.visitCount);
  const maxVisit = Math.max(...visitCounts);
  const minVisit = Math.min(...visitCounts);
  const hasVisitDiff = maxVisit !== minVisit;
  const maxVisitAsset = compareAssets.find((a) => a.visitCount === maxVisit);
  const minVisitAsset = compareAssets.find((a) => a.visitCount === minVisit);

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
          <div className="flex items-center gap-2">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={cn(
                  'p-2 rounded-lg hover:bg-white/10 transition-colors',
                  showSearch ? 'bg-white/10 text-violet-400' : 'text-slate-400 hover:text-white'
                )}
              >
                <Search className="w-5 h-5" />
              </button>
              {showSearch && (
                <div className="absolute right-0 top-full mt-2 w-72 z-50">
                  <div className="glass-card rounded-xl bg-slate-800/95 border border-white/10 shadow-xl overflow-hidden">
                    <div className="p-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索资产名称..."
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
                        autoFocus
                      />
                    </div>
                    {searchQuery.trim() && (
                      <div className="max-h-60 overflow-auto border-t border-white/5">
                        {searchResults.length === 0 ? (
                          <div className="px-3 py-4 text-xs text-slate-500 text-center">无匹配结果</div>
                        ) : (
                          searchResults.map((asset) => {
                            const alreadyInCompare = isInCompare(asset.id);
                            const isFull = compareIds.length >= 3;
                            const disabled = alreadyInCompare || isFull;
                            return (
                              <button
                                key={asset.id}
                                disabled={disabled}
                                onClick={() => {
                                  if (!disabled) {
                                    addToCompare(asset.id);
                                    setSearchQuery('');
                                    setShowSearch(false);
                                  }
                                }}
                                className={cn(
                                  'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                                  disabled
                                    ? 'opacity-40 cursor-not-allowed'
                                    : 'hover:bg-white/5 cursor-pointer'
                                )}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm text-white truncate">{asset.name}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <AssetTypeBadge type={asset.type} />
                                    <SensitivityBadge level={asset.sensitivity} size="sm" />
                                  </div>
                                </div>
                                {alreadyInCompare && (
                                  <span className="text-[10px] text-slate-500 shrink-0">已添加</span>
                                )}
                                {isFull && !alreadyInCompare && (
                                  <span className="text-[10px] text-rose-400 shrink-0">最多3项</span>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                    {compareIds.length >= 3 && (
                      <div className="px-3 py-2 border-t border-white/5 text-xs text-rose-400/80 text-center">
                        最多对比 3 项
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Close */}
            <button
              onClick={() => setShowComparePanel(false)}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
                className={cn(
                  'space-y-2 rounded-xl p-4 border',
                  hasOwnerDiff && 'border-amber-500/20 bg-amber-500/[0.03]'
                )}
                style={
                  !hasOwnerDiff
                    ? { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' }
                    : undefined
                }
              >
                <div className={cn('flex items-center gap-2 text-xs', hasOwnerDiff ? 'text-amber-300' : 'text-slate-300')}>
                  <User className={cn('w-3.5 h-3.5', hasOwnerDiff ? 'text-amber-400' : 'text-slate-500')} />
                  <span className={hasOwnerDiff ? 'text-amber-500' : 'text-slate-500'}>负责人:</span>
                  <span>{getOwnerName(asset.ownerId)}</span>
                  {hasOwnerDiff && <span className="text-[10px] text-amber-500/70 ml-auto">差异</span>}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500">访问量:</span>
                  <span>{asset.visitCount.toLocaleString()}</span>
                  {hasVisitDiff && asset.visitCount === maxVisit && (
                    <span className="text-[10px] text-emerald-400/80 ml-auto">最高</span>
                  )}
                  {hasVisitDiff && asset.visitCount === minVisit && maxVisit !== minVisit && (
                    <span className="text-[10px] text-slate-500 ml-auto">最低</span>
                  )}
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

          {/* Diff Summary (only in diff mode) */}
          {viewMode === 'diff' && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-violet-300">
                <Diff className="w-4 h-4" />
                差异归纳
              </div>
              <div className="space-y-2">
                {hasSensitivityDiff && (
                  <div className="flex items-start gap-2 text-xs">
                    <Columns className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                    <span className="text-slate-300">
                      敏感等级差异：
                      {compareAssets.map((a) => `${a.name} 为${sensitivityLabel(a.sensitivity)}`).join('，')}
                    </span>
                  </div>
                )}
                {hasVisitDiff && maxVisitAsset && minVisitAsset && (
                  <div className="flex items-start gap-2 text-xs">
                    <Eye className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                    <span className="text-slate-300">
                      访问热度差异：{maxVisitAsset.name} 访问量最高（{maxVisit.toLocaleString()}），{minVisitAsset.name} 最低（{minVisit.toLocaleString()}），差值 {(maxVisit - minVisit).toLocaleString()}
                    </span>
                  </div>
                )}
                {hasOwnerDiff && (
                  <div className="flex items-start gap-2 text-xs">
                    <User className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span className="text-amber-300">
                      负责人差异：{compareAssets.map((a) => `${a.name} → ${getOwnerName(a.ownerId)}`).join('；')}
                    </span>
                  </div>
                )}
                {!hasSensitivityDiff && !hasVisitDiff && !hasOwnerDiff && displayedFieldNames.length === 0 && (
                  <div className="text-xs text-slate-500">元信息无差异</div>
                )}
              </div>
            </div>
          )}

          {/* Field Comparison Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-300">字段对比</h3>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10">
                <button
                  onClick={() => setViewMode('all')}
                  className={cn(
                    'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                    viewMode === 'all'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'text-slate-400 hover:text-slate-300 border border-transparent'
                  )}
                >
                  全部字段
                </button>
                <button
                  onClick={() => setViewMode('diff')}
                  className={cn(
                    'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                    viewMode === 'diff'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'text-slate-400 hover:text-slate-300 border border-transparent'
                  )}
                >
                  仅差异
                </button>
              </div>
            </div>
            {displayedFieldNames.length === 0 ? (
              <div className="rounded-xl border border-white/10 p-6 text-center text-sm text-slate-500">
                无差异字段
              </div>
            ) : (
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
                {displayedFieldNames.map((fieldName) => {
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
            )}
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
