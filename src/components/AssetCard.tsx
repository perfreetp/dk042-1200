import { Link } from 'react-router-dom';
import { Star, Eye, User, Database, Network, GitCompare } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { DataAsset } from '@/types';
import SensitivityBadge from './SensitivityBadge';
import AssetTypeBadge, { typeConfig } from './AssetTypeBadge';
import { owners } from '@/data/owners';
import { departments } from '@/data/departments';
import { cn } from '@/lib/utils';

interface Props {
  asset: DataAsset;
  index: number;
}

export default function AssetCard({ asset, index }: Props) {
  const { toggleFavorite, setShowApplyModal, addToCompare, isInCompare, compareIds, setShowComparePanel } = useAppStore();
  const owner = owners.find((o) => o.id === asset.ownerId);
  const dept = departments.find((d) => d.id === asset.departmentId);
  const TypeIcon = typeConfig[asset.type].icon;
  const staggerClass = `stagger-${(index % 6) + 1}`;

  return (
    <div
      className={cn(
        'glass-card glass-card-hover gradient-border p-5 flex flex-col gap-4 fade-in-up group cursor-pointer',
        staggerClass
      )}
    >
      <Link to={`/assets/${asset.id}`} className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                typeConfig[asset.type].bgClass,
                'shadow-lg shadow-black/20'
              )}
            >
              <TypeIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-semibold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                {asset.name}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <AssetTypeBadge type={asset.type} />
                <SensitivityBadge level={asset.sensitivity} />
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(asset.id);
            }}
            className={cn(
              'p-2 rounded-lg transition-all flex-shrink-0',
              asset.isFavorite
                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                : 'bg-white/[0.03] text-slate-500 hover:text-amber-400 hover:bg-white/[0.06]'
            )}
          >
            <Star className={cn('w-4 h-4', asset.isFavorite && 'fill-current')} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCompare(asset.id);
              setShowComparePanel(true);
            }}
            className={cn(
              'p-2 rounded-lg transition-all flex-shrink-0',
              isInCompare(asset.id)
                ? 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20'
                : 'bg-white/[0.03] text-slate-500 hover:text-violet-400 hover:bg-white/[0.06]'
            )}
            title={isInCompare(asset.id) ? '已加入对比' : '加入对比'}
          >
            <GitCompare className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[32px]">
          {asset.description}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {owner && (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-200">
                  {owner.avatar}
                </div>
                <span className="truncate max-w-[80px]">{owner.name}</span>
              </div>
            )}
            {dept && (
              <div className="flex items-center gap-1 text-slate-500">
                <Database className="w-3 h-3" />
                <span className="truncate max-w-[60px]">{dept.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Eye className="w-3.5 h-3.5" />
            <span>{asset.visitCount.toLocaleString()}</span>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
        <Link
          to={`/lineage/${asset.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs
                     text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all group/lineage"
        >
          <Network className="w-3.5 h-3.5 group-hover/lineage:scale-110 transition-transform" />
          血缘
        </Link>
        <button
          onClick={() => setShowApplyModal(true, asset.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs
                     text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all group/apply"
        >
          <User className="w-3.5 h-3.5 group-hover/apply:scale-110 transition-transform" />
          申请
        </button>
        <Link
          to={`/assets/${asset.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs
                     text-cyan-300 hover:bg-cyan-500/10 transition-all"
        >
          查看详情 →
        </Link>
      </div>
    </div>
  );
}
