import type { LineageData } from '@/types';

export const lineageMap: Record<string, LineageData> = {
  'asset-001': {
    centerAssetId: 'asset-001',
    nodes: [
      { id: 'asset-001', name: 'ods_user_info', type: 'table', layer: 0 },
      { id: 'asset-002', name: 'dws_user_order_summary', type: 'table', layer: 1 },
      { id: 'asset-005', name: 'api_user_profile', type: 'api', layer: 1 },
      { id: 'asset-003', name: 'ods_order_detail', type: 'table', layer: -1 },
      { id: 'asset-007', name: 'rpt_user_growth_daily', type: 'report', layer: 2 },
      { id: 'asset-014', name: 'dwd_log_behavior', type: 'table', layer: -1 },
    ],
    edges: [
      { from: 'asset-001', to: 'asset-002' },
      { from: 'asset-001', to: 'asset-005' },
      { from: 'asset-003', to: 'asset-002' },
      { from: 'asset-002', to: 'asset-007' },
      { from: 'asset-014', to: 'asset-005' },
    ],
  },
  'asset-002': {
    centerAssetId: 'asset-002',
    nodes: [
      { id: 'asset-002', name: 'dws_user_order_summary', type: 'table', layer: 0 },
      { id: 'asset-001', name: 'ods_user_info', type: 'table', layer: -1 },
      { id: 'asset-003', name: 'ods_order_detail', type: 'table', layer: -1 },
      { id: 'asset-007', name: 'rpt_user_growth_daily', type: 'report', layer: 1 },
      { id: 'asset-005', name: 'api_user_profile', type: 'api', layer: 1 },
      { id: 'asset-011', name: 'rpt_marketing_campaign_effect', type: 'report', layer: 2 },
    ],
    edges: [
      { from: 'asset-001', to: 'asset-002' },
      { from: 'asset-003', to: 'asset-002' },
      { from: 'asset-002', to: 'asset-007' },
      { from: 'asset-002', to: 'asset-005' },
      { from: 'asset-007', to: 'asset-011' },
    ],
  },
  'asset-003': {
    centerAssetId: 'asset-003',
    nodes: [
      { id: 'asset-003', name: 'ods_order_detail', type: 'table', layer: 0 },
      { id: 'asset-002', name: 'dws_user_order_summary', type: 'table', layer: 1 },
      { id: 'asset-006', name: 'ods_finance_payment', type: 'table', layer: -1 },
      { id: 'asset-010', name: 'ods_goods_info', type: 'table', layer: -1 },
      { id: 'asset-004', name: 'rpt_monthly_sales', type: 'report', layer: 2 },
      { id: 'asset-005', name: 'api_user_profile', type: 'api', layer: 2 },
    ],
    edges: [
      { from: 'asset-003', to: 'asset-002' },
      { from: 'asset-006', to: 'asset-003' },
      { from: 'asset-010', to: 'asset-003' },
      { from: 'asset-002', to: 'asset-004' },
      { from: 'asset-002', to: 'asset-005' },
    ],
  },
  'asset-004': {
    centerAssetId: 'asset-004',
    nodes: [
      { id: 'asset-004', name: 'rpt_monthly_sales', type: 'report', layer: 0 },
      { id: 'asset-002', name: 'dws_user_order_summary', type: 'table', layer: -1 },
      { id: 'asset-003', name: 'ods_order_detail', type: 'table', layer: -2 },
      { id: 'asset-010', name: 'ods_goods_info', type: 'table', layer: -2 },
      { id: 'asset-011', name: 'rpt_marketing_campaign_effect', type: 'report', layer: 1 },
    ],
    edges: [
      { from: 'asset-002', to: 'asset-004' },
      { from: 'asset-003', to: 'asset-002' },
      { from: 'asset-010', to: 'asset-003' },
      { from: 'asset-004', to: 'asset-011' },
    ],
  },
  'asset-005': {
    centerAssetId: 'asset-005',
    nodes: [
      { id: 'asset-005', name: 'api_user_profile', type: 'api', layer: 0 },
      { id: 'asset-001', name: 'ods_user_info', type: 'table', layer: -2 },
      { id: 'asset-002', name: 'dws_user_order_summary', type: 'table', layer: -1 },
      { id: 'asset-014', name: 'dwd_log_behavior', type: 'table', layer: -1 },
      { id: 'asset-008', name: 'dwd_risk_event_log', type: 'table', layer: 1 },
      { id: 'asset-009', name: 'api_risk_assessment', type: 'api', layer: 2 },
    ],
    edges: [
      { from: 'asset-001', to: 'asset-002' },
      { from: 'asset-002', to: 'asset-005' },
      { from: 'asset-014', to: 'asset-005' },
      { from: 'asset-005', to: 'asset-008' },
      { from: 'asset-008', to: 'asset-009' },
    ],
  },
  'asset-006': {
    centerAssetId: 'asset-006',
    nodes: [
      { id: 'asset-006', name: 'ods_finance_payment', type: 'table', layer: 0 },
      { id: 'asset-003', name: 'ods_order_detail', type: 'table', layer: 1 },
      { id: 'asset-004', name: 'rpt_monthly_sales', type: 'report', layer: 2 },
      { id: 'asset-015', name: 'ods_hr_employee_salary', type: 'table', layer: -1 },
    ],
    edges: [
      { from: 'asset-006', to: 'asset-003' },
      { from: 'asset-003', to: 'asset-004' },
      { from: 'asset-015', to: 'asset-006' },
    ],
  },
};

export const getLineageData = (assetId: string): LineageData => {
  if (lineageMap[assetId]) return lineageMap[assetId];
  return {
    centerAssetId: assetId,
    nodes: [{ id: assetId, name: assetId, type: 'table', layer: 0 }],
    edges: [],
  };
};
