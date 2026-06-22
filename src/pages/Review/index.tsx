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
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { StatCard } from '@/components/StatCard';

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
  const { triageRecords, customers, getTodayStats } = useAppStore();
  const stats = getTodayStats();

  const avgWaitTime = 18;
  const avgConsultTime = 25;

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
    </div>
  );
};

export default Review;
