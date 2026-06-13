import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMemo, useState, useRef } from 'react';
import { getLineageData, getUpstreamIds, getDownstreamIds } from '@/data/lineage';
import { useAppStore } from '@/store/useAppStore';
import SensitivityBadge from '@/components/SensitivityBadge';
import AssetTypeBadge, { typeConfig } from '@/components/AssetTypeBadge';
import {
  ArrowLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Layers,
  ArrowRightLeft,
  Database,
  BarChart3,
  PlugZap,
  X,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LineageNode } from '@/types';

const iconMap = {
  table: Database,
  report: BarChart3,
  api: PlugZap,
};

export default function LineageView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAssetById } = useAppStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [depth, setDepth] = useState<2 | 3 | 4>(2);
  const [direction, setDirection] = useState<'both' | 'upstream' | 'downstream'>('both');
  const [selectedNode, setSelectedNode] = useState<LineageNode | null>(null);
  const [viewBox, setViewBox] = useState({ x: -400, y: -200, w: 1600, h: 600 });

  const lineageData = useMemo(() => (id ? getLineageData(id) : null), [id]);
  const centerAsset = id ? getAssetById(id) : undefined;

  const layout = useMemo(() => {
    if (!lineageData) return { nodes: [], edges: [] };

    const maxLayer = Math.abs(depth);
    let nodes = lineageData.nodes;

    if (direction === 'upstream') {
      nodes = nodes.filter((n) => n.layer <= 0 && n.layer >= -maxLayer);
    } else if (direction === 'downstream') {
      nodes = nodes.filter((n) => n.layer >= 0 && n.layer <= maxLayer);
    } else {
      nodes = nodes.filter((n) => Math.abs(n.layer) <= maxLayer);
    }
    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = lineageData.edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to));

    const byLayer: Record<number, LineageNode[]> = {};
    nodes.forEach((n) => {
      if (!byLayer[n.layer]) byLayer[n.layer] = [];
      byLayer[n.layer].push(n);
    });

    const NODE_W = 180;
    const NODE_H = 80;
    const GAP_X = 280;
    const GAP_Y = 110;

    const positioned: Record<string, { x: number; y: number }> = {};
    Object.keys(byLayer).forEach((layerKey) => {
      const layer = Number(layerKey);
      const list = byLayer[layer];
      const totalH = list.length * NODE_H + (list.length - 1) * (GAP_Y - NODE_H);
      const startY = -totalH / 2 + NODE_H / 2;
      list.forEach((n, idx) => {
        positioned[n.id] = {
          x: layer * GAP_X,
          y: startY + idx * GAP_Y,
        };
      });
    });

    return { nodes, edges, positioned, NODE_W, NODE_H };
  }, [lineageData, depth, direction]);

  const selectedAsset = selectedNode ? getAssetById(selectedNode.id) : undefined;

  const handleZoom = (factor: number) => {
    setZoom((z) => Math.max(0.4, Math.min(2, z * factor)));
    setViewBox((v) => ({
      ...v,
      x: v.x * factor,
      y: v.y * factor,
      w: v.w / factor,
      h: v.h / factor,
    }));
  };

  const resetView = () => {
    setZoom(1);
    setViewBox({ x: -400, y: -200, w: 1600, h: 600 });
  };

  const upstreamIds = useMemo(
    () => (selectedNode ? getUpstreamIds(selectedNode.id) : []),
    [selectedNode]
  );
  const downstreamIds = useMemo(
    () => (selectedNode ? getDownstreamIds(selectedNode.id) : []),
    [selectedNode]
  );

  const panelOpen = selectedNode !== null;

  return (
    <div className="space-y-5 h-[calc(100vh-160px)] flex flex-col">
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
          {centerAsset && (
            <>
              <Link to={`/assets/${id}`} className="hover:text-cyan-300 transition-colors">{centerAsset.name}</Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-violet-300 font-medium">血缘视图</span>
        </div>
      </div>

      <div className="flex-1 flex gap-0 overflow-hidden relative fade-in-up">
        <div className={cn(
          'glass-card gradient-border overflow-hidden flex flex-col transition-all duration-300',
          panelOpen ? 'flex-1 min-w-0' : 'flex-1'
        )}>
          <div className="px-5 py-3.5 border-b border-white/[0.06] flex flex-wrap items-center gap-3 bg-slate-950/50 backdrop-blur-sm z-20">
            <div className="font-display font-semibold text-slate-100 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-violet-400" />
              数据血缘关系
            </div>

            <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />

            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <button
                onClick={() => setDirection('upstream')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  direction === 'upstream'
                    ? 'bg-cyan-500/15 text-cyan-300'
                    : 'text-slate-500 hover:text-slate-300'
                )}
              >
                仅上游
              </button>
              <button
                onClick={() => setDirection('both')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  direction === 'both'
                    ? 'bg-cyan-500/15 text-cyan-300'
                    : 'text-slate-500 hover:text-slate-300'
                )}
              >
                全部
              </button>
              <button
                onClick={() => setDirection('downstream')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  direction === 'downstream'
                    ? 'bg-cyan-500/15 text-cyan-300'
                    : 'text-slate-500 hover:text-slate-300'
                )}
              >
                仅下游
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                {[2, 3, 4].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDepth(d as 2 | 3 | 4)}
                    className={cn(
                      'w-7 h-7 rounded-lg text-xs font-medium transition-all',
                      depth === d
                        ? 'bg-violet-500/15 text-violet-300'
                        : 'text-slate-500 hover:text-slate-300'
                    )}
                  >
                    {d}层
                  </button>
                ))}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <button
                onClick={() => handleZoom(1.2)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] flex items-center justify-center transition-all"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom(0.8)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] flex items-center justify-center transition-all"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-white/10 mx-1" />
              <button
                onClick={resetView}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] flex items-center justify-center transition-all"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative bg-grid-pattern overflow-hidden">
            <svg
              ref={svgRef}
              className="w-full h-full"
              viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="rgba(34, 211, 238, 0.5)" />
                </marker>
                <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(139, 92, 246, 0.4)" />
                  <stop offset="50%" stopColor="rgba(6, 182, 212, 0.7)" />
                  <stop offset="100%" stopColor="rgba(139, 92, 246, 0.4)" />
                </linearGradient>
                <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g>
                {layout.edges.map((edge, idx) => {
                  const from = layout.positioned[edge.from];
                  const to = layout.positioned[edge.to];
                  if (!from || !to) return null;

                  const sx = from.x + layout.NODE_W / 2;
                  const sy = from.y;
                  const tx = to.x - layout.NODE_W / 2;
                  const ty = to.y;
                  const mx = (sx + tx) / 2;

                  const d = `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`;

                  return (
                    <path
                      key={idx}
                      d={d}
                      fill="none"
                      stroke="url(#edgeGradient)"
                      strokeWidth={2}
                      strokeLinecap="round"
                      className="line-flow"
                      markerEnd="url(#arrowhead)"
                    />
                  );
                })}
              </g>

              <g>
                {layout.nodes.map((node) => {
                  const pos = layout.positioned[node.id];
                  if (!pos) return null;
                  const asset = getAssetById(node.id);
                  const isCenter = node.layer === 0;
                  const Icon = iconMap[node.type];
                  const isSelected = selectedNode?.id === node.id;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x - layout.NODE_W / 2}, ${pos.y - layout.NODE_H / 2})`}
                      className={cn('cursor-pointer', isCenter && 'node-pulse')}
                      onClick={() => {
                        setSelectedNode(node);
                      }}
                    >
                      <rect
                        x={0}
                        y={0}
                        width={layout.NODE_W}
                        height={layout.NODE_H}
                        rx={14}
                        fill={isCenter
                          ? 'rgba(6, 182, 212, 0.15)'
                          : node.layer < 0
                          ? 'rgba(139, 92, 246, 0.08)'
                          : 'rgba(16, 185, 129, 0.08)'}
                        stroke={isCenter
                          ? 'rgba(6, 182, 212, 0.5)'
                          : node.layer < 0
                          ? 'rgba(139, 92, 246, 0.3)'
                          : 'rgba(16, 185, 129, 0.3)'}
                        strokeWidth={isSelected ? 2 : 1}
                        filter={isCenter ? 'url(#nodeGlow)' : undefined}
                        className="transition-all hover:stroke-cyan-400"
                      />
                      <g transform="translate(14, 16)">
                        <g
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center',
                            typeConfig[node.type].bgClass
                          )}
                          transform="translate(0, 0)"
                        >
                          <foreignObject width={32} height={32}>
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white', typeConfig[node.type].bgClass)}>
                              <Icon width={16} height={16} />
                            </div>
                          </foreignObject>
                        </g>
                      </g>
                      <foreignObject x={56} y={14} width={layout.NODE_W - 70} height={22}>
                        <div
                          className={cn(
                            'text-xs font-semibold truncate',
                            isCenter ? 'text-cyan-200' : 'text-slate-200'
                          )}
                        >
                          {node.name.length > 20 ? node.name.slice(0, 20) + '…' : node.name}
                        </div>
                      </foreignObject>
                      <foreignObject x={56} y={40} width={layout.NODE_W - 70} height={28}>
                        <div className="flex flex-wrap gap-1">
                          <div dangerouslySetInnerHTML={{ __html: '' }} />
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-md border', typeConfig[node.type].className)}>
                            {typeConfig[node.type].label}
                          </span>
                          {asset && (
                            <span
                              className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded-md border',
                                asset.sensitivity === 'high' && 'bg-rose-500/10 text-rose-300 border-rose-500/30',
                                asset.sensitivity === 'medium' && 'bg-violet-500/10 text-violet-300 border-violet-500/30',
                                asset.sensitivity === 'low' && 'bg-sky-500/10 text-sky-300 border-sky-500/30',
                                asset.sensitivity === 'public' && 'bg-slate-500/10 text-slate-300 border-slate-500/30'
                              )}
                            >
                              {asset.sensitivity === 'high' ? '高' : asset.sensitivity === 'medium' ? '中' : asset.sensitivity === 'low' ? '低' : '公'}
                            </span>
                          )}
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </g>
            </svg>

            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-slate-500 glass-card px-3 py-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                中心资产
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400/80" />
                上游
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                下游
              </div>
              <div className="w-px h-4 bg-white/10" />
              <span className="text-slate-600">缩放: {(zoom * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {panelOpen && selectedNode && (
          <div className="w-[360px] shrink-0 glass-card border-l border-white/[0.08] z-30 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <AssetTypeBadge type={selectedNode.type} />
                  {selectedAsset && <SensitivityBadge level={selectedAsset.sensitivity} />}
                </div>
                <h3 className="font-display font-semibold text-base text-white truncate">{selectedNode.name}</h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {selectedAsset ? (
                <div className="p-5 space-y-5">
                  <p className="text-slate-400 text-xs leading-relaxed">{selectedAsset.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/[0.03]">
                      <div className="text-slate-500 mb-1">访问量</div>
                      <div className="font-semibold text-slate-200">{selectedAsset.visitCount.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03]">
                      <div className="text-slate-500 mb-1">字段数</div>
                      <div className="font-semibold text-slate-200">{selectedAsset.fields.length}</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-full bg-violet-400" />
                      <span className="text-xs font-semibold text-slate-300">上游数据源</span>
                      <span className="text-[10px] text-slate-500 ml-auto">{upstreamIds.length} 项</span>
                    </div>
                    {upstreamIds.length === 0 ? (
                      <div className="text-xs text-slate-600 py-3 text-center rounded-xl bg-white/[0.02]">无上游资产</div>
                    ) : (
                      <div className="space-y-1.5">
                        {upstreamIds.map((uid) => {
                          const uAsset = getAssetById(uid);
                          const uMeta = lineageData?.nodes.find((n) => n.id === uid);
                          return (
                            <div
                              key={uid}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-slate-200 truncate">
                                  {uMeta?.name ?? uid}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  {uMeta && (
                                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-md border', typeConfig[uMeta.type].className)}>
                                      {typeConfig[uMeta.type].label}
                                    </span>
                                  )}
                                  {uAsset && (
                                    <span className={cn(
                                      'text-[10px] px-1.5 py-0.5 rounded-md border',
                                      uAsset.sensitivity === 'high' && 'bg-rose-500/10 text-rose-300 border-rose-500/30',
                                      uAsset.sensitivity === 'medium' && 'bg-violet-500/10 text-violet-300 border-violet-500/30',
                                      uAsset.sensitivity === 'low' && 'bg-sky-500/10 text-sky-300 border-sky-500/30',
                                      uAsset.sensitivity === 'public' && 'bg-slate-500/10 text-slate-300 border-slate-500/30'
                                    )}>
                                      {uAsset.sensitivity === 'high' ? '高' : uAsset.sensitivity === 'medium' ? '中' : uAsset.sensitivity === 'low' ? '低' : '公'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedNode(null);
                                  navigate(`/lineage/${uid}`);
                                }}
                                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                                           text-slate-600 hover:text-violet-300 hover:bg-violet-500/10 transition-all
                                           opacity-0 group-hover:opacity-100"
                                title="以此为中心展开"
                              >
                                <GitBranch className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold text-slate-300">下游消费者</span>
                      <span className="text-[10px] text-slate-500 ml-auto">{downstreamIds.length} 项</span>
                    </div>
                    {downstreamIds.length === 0 ? (
                      <div className="text-xs text-slate-600 py-3 text-center rounded-xl bg-white/[0.02]">无下游资产</div>
                    ) : (
                      <div className="space-y-1.5">
                        {downstreamIds.map((did) => {
                          const dAsset = getAssetById(did);
                          const dMeta = lineageData?.nodes.find((n) => n.id === did);
                          return (
                            <div
                              key={did}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-slate-200 truncate">
                                  {dMeta?.name ?? did}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  {dMeta && (
                                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-md border', typeConfig[dMeta.type].className)}>
                                      {typeConfig[dMeta.type].label}
                                    </span>
                                  )}
                                  {dAsset && (
                                    <span className={cn(
                                      'text-[10px] px-1.5 py-0.5 rounded-md border',
                                      dAsset.sensitivity === 'high' && 'bg-rose-500/10 text-rose-300 border-rose-500/30',
                                      dAsset.sensitivity === 'medium' && 'bg-violet-500/10 text-violet-300 border-violet-500/30',
                                      dAsset.sensitivity === 'low' && 'bg-sky-500/10 text-sky-300 border-sky-500/30',
                                      dAsset.sensitivity === 'public' && 'bg-slate-500/10 text-slate-300 border-slate-500/30'
                                    )}>
                                      {dAsset.sensitivity === 'high' ? '高' : dAsset.sensitivity === 'medium' ? '中' : dAsset.sensitivity === 'low' ? '低' : '公'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedNode(null);
                                  navigate(`/lineage/${did}`);
                                }}
                                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                                           text-slate-600 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all
                                           opacity-0 group-hover:opacity-100"
                                title="以此为中心展开"
                              >
                                <GitBranch className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 text-center py-8 text-slate-500 text-xs">暂无详细信息</div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-white/[0.06] space-y-2">
              <Link
                to={`/assets/${selectedNode.id}`}
                onClick={() => setSelectedNode(null)}
                className="btn-primary text-xs w-full text-center py-2.5 flex items-center justify-center gap-1.5"
              >
                查看资产详情
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => {
                  setSelectedNode(null);
                  navigate(`/lineage/${selectedNode.id}`);
                }}
                className="btn-ghost text-xs w-full py-2.5 !bg-violet-500/10 !border-violet-500/30 !text-violet-300 flex items-center justify-center gap-1.5"
              >
                <GitBranch className="w-3.5 h-3.5" />
                以其为中心展开
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
