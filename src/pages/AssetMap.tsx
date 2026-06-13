import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import AssetCard from '@/components/AssetCard';
import StatsCard from '@/components/StatsCard';
import ApplyModal from '@/components/ApplyModal';
import {
  Database,
  Shield,
  Eye,
  AlertTriangle,
  Star,
  Filter,
  Database as DBIcon,
  BarChart3,
  PlugZap,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AssetType } from '@/types';
import { Link } from 'react-router-dom';

export default function AssetMap() {
  const {
    assets,
    filteredAssets,
    searchKeyword,
    selectedDepartmentId,
    selectedSubjectId,
    favoriteIds,
    toggleFavorite,
    selectedAssetType,
    setSelectedAssetType,
    setSearchKeyword,
    setSelectedDepartment,
    setSelectedSubject,
  } = useAppStore();

  const [showFavPanel, setShowFavPanel] = useState(false);

  const totalVisits = useMemo(() => assets.reduce((s, a) => s + a.visitCount, 0), [assets]);
  const highSensitivityCount = assets.filter((a) => a.sensitivity === 'high').length;
  const tableCount = assets.filter((a) => a.type === 'table').length;
  const reportCount = assets.filter((a) => a.type === 'report').length;
  const apiCount = assets.filter((a) => a.type === 'api').length;

  const filtered = filteredAssets();
  const favoriteAssets = assets.filter((a) => favoriteIds.includes(a.id));

  const typeTabs: { key: AssetType | 'all'; label: string; icon: typeof DBIcon; count: number }[] = [
    { key: 'all', label: '全部', icon: Database, count: assets.length },
    { key: 'table', label: '数据表', icon: DBIcon, count: tableCount },
    { key: 'report', label: '报表', icon: BarChart3, count: reportCount },
    { key: 'api', label: '接口', icon: PlugZap, count: apiCount },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="数据资产总数"
          value={assets.length}
          subtitle="已登记纳入管理"
          icon={<Database className="w-6 h-6" />}
          accent="cyan"
          trend={12}
        />
        <StatsCard
          title="累计访问量"
          value={totalVisits}
          subtitle="近90天统计"
          icon={<Eye className="w-6 h-6" />}
          accent="violet"
          trend={23}
        />
        <StatsCard
          title="高敏感资产"
          value={highSensitivityCount}
          subtitle="需严格权限管控"
          icon={<Shield className="w-6 h-6" />}
          accent="rose"
          trend={-2}
        />
        <StatsCard
          title="我的收藏"
          value={favoriteIds.length}
          subtitle="常用资产快捷访问"
          icon={<Star className="w-6 h-6" />}
          accent="amber"
        />
      </div>

      <div className="glass-card p-5 gradient-border fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {typeTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.key === 'all' ? !selectedAssetType : selectedAssetType === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedAssetType(tab.key === 'all' ? null : (tab.key as AssetType))}
                  className={cn(
                    'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border',
                    isActive
                      ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/5'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-md',
                    isActive ? 'bg-cyan-500/20 text-cyan-200' : 'bg-white/[0.06] text-slate-500'
                  )}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {(searchKeyword || selectedDepartmentId || selectedSubjectId) && (
              <button
                onClick={() => {
                  setSearchKeyword('');
                  setSelectedDepartment(null);
                  setSelectedSubject(null);
                }}
                className="btn-ghost text-xs py-2 flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                清除筛选
              </button>
            )}
            <button
              onClick={() => setShowFavPanel(!showFavPanel)}
              className={cn(
                'btn-ghost text-xs py-2 flex items-center gap-1.5',
                showFavPanel && '!bg-amber-500/10 !border-amber-500/30 !text-amber-300'
              )}
            >
              <Star className="w-3.5 h-3.5" />
              收藏夹 ({favoriteIds.length})
            </button>
          </div>
        </div>

        {(searchKeyword || selectedDepartmentId || selectedSubjectId) && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              当前筛选：
            </span>
            {searchKeyword && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs">
                关键词: {searchKeyword}
                <button onClick={() => setSearchKeyword('')} className="opacity-60 hover:opacity-100">✕</button>
              </span>
            )}
            {selectedDepartmentId && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs">
                部门筛选
                <button onClick={() => setSelectedDepartment(null)} className="opacity-60 hover:opacity-100">✕</button>
              </span>
            )}
            {selectedSubjectId && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                主题筛选
                <button onClick={() => setSelectedSubject(null)} className="opacity-60 hover:opacity-100">✕</button>
              </span>
            )}
            <span className="ml-auto text-xs text-slate-500">
              共找到 <span className="text-cyan-300 font-semibold">{filtered.length}</span> 个资产
            </span>
          </div>
        )}
      </div>

      {showFavPanel && favoriteAssets.length > 0 && (
        <div className="glass-card p-5 gradient-border fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-slate-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              我的收藏夹
            </h3>
            <button
              onClick={() => setShowFavPanel(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {favoriteAssets.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]
                           hover:bg-white/[0.05] hover:border-cyan-500/20 transition-all group"
              >
                <Link to={`/assets/${a.id}`} className="flex-1 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <DBIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-200 truncate">{a.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{a.description}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </Link>
                <button
                  onClick={() => toggleFavorite(a.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filtered.map((asset, idx) => (
            <AssetCard key={asset.id} asset={asset} index={idx} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 text-center gradient-border">
          <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="font-display font-semibold text-slate-200 mb-2">未找到匹配的数据资产</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            请尝试调整搜索关键词或筛选条件，或清除筛选条件后重新浏览
          </p>
        </div>
      )}

      <ApplyModal />
    </div>
  );
}
