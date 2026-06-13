import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Database,
  Map,
  Network,
  TrendingUp,
  FileText,
  Compass,
  Star,
  User,
  Bell,
  Search,
  ChevronRight,
  FolderTree,
  Tags,
} from 'lucide-react';
import { useState } from 'react';
import { departments } from '@/data/departments';
import { subjects } from '@/data/subjects';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { Department } from '@/types';

const navItems = [
  { path: '/', label: '资产地图', icon: Map, end: true },
  { path: '/ranking', label: '使用排行', icon: TrendingUp },
  { path: '/applications', label: '申请记录', icon: FileText },
];

function getChildDepartments(depts: Department[], parentId: string | null): Department[] {
  return depts.filter((d) => d.parentId === parentId);
}

function Sidebar() {
  const { pathname } = useLocation();
  const [expandDept, setExpandDept] = useState<Record<string, boolean>>({});
  const [expandSubject, setExpandSubject] = useState<Record<string, boolean>>({ all: true });
  const [activeTab, setActiveTab] = useState<'dept' | 'subject'>('dept');
  const {
    selectedDepartmentId,
    setSelectedDepartment,
    selectedSubjectId,
    setSelectedSubject,
  } = useAppStore();

  const toggleDept = (id: string) =>
    setExpandDept((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderDeptTree = (parentId: string | null, level = 0) => {
    const children = getChildDepartments(departments, parentId);
    return children.map((dept) => {
      const hasChildren = departments.some((d) => d.parentId === dept.id);
      const isExpanded = expandDept[dept.id];
      const isSelected = selectedDepartmentId === dept.id;
      return (
        <div key={dept.id}>
          <div
            className={cn(
              'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 group',
              isSelected
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border-l-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            )}
            style={{ paddingLeft: 12 + level * 16 }}
            onClick={() => {
              setSelectedDepartment(isSelected ? null : dept.id);
              setSelectedSubject(null);
            }}
          >
            {hasChildren ? (
              <ChevronRight
                className={cn(
                  'w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0',
                  isExpanded && 'rotate-90'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDept(dept.id);
                }}
              />
            ) : (
              <span className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            <FolderTree className="w-4 h-4 flex-shrink-0 opacity-60" />
            <span className="text-sm truncate">{dept.name}</span>
          </div>
          {hasChildren && isExpanded && (
            <div className="mt-0.5">{renderDeptTree(dept.id, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <aside className="w-64 flex-shrink-0 h-screen sticky top-0 border-r border-white/[0.06] bg-slate-950/50 backdrop-blur-xl">
      <Link to="/" className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 flex items-center justify-center glow-cyan">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-display font-bold text-base gradient-text">
            DataAtlas
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">
            Asset Map
          </div>
        </div>
      </Link>

      <nav className="px-3 py-4 border-b border-white/[0.06]">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest px-3 mb-2">
          导航
        </div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.end ? pathname === item.path : pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/5 text-cyan-300 shadow-lg shadow-cyan-500/10 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive && 'text-cyan-400')} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {pathname === '/' && (
        <div className="px-3 py-4 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest px-3 mb-3">
            分类浏览
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4 mx-2">
            <button
              onClick={() => setActiveTab('dept')}
              className={cn(
                'flex-1 text-xs py-1.5 rounded-lg font-medium transition-all',
                activeTab === 'dept'
                  ? 'bg-white/[0.08] text-cyan-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              按部门
            </button>
            <button
              onClick={() => setActiveTab('subject')}
              className={cn(
                'flex-1 text-xs py-1.5 rounded-lg font-medium transition-all',
                activeTab === 'subject'
                  ? 'bg-white/[0.08] text-cyan-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              按主题
            </button>
          </div>

          {activeTab === 'dept' ? (
            <div className="space-y-0.5 px-2">
              {selectedDepartmentId && (
                <button
                  onClick={() => setSelectedDepartment(null)}
                  className="w-full flex items-center gap-2 px-3 py-2 mb-2 text-xs text-cyan-400 hover:text-cyan-300 rounded-lg hover:bg-cyan-500/5 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>清除筛选 · 查看全部</span>
                </button>
              )}
              {renderDeptTree(null)}
            </div>
          ) : (
            <div className="space-y-0.5 px-2">
              {selectedSubjectId && (
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="w-full flex items-center gap-2 px-3 py-2 mb-2 text-xs text-cyan-400 hover:text-cyan-300 rounded-lg hover:bg-cyan-500/5 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>清除筛选 · 查看全部</span>
                </button>
              )}
              {subjects.map((sub) => {
                const isSelected = selectedSubjectId === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubject(isSelected ? null : sub.id);
                      setSelectedDepartment(null);
                    }}
                    className={cn(
                      'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all duration-200',
                      isSelected
                        ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/10 text-cyan-300 border-l-2 border-violet-400'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    )}
                  >
                    <Tags className="w-4 h-4 flex-shrink-0 opacity-60" />
                    <span className="text-sm truncate">{sub.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold glow-cyan">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-200">数据管理员</div>
            <div className="text-[10px] text-slate-500 truncate">admin@company.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  const { searchKeyword, setSearchKeyword } = useAppStore();

  return (
    <header className="h-16 flex items-center gap-4 px-6 border-b border-white/[0.06] bg-slate-950/30 backdrop-blur-xl sticky top-0 z-30">
      <div className="relative flex-1 max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="搜索表、报表、接口...（支持名称、描述、字段名）"
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm
                     text-slate-200 placeholder-slate-500 outline-none
                     focus:border-cyan-500/40 focus:bg-white/[0.05] focus:shadow-lg focus:shadow-cyan-500/5
                     transition-all duration-200"
        />
        {searchKeyword && (
          <button
            onClick={() => setSearchKeyword('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10
                       flex items-center justify-center text-slate-400 hover:text-slate-200 text-xs transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="relative w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center
                           text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all">
          <Star className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500
                           text-[10px] font-bold flex items-center justify-center text-white">3</span>
        </button>
        <button className="relative w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center
                           text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1" />
        <button className="btn-primary text-sm flex items-center gap-2 py-2">
          <Network className="w-4 h-4" />
          <span className="hidden md:inline">血缘分析</span>
        </button>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-950 bg-grid-pattern relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
