import { useState } from 'react';
import {
  Bell,
  Clock,
  AlertTriangle,
  Check,
  User,
  Volume2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Users,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { StatusBadge } from '@/components/StatusBadge';
import { Tag } from '@/components/Tag';
import { formatTime, formatWaitTime, getWaitTimeColor } from '@/utils/format';
import { calculateEstimatedWait } from '@/utils/triage';
import type { Doctor, TriageRecord } from '@/types';

const TriageBoard = () => {
  const { triageRecords, doctors, updateTriageStatus, callNextPatient, reassignTriageDoctor } = useAppStore();
  const [filterDept, setFilterDept] = useState<string>('');
  const [expandedDoctors, setExpandedDoctors] = useState<Record<string, boolean>>({});
  const [reassignModal, setReassignModal] = useState<{ record: TriageRecord | null }>({ record: null });
  const [reassignDoctorId, setReassignDoctorId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  const todayRecords = triageRecords.filter((r) => {
    const recordDate = new Date(r.queuedAt).toDateString();
    return recordDate === new Date().toDateString();
  });

  const filteredDoctors = doctors.filter((d) => {
    if (!filterDept) return true;
    return d.departmentName === filterDept;
  });

  const getDoctorQueue = (doctorId: string) => {
    return todayRecords
      .filter((r) => r.doctorId === doctorId && (r.status === 'queued' || r.status === 'calling'))
      .sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime();
      });
  };

  const getQueuedOnly = (doctorId: string) => {
    return getDoctorQueue(doctorId).filter((r) => r.status === 'queued');
  };

  const getCallingRecord = (doctorId: string) => {
    return todayRecords.find((r) => r.doctorId === doctorId && r.status === 'calling');
  };

  const getConsultingRecord = (doctorId: string) => {
    return todayRecords.find((r) => r.doctorId === doctorId && r.status === 'consulting');
  };

  const getPriorityLabel = (record: TriageRecord) => {
    if (record.hasHighRisk) {
      return { label: '高风险优先', color: 'bg-coral-100 text-coral-700' };
    }
    if (record.isManualAdjusted) {
      return { label: '人工调整', color: 'bg-amber-100 text-amber-700' };
    }
    return { label: '普通', color: 'bg-gray-100 text-gray-600' };
  };

  const getQueueIndex = (record: TriageRecord) => {
    const queue = getDoctorQueue(record.doctorId);
    return queue.findIndex((r) => r.id === record.id);
  };

  const toggleExpand = (doctorId: string) => {
    setExpandedDoctors((prev) => ({
      ...prev,
      [doctorId]: !prev[doctorId],
    }));
  };

  const handleCall = (recordId: string) => {
    updateTriageStatus(recordId, 'calling');
  };

  const handleStartConsult = (recordId: string) => {
    updateTriageStatus(recordId, 'consulting');
  };

  const handleComplete = (recordId: string) => {
    updateTriageStatus(recordId, 'completed');
  };

  const handleCallNext = (doctorId: string) => {
    callNextPatient(doctorId);
  };

  const openReassignModal = (record: TriageRecord) => {
    setReassignModal({ record });
    setReassignDoctorId(record.doctorId);
    setReassignReason('');
  };

  const closeReassignModal = () => {
    setReassignModal({ record: null });
    setReassignDoctorId('');
    setReassignReason('');
  };

  const handleReassign = () => {
    if (!reassignModal.record || !reassignDoctorId || !reassignReason.trim()) return;
    reassignTriageDoctor(reassignModal.record.id, reassignDoctorId, reassignReason.trim());
    closeReassignModal();
  };

  const queuedCount = todayRecords.filter((r) => r.status === 'queued').length;
  const activeCount = todayRecords.filter((r) => r.status === 'calling' || r.status === 'consulting').length;
  const completedCount = todayRecords.filter((r) => r.status === 'completed').length;

  const avgWait = Math.round(
    todayRecords
      .filter((r) => r.status === 'completed')
      .reduce((acc, r) => acc + r.waitTime, 0) /
      Math.max(todayRecords.filter((r) => r.status === 'completed').length, 1)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-serif font-semibold text-rose-800 text-xl">分诊看板</h3>
          <Tag variant="rose">{queuedCount} 人候诊</Tag>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-4 py-2 bg-white border border-cream-200 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-rose-200 appearance-none cursor-pointer"
          >
            <option value="">全部科室</option>
            {['皮肤美容科', '微整形科', '整形外科'].map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Bell className="w-4 h-4" />
            批量提醒
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-rose-500 font-serif">{queuedCount}</p>
          <p className="text-sm text-rose-400 mt-1">候诊中</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-mint-500 font-serif">{activeCount}</p>
          <p className="text-sm text-rose-400 mt-1">接诊中</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-amber-500 font-serif">{avgWait}</p>
          <p className="text-sm text-rose-400 mt-1">平均等待(分钟)</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-rose-400 font-serif">{completedCount}</p>
          <p className="text-sm text-rose-400 mt-1">已完成</p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredDoctors.map((doctor) => {
          const queue = getQueuedOnly(doctor.id);
          const calling = getCallingRecord(doctor.id);
          const consulting = getConsultingRecord(doctor.id);
          const isExpanded = expandedDoctors[doctor.id] !== false;
          const nextWait = calculateEstimatedWait(doctor, todayRecords, 0);
          const active = calling || consulting;

          return (
            <div key={doctor.id} className="card p-5 overflow-hidden">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(doctor.id)}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={doctor.avatar}
                    alt={doctor.name}
                    className="w-14 h-14 rounded-full bg-rose-100"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-semibold text-rose-800 text-lg">{doctor.name}</h4>
                      <StatusBadge status={doctor.status} size="sm" />
                    </div>
                    <p className="text-sm text-rose-500 mt-0.5">
                      {doctor.title} · {doctor.departmentName} · {doctor.room}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-rose-500">
                      候诊 <span className="font-bold text-rose-700">{queue.length}</span> 人
                    </p>
                    <p className="text-xs text-mint-500 mt-0.5">
                      下一位预计等 {nextWait} 分钟
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCallNext(doctor.id);
                    }}
                    disabled={queue.length === 0}
                    className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2
                              ${queue.length > 0
                                ? 'bg-rose-gradient text-white hover:opacity-90 transition-opacity'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                    呼叫下一位
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-rose-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-rose-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-cream-100 space-y-3">
                  {active && (
                    <div className="p-4 bg-mint-50 rounded-xl border border-mint-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-mint-500 flex items-center justify-center text-white font-bold">
                            <Volume2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-rose-800">{active.customerName}</p>
                              <Tag variant="mint" size="sm">
                                {active.status === 'calling' ? '叫号中' : '接诊中'}
                              </Tag>
                            </div>
                            <p className="text-xs text-rose-400 mt-0.5">
                              {active.calledAt ? formatTime(active.calledAt) : '--'} 开始
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {active.status === 'calling' && (
                            <button
                              onClick={() => handleStartConsult(active.id)}
                              className="px-4 py-2 bg-mint-500 text-white rounded-xl text-sm font-medium
                                       hover:bg-mint-600 transition-colors"
                            >
                              开始接诊
                            </button>
                          )}
                          {active.status === 'consulting' && (
                            <button
                              onClick={() => handleComplete(active.id)}
                              className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium
                                       hover:bg-rose-600 transition-colors flex items-center gap-1"
                            >
                              <Check className="w-4 h-4" />
                              完成
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {queue.length === 0 ? (
                    <div className="text-center py-8 text-rose-400">
                      <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无候诊顾客</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-rose-600 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        候诊队列（{queue.length} 人）
                      </p>
                      {queue.map((record, idx) => {
                        const priorityInfo = getPriorityLabel(record);
                        const queueIdx = getQueueIndex(record);
                        const dynamicWait = calculateEstimatedWait(doctor, todayRecords, queueIdx);

                        return (
                          <div
                            key={record.id}
                            className={`p-4 rounded-xl border-2 transition-all hover:shadow-sm
                                      ${idx === 0 ? 'border-rose-300 bg-rose-50' : 'border-cream-200 bg-white'}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
                                            ${idx === 0 ? 'bg-rose-gradient' : 'bg-rose-200'}`}>
                                {idx + 1}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="font-medium text-rose-800">{record.customerName}</h5>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                                    {priorityInfo.label}
                                  </span>
                                  {record.hasHighRisk && (
                                    <span className="text-coral-500 flex items-center gap-0.5" title="高风险">
                                      <AlertTriangle className="w-4 h-4" />
                                    </span>
                                  )}
                                  {record.isManualAdjusted && (
                                    <Tag variant="coral" size="sm">人工调整</Tag>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-rose-400">
                                    {record.departmentName} · {record.room}
                                  </span>
                                </div>
                                {record.isManualAdjusted && record.adjustReason && (
                                  <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded-lg">
                                    <span className="font-medium">调整原因：</span>
                                    {record.adjustReason}
                                  </div>
                                )}
                              </div>

                              <div className="text-right">
                                <p className={`text-sm font-medium ${getWaitTimeColor(record.waitTime)}`}>
                                  已等 {formatWaitTime(record.waitTime)}
                                </p>
                                <p className="text-xs text-rose-400 mt-0.5">
                                  预计还需 <span className="font-medium text-rose-600">{formatWaitTime(dynamicWait)}</span>
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => openReassignModal(record)}
                                  className="px-3 py-2 border border-cream-300 text-rose-600 rounded-xl text-xs font-medium
                                           hover:bg-cream-50 transition-colors"
                                >
                                  调整医生
                                </button>
                                <button
                                  onClick={() => handleCall(record.id)}
                                  className="btn-primary px-4 py-2 text-sm flex items-center gap-1"
                                >
                                  <Volume2 className="w-4 h-4" />
                                  叫号
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {reassignModal.record && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md mx-4 overflow-hidden animate-slide-up">
            <div className="bg-rose-gradient p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold">调整接诊医生</h3>
                <button onClick={closeReassignModal} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 bg-cream-50 rounded-xl">
                <p className="text-sm text-rose-400">顾客</p>
                <p className="font-medium text-rose-800 mt-1">{reassignModal.record.customerName}</p>
                <p className="text-xs text-rose-400 mt-1">
                  当前医生：{reassignModal.record.doctorName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-rose-700 mb-2">
                  选择新医生 <span className="text-coral-500">*</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {doctors.filter((d) => d.status !== 'offline').map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => setReassignDoctorId(doctor.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3
                                ${reassignDoctorId === doctor.id
                                  ? 'border-rose-400 bg-rose-50'
                                  : 'border-cream-200 hover:border-rose-200'}`}
                    >
                      <img
                        src={doctor.avatar}
                        alt={doctor.name}
                        className="w-10 h-10 rounded-full bg-rose-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-rose-800 text-sm">{doctor.name}</p>
                        <p className="text-xs text-rose-400">
                          {doctor.title} · {doctor.departmentName}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                    ${reassignDoctorId === doctor.id ? 'border-rose-500 bg-rose-500' : 'border-cream-300'}`}>
                        {reassignDoctorId === doctor.id && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-rose-700 mb-2">
                  调整原因 <span className="text-coral-500">*</span>
                </label>
                <textarea
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="请说明调整医生的原因..."
                  className="w-full px-4 py-3 border border-cream-300 rounded-xl bg-white
                           focus:outline-none focus:ring-2 focus:ring-rose-200
                           transition-all duration-200 resize-none text-sm"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={closeReassignModal} className="btn-secondary">
                  取消
                </button>
                <button
                  onClick={handleReassign}
                  disabled={!reassignDoctorId || !reassignReason.trim()}
                  className={`btn-primary flex items-center gap-1
                            ${!reassignDoctorId || !reassignReason.trim()
                              ? 'opacity-50 cursor-not-allowed'
                              : ''}`}
                >
                  确认调整
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TriageBoard;
