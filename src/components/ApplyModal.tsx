import { useState } from 'react';
import Modal from './Modal';
import { useAppStore } from '@/store/useAppStore';
import { FileText, Calendar, AlertCircle } from 'lucide-react';

export default function ApplyModal() {
  const { showApplyModal, setShowApplyModal, applyModalAssetId, submitApplication, getAssetById, assets } = useAppStore();
  const asset = applyModalAssetId ? getAssetById(applyModalAssetId) : undefined;

  const [form, setForm] = useState({
    purpose: '',
    duration: '30天',
    selectedAssetId: applyModalAssetId || '',
  });
  const [errors, setErrors] = useState<{ purpose?: string }>({});

  const handleClose = () => {
    setShowApplyModal(false);
    setForm({ purpose: '', duration: '30天', selectedAssetId: '' });
    setErrors({});
  };

  const handleSubmit = () => {
    const newErrors: { purpose?: string } = {};
    if (!form.purpose.trim()) {
      newErrors.purpose = '请填写使用用途';
    }
    const assetId = asset?.id || form.selectedAssetId;
    if (!assetId) {
      newErrors.purpose = '请选择数据资产';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const targetAsset = asset || assets.find((a) => a.id === form.selectedAssetId);
    if (targetAsset) {
      submitApplication({
        assetId: targetAsset.id,
        assetName: targetAsset.name,
        purpose: form.purpose,
        duration: form.duration,
      });
      setForm({ purpose: '', duration: '30天', selectedAssetId: '' });
    }
  };

  return (
    <Modal
      open={showApplyModal}
      onClose={handleClose}
      title="数据使用申请"
      size="lg"
    >
      <div className="space-y-5">
        <div>
          <label className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2 block">
            申请资产
          </label>
          {asset ? (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-cyan-500/20 border-dashed">
              <div className="font-display font-semibold text-cyan-300 text-sm">{asset.name}</div>
              <div className="mt-1 text-xs text-slate-500 line-clamp-2">{asset.description}</div>
            </div>
          ) : (
            <select
              value={form.selectedAssetId}
              onChange={(e) => setForm((f) => ({ ...f, selectedAssetId: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm
                         text-slate-200 outline-none focus:border-cyan-500/40 focus:bg-white/[0.05] transition-all"
            >
              <option value="" className="bg-slate-900">请选择资产...</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id} className="bg-slate-900">
                  {a.name} - {a.description.slice(0, 40)}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            使用用途 <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={form.purpose}
            onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
            rows={4}
            placeholder="请详细描述数据的使用场景、分析目的和安全保障措施..."
            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm
                       text-slate-200 placeholder-slate-500 outline-none resize-none
                       focus:border-cyan-500/40 focus:bg-white/[0.05] transition-all"
          />
          {errors.purpose && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.purpose}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            申请期限
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['7天', '30天', '90天', '180天'].map((dur) => (
              <button
                key={dur}
                onClick={() => setForm((f) => ({ ...f, duration: dur }))}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  form.duration === dur
                    ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-300'
                    : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                }`}
              >
                {dur}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/80 leading-relaxed">
          <div className="font-medium text-amber-300 mb-1">📋 数据使用规范</div>
          <ul className="space-y-1 text-amber-300/70">
            <li>• 请严格按照申请用途使用数据，不得用于其他商业目的</li>
            <li>• 敏感数据字段需进行脱敏处理后方可分析使用</li>
            <li>• 申请到期后请及时续期，否则访问权限将自动收回</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={handleClose} className="btn-ghost text-sm">
            取消
          </button>
          <button onClick={handleSubmit} className="btn-primary text-sm">
            提交申请
          </button>
        </div>
      </div>
    </Modal>
  );
}
