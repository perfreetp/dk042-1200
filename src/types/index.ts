export type SensitivityLevel = 'high' | 'medium' | 'low' | 'public';

export type AssetType = 'table' | 'report' | 'api';

export interface Department {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
}

export interface Owner {
  id: string;
  name: string;
  avatar: string;
  department: string;
  email: string;
  phone: string;
}

export interface Field {
  name: string;
  type: string;
  description: string;
  sensitivity: SensitivityLevel;
  isPrimary?: boolean;
  isNullable?: boolean;
}

export interface DataAsset {
  id: string;
  name: string;
  type: AssetType;
  description: string;
  departmentId: string;
  subjectId: string;
  ownerId: string;
  sensitivity: SensitivityLevel;
  fields: Field[];
  createTime: string;
  updateTime: string;
  visitCount: number;
  lastVisitTime: string;
  rowCount?: number;
  isFavorite: boolean;
}

export interface LineageNode {
  id: string;
  name: string;
  type: AssetType;
  layer: number;
}

export interface LineageEdge {
  from: string;
  to: string;
}

export interface LineageData {
  centerAssetId: string;
  nodes: LineageNode[];
  edges: LineageEdge[];
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'resubmitted';

export interface TimelineEvent {
  type: 'submit' | 'approve' | 'reject' | 'resubmit' | 'comment';
  time: string;
  actorName: string;
  comment?: string;
}

export interface Application {
  id: string;
  assetId: string;
  assetName: string;
  applicantId: string;
  applicantName: string;
  purpose: string;
  duration: string;
  submitTime: string;
  status: ApplicationStatus;
  approverId?: string;
  approverName?: string;
  approvalTime?: string;
  approvalComment?: string;
  timeline: TimelineEvent[];
}

export interface SubmitAppData {
  assetId: string;
  assetName: string;
  purpose: string;
  duration: string;
}
