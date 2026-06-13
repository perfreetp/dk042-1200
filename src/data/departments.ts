import type { Department } from '@/types';

export const departments: Department[] = [
  { id: 'dept-1', name: '数据中心', parentId: null },
  { id: 'dept-1-1', name: '数据开发部', parentId: 'dept-1' },
  { id: 'dept-1-2', name: '数据治理部', parentId: 'dept-1' },
  { id: 'dept-2', name: '营销部', parentId: null },
  { id: 'dept-2-1', name: '用户增长组', parentId: 'dept-2' },
  { id: 'dept-2-2', name: '品牌运营组', parentId: 'dept-2' },
  { id: 'dept-3', name: '财务部', parentId: null },
  { id: 'dept-3-1', name: '财务分析组', parentId: 'dept-3' },
  { id: 'dept-4', name: '人力资源部', parentId: null },
  { id: 'dept-5', name: '风控部', parentId: null },
];
