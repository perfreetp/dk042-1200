import { create } from 'zustand';
import type { AssetType, Application, SubmitAppData } from '@/types';
import { assets as initialAssets } from '@/data/assets';
import { initialApplications } from '@/data/applications';
import type { DataAsset } from '@/types';

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
  approveApplication: (id: string, comment: string) => void;
  rejectApplication: (id: string, comment: string) => void;
  getAssetById: (id: string) => DataAsset | undefined;
  filteredAssets: () => DataAsset[];
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

export const useAppStore = create<AppStore>((set, get) => ({
  searchKeyword: '',
  selectedDepartmentId: null,
  selectedSubjectId: null,
  selectedAssetType: null,
  favoriteIds: loadFavorites(),
  applications: initialApplications,
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
    const newApp: Application = {
      id: `app-${Date.now()}`,
      assetId: data.assetId,
      assetName: data.assetName,
      applicantId: 'current-user',
      applicantName: '当前用户',
      purpose: data.purpose,
      duration: data.duration,
      submitTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      status: 'pending',
    };
    set({
      applications: [newApp, ...get().applications],
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

  approveApplication: (id: string, comment: string) => {
    set({
      applications: get().applications.map((app) =>
        app.id === id
          ? {
              ...app,
              status: 'approved',
              approverId: 'current-owner',
              approverName: '当前负责人',
              approvalTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
              approvalComment: comment || '申请通过。',
            }
          : app
      ),
    });
  },

  rejectApplication: (id: string, comment: string) => {
    set({
      applications: get().applications.map((app) =>
        app.id === id
          ? {
              ...app,
              status: 'rejected',
              approverId: 'current-owner',
              approverName: '当前负责人',
              approvalTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
              approvalComment: comment || '申请被驳回。',
            }
          : app
      ),
    });
  },

  getAssetById: (id: string) => get().assets.find((a) => a.id === id),

  filteredAssets: () => {
    const { assets, searchKeyword, selectedDepartmentId, selectedSubjectId, selectedAssetType } = get();
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
      if (selectedDepartmentId) {
        const deptPrefix = selectedDepartmentId;
        if (!asset.departmentId.startsWith(deptPrefix.split('-').slice(0, 2).join('-')) && asset.departmentId !== selectedDepartmentId) {
          return false;
        }
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
}));
