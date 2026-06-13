import type { LineageData, LineageNode, LineageEdge } from '@/types';

export const globalEdges: LineageEdge[] = [
  { from: 'asset-001', to: 'asset-002' },
  { from: 'asset-003', to: 'asset-002' },
  { from: 'asset-001', to: 'asset-005' },
  { from: 'asset-002', to: 'asset-007' },
  { from: 'asset-002', to: 'asset-004' },
  { from: 'asset-004', to: 'asset-011' },
  { from: 'asset-007', to: 'asset-011' },
  { from: 'asset-005', to: 'asset-008' },
  { from: 'asset-014', to: 'asset-005' },
  { from: 'asset-014', to: 'asset-007' },
  { from: 'asset-014', to: 'asset-008' },
  { from: 'asset-008', to: 'asset-009' },
  { from: 'asset-010', to: 'asset-003' },
  { from: 'asset-010', to: 'asset-013' },
  { from: 'asset-003', to: 'asset-006' },
  { from: 'asset-006', to: 'asset-004' },
  { from: 'asset-015', to: 'asset-012' },
  { from: 'asset-015', to: 'asset-006' },
  { from: 'asset-002', to: 'asset-005' },
];

export const assetMeta: Record<string, { name: string; type: 'table' | 'report' | 'api' }> = {
  'asset-001': { name: 'ods_user_info', type: 'table' },
  'asset-002': { name: 'dws_user_order_summary', type: 'table' },
  'asset-003': { name: 'ods_order_detail', type: 'table' },
  'asset-004': { name: 'rpt_monthly_sales', type: 'report' },
  'asset-005': { name: 'api_user_profile', type: 'api' },
  'asset-006': { name: 'ods_finance_payment', type: 'table' },
  'asset-007': { name: 'rpt_user_growth_daily', type: 'report' },
  'asset-008': { name: 'dwd_risk_event_log', type: 'table' },
  'asset-009': { name: 'api_risk_assessment', type: 'api' },
  'asset-010': { name: 'ods_goods_info', type: 'table' },
  'asset-011': { name: 'rpt_marketing_campaign_effect', type: 'report' },
  'asset-012': { name: 'dws_hr_employee_dim', type: 'table' },
  'asset-013': { name: 'api_goods_search', type: 'api' },
  'asset-014': { name: 'dwd_log_behavior', type: 'table' },
  'asset-015': { name: 'ods_hr_employee_salary', type: 'table' },
};

const downstreamMap = new Map<string, string[]>();
const upstreamMap = new Map<string, string[]>();

for (const edge of globalEdges) {
  let ds = downstreamMap.get(edge.from);
  if (!ds) {
    ds = [];
    downstreamMap.set(edge.from, ds);
  }
  ds.push(edge.to);

  let us = upstreamMap.get(edge.to);
  if (!us) {
    us = [];
    upstreamMap.set(edge.to, us);
  }
  us.push(edge.from);
}

export function computeLineage(centerAssetId: string, maxDepth: number): LineageData {
  const nodeLayers = new Map<string, number>();
  nodeLayers.set(centerAssetId, 0);

  const upQueue: [string, number][] = [[centerAssetId, 0]];
  while (upQueue.length > 0) {
    const [id, depth] = upQueue.shift()!;
    if (depth >= maxDepth) continue;
    const parents = upstreamMap.get(id);
    if (!parents) continue;
    for (const p of parents) {
      if (!nodeLayers.has(p)) {
        const newLayer = -(depth + 1);
        nodeLayers.set(p, newLayer);
        upQueue.push([p, depth + 1]);
      }
    }
  }

  const downQueue: [string, number][] = [[centerAssetId, 0]];
  while (downQueue.length > 0) {
    const [id, depth] = downQueue.shift()!;
    if (depth >= maxDepth) continue;
    const children = downstreamMap.get(id);
    if (!children) continue;
    for (const c of children) {
      if (!nodeLayers.has(c)) {
        const newLayer = depth + 1;
        nodeLayers.set(c, newLayer);
        downQueue.push([c, depth + 1]);
      }
    }
  }

  const nodes: LineageNode[] = [];
  for (const [id, layer] of nodeLayers) {
    const meta = assetMeta[id];
    nodes.push({
      id,
      name: meta ? meta.name : id,
      type: meta ? meta.type : 'table',
      layer,
    });
  }

  const nodeIdSet = new Set(nodeLayers.keys());
  const edges = globalEdges.filter(
    (e) => nodeIdSet.has(e.from) && nodeIdSet.has(e.to),
  );

  return { centerAssetId, nodes, edges };
}

export function getLineageData(assetId: string): LineageData {
  return computeLineage(assetId, 4);
}

export function getUpstreamIds(assetId: string): string[] {
  return upstreamMap.get(assetId) ?? [];
}

export function getDownstreamIds(assetId: string): string[] {
  return downstreamMap.get(assetId) ?? [];
}
