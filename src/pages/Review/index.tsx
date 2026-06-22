import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Clock,
  PieChart as PieChartIcon,
  BarChart3,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  User,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { StatCard } from '@/components/StatCard';
import { Tag } from '@/components/Tag';
import { formatTime, formatWaitTime } from '@/utils/format';

const dailyData = [
  { day: '周一', arrivals: 22, completed: 20, avgWait: 15 },
  { day: '周二', arrivals: 28, completed: 26, avgWait: 22 },
  { day: '周三', arrivals: 25, completed: 24, avgWait: 18 },
  { day: '周四', arrivals: 32, completed: 29, avgWait: 28 },
  { day: '周五', arrivals: 35, completed: 33, avgWait: 32 },
  { day: '周六', arrivals: 42, completed: 38, avgWait: 40 },
  { day: '周日', arrivals: 30, completed: 28, avgWait: 25 },
];

const channelData = [
  { name: '小红书', value: 28, color: '#D4A574' },
  { name: '抖音', value: 22, color: '#E8C4A0' },
  { name: '大众点评', value: 18, color: '#7FB7A6' },
  { name: '朋友推荐', value: 15, color: '#95BFB1' },
  { name: '老客转介', value: 10, color: '#E07A5F' },
  { name: '其他', value: 7, color: '#B9D5CB' },
];

const concernData = [
  { category: '皮肤管理', count: 45 },
  { category: '微整形', count: 38 },
  { category: '面部抗衰', count: 32 },
  { category: '眼部整形', count: 18 },
  { category: '鼻部整形', count: 15 },
  { category: '体型塑形', count: 12 },
];

const hourlyData = [
  { hour: '09:00', count: 5 },
  { hour: '10:00', count: 8 },
  { hour: '11:00', count: 12 },
  { hour: '12:00', count: 6 },
  { hour: '13:00', count: 4 },
  { hour: '14:00', count: 10 },
  { hour: '15:00', count: 15 },
  { hour: '16:00', count: 13 },
  { hour: '17:00', count: 9 },
  { hour: '18:00', count: 3 },
];

const Review = () => {
  const { triageRecords, customers, doctors, getTodayStats } = useAppStore();
  const stats = getTodayStats();
  const [expandedDoctors, setExpandedDoctors] = useState<Record<string, boolean>>({});

  const avgWaitTime = 18;
  const avgConsultTime = 25;

  const today = new Date().toDateString();
  const todayRecords = triageRecords.filter((r) => {
    const recordDate = new Date(r.queuedAt).toDateString();
    return recordDate === today;
  });

  const doctorStats = doctors.map((doctor) => {
    const doctorRecords = todayRecords.filter((r) => r.doctorId === doctor.id);
    const completed = doctorRecords.filter((r) => r.status === 'completed');
    const queued = doctorRecords.filter((r) => r.status === 'queued');
    const active = doctorRecords.filter((r) => r.status === 'calling' || r.status === 'consulting');
    const manualAdjusted = doctorRecords.filter((r) => r.isManualAdjusted);
    const highRisk = doctorRecords.filter((r) => r.hasHighRisk);

    const avgWait = completed.length > 0
      ? Math.round(completed.reduce((acc, r) => acc + r.waitTime, 0) / completed.length)
      : 0;

    return {
      doctor,
      total: doctorRecords.length,
      completed: completed.length,
      queued: queued.length,
      active: active.length,
      manualAdjusted: manualAdjusted.length,
      highRisk: highRisk.length,
      avgWait,
      records: doctorRecords.sort((a, b) =>
        new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime()
      ),
    };
  }).sort((a, b) => b.total - a.total);

  const toggleExpand = (doctorId: string) => {
    setExpandedDoctors((prev) => ({
      ...prev,
      [doctorId]: !prev[doctorId],
    }));
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'queued': return { text: '候诊中', color: 'text-rose-500 bg-rose-50' };
      case 'calling': return { text: '叫号中', color: 'text-amber-600 bg-amber-50' };
      case 'consulting': return { text: '接诊中', color: 'text-mint-600 bg-mint-50' };
      case 'completed': return { text: '已完成', color: 'text-gray-500 bg-gray-50' };
      default: return { text: status, color: 'text-gray-500 bg-gray-50' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          title="今日到诊"
          value={stats.totalArrivals}
          subtitle="人"
          trend={12}
          icon={<Users className="w-5 h-5" />}
          gradient="from-rose-400 to-rose-300"
        />
        <StatCard
          title="完成率"
          value="85.7%"
          subtitle="较昨日 +3.2%"
          icon={<Sparkles className="w-5 h-5" />}
          gradient="from-mint-400 to-mint-300"
        />
        <StatCard
          title="平均等待"
          value={`${avgWaitTime}分钟`}
          subtitle="较昨日 -2分钟"
          trend={-10}
          icon={<Clock className="w-5 h-5" />}
          gradient="from-amber-400 to-amber-300"
        />
        <StatCard
          title="平均接诊"
          value={`${avgConsultTime}分钟`}
          subtitle="较昨日 +3分钟"
          icon={<BarChart3 className="w-5 h-5" />}
          gradient="from-blue-400 to-blue-300"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card p-6">
          <h4 className="font-serif font-semibold text-rose-800 mb-4">本周到诊趋势</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3DFC8" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#C08A5A', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#C08A5A', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(192, 138, 90, 0.2)',
                  }}
                />
                <Bar dataKey="arrivals" name="到诊人数" fill="url(#colorRose)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" name="完成人数" fill="url(#colorMint)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="colorRose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4A574" />
                    <stop offset="100%" stopColor="#E8C4A0" />
                  </linearGradient>
                  <linearGradient id="colorMint" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7FB7A6" />
                    <stop offset="100%" stopColor="#B9D5CB" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-rose-300"></span>
              <span className="text-sm text-rose-500">到诊人数</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-mint-300"></span>
              <span className="text-sm text-rose-500">完成人数</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h4 className="font-serif font-semibold text-rose-800 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-rose-400" />
            渠道来源分布
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(192, 138, 90, 0.2)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {channelData.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-xs text-rose-500">{item.name} {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6">
          <h4 className="font-serif font-semibold text-rose-800 mb-4">诉求类型分布</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={concernData} layout="vertical" barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3DFC8" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#C08A5A', fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8A5A38', fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(192, 138, 90, 0.2)',
                  }}
                />
                <Bar dataKey="count" name="人数" radius={[0, 6, 6, 0]}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#E8C4A0" />
                      <stop offset="100%" stopColor="#D4A574" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h4 className="font-serif font-semibold text-rose-800 mb-4">每日时段分布</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3DFC8" vertical={false} />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#C08A5A', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#C08A5A', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(192, 138, 90, 0.2)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="到诊人数"
                  stroke="#D4A574"
                  strokeWidth={3}
                  dot={{ fill: '#D4A574', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#fff', stroke: '#D4A574', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h4 className="font-serif font-semibold text-rose-800 mb-4">关键指标概览</h4>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: '新客占比', value: '68%', desc: '较上周 +5%', positive: true },
            { label: '复购率', value: '32%', desc: '较上周 +2%', positive: true },
            { label: '分诊准确率', value: '95%', desc: '系统建议匹配度', positive: true },
            { label: '顾客满意度', value: '4.8分', desc: '5分制评分', positive: true },
          ].map((item, index) => (
            <div key={index} className="text-center p-4 bg-cream-50 rounded-xl">
              <p className="text-2xl font-bold text-rose-700 font-serif">{item.value}</p>
              <p className="text-sm text-rose-500 mt-1">{item.label}</p>
              <p className={`text-xs mt-1 ${item.positive ? 'text-mint-500' : 'text-coral-500'}`}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h4 className="font-serif font-semibold text-rose-800 text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-400" />
            今日医生分诊明细
          </h4>
          <Tag variant="rose">{doctorStats.filter(d => d.total > 0).length} 位医生接诊</Tag>
        </div>

        <div className="space-y-3">
          {doctorStats.map(({ doctor, total, completed, queued, active, manualAdjusted, highRisk, avgWait, records }) => {
            const isExpanded = expandedDoctors[doctor.id] === true;
            return (
              <div key={doctor.id} className="border border-cream-200 rounded-2xl overflow-hidden">
                <div
                  className="p-4 bg-cream-50/50 flex items-center justify-between cursor-pointer hover:bg-cream-50 transition-colors"
                  onClick={() => toggleExpand(doctor.id)}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={doctor.avatar}
                      alt={doctor.name}
                      className="w-12 h-12 rounded-full bg-rose-100"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-rose-800">{doctor.name}</h5>
                        <Tag variant="rose" size="sm">{doctor.departmentName}</Tag>
                      </div>
                      <p className="text-xs text-rose-400 mt-0.5">{doctor.title} · {doctor.room}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-xl font-bold text-rose-600 font-serif">{total}</p>
                      <p className="text-xs text-rose-400">今日接诊</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-mint-500 font-serif">{completed}</p>
                      <p className="text-xs text-rose-400">已完成</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-amber-500 font-serif">{avgWait}</p>
                      <p className="text-xs text-rose-400">平均等待(分)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-coral-500 font-serif">{manualAdjusted}</p>
                      <p className="text-xs text-rose-400">人工调整</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-rose-400 font-serif">{highRisk}</p>
                      <p className="text-xs text-rose-400">高风险</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-rose-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-rose-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 border-t border-cream-100 bg-white">
                    {records.length === 0 ? (
                      <div className="text-center py-6 text-rose-400">
                        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">今日暂无接诊记录</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-rose-400 border-b border-cream-100">
                              <th className="pb-3 pl-2 font-medium">顾客</th>
                              <th className="pb-3 font-medium">状态</th>
                              <th className="pb-3 font-medium">到诊时间</th>
                              <th className="pb-3 font-medium">等待时长</th>
                              <th className="pb-3 font-medium">风险</th>
                              <th className="pb-3 font-medium">调整</th>
                              <th className="pb-3 pr-2 font-medium text-right">完成时间</th>
                            </tr>
                          </thead>
                          <tbody>
                            {records.map((record) => {
                              const statusInfo = getStatusLabel(record.status);
                              return (
                                <tr key={record.id} className="border-b border-cream-50 last:border-0">
                                  <td className="py-3 pl-2">
                                    <span className="font-medium text-rose-700">
                                      {record.customerName}
                                    </span>
                                  </td>
                                  <td className="py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                      {statusInfo.text}
                                    </span>
                                  </td>
                                  <td className="py-3 text-rose-500">
                                    {formatTime(record.queuedAt)}
                                  </td>
                                  <td className="py-3 text-rose-500">
                                    {formatWaitTime(record.waitTime)}
                                  </td>
                                  <td className="py-3">
                                    {record.hasHighRisk ? (
                                      <span className="flex items-center gap-1 text-coral-500 text-xs">
                                        <AlertTriangle className="w-3 h-3" />
                                        高风险
                                      </span>
                                    ) : (
                                      <span className="text-mint-500 text-xs">正常</span>
                                    )}
                                  </td>
                                  <td className="py-3">
                                    {record.isManualAdjusted ? (
                                      <span className="text-amber-600 text-xs" title={record.adjustReason}>
                                        是
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 text-xs">否</span>
                                    )}
                                  </td>
                                  <td className="py-3 pr-2 text-right text-rose-400">
                                    {record.completedAt ? formatTime(record.completedAt) : '--'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Review;
