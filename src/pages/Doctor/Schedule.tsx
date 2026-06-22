import { useState } from 'react';
import { Calendar, Clock, MapPin, Award, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { StatusBadge } from '@/components/StatusBadge';
import { Tag } from '@/components/Tag';
import { mockDepartments } from '@/mock';

const DoctorSchedule = () => {
  const { doctors, schedules, getTodayStats } = useAppStore();
  const [selectedDept, setSelectedDept] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const filteredDoctors = selectedDept
    ? doctors.filter((d) => d.departmentName === selectedDept)
    : doctors;

  const formatDateStr = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}-${day}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const getDoctorSchedule = (doctorId: string, dateStr: string) => {
    return schedules.filter(
      (s) => s.doctorId === doctorId && s.date === dateStr
    );
  };

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-serif font-semibold text-rose-800">医生排班</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDept('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${!selectedDept ? 'bg-rose-500 text-white' : 'bg-white text-rose-500 hover:bg-rose-50'}`}
            >
              全部
            </button>
            {mockDepartments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${selectedDept === dept.name
                            ? 'bg-rose-500 text-white'
                            : 'bg-white text-rose-500 hover:bg-rose-50'}`}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="card p-5">
            <div className="flex items-start gap-4">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-16 h-16 rounded-full bg-rose-100"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-rose-800">{doctor.name}</h4>
                  <StatusBadge status={doctor.status} size="sm" />
                </div>
                <p className="text-sm text-rose-500 mt-0.5">{doctor.title}</p>
                <p className="text-xs text-rose-400 mt-1">{doctor.departmentName}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-cream-200">
              <div className="flex items-center gap-1 text-xs text-rose-400 mb-2">
                <Award className="w-3.5 h-3.5" />
                擅长项目
              </div>
              <div className="flex flex-wrap gap-1">
                {doctor.specialties.slice(0, 4).map((s) => (
                  <Tag key={s} variant="mint" size="sm">{s}</Tag>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-rose-400">
                <MapPin className="w-4 h-4" />
                <span>{doctor.room}</span>
              </div>
              <span className="text-rose-500 font-medium">
                今日 {doctor.todayPatientCount} 人
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-serif font-semibold text-rose-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-400" />
            本周排班
          </h4>
          <div className="flex items-center gap-4">
            <button
              onClick={prevWeek}
              className="p-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-rose-500" />
            </button>
            <span className="text-rose-700 font-medium">
              {formatDateStr(weekDates[0])} ~ {formatDateStr(weekDates[6])}
            </span>
            <button
              onClick={nextWeek}
              className="p-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-rose-500" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 text-rose-500 font-medium text-sm w-32">医生</th>
                {weekDates.map((date, i) => (
                  <th
                    key={i}
                    className={`text-center py-3 px-2 text-sm font-medium ${isToday(date) ? 'text-rose-600 bg-rose-50' : 'text-rose-400'}`}
                  >
                    <div>{weekDays[i]}</div>
                    <div className={`text-lg font-serif font-bold ${isToday(date) ? 'text-rose-600' : ''}`}>
                      {date.getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="border-t border-cream-100">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={doctor.avatar}
                        alt={doctor.name}
                        className="w-8 h-8 rounded-full bg-rose-100"
                      />
                      <div>
                        <p className="text-sm font-medium text-rose-700">{doctor.name}</p>
                        <p className="text-xs text-rose-400">{doctor.title}</p>
                      </div>
                    </div>
                  </td>
                  {weekDates.map((date, i) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const daySchedules = getDoctorSchedule(doctor.id, dateStr);

                    return (
                      <td key={i} className={`py-4 px-2 ${isToday(date) ? 'bg-rose-50/50' : ''}`}>
                        <div className="space-y-1">
                          {daySchedules.length > 0 ? (
                            daySchedules.map((schedule) => (
                              <div
                                key={schedule.id}
                                className={`px-2 py-1.5 rounded-lg text-xs text-center
                                          ${schedule.type === 'morning'
                                            ? 'bg-mint-100 text-mint-700'
                                            : schedule.type === 'afternoon'
                                              ? 'bg-rose-100 text-rose-700'
                                              : 'bg-amber-100 text-amber-700'}`}
                              >
                                <div className="font-medium">{schedule.startTime} - {schedule.endTime}</div>
                                <div className="text-xs opacity-80">{schedule.room}</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-2 text-rose-200 text-xs">
                              休息
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-mint-200"></span>
          <span className="text-rose-500">上午班</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-rose-200"></span>
          <span className="text-rose-500">下午班</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-200"></span>
          <span className="text-rose-500">全天班</span>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;
