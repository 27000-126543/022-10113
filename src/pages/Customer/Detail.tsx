import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  FileText,
  Calendar,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Tag } from '@/components/Tag';
import { StatusBadge } from '@/components/StatusBadge';
import { maskIdCard, maskPhone } from '@/utils/validator';
import { formatFullDate, getGenderText } from '@/utils/format';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomer, getQuestionnaire, triageRecords } = useAppStore();

  const customer = getCustomer(id || '');
  const questionnaire = getQuestionnaire(id || '');
  const customerTriageRecords = triageRecords.filter((r) => r.customerId === id);

  if (!customer) {
    return (
      <div className="card p-12 text-center">
        <p className="text-rose-400">顾客不存在</p>
        <button onClick={() => navigate('/customers')} className="btn-primary mt-4">
          返回列表
        </button>
      </div>
    );
  }

  const allConcerns = [
    ...(questionnaire?.skinConcerns || []),
    ...(questionnaire?.facialConcerns || []),
    ...(questionnaire?.bodyConcerns || []),
  ];

  const hasHighRisk = questionnaire?.riskAlerts.some((r) => r.level === 'high');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-rose-500" />
        </button>
        <div>
          <h2 className="text-xl font-serif font-bold text-rose-800">顾客档案详情</h2>
          <p className="text-sm text-rose-400">创建于 {formatFullDate(customer.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-rose-gradient flex items-center justify-center text-white text-3xl font-serif font-bold">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-rose-800">{customer.name}</h3>
                  <p className="text-rose-500 mt-1">
                    {getGenderText(customer.gender)} · {customer.age}岁
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Tag variant="rose">{customer.sourceChannel}</Tag>
                    {hasHighRisk && (
                      <Tag variant="coral">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        高风险
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  编辑
                </button>
                <button
                  onClick={() => navigate(`/questionnaire/${customer.id}`)}
                  className="btn-primary flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {questionnaire ? '查看问卷' : '填写问卷'}
                </button>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h4 className="font-serif font-semibold text-rose-800 mb-4">基本信息</h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-rose-400" />
                  <div>
                    <p className="text-sm text-rose-400">手机号</p>
                    <p className="text-rose-700 font-medium">{maskPhone(customer.phone)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-rose-400" />
                  <div>
                    <p className="text-sm text-rose-400">身份证号</p>
                    <p className="text-rose-700 font-medium">{maskIdCard(customer.idCard)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-rose-400" />
                  <div>
                    <p className="text-sm text-rose-400">来院渠道</p>
                    <p className="text-rose-700 font-medium">{customer.sourceChannel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-rose-400" />
                  <div>
                    <p className="text-sm text-rose-400">预约项目</p>
                    <p className="text-rose-700 font-medium">{customer.appointmentItem}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {questionnaire && (
            <>
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-serif font-semibold text-rose-800">求美诉求</h4>
                  <Link to={`/questionnaire/${customer.id}`} className="text-sm text-rose-500 hover:text-rose-600">
                    查看详情
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allConcerns.length > 0 ? (
                    allConcerns.map((concern) => (
                      <Tag key={concern} variant="mint">{concern}</Tag>
                    ))
                  ) : (
                    <p className="text-rose-400 text-sm">暂无诉求记录</p>
                  )}
                </div>
              </div>

              {questionnaire.riskAlerts.length > 0 && (
                <div className="card p-6 border-l-4 border-coral-400">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-coral-500" />
                    <h4 className="font-serif font-semibold text-rose-800">风险提示</h4>
                  </div>
                  <div className="space-y-3">
                    {questionnaire.riskAlerts.map((alert) => (
                      <div key={alert.id} className="p-4 bg-coral-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Tag variant="coral" size="sm">
                            {alert.level === 'high' ? '高风险' : alert.level === 'medium' ? '中风险' : '低风险'}
                          </Tag>
                          <span className="font-medium text-rose-700">{alert.title}</span>
                        </div>
                        <p className="text-sm text-rose-600 mt-2">{alert.description}</p>
                        <p className="text-sm text-mint-600 mt-1">
                          <strong>建议：</strong>{alert.suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="card p-6">
            <h4 className="font-serif font-semibold text-rose-800 mb-4">标签</h4>
            <div className="flex flex-wrap gap-2">
              {customer.tags.map((tag) => (
                <Tag key={tag} variant="rose">{tag}</Tag>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h4 className="font-serif font-semibold text-rose-800 mb-4">快捷操作</h4>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/questionnaire/${customer.id}`)}
                className="w-full p-3 text-left rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-3"
              >
                <FileText className="w-5 h-5 text-rose-400" />
                <span className="text-rose-700">填写初诊问卷</span>
              </button>
              <button className="w-full p-3 text-left rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-3">
                <Calendar className="w-5 h-5 text-rose-400" />
                <span className="text-rose-700">预约下次到店</span>
              </button>
              <button className="w-full p-3 text-left rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-3">
                <Phone className="w-5 h-5 text-rose-400" />
                <span className="text-rose-700">拨打电话</span>
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h4 className="font-serif font-semibold text-rose-800 mb-4">分诊历史</h4>
            {customerTriageRecords.length === 0 ? (
              <p className="text-sm text-rose-400">暂无分诊记录</p>
            ) : (
              <div className="space-y-3">
                {customerTriageRecords.map((record) => (
                  <div key={record.id} className="p-3 bg-cream-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-rose-700">{record.doctorName}</span>
                      <StatusBadge status={record.status} size="sm" />
                    </div>
                    <p className="text-xs text-rose-400">
                      {record.departmentName} · {record.room}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-rose-400 mt-1">
                      <Clock className="w-3 h-3" />
                      {formatFullDate(record.queuedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h4 className="font-serif font-semibold text-rose-800 mb-4">咨询师标签</h4>
            {questionnaire?.consultantTags && questionnaire.consultantTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {questionnaire.consultantTags.map((tag) => (
                  <Tag key={tag} variant="mint">{tag}</Tag>
                ))}
              </div>
            ) : (
              <p className="text-sm text-rose-400">暂无标签</p>
            )}
            {questionnaire?.consultantNotes && (
              <div className="mt-4 p-3 bg-cream-50 rounded-xl">
                <p className="text-xs text-rose-400 mb-1">咨询师备注</p>
                <p className="text-sm text-rose-600">{questionnaire.consultantNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
