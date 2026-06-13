import { create } from 'zustand';
import type { AssetType, Application, SubmitAppData } from '@/types';
import { assets as initialAssets } from '@/data/assets';
import { initialApplications } from '@/data/applications';
import { departments } from '@/data/departments';
import type { DataAsset } from '@/types';
import type { Department } from '@/types';

interface AppStore {
  searchKeyword: string;
  selectedDepartmentId: string | null;
  selectedSubjectId: string | null;
  selectedAssetType: AssetType | null;

  favoriteIds: string[];
  applications: Application[];
  assets: DataAsset[];
  showApplyModal: boolean;
  applyModalAssetId: string | null;

  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  submitApplication: (data: SubmitAppData) => void;
  setSearchKeyword: (kw: string) => void;
  setSelectedDepartment: (id: string | null) => void;
  setSelectedSubject: (id: string | null) => void;
  setSelectedAssetType: (type: AssetType | null) => void;
  setShowApplyModal: (show: boolean, assetId?: string) => void;
  approveApplication: (id: string) => void;
  rejectApplication: (id: string) => void;
  addApprovalComment: (id: string, comment: string) => void;
  resubmitApplication: (id: string, supplement: string) => void;
  getAssetById: (id: string) => DataAsset | undefined;
  filteredAssets: () => DataAsset[];

  compareIds: string[];
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
  showComparePanel: boolean;
  setShowComparePanel: (show: boolean) => void;
}

const loadFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem('data-asset-favorites');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveFavorites = (ids: string[]) => {
  try {
    localStorage.setItem('data-asset-favorites', JSON.stringify(ids));
  } catch {
    // ignore
  }
};

const loadApplications = (): Application[] => {
  try {
    const stored = localStorage.getItem('data-asset-applications');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return initialApplications;
};

const saveApplications = (apps: Application[]) => {
  try {
    localStorage.setItem('data-asset-applications', JSON.stringify(apps));
  } catch {
    // ignore
  }
};

const getDepartmentAndChildrenIds = (deptId: string, allDepts: Department[]): string[] => {
  const ids: string[] = [deptId];
  const children = allDepts.filter((d) => d.parentId === deptId);
  children.forEach((child) => {
    ids.push(...getDepartmentAndChildrenIds(child.id, allDepts));
  });
  return ids;
};

export const useAppStore = create<AppStore>((set, get) => ({
  searchKeyword: '',
  selectedDepartmentId: null,
  selectedSubjectId: null,
  selectedAssetType: null,
  favoriteIds: loadFavorites(),
  applications: loadApplications(),
  assets: initialAssets.map((a) => ({
    ...a,
    isFavorite: loadFavorites().includes(a.id),
  })),
  showApplyModal: false,
  applyModalAssetId: null,

  toggleFavorite: (id: string) => {
    const { favoriteIds } = get();
    const newFavs = favoriteIds.includes(id)
      ? favoriteIds.filter((f) => f !== id)
      : [...favoriteIds, id];
    saveFavorites(newFavs);
    set({
      favoriteIds: newFavs,
      assets: get().assets.map((a) =>
        a.id === id ? { ...a, isFavorite: !a.isFavorite } : a
      ),
    });
  },

  isFavorite: (id: string) => get().favoriteIds.includes(id),

  submitApplication: (data: SubmitAppData) => {
    const submitTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    const applicantName = '当前用户';
    const newApp: Application = {
      id: `app-${Date.now()}`,
      assetId: data.assetId,
      assetName: data.assetName,
      applicantId: 'current-user',
      applicantName,
      purpose: data.purpose,
      duration: data.duration,
      submitTime,
      status: 'pending',
      timeline: [{ type: 'submit', time: submitTime, actorName: applicantName, comment: data.purpose }],
    };
    const newApps = [newApp, ...get().applications];
    saveApplications(newApps);
    set({
      applications: newApps,
      showApplyModal: false,
      applyModalAssetId: null,
    });
  },

  setSearchKeyword: (kw: string) => set({ searchKeyword: kw }),
  setSelectedDepartment: (id: string | null) => set({ selectedDepartmentId: id }),
  setSelectedSubject: (id: string | null) => set({ selectedSubjectId: id }),
  setSelectedAssetType: (type: AssetType | null) => set({ selectedAssetType: type }),

  setShowApplyModal: (show: boolean, assetId?: string) =>
    set({ showApplyModal: show, applyModalAssetId: assetId || null }),

  approveApplication: (id: string) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    const approverName = '当前负责人';
    const newApps = get().applications.map((app) =>
      app.id === id
        ? {
            ...app,
            status: 'approved' as const,
            approverId: 'current-owner',
            approverName,
            approvalTime: now,
            timeline: [...app.timeline, { type: 'approve' as const, time: now, actorName: approverName }],
          }
        : app
    );
    saveApplications(newApps);
    set({ applications: newApps });
  },

  rejectApplication: (id: string) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    const approverName = '当前负责人';
    const newApps = get().applications.map((app) =>
      app.id === id
        ? {
            ...app,
            status: 'rejected' as const,
            approverId: 'current-owner',
            approverName,
            approvalTime: now,
            timeline: [...app.timeline, { type: 'reject' as const, time: now, actorName: approverName }],
          }
        : app
    );
    saveApplications(newApps);
    set({ applications: newApps });
  },

  addApprovalComment: (id: string, comment: string) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    const actorName = '当前负责人';
    const newApps = get().applications.map((app) =>
      app.id === id
        ? {
            ...app,
            timeline: [...app.timeline, { type: 'comment' as const, time: now, actorName, comment }],
          }
        : app
    );
    saveApplications(newApps);
    set({ applications: newApps });
  },

  resubmitApplication: (id: string, supplement: string) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    const applicantName = '当前用户';
    const newApps = get().applications.map((app) =>
      app.id === id
        ? {
            ...app,
            status: 'resubmitted' as const,
            approverId: undefined,
            approverName: undefined,
            approvalTime: undefined,
            timeline: [...app.timeline, { type: 'resubmit' as const, time: now, actorName: applicantName, comment: supplement }],
          }
        : app
    );
    saveApplications(newApps);
    set({ applications: newApps });
  },

  getAssetById: (id: string) => get().assets.find((a) => a.id === id),

  filteredAssets: () => {
    const { assets, searchKeyword, selectedDepartmentId, selectedSubjectId, selectedAssetType } = get();
    let allowedDeptIds: Set<string> | null = null;
    if (selectedDepartmentId) {
      allowedDeptIds = new Set(getDepartmentAndChildrenIds(selectedDepartmentId, departments));
    }
    return assets.filter((asset) => {
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        if (
          !asset.name.toLowerCase().includes(kw) &&
          !asset.description.toLowerCase().includes(kw) &&
          !asset.fields.some((f) => f.name.toLowerCase().includes(kw))
        ) {
          return false;
        }
      }
      if (allowedDeptIds && !allowedDeptIds.has(asset.departmentId)) {
        return false;
      }
      if (selectedSubjectId && asset.subjectId !== selectedSubjectId) {
        return false;
      }
      if (selectedAssetType && asset.type !== selectedAssetType) {
        return false;
      }
      return true;
    });
  },

  compareIds: [],
  addToCompare: (id: string) => {
    const { compareIds } = get();
    if (compareIds.length >= 3 || compareIds.includes(id)) return;
    set({ compareIds: [...compareIds, id] });
  },
  removeFromCompare: (id: string) => {
    set({ compareIds: get().compareIds.filter((cid) => cid !== id) });
  },
  clearCompare: () => set({ compareIds: [] }),
  isInCompare: (id: string) => get().compareIds.includes(id),
  showComparePanel: false,
  setShowComparePanel: (show: boolean) => set({ showComparePanel: show }),
}));
