import { useState } from 'react';
import {
  Bell,
  Clock,
  AlertTriangle,
  Check,
  User,
  Volume2,
  ArrowRight,
  Play,
  Pause,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { StatusBadge } from '@/components/StatusBadge';
import { Tag } from '@/components/Tag';
import { formatTime, formatWaitTime, getWaitTimeColor } from '@/utils/format';
import { calculateEstimatedWait } from '@/utils/triage';

const TriageBoard = () => {
  const { triageRecords, doctors, updateTriageStatus, callNextPatient } = useAppStore();
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');

  const queuedRecords = triageRecords
    .filter((r) => r.status === 'queued')
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime();
    });

  const activeRecords = triageRecords.filter(
    (r) => r.status === 'calling' || r.status === 'consulting'
  );

  const completedRecords = triageRecords.filter((r) => r.status === 'completed');

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

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3:
        return { label: 'VIP优先', color: 'bg-amber-100 text-amber-700' };
      case 2:
        return { label: '普通', color: 'bg-rose-100 text-rose-600' };
      default:
        return { label: '普通', color: 'bg-gray-100 text-gray-600' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-serif font-semibold text-rose-800">候诊队列</h3>
          <Tag variant="rose">{queuedRecords.length} 人等候</Tag>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
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

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-2">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-serif font-semibold text-rose-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-400" />
                等候队列
              </h4>
              <span className="text-sm text-rose-400">
                平均等待 {formatWaitTime(
                  Math.round(
                    queuedRecords.reduce((acc, r) => {
                      const doctor = doctors.find((d) => d.id === r.doctorId);
                      const doctorQueue = triageRecords.filter(
                        (qr) => qr.doctorId === r.doctorId && (qr.status === 'queued' || qr.status === 'calling')
                      );
                      const doctorQueueIndex = doctorQueue.findIndex((qr) => qr.id === r.id);
                      return acc + (doctor ? calculateEstimatedWait(doctor, triageRecords, Math.max(0, doctorQueueIndex)) : r.estimatedWait);
                    }, 0) / Math.max(queuedRecords.length, 1)
                  )
                )}
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {queuedRecords.length === 0 ? (
                <div className="text-center py-12 text-rose-400">
                  <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无候诊顾客</p>
                </div>
              ) : (
                queuedRecords.map((record, index) => {
                  const priorityInfo = getPriorityLabel(record.priority);
                  const doctor = doctors.find((d) => d.id === record.doctorId);

                  const doctorQueueCount = triageRecords.filter(
                    (r) => r.doctorId === record.doctorId && (r.status === 'queued' || r.status === 'calling')
                  ).length;
                  const doctorQueue = triageRecords.filter(
                    (r) => r.doctorId === record.doctorId && (r.status === 'queued' || r.status === 'calling')
                  );
                  const doctorQueueIndex = doctorQueue.findIndex((r) => r.id === record.id);
                  const dynamicWait = doctor
                    ? calculateEstimatedWait(doctor, triageRecords, Math.max(0, doctorQueueIndex))
                    : record.estimatedWait;

                  return (
                    <div
                      key={record.id}
                      className={`p-4 rounded-2xl border-2 transition-all hover:shadow-md
                                ${index === 0 ? 'border-rose-300 bg-rose-50' : 'border-cream-200 bg-white'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                                      ${index === 0 ? 'bg-rose-gradient' : 'bg-rose-200'}`}>
                          {index + 1}
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
                              <Tag variant="coral" size="sm">
                                人工调整
                              </Tag>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Tag variant="rose" size="sm">{record.departmentName}</Tag>
                            <span className="text-xs text-rose-400">
                              {record.doctorName} · {record.room}
                            </span>
                            {doctor && (
                              <span className="text-xs text-mint-500">
                                · 排队 {doctorQueueCount} 人
                              </span>
                            )}
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
                          {doctor && (
                            <p className="text-xs text-mint-500 mt-0.5">
                              {doctor.status === 'available' ? '医生空闲' :
                               doctor.status === 'busy' ? '医生接诊中' : '医生离线'}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
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
                })
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="card p-5">
            <h4 className="font-serif font-semibold text-rose-800 mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-mint-500" />
              进行中
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {doctors.filter((d) => d.status !== 'offline').map((doctor) => {
                const activeRecord = activeRecords.find((r) => r.doctorId === doctor.id);
                const doctorQueue = queuedRecords.filter((r) => r.doctorId === doctor.id);
                const nextWait = calculateEstimatedWait(doctor, triageRecords, 0);
                return (
                  <div
                    key={doctor.id}
                    className={`p-4 rounded-2xl border-2 transition-all
                              ${activeRecord ? 'border-mint-300 bg-mint-50' : 'border-cream-200 bg-white'}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={doctor.avatar}
                        alt={doctor.name}
                        className="w-12 h-12 rounded-full bg-rose-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-rose-800">{doctor.name}</h5>
                        <p className="text-xs text-rose-400">{doctor.title}</p>
                      </div>
                      <StatusBadge status={doctor.status} size="sm" />
                    </div>

                    <div className="text-sm text-rose-500 mb-3">
                      <p>{doctor.departmentName} · {doctor.room}</p>
                    </div>

                    {activeRecord ? (
                      <div className="p-3 bg-white rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-rose-700">
                              {activeRecord.customerName}
                            </p>
                            <p className="text-xs text-rose-400">
                              {activeRecord.status === 'calling' ? '叫号中' : '接诊中'}
                              {activeRecord.calledAt && ` · ${formatTime(activeRecord.calledAt)}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {activeRecord.status === 'calling' && (
                              <button
                                onClick={() => handleStartConsult(activeRecord.id)}
                                className="px-3 py-1.5 bg-mint-500 text-white rounded-lg text-xs font-medium
                                         hover:bg-mint-600 transition-colors"
                              >
                                开始接诊
                              </button>
                            )}
                            {activeRecord.status === 'consulting' && (
                              <button
                                onClick={() => handleComplete(activeRecord.id)}
                                className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-medium
                                         hover:bg-rose-600 transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                完成
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCallNext(doctor.id)}
                        disabled={!doctorQueue.length}
                        className={`w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2
                                  ${doctorQueue.length
                                    ? 'bg-mint-100 text-mint-700 hover:bg-mint-200 transition-colors'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      >
                        <ArrowRight className="w-4 h-4" />
                        {doctorQueue.length ? `呼叫下一位 (${doctorQueue.length}人等候)` : '无候诊顾客'}
                      </button>
                    )}

                    {doctorQueue.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-cream-100 flex items-center justify-between text-xs">
                        <span className="text-rose-400">排队 {doctorQueue.length} 人</span>
                        <span className="text-mint-500">预计下一位等 {nextWait} 分钟</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-5">
            <h4 className="font-serif font-semibold text-rose-800 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-mint-500" />
              今日已完成 ({completedRecords.length})
            </h4>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {completedRecords.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-cream-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mint-100 flex items-center justify-center">
                      <Check className="w-4 h-4 text-mint-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-rose-700">{record.customerName}</p>
                      <p className="text-xs text-rose-400">
                        {record.doctorName} · {record.departmentName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-rose-400">完成时间</p>
                    <p className="text-sm text-rose-600">
                      {record.completedAt ? formatTime(record.completedAt) : '--'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-rose-500 font-serif">{queuedRecords.length}</p>
          <p className="text-sm text-rose-400 mt-1">等候中</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-mint-500 font-serif">{activeRecords.length}</p>
          <p className="text-sm text-rose-400 mt-1">接诊中</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-amber-500 font-serif">
            {Math.round(queuedRecords.reduce((acc, r) => acc + r.waitTime, 0) / Math.max(queuedRecords.length, 1))}
          </p>
          <p className="text-sm text-rose-400 mt-1">平均等待(分钟)</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-rose-400 font-serif">{completedRecords.length}</p>
          <p className="text-sm text-rose-400 mt-1">已完成</p>
        </div>
      </div>
    </div>
  );
};

export default TriageBoard;
