import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { owners } from '@/data/owners';
import { departments } from '@/data/departments';
import { subjects } from '@/data/subjects';
import FieldsTable from '@/components/FieldsTable';
import OwnerCard from '@/components/OwnerCard';
import SensitivityBadge from '@/components/SensitivityBadge';
import AssetTypeBadge from '@/components/AssetTypeBadge';
import ApplyModal from '@/components/ApplyModal';
import {
  ArrowLeft,
  Star,
  Network,
  FileEdit,
  Calendar,
  RefreshCw,
  Database,
  Eye,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAssetById, toggleFavorite, setShowApplyModal } = useAppStore();

  const asset = id ? getAssetById(id) : undefined;

  if (!asset) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="glass-card p-12 text-center gradient-border max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="font-display font-bold text-xl text-slate-200 mb-2">资产不存在</h2>
          <p className="text-sm text-slate-500 mb-6">未找到对应的数据资产，可能已被移除或ID无效</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回资产地图
          </Link>
        </div>
      </div>
    );
  }

  const owner = owners.find((o) => o.id === asset.ownerId);
  const dept = departments.find((d) => d.id === asset.departmentId);
  const subject = subjects.find((s) => s.id === asset.subjectId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center
                     text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-cyan-300 transition-colors">资产地图</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-cyan-300 font-medium">{asset.name}</span>
        </div>
      </div>

      <div className="glass-card p-6 gradient-border relative overflow-hidden fade-in-up">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

        <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <AssetTypeBadge type={asset.type} />
              <SensitivityBadge level={asset.sensitivity} withGlow size="md" />
              {dept && (
                <span className="tag bg-white/[0.05] text-slate-300 border-white/[0.08]">
                  <Database className="w-3 h-3" />
                  {dept.name}
                </span>
              )}
              {subject && (
                <span className="tag bg-white/[0.05] text-slate-300 border-white/[0.08]">
                  📁 {subject.name}
                </span>
              )}
            </div>

            <h1 className="font-display font-bold text-3xl text-white mb-3 tracking-tight">
              {asset.name}
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
              {asset.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                创建于 <span className="text-slate-300">{asset.createTime}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                最近更新 <span className="text-slate-300">{asset.updateTime}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Eye className="w-3.5 h-3.5 text-violet-400" />
                访问量 <span className="text-violet-300 font-semibold">{asset.visitCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                最近访问 <span className="text-slate-300">{asset.lastVisitTime}</span>
              </div>
              {asset.rowCount !== undefined && (
                <div className="flex items-center gap-2 text-slate-500">
                  <FileEdit className="w-3.5 h-3.5 text-sky-400" />
                  数据量 <span className="text-sky-300 font-semibold">{asset.rowCount.toLocaleString()} 行</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col gap-3 md:min-w-[200px]">
            <button
              onClick={() => toggleFavorite(asset.id)}
              className={cn(
                'btn-ghost flex items-center justify-center gap-2 py-3',
                asset.isFavorite && '!bg-amber-500/10 !border-amber-500/30 !text-amber-300'
              )}
            >
              <Star className={cn('w-4 h-4', asset.isFavorite && 'fill-current')} />
              {asset.isFavorite ? '已收藏' : '收藏资产'}
            </button>
            <button
              onClick={() => setShowApplyModal(true, asset.id)}
              className="btn-primary flex items-center justify-center gap-2 py-3"
            >
              <FileEdit className="w-4 h-4" />
              申请使用
            </button>
            <Link
              to={`/lineage/${asset.id}`}
              className="btn-ghost flex items-center justify-center gap-2 py-3
                         !bg-violet-500/10 !border-violet-500/30 !text-violet-300 hover:!bg-violet-500/15"
            >
              <Network className="w-4 h-4" />
              查看血缘
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="font-display font-semibold text-lg text-slate-100 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              字段说明
              <span className="text-xs font-normal text-slate-500">
                共 {asset.fields.length} 个字段
              </span>
            </h2>
            <FieldsTable fields={asset.fields} />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="font-display font-semibold text-lg text-slate-100 mb-4 flex items-center gap-2">
              👤 资产负责人
            </h2>
            {owner && <OwnerCard owner={owner} />}
          </div>

          <div className="glass-card p-5 gradient-border">
            <h3 className="font-display font-semibold text-slate-100 mb-4 text-sm flex items-center gap-2">
              📊 快速统计
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500">高敏感字段占比</span>
                  <span className="text-rose-300 font-semibold">
                    {asset.fields.filter((f) => f.sensitivity === 'high').length} / {asset.fields.length}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500"
                    style={{
                      width: `${(asset.fields.filter((f) => f.sensitivity === 'high').length / asset.fields.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500">中敏感字段占比</span>
                  <span className="text-violet-300 font-semibold">
                    {asset.fields.filter((f) => f.sensitivity === 'medium').length} / {asset.fields.length}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    style={{
                      width: `${(asset.fields.filter((f) => f.sensitivity === 'medium').length / asset.fields.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500">主键字段数</span>
                  <span className="text-amber-300 font-semibold">
                    {asset.fields.filter((f) => f.isPrimary).length}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500">可空字段数</span>
                  <span className="text-sky-300 font-semibold">
                    {asset.fields.filter((f) => f.isNullable).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ApplyModal />
    </div>
  );
}
