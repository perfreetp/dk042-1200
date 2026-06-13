import { useState, useRef, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { owners } from '@/data/owners';
import SensitivityBadge from '@/components/SensitivityBadge';
import AssetTypeBadge from '@/components/AssetTypeBadge';
import { cn } from '@/lib/utils';
import { X, GitCompare, Trash2, User, Eye, Database, Search, Columns, Diff, Target, CheckCircle2, AlertTriangle, FileCheck, Copy } from 'lucide-react';
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

  const baselineInitId = compareIds.find((id) => assets.some((a) => a.id === id)) || null;
  const [baseline, setBaseline] = useState<string | null>(baselineInitId);
  useEffect(() => {
    if (baseline && !compareIds.includes(baseline)) {
      setBaseline(compareIds[0] ?? null);
    } else if (!baseline && compareIds[0]) {
      setBaseline(compareIds[0]);
    }
  }, [compareIds, baseline]);
  const baselineAsset = useMemo(() => compareAssets.find((a) => a.id === baseline), [compareAssets, baseline]);

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

  interface AddedMissingFieldItem {
    fieldName: string;
    hasAssets: string[];
    missingAssets: string[];
  }
  interface TypeChangedFieldItem {
    fieldName: string;
    baselineType: string;
    comparisons: { assetName: string; type: string }[];
  }
  interface SensitivityElevatedFieldItem {
    fieldName: string;
    baselineSensitivity: SensitivityLevel;
    comparisons: { assetName: string; sensitivity: SensitivityLevel }[];
  }

  const { addedMissingFields, typeChangedFields, sensitivityElevatedFields } = useMemo(() => {
    const addedMissing: AddedMissingFieldItem[] = [];
    const typeChanged: TypeChangedFieldItem[] = [];
    const sensitivityElevated: SensitivityElevatedFieldItem[] = [];

    if (!baselineAsset) {
      return { addedMissingFields: addedMissing, typeChangedFields: typeChanged, sensitivityElevatedFields: sensitivityElevated };
    }

    for (const fieldName of displayedFieldNames) {
      const baselineField = baselineAsset.fields.find((f) => f.name === fieldName);
      const hasAssets: string[] = [];
      const missingAssets: string[] = [];

      for (const asset of compareAssets) {
        const f = asset.fields.find((f) => f.name === fieldName);
        if (f) {
          hasAssets.push(asset.name);
        } else {
          missingAssets.push(asset.name);
        }
      }

      if (hasAssets.length > 0 && missingAssets.length > 0) {
        addedMissing.push({ fieldName, hasAssets, missingAssets });
      }

      if (baselineField) {
        const typeComparisons: { assetName: string; type: string }[] = [];
        for (const asset of compareAssets) {
          if (asset.id === baselineAsset.id) continue;
          const f = asset.fields.find((f) => f.name === fieldName);
          if (f && f.type !== baselineField.type) {
            typeComparisons.push({ assetName: asset.name, type: f.type });
          }
        }
        if (typeComparisons.length > 0) {
          typeChanged.push({ fieldName, baselineType: baselineField.type, comparisons: typeComparisons });
        }

        const sensComparisons: { assetName: string; sensitivity: SensitivityLevel }[] = [];
        const baselineRank = sensitivityRank(baselineField.sensitivity);
        for (const asset of compareAssets) {
          if (asset.id === baselineAsset.id) continue;
          const f = asset.fields.find((f) => f.name === fieldName);
          if (f && sensitivityRank(f.sensitivity) > baselineRank) {
            sensComparisons.push({ assetName: asset.name, sensitivity: f.sensitivity });
          }
        }
        if (sensComparisons.length > 0) {
          sensitivityElevated.push({
            fieldName,
            baselineSensitivity: baselineField.sensitivity,
            comparisons: sensComparisons,
          });
        }
      }
    }

    return { addedMissingFields: addedMissing, typeChangedFields: typeChanged, sensitivityElevatedFields: sensitivityElevated };
  }, [displayedFieldNames, compareAssets, baselineAsset]);

  const diffCount = displayedFieldNames.length;
  const totalFields = allFieldNames.length;
  const diffRatio = totalFields > 0 ? diffCount / totalFields : 0;
  const overallAssessment = diffRatio <= 0.2 ? '高度一致' : diffRatio <= 0.6 ? '部分重叠' : '差异显著';
  const assessmentIcon = overallAssessment === '高度一致' ? CheckCircle2 : overallAssessment === '部分重叠' ? FileCheck : AlertTriangle;
  const assessmentColor = overallAssessment === '高度一致' ? 'emerald' : overallAssessment === '部分重叠' ? 'sky' : 'amber';

  const hasSensitivityElevation = useMemo(() => {
    if (!baselineAsset) return false;
    return compareAssets.some((a) => {
      if (a.id === baselineAsset.id) return false;
      return sensitivityRank(a.sensitivity) > sensitivityRank(baselineAsset.sensitivity);
    });
  }, [compareAssets, baselineAsset]);

  const reuseSuggestion = useMemo(() => {
    const scored = compareAssets.map((asset) => ({
      asset,
      visitScore: asset.visitCount,
      fieldScore: asset.fields.length,
      combined: asset.visitCount * 0.5 + asset.fields.length * 1000,
    }));
    scored.sort((a, b) => b.combined - a.combined);
    const best = scored[0];
    if (!best) return null;
    const reason = best.asset.fields.length >= Math.max(...compareAssets.map((a) => a.fields.length))
      ? '字段完整且访问稳定'
      : '访问热度高';
    return { asset: best.asset, reason };
  }, [compareAssets]);

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
            {compareAssets.map((asset) => {
              const isBaseline = asset.id === baseline;
              return (
                <div
                  key={asset.id}
                  className={cn(
                    'glass-card p-4 rounded-xl bg-white/5 space-y-2 transition-all relative',
                    isBaseline
                      ? 'border-2 border-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                      : 'border border-white/10'
                  )}
                >
                  {isBaseline && (
                    <div className="absolute -top-2 left-3 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-medium text-cyan-300 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      基准资产
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-sm font-semibold text-white truncate pr-2 flex-1">
                      {asset.name}
                    </h3>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {!isBaseline && (
                        <button
                          onClick={() => setBaseline(asset.id)}
                          title="设为基准"
                          className="p-1 rounded hover:bg-cyan-500/20 text-slate-500 hover:text-cyan-400 transition-colors"
                        >
                          <Target className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => removeFromCompare(asset.id)}
                        className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AssetTypeBadge type={asset.type} />
                    <SensitivityBadge level={asset.sensitivity} size="sm" />
                  </div>
                </div>
              );
            })}
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

          {/* Decision Assistant Summary Card (only in diff mode with diff fields) */}
          {viewMode === 'diff' && displayedFieldNames.length > 0 && baselineAsset && (
            <div className="relative rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-violet-500/15 to-fuchsia-500/20 rounded-xl" />
              <div className="absolute inset-0 rounded-xl border border-cyan-400/20" />
              <div className="relative p-4 space-y-4 glass-card bg-slate-900/40 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border border-cyan-400/30">
                    <Target className="w-4 h-4 text-cyan-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">决策助手</h3>
                  <span className="text-[11px] text-slate-400 ml-1">
                    以 <span className="text-cyan-300">{baselineAsset.name}</span> 为基准
                  </span>
                </div>

                <div className="space-y-3">
                  {addedMissingFields.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-medium text-sky-300 flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        字段新增/缺失 ({addedMissingFields.length})
                      </div>
                      <div className="space-y-1">
                        {addedMissingFields.map((item) => (
                          <div key={item.fieldName} className="text-xs text-slate-300 flex items-start gap-1.5 pl-1">
                            <span className="text-sky-400 shrink-0 mt-0.5">[增减]</span>
                            <span>
                              <code className="text-sky-200 font-mono text-[11px]">{item.fieldName}</code>
                              <span className="text-slate-400">: </span>
                              <span className="text-emerald-300">{item.hasAssets.join('、')} 有</span>
                              <span className="text-slate-400">，</span>
                              <span className="text-rose-300">{item.missingAssets.join('、')} 无</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {typeChangedFields.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-medium text-violet-300 flex items-center gap-1">
                        <Columns className="w-3 h-3" />
                        字段类型变化 ({typeChangedFields.length})
                      </div>
                      <div className="space-y-1">
                        {typeChangedFields.map((item) => (
                          <div key={item.fieldName} className="text-xs text-slate-300 flex items-start gap-1.5 pl-1">
                            <span className="text-violet-400 shrink-0 mt-0.5">[类型变]</span>
                            <span>
                              <code className="text-violet-200 font-mono text-[11px]">{item.fieldName}</code>
                              <span className="text-slate-400">: </span>
                              <span>{baselineAsset.name}</span>
                              <code className="text-slate-200 font-mono text-[11px] mx-1">({item.baselineType})</code>
                              <span className="text-slate-400">→</span>
                              {item.comparisons.map((c, i) => (
                                <span key={c.assetName}>
                                  <span className="mx-1">{c.assetName}</span>
                                  <code className="text-amber-300 font-mono text-[11px]">({c.type})</code>
                                  {i < item.comparisons.length - 1 && <span className="text-slate-500 mx-0.5">/</span>}
                                </span>
                              ))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sensitivityElevatedFields.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-medium text-rose-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        敏感等级升高 ({sensitivityElevatedFields.length})
                      </div>
                      <div className="space-y-1">
                        {sensitivityElevatedFields.map((item) => (
                          <div key={item.fieldName} className="text-xs text-slate-300 flex items-start gap-1.5 pl-1">
                            <span className="text-rose-400 shrink-0 mt-0.5">[敏感升]</span>
                            <span>
                              <code className="text-rose-200 font-mono text-[11px]">{item.fieldName}</code>
                              <span className="text-slate-400">: </span>
                              <span>{baselineAsset.name}</span>
                              <span className="text-slate-200 mx-1">({sensitivityLabel(item.baselineSensitivity)})</span>
                              <span className="text-slate-400">→</span>
                              {item.comparisons.map((c, i) => (
                                <span key={c.assetName}>
                                  <span className="mx-1">{c.assetName}</span>
                                  <span className="text-rose-300">({sensitivityLabel(c.sensitivity)})</span>
                                  {i < item.comparisons.length - 1 && <span className="text-slate-500 mx-0.5">/</span>}
                                </span>
                              ))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {addedMissingFields.length === 0 && typeChangedFields.length === 0 && sensitivityElevatedFields.length === 0 && (
                    <div className="text-xs text-slate-400 italic">
                      无显著分类差异
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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

          {/* Conclusion Card (only in diff mode) */}
          {viewMode === 'diff' && (
            <div className="relative rounded-xl overflow-hidden">
              <div
                className="absolute inset-0 rounded-xl opacity-60"
                style={{
                  background:
                    assessmentColor === 'emerald'
                      ? 'linear-gradient(135deg, rgba(16,185,129,0.35) 0%, rgba(34,211,238,0.2) 50%, rgba(139,92,246,0.25) 100%)'
                      : assessmentColor === 'sky'
                      ? 'linear-gradient(135deg, rgba(56,189,248,0.3) 0%, rgba(139,92,246,0.25) 50%, rgba(236,72,153,0.2) 100%)'
                      : 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(244,63,94,0.25) 50%, rgba(168,85,247,0.2) 100%)',
                }}
              />
              <div className="absolute inset-0 rounded-xl border border-white/10 pointer-events-none" />
              <div className="relative p-4 glass-card bg-slate-900/50 rounded-xl space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'p-1.5 rounded-lg border',
                        assessmentColor === 'emerald' && 'bg-emerald-500/20 border-emerald-400/30',
                        assessmentColor === 'sky' && 'bg-sky-500/20 border-sky-400/30',
                        assessmentColor === 'amber' && 'bg-amber-500/20 border-amber-400/30'
                      )}
                    >
                      {(() => {
                        const Icon = assessmentIcon;
                        return (
                          <Icon
                            className={cn(
                              'w-4 h-4',
                              assessmentColor === 'emerald' && 'text-emerald-300',
                              assessmentColor === 'sky' && 'text-sky-300',
                              assessmentColor === 'amber' && 'text-amber-300'
                            )}
                          />
                        );
                      })()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <FileCheck className="w-4 h-4 text-slate-300" />
                          对比结论
                        </h3>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-medium border',
                            assessmentColor === 'emerald' && 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
                            assessmentColor === 'sky' && 'bg-sky-500/15 text-sky-300 border-sky-400/30',
                            assessmentColor === 'amber' && 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                          )}
                        >
                          {overallAssessment}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        差异字段 {diffCount}/{totalFields} · 差异率 {(diffRatio * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <button
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                    title="复制结论"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid gap-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0 w-16">总体评价:</span>
                    <span
                      className={cn(
                        'font-medium',
                        assessmentColor === 'emerald' && 'text-emerald-300',
                        assessmentColor === 'sky' && 'text-sky-300',
                        assessmentColor === 'amber' && 'text-amber-300'
                      )}
                    >
                      {overallAssessment}
                      <span className="text-slate-400 font-normal">
                        {' '}
                        - {overallAssessment === '高度一致' ? '字段结构和属性高度相似，可灵活选择复用' : overallAssessment === '部分重叠' ? '存在一定差异，需根据业务场景确认选择' : '差异较大，建议仔细评估后选择'}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0 w-16">敏感风险:</span>
                    {hasSensitivityElevation ? (
                      <span className="text-rose-300">
                        <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" />
                        部分资产敏感等级高于基准，需关注权限合规
                      </span>
                    ) : (
                      <span className="text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 inline mr-1 -mt-0.5" />
                        敏感等级一致或低于基准，风险可控
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0 w-16">复用建议:</span>
                    {reuseSuggestion ? (
                      <span className="text-cyan-300">
                        建议优先复用 <span className="font-semibold text-white">{reuseSuggestion.asset.name}</span>
                        <span className="text-slate-400">（{reuseSuggestion.reason}）</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">数据不足，暂无法建议</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <div className="text-[11px] font-medium text-slate-400 mb-1">快速要点</div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-500 mt-0.5">·</span>
                      <span className="text-slate-300">
                        字段差异数: <span className="text-white font-medium">{diffCount}</span> 项
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-500 mt-0.5">·</span>
                      <span className="text-slate-300">
                        最大访问差:{' '}
                        <span className="text-white font-medium">
                          {hasVisitDiff ? (maxVisit - minVisit).toLocaleString() : '0'}
                        </span>
                        {hasVisitDiff && maxVisitAsset && minVisitAsset && (
                          <span className="text-slate-500 ml-1">
                            ({maxVisitAsset.name} vs {minVisitAsset.name})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-500 mt-0.5">·</span>
                      <span className="text-slate-300">
                        负责人情况:{' '}
                        {hasOwnerDiff ? (
                          <span className="text-amber-300">存在差异</span>
                        ) : (
                          <span className="text-emerald-300">一致</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-500 mt-0.5">·</span>
                      <span className="text-slate-300">
                        敏感等级变化:{' '}
                        {hasSensitivityElevation ? (
                          <span className="text-rose-300">有升高</span>
                        ) : (
                          <span className="text-emerald-300">无升高</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
