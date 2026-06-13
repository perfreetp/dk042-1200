import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import StatusBadge from '@/components/StatusBadge';
import ApplyModal from '@/components/ApplyModal';
import type { ApplicationStatus, Application } from '@/types';
import {
  FileText,
  Plus,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  MessageSquare,
  Calendar,
  User,
  Send,
  Check,
  X,
  Search,
  ArrowUpRight,
  X as XIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

type TimeRange = '7d' | '30d' | '90d' | 'all';

const filterTabs: { key: 'all' | ApplicationStatus; label: string; icon: typeof Clock }[] = [
  { key: 'all', label: '全部', icon: FileText },
  { key: 'pending', label: '待审批', icon: Clock },
  { key: 'approved', label: '已通过', icon: CheckCircle },
  { key: 'rejected', label: '已驳回', icon: XCircle },
];

const timeRangeOptions: { key: TimeRange; label: string }[] = [
  { key: '7d', label: '近7天' },
  { key: '30d', label: '近30天' },
  { key: '90d', label: '近90天' },
  { key: 'all', label: '全部' },
];

function getTimeRangeMs(range: TimeRange): number | null {
  if (range === 'all') return null;
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  return days * 24 * 60 * 60 * 1000;
}

function ApprovalTimeline({ app, formatDate }: { app: Application; formatDate: (t: string) => string }) {
  const isApproved = app.status === 'approved';
  const isRejected = app.status === 'rejected';
  const isPending = app.status === 'pending';

  const purposeSummary = app.purpose.length > 40 ? app.purpose.slice(0, 40) + '...' : app.purpose;

  return (
    <div className="relative pl-8">
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/[0.08]" />

      <div className="relative pb-6">
        <div
          className={cn(
            'absolute left-[-21px] top-1 w-[22px] h-[22px] rounded-full flex items-center justify-center',
            'bg-blue-500/20 border-2 border-blue-400'
          )}
        >
          <ArrowUpRight className="w-3 h-3 text-blue-400" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-medium text-blue-300 mb-1">提交申请</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-cyan-400" />
              {app.applicantName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-violet-400" />
              {formatDate(app.submitTime)}
            </span>
          </div>
          <div className="mt-1.5 text-xs text-slate-500 bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.04]">
            {purposeSummary}
          </div>
        </div>
      </div>

      {isPending ? (
        <div className="relative">
          <div
            className={cn(
              'absolute left-[-21px] top-1 w-[22px] h-[22px] rounded-full flex items-center justify-center',
              'bg-amber-500/10 border-2 border-dashed border-amber-400/60'
            )}
          >
            <Clock className="w-3 h-3 text-amber-400" />
          </div>
          <div className="ml-2">
            <div className="text-sm font-medium text-amber-300 mb-1">等待审批中</div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden max-w-[120px]">
                <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 animate-pulse" />
              </div>
              <span>审批进行中...</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div
            className={cn(
              'absolute left-[-21px] top-1 w-[22px] h-[22px] rounded-full flex items-center justify-center',
              isApproved && 'bg-emerald-500/20 border-2 border-emerald-400',
              isRejected && 'bg-rose-500/20 border-2 border-rose-400'
            )}
          >
            {isApproved && <Check className="w-3 h-3 text-emerald-400" />}
            {isRejected && <X className="w-3 h-3 text-rose-400" />}
          </div>
          <div className="ml-2">
            <div
              className={cn(
                'text-sm font-medium mb-1',
                isApproved ? 'text-emerald-300' : 'text-rose-300'
              )}
            >
              {isApproved ? '审批通过' : '审批驳回'}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              {app.approverName && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-cyan-400" />
                  {app.approverName}
                </span>
              )}
              {app.approvalTime && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-violet-400" />
                  {formatDate(app.approvalTime)}
                </span>
              )}
            </div>
            {app.approvalComment && (
              <div
                className={cn(
                  'mt-1.5 text-xs rounded-lg px-3 py-2 border',
                  isApproved
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300'
                    : 'bg-rose-500/5 border-rose-500/20 text-slate-300'
                )}
              >
                {app.approvalComment}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterTag {
  key: string;
  label: string;
  onClear: () => void;
}

export default function Applications() {
  const { applications, submitApplication, setShowApplyModal, approveApplication, rejectApplication } = useAppStore();
  const [filter, setFilter] = useState<'all' | ApplicationStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState('');
  const [replyId, setReplyId] = useState<string | null>(null);

  const [applicantSearch, setApplicantSearch] = useState('');
  const [assetSearch, setAssetSearch] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  const filtered = useMemo(() => {
    const now = Date.now();
    const rangeMs = getTimeRangeMs(timeRange);

    return applications.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false;

      if (applicantSearch.trim()) {
        const kw = applicantSearch.trim().toLowerCase();
        if (!a.applicantName.toLowerCase().includes(kw)) return false;
      }

      if (assetSearch.trim()) {
        const kw = assetSearch.trim().toLowerCase();
        if (!a.assetName.toLowerCase().includes(kw)) return false;
      }

      if (rangeMs !== null) {
        const submitMs = new Date(a.submitTime.replace(/-/g, '/')).getTime();
        if (now - submitMs > rangeMs) return false;
      }

      return true;
    });
  }, [applications, filter, applicantSearch, assetSearch, timeRange]);

  const counts = useMemo(() => ({
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }), [applications]);

  const filterTags: FilterTag[] = useMemo(() => {
    const tags: FilterTag[] = [];
    if (applicantSearch.trim()) {
      tags.push({
        key: 'applicant',
        label: `申请人: ${applicantSearch.trim()}`,
        onClear: () => setApplicantSearch(''),
      });
    }
    if (assetSearch.trim()) {
      tags.push({
        key: 'asset',
        label: `资产: ${assetSearch.trim()}`,
        onClear: () => setAssetSearch(''),
      });
    }
    if (timeRange !== 'all') {
      const label = timeRangeOptions.find((o) => o.key === timeRange)?.label ?? '';
      tags.push({
        key: 'timeRange',
        label: `时间: ${label}`,
        onClear: () => setTimeRange('all'),
      });
    }
    return tags;
  }, [applicantSearch, assetSearch, timeRange]);

  const hasActiveFilters = filterTags.length > 0;

  const clearAllFilters = () => {
    setApplicantSearch('');
    setAssetSearch('');
    setTimeRange('all');
    setFilter('all');
  };

  const handleApprove = (app: Application) => {
    if (replyId === app.id && replyComment.trim()) {
      approveApplication(app.id, replyComment.trim());
      setReplyId(null);
      setReplyComment('');
    } else {
      setReplyId(app.id);
    }
  };

  const handleReject = (app: Application) => {
    if (replyId === app.id && replyComment.trim()) {
      rejectApplication(app.id, replyComment.trim());
      setReplyId(null);
      setReplyComment('');
    } else {
      setReplyId(app.id);
    }
  };

  const formatDate = (time: string) => {
    const [date, hm] = time.split(' ');
    const hhmm = hm.slice(0, 5);
    return `${date} ${hhmm}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white mb-1 flex items-center gap-3">
            <FileText className="w-7 h-7 text-cyan-400" />
            申请记录
          </h1>
          <p className="text-sm text-slate-500">管理数据资产使用申请，跟踪审批进度</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          提交新申请
        </button>
      </div>

      <div className="glass-card p-1.5 gradient-border inline-flex items-center gap-1 fade-in-up">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-md font-semibold',
                isActive ? 'bg-cyan-500/20 text-cyan-200' : 'bg-white/[0.06] text-slate-500'
              )}>
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="glass-card gradient-border p-4 space-y-4 fade-in-up">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={applicantSearch}
              onChange={(e) => setApplicantSearch(e.target.value)}
              placeholder="搜索申请人..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/[0.08] text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/40 transition-all"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
              placeholder="搜索资产名..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/[0.08] text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/40 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 mr-1">时间范围：</span>
          {timeRangeOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTimeRange(opt.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                timeRange === opt.key
                  ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                  : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
            <span className="text-xs text-slate-500">筛选条件：</span>
            {filterTags.map((tag) => (
              <span
                key={tag.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-300"
              >
                {tag.label}
                <button
                  onClick={tag.onClear}
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-cyan-500/20 transition-colors"
                >
                  <XIcon className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors ml-2"
            >
              清除全部
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <span className="text-xs text-slate-500">
            共 <span className="text-cyan-300 font-medium">{filtered.length}</span> 条结果
          </span>
          {hasActiveFilters && (
            <span className="text-[10px] text-slate-600">已启用多维筛选</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((app, idx) => {
            const isExpanded = expandedId === app.id;
            const staggerClass = `stagger-${(idx % 6) + 1}`;
            const isReplying = replyId === app.id;
            return (
              <div
                key={app.id}
                className={cn(
                  'glass-card gradient-border overflow-hidden fade-in-up',
                  staggerClass
                )}
              >
                <div
                  className="p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-2xl flex items-center justify-center',
                          app.status === 'approved' && 'bg-emerald-500/15',
                          app.status === 'pending' && 'bg-amber-500/15',
                          app.status === 'rejected' && 'bg-rose-500/15'
                        )}
                      >
                        <FileText
                          className={cn(
                            'w-6 h-6',
                            app.status === 'approved' && 'text-emerald-400',
                            app.status === 'pending' && 'text-amber-400',
                            app.status === 'rejected' && 'text-rose-400'
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <Link
                          to={`/assets/${app.assetId}`}
                          className="font-display font-semibold text-slate-100 hover:text-cyan-300 transition-colors text-base"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {app.assetName}
                        </Link>
                        <StatusBadge status={app.status} size="md" />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <User className="w-3.5 h-3.5 text-cyan-400" />
                          申请人：<span className="text-slate-300">{app.applicantName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-violet-400" />
                          提交时间：<span className="text-slate-300">{formatDate(app.submitTime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          期限：<span className="text-slate-300">{app.duration}</span>
                        </div>
                        {app.approverName && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            审批人：<span className="text-slate-300">{app.approverName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-cyan-300 transition-colors flex-shrink-0',
                        isExpanded && 'rotate-180 text-cyan-400'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : app.id);
                      }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-white/[0.06] space-y-5 fade-in-up">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          审批时间线
                        </div>
                        <ApprovalTimeline app={app} formatDate={formatDate} />
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          申请详情
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="text-[10px] text-slate-600 mb-1">申请用途</div>
                            <p className="text-sm text-slate-300 leading-relaxed">{app.purpose}</p>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-slate-500">
                              使用期限：<span className="text-slate-300">{app.duration}</span>
                            </span>
                            <span className="text-slate-500">
                              资产：<span className="text-slate-300">{app.assetName}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {app.status === 'pending' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                          <span className="text-xs text-slate-500">审批操作：</span>
                          <button
                            onClick={() => handleApprove(app)}
                            className={cn(
                              'text-xs px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5',
                              isReplying
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15'
                            )}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {isReplying ? '确认通过' : '通过申请'}
                          </button>
                          <button
                            onClick={() => handleReject(app)}
                            className={cn(
                              'text-xs px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5',
                              isReplying
                                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/15'
                            )}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {isReplying ? '确认驳回' : '驳回申请'}
                          </button>
                          {isReplying && (
                            <button
                              onClick={() => {
                                setReplyId(null);
                                setReplyComment('');
                              }}
                              className="text-xs px-4 py-2 rounded-xl font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                            >
                              取消
                            </button>
                          )}
                        </div>

                        {isReplying && (
                          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] fade-in-up">
                            <div className="text-xs text-slate-500 mb-2">请填写审批意见：</div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={replyComment}
                                onChange={(e) => setReplyComment(e.target.value)}
                                placeholder="输入审批意见..."
                                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/[0.08] text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/40 transition-all"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  if (replyComment.trim()) {
                                    if (replyComment.includes('驳回') || replyComment.includes('不同意') || replyComment.includes('拒绝')) {
                                      handleReject(app);
                                    } else {
                                      handleApprove(app);
                                    }
                                  }
                                }}
                                className="px-4 py-2.5 rounded-xl btn-primary text-sm flex items-center gap-1.5"
                              >
                                <Send className="w-3.5 h-3.5" />
                                提交
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="glass-card p-16 text-center gradient-border">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-5">
              <Filter className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="font-display font-semibold text-slate-200 mb-2">暂无匹配的申请记录</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              尝试切换筛选条件或提交新的数据使用申请
            </p>
            <button
              onClick={() => setShowApplyModal(true)}
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              提交新申请
            </button>
          </div>
        )}
      </div>

      <ApplyModal />
    </div>
  );
}
