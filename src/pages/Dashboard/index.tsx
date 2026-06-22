import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  UserPlus,
  ListTodo,
  Clock,
  AlertTriangle,
  Stethoscope,
  UserCheck,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Tag } from '@/components/Tag';
import { formatTime, formatWaitTime } from '@/utils/format';

const Dashboard = () => {
  const navigate = useNavigate();
  const { triageRecords, customers, doctors, getTodayStats } = useAppStore();
  const stats = getTodayStats();

  const waitingQueue = triageRecords
    .filter((r) => r.status === 'queued')
    .sort((a, b) => b.priority - a.priority || a.waitTime - b.waitTime);

  const recentCustomers = customers.slice(0, 4);

  const highRiskRecords = triageRecords.filter((r) => r.hasHighRisk && r.status !== 'completed');

  const quickActions = [
    {
      icon: QrCode,
      label: '扫码建档',
      desc: '快速录入新顾客',
      color: 'from-rose-400 to-rose-300',
      onClick: () => navigate('/customers/new'),
    },
    {
      icon: UserPlus,
      label: '快速登记',
      desc: '手动录入信息',
      color: 'from-mint-400 to-mint-300',
      onClick: () => navigate('/customers/new'),
    },
    {
      icon: ListTodo,
      label: '填写问卷',
      desc: '初诊问卷录入',
      color: 'from-amber-400 to-amber-300',
      onClick: () => navigate('/questionnaire'),
    },
    {
      icon: Stethoscope,
      label: '分诊看板',
      desc: '查看候诊队列',
      color: 'from-blue-400 to-blue-300',
      onClick: () => navigate('/triage'),
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          title="今日到诊"
          value={stats.totalArrivals}
          subtitle="人"
          trend={12}
          icon={<Sparkles className="w-5 h-5" />}
          gradient="from-rose-400 to-rose-300"
        />
        <StatCard
          title="候诊中"
          value={stats.queuedCount}
          subtitle="人"
          trend={-5}
          icon={<Clock className="w-5 h-5" />}
          gradient="from-amber-400 to-amber-300"
        />
        <StatCard
          title="分诊中"
          value={stats.consultingCount}
          subtitle="人"
          icon={<UserCheck className="w-5 h-5" />}
          gradient="from-mint-400 to-mint-300"
        />
        <StatCard
          title="已完成"
          value={stats.completedCount}
          subtitle="人"
          trend={8}
          icon={<Stethoscope className="w-5 h-5" />}
          gradient="from-blue-400 to-blue-300"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-rose-800">快捷操作</h3>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="group p-5 rounded-2xl bg-gradient-to-br from-cream-50 to-white border border-cream-200
                           hover:shadow-rose hover:-translate-y-1 transition-all duration-300 text-left"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3
                                  group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <p className="font-medium text-rose-700">{action.label}</p>
                  <p className="text-xs text-rose-400 mt-1">{action.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-rose-800">候诊队列</h3>
              <button
                onClick={() => navigate('/triage')}
                className="text-sm text-rose-500 hover:text-rose-600 flex items-center gap-1"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {waitingQueue.length === 0 ? (
              <div className="text-center py-8 text-rose-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无候诊顾客</p>
              </div>
            ) : (
              <div className="space-y-3">
                {waitingQueue.slice(0, 4).map((record, index) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-cream-50 hover:bg-rose-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                                    ${index === 0 ? 'bg-rose-gradient' : 'bg-rose-200 text-rose-600'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-rose-700">{record.customerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Tag variant="rose" size="sm">{record.departmentName}</Tag>
                          <span className="text-xs text-rose-400">{record.doctorName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-rose-600">
                        等待 {formatWaitTime(record.waitTime)}
                      </p>
                      <p className="text-xs text-rose-400 mt-1">
                        预计还需 {formatWaitTime(record.estimatedWait)}
                      </p>
                    </div>

                    {record.hasHighRisk && (
                      <div className="flex items-center gap-1 text-coral-500">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-medium">高风险</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-serif text-lg font-semibold text-rose-800 mb-4">到诊趋势</h3>
            <div className="h-48 flex items-end gap-2">
              {[12, 18, 15, 22, 28, 25, 20].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-rose-gradient rounded-t-lg transition-all duration-500 hover:opacity-80"
                    style={{ height: `${(val / 30) * 100}%` }}
                  ></div>
                  <span className="text-xs text-rose-400">
                    {['一', '二', '三', '四', '五', '六', '日'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {highRiskRecords.length > 0 && (
            <div className="card p-5 border-l-4 border-coral-400">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-coral-500" />
                <h3 className="font-serif text-lg font-semibold text-rose-800">风险提醒</h3>
              </div>
              <div className="space-y-2">
                {highRiskRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-coral-50 rounded-lg cursor-pointer hover:bg-coral-100 transition-colors"
                    onClick={() => navigate(`/customers/${record.customerId}`)}
                  >
                    <span className="text-sm font-medium text-coral-700">{record.customerName}</span>
                    <Tag variant="coral" size="sm">高风险</Tag>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-rose-800">在线医生</h3>
              <span className="text-xs text-rose-400">
                {doctors.filter((d) => d.status !== 'offline').length} 人在线
              </span>
            </div>
            <div className="space-y-3">
              {doctors.filter((d) => d.status !== 'offline').slice(0, 3).map((doctor) => (
                <div key={doctor.id} className="flex items-center gap-3">
                  <img
                    src={doctor.avatar}
                    alt={doctor.name}
                    className="w-10 h-10 rounded-full bg-rose-100"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-rose-700">{doctor.name}</p>
                    <p className="text-xs text-rose-400">{doctor.title} · {doctor.departmentName}</p>
                  </div>
                  <StatusBadge status={doctor.status} size="sm" />
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/doctors')}
              className="w-full mt-4 py-2 text-sm text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              查看全部医生 <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="card p-5">
            <h3 className="font-serif text-lg font-semibold text-rose-800 mb-4">最新登记</h3>
            <div className="space-y-3">
              {recentCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/customers/${customer.id}`)}
                >
                  <div className="w-9 h-9 rounded-full bg-rose-gradient flex items-center justify-center text-white text-sm font-medium">
                    {customer.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-rose-700 truncate">{customer.name}</p>
                    <p className="text-xs text-rose-400 truncate">{customer.sourceChannel} · {customer.appointmentItem}</p>
                  </div>
                  <span className="text-xs text-rose-400">
                    {formatTime(customer.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
