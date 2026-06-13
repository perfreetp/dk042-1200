import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Link } from 'react-router-dom';
import StatsCard from '@/components/StatsCard';
import SensitivityBadge from '@/components/SensitivityBadge';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Snowflake,
  Archive,
  BarChart3,
  PieChart,
  Users,
  Flame,
  ChevronRight,
  Eye,
  Calendar,
} from 'lucide-react';

const typeColorMap = {
  table: '#06b6d4',
  report: '#8b5cf6',
  api: '#f59e0b',
};

export default function Ranking() {
  const { assets } = useAppStore();

  const byVisit = useMemo(() =>
    [...assets].sort((a, b) => b.visitCount - a.visitCount),
    [assets]
  );

  const coldAssets = useMemo(() => {
    const now = new Date('2026-06-14').getTime();
    return assets
      .filter((a) => {
        const last = new Date(a.lastVisitTime).getTime();
        const diff = (now - last) / (1000 * 60 * 60 * 24);
        return diff > 30;
      })
      .sort((a, b) => a.lastVisitTime.localeCompare(b.lastVisitTime));
  }, [assets]);

  const avgVisit = assets.reduce((s, a) => s + a.visitCount, 0) / assets.length;
  const hotAssetCount = assets.filter((a) => a.visitCount > avgVisit * 1.5).length;

  const typeStats = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach((a) => {
      map[a.type] = (map[a.type] || 0) + 1;
    });
    const total = assets.length;
    return Object.entries(map).map(([type, count]) => ({
      type,
      count,
      pct: (count / total) * 100,
    }));
  }, [assets]);

  const deptStats = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach((a) => {
      map[a.departmentId] = (map[a.departmentId] || 0) + a.visitCount;
    });
    const entries = Object.entries(map)
      .map(([deptId, visits]) => ({ deptId, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 6);
    const max = entries[0]?.visits || 1;
    return entries.map((e) => ({ ...e, pct: (e.visits / max) * 100 }));
  }, [assets]);

  const deptNameMap: Record<string, string> = {
    'dept-1-1': '数据开发部',
    'dept-1-2': '数据治理部',
    'dept-2-1': '用户增长组',
    'dept-2-2': '品牌运营组',
    'dept-3-1': '财务分析组',
    'dept-4': '人力资源部',
    'dept-5': '风控部',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white mb-1 flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-cyan-400" />
          使用排行分析
        </h1>
        <p className="text-sm text-slate-500">洞察数据资产使用情况，发现热门资产与闲置资产</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="热门资产数"
          value={hotAssetCount}
          subtitle={`访问量超过均值 × 1.5`}
          icon={<Flame className="w-6 h-6" />}
          accent="cyan"
          trend={8}
        />
        <StatsCard
          title="平均访问量"
          value={Math.round(avgVisit)}
          subtitle="每资产月均访问"
          icon={<Eye className="w-6 h-6" />}
          accent="violet"
          trend={15}
        />
        <StatsCard
          title="长期未用资产"
          value={coldAssets.length}
          subtitle="超过30天未被访问"
          icon={<Snowflake className="w-6 h-6" />}
          accent="amber"
          trend={-5}
        />
        <StatsCard
          title="资产覆盖部门"
          value={new Set(assets.map((a) => a.departmentId)).size}
          subtitle="参与数据建设"
          icon={<Users className="w-6 h-6" />}
          accent="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 gradient-border fade-in-up">
          <h2 className="font-display font-semibold text-lg text-slate-100 mb-5 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            访问热度 TOP 10
          </h2>

          <div className="space-y-3">
            {byVisit.slice(0, 10).map((asset, idx) => {
              const pct = (asset.visitCount / byVisit[0].visitCount) * 100;
              const trend = (Math.random() - 0.3) * 40;
              return (
                <Link
                  key={asset.id}
                  to={`/assets/${asset.id}`}
                  className="group block rounded-xl p-3 -mx-3 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        idx === 0
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                          : idx === 1
                          ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800'
                          : idx === 2
                          ? 'bg-gradient-to-br from-orange-600 to-amber-700 text-amber-100'
                          : 'bg-white/[0.05] text-slate-400 border border-white/[0.08]'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-200 group-hover:text-cyan-300 truncate transition-colors">
                          {asset.name}
                        </span>
                        <SensitivityBadge level={asset.sensitivity} />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Eye className="w-3 h-3 text-slate-600" />
                        <span className="text-xs text-slate-500">{asset.visitCount.toLocaleString()} 次访问</span>
                        {trend >= 0 ? (
                          <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 ml-auto">
                            <TrendingUp className="w-3 h-3" />
                            +{trend.toFixed(0)}%
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-[10px] text-rose-400 ml-auto">
                            <TrendingDown className="w-3 h-3" />
                            {trend.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-10 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: idx < 3
                          ? 'linear-gradient(90deg, #f59e0b, #fb923c)'
                          : 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-6 gradient-border fade-in-up stagger-1">
          <h2 className="font-display font-semibold text-lg text-slate-100 mb-5 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            长期未用资产提醒
            <span className="ml-auto text-xs font-normal px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {coldAssets.length} 项待处理
            </span>
          </h2>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
            {coldAssets.map((asset, idx) => {
              const days = Math.floor(
                (new Date('2026-06-14').getTime() - new Date(asset.lastVisitTime).getTime())
                / (1000 * 60 * 60 * 24)
              );
              return (
                <div
                  key={asset.id}
                  className="rounded-xl p-4 border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Snowflake className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          to={`/assets/${asset.id}`}
                          className="font-medium text-sm text-slate-200 hover:text-amber-300 truncate transition-colors"
                        >
                          {asset.name}
                        </Link>
                        <SensitivityBadge level={asset.sensitivity} />
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          最近访问: {asset.lastVisitTime.split(' ')[0]}
                        </span>
                        <span className="text-amber-300 font-semibold">
                          已沉睡 {days} 天
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500 line-clamp-1">
                        {asset.description}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] transition-colors flex items-center gap-1">
                          <ChevronRight className="w-3 h-3" />
                          查看详情
                        </button>
                        <button className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/15 transition-colors flex items-center gap-1">
                          <Archive className="w-3 h-3" />
                          建议归档
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {coldAssets.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm">
                🎉 所有资产都处于活跃状态
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 gradient-border fade-in-up stagger-2">
          <h2 className="font-display font-semibold text-lg text-slate-100 mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-violet-400" />
            资产类型分布
          </h2>
          <div className="flex items-center gap-8">
            <div className="relative w-44 h-44 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {(() => {
                  let offset = 0;
                  return typeStats.map((item, idx) => {
                    const radius = 40;
                    const circumference = 2 * Math.PI * radius;
                    const dash = (item.pct / 100) * circumference;
                    const color = typeColorMap[item.type as keyof typeof typeColorMap];
                    const result = (
                      <circle
                        key={item.type}
                        cx={50}
                        cy={50}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={16}
                        strokeDasharray={`${dash} ${circumference}`}
                        strokeDashoffset={-offset}
                        className="transition-all duration-1000"
                        style={{ opacity: 0.9 }}
                      />
                    );
                    offset += dash;
                    return result;
                  });
                })()}
                <circle cx={50} cy={50} r={28} fill="#0F172A" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-display font-bold text-2xl text-white">{assets.length}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">资产总数</div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {typeStats.map((item) => (
                <div key={item.type}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-md"
                        style={{ background: typeColorMap[item.type as keyof typeof typeColorMap] }}
                      />
                      <span className="text-slate-300 capitalize">
                        {item.type === 'table' ? '数据表' : item.type === 'report' ? '报表' : '接口'}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      <span className="font-semibold text-slate-200">{item.count}</span> 项
                      <span className="text-slate-600 ml-1">({item.pct.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${item.pct}%`,
                        background: typeColorMap[item.type as keyof typeof typeColorMap],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-6 gradient-border fade-in-up stagger-3">
          <h2 className="font-display font-semibold text-lg text-slate-100 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            部门访问量排行
          </h2>
          <div className="space-y-4">
            {deptStats.map((item, idx) => (
              <div key={item.deptId}>
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className={
                      idx === 0
                        ? 'w-5 h-5 rounded-md bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white'
                        : 'w-5 h-5 rounded-md bg-white/[0.05] flex items-center justify-center text-[10px] text-slate-400'
                    }>
                      {idx + 1}
                    </span>
                    <span className="text-slate-200 font-medium">
                      {deptNameMap[item.deptId] || item.deptId}
                    </span>
                  </div>
                  <span className="text-slate-300 font-semibold">{item.visits.toLocaleString()} 次</span>
                </div>
                <div className="h-3 rounded-full bg-white/[0.04] overflow-hidden ml-7">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${item.pct}%`,
                      background: `linear-gradient(90deg, #10b981, #06b6d4)`,
                      opacity: 1 - idx * 0.12,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
