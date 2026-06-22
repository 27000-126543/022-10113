import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Camera,
  Check,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Tag } from '@/components/Tag';
import {
  skinConcernOptions,
  facialConcernOptions,
  bodyConcernOptions,
  pastProcedureOptions,
  allergyOptions,
  consultantTagOptions,
} from '@/mock';
import { generateRiskAlerts } from '@/utils/triage';
import { suggestDoctor } from '@/utils/triage';

const steps = [
  { id: 1, title: '求美诉求', icon: Sparkles },
  { id: 2, title: '健康信息', icon: Stethoscope },
  { id: 3, title: '风险提示', icon: AlertTriangle },
  { id: 4, title: '照片指引', icon: Camera },
  { id: 5, title: '分诊建议', icon: Stethoscope },
];

const QuestionnaireForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomer, getQuestionnaire, doctors, addQuestionnaire, addTriageRecord } = useAppStore();

  const customer = getCustomer(id || '');
  const existingQuestionnaire = getQuestionnaire(id || '');

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    skinConcerns: existingQuestionnaire?.skinConcerns || [],
    facialConcerns: existingQuestionnaire?.facialConcerns || [],
    bodyConcerns: existingQuestionnaire?.bodyConcerns || [],
    pastProcedures: existingQuestionnaire?.pastProcedures || [],
    allergies: existingQuestionnaire?.allergies || [],
    contraindications: existingQuestionnaire?.contraindications || '',
    consultantNotes: existingQuestionnaire?.consultantNotes || '',
    consultantTags: existingQuestionnaire?.consultantTags || [],
    photoUrls: existingQuestionnaire?.photoUrls || [],
  });

  const riskAlerts = useMemo(() => {
    return generateRiskAlerts(
      formData.pastProcedures,
      formData.allergies,
      formData.contraindications
    );
  }, [formData.pastProcedures, formData.allergies, formData.contraindications]);

  const suggestedDoctor = useMemo(() => {
    if (!customer) return null;
    const tempQuestionnaire = {
      id: 'temp',
      customerId: customer.id,
      ...formData,
      riskAlerts,
      createdAt: new Date().toISOString(),
    };
    return suggestDoctor(doctors, customer.id);
  }, [doctors, customer, formData, riskAlerts]);

  const toggleItem = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const current = (prev[field] as unknown as string[]) || [];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const toggleConsultantTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      consultantTags: prev.consultantTags.includes(tag)
        ? prev.consultantTags.filter((t) => t !== tag)
        : [...prev.consultantTags, tag],
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!customer) return;

    const questionnaire = {
      id: `q_${Date.now()}`,
      customerId: customer.id,
      ...formData,
      riskAlerts,
      createdAt: new Date().toISOString(),
    };

    addQuestionnaire(questionnaire);

    if (suggestedDoctor) {
      const hasHighRisk = riskAlerts.some((r) => r.level === 'high');
      addTriageRecord({
        customerId: customer.id,
        customerName: customer.name,
        doctorId: suggestedDoctor.id,
        doctorName: suggestedDoctor.name,
        departmentName: suggestedDoctor.departmentName,
        room: suggestedDoctor.room,
        status: 'queued',
        priority: hasHighRisk ? 3 : 1,
        waitTime: 0,
        estimatedWait: 15,
        suggestedDoctorId: suggestedDoctor.id,
        isManualAdjusted: false,
        hasHighRisk,
      });
    }

    navigate('/triage');
  };

  if (!customer) {
    return (
      <div className="card p-12 text-center">
        <p className="text-rose-400">请先选择顾客</p>
        <button onClick={() => navigate('/customers')} className="btn-primary mt-4">
          选择顾客
        </button>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <h4 className="font-serif font-semibold text-rose-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-sm flex items-center justify-center">1</span>
                皮肤问题
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {skinConcernOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleItem('skinConcerns', option)}
                    className={`p-3 rounded-xl border-2 text-left transition-all text-sm
                              ${formData.skinConcerns.includes(option)
                                ? 'border-rose-400 bg-rose-50 text-rose-700'
                                : 'border-cream-200 text-rose-500 hover:border-rose-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {formData.skinConcerns.includes(option) && (
                        <Check className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-serif font-semibold text-rose-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-sm flex items-center justify-center">2</span>
                面部轮廓
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {facialConcernOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleItem('facialConcerns', option)}
                    className={`p-3 rounded-xl border-2 text-left transition-all text-sm
                              ${formData.facialConcerns.includes(option)
                                ? 'border-rose-400 bg-rose-50 text-rose-700'
                                : 'border-cream-200 text-rose-500 hover:border-rose-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {formData.facialConcerns.includes(option) && (
                        <Check className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-serif font-semibold text-rose-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-sm flex items-center justify-center">3</span>
                体型塑形
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {bodyConcernOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleItem('bodyConcerns', option)}
                    className={`p-3 rounded-xl border-2 text-left transition-all text-sm
                              ${formData.bodyConcerns.includes(option)
                                ? 'border-rose-400 bg-rose-50 text-rose-700'
                                : 'border-cream-200 text-rose-500 hover:border-rose-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {formData.bodyConcerns.includes(option) && (
                        <Check className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h4 className="font-serif font-semibold text-rose-800 mb-4">既往医美项目</h4>
              <div className="grid grid-cols-4 gap-3">
                {pastProcedureOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleItem('pastProcedures', option)}
                    className={`p-3 rounded-xl border-2 text-left transition-all text-sm
                              ${formData.pastProcedures.includes(option)
                                ? 'border-mint-400 bg-mint-50 text-mint-700'
                                : 'border-cream-200 text-rose-500 hover:border-mint-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {formData.pastProcedures.includes(option) && (
                        <Check className="w-4 h-4 text-mint-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-serif font-semibold text-rose-800 mb-4">过敏史</h4>
              <div className="grid grid-cols-4 gap-3">
                {allergyOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleItem('allergies', option)}
                    className={`p-3 rounded-xl border-2 text-left transition-all text-sm
                              ${formData.allergies.includes(option)
                                ? 'border-coral-400 bg-coral-50 text-coral-700'
                                : 'border-cream-200 text-rose-500 hover:border-coral-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {formData.allergies.includes(option) && (
                        <Check className="w-4 h-4 text-coral-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-serif font-semibold text-rose-800 mb-4">禁忌症 / 特殊病史</h4>
              <textarea
                value={formData.contraindications}
                onChange={(e) => setFormData((prev) => ({ ...prev, contraindications: e.target.value }))}
                placeholder="请填写高血压、糖尿病、疤痕体质等特殊情况..."
                className="input-field min-h-[100px] resize-none"
              />
            </div>

            <div>
              <h4 className="font-serif font-semibold text-rose-800 mb-4">咨询师标签</h4>
              <div className="flex flex-wrap gap-2">
                {consultantTagOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleConsultantTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                              ${formData.consultantTags.includes(tag)
                                ? 'bg-rose-500 text-white'
                                : 'bg-cream-100 text-rose-500 hover:bg-rose-100'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-serif font-semibold text-rose-800 mb-4">咨询师备注</h4>
              <textarea
                value={formData.consultantNotes}
                onChange={(e) => setFormData((prev) => ({ ...prev, consultantNotes: e.target.value }))}
                placeholder="填写顾客的特别需求、沟通要点等..."
                className="input-field min-h-[100px] resize-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral-100 mb-4">
                <AlertTriangle className="w-8 h-8 text-coral-500" />
              </div>
              <h4 className="font-serif text-xl font-semibold text-rose-800">风险评估结果</h4>
              <p className="text-rose-400 mt-2">
                共识别 {riskAlerts.length} 项风险提示，请仔细查看并告知医生
              </p>
            </div>

            {riskAlerts.length === 0 ? (
              <div className="p-8 text-center bg-mint-50 rounded-2xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mint-100 mb-4">
                  <Check className="w-8 h-8 text-mint-500" />
                </div>
                <p className="text-mint-700 font-medium">暂无风险提示</p>
                <p className="text-sm text-mint-500 mt-1">顾客健康状况良好，可正常进行治疗</p>
              </div>
            ) : (
              <div className="space-y-4">
                {riskAlerts.map((alert, index) => (
                  <div
                    key={alert.id}
                    className={`p-5 rounded-2xl border-l-4 ${alert.level === 'high'
                      ? 'bg-coral-50 border-coral-400 animate-breathe'
                      : alert.level === 'medium'
                        ? 'bg-amber-50 border-amber-400'
                        : 'bg-mint-50 border-mint-400'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Tag variant={alert.level === 'high' ? 'coral' : alert.level === 'medium' ? 'rose' : 'mint'}>
                        {alert.level === 'high' ? '高风险' : alert.level === 'medium' ? '中风险' : '低风险'}
                      </Tag>
                      <span className="font-semibold text-rose-700">{alert.title}</span>
                    </div>
                    <p className="text-sm text-rose-600">{alert.description}</p>
                    <div className="mt-3 p-3 bg-white/60 rounded-xl">
                      <p className="text-sm text-mint-600">
                        <strong>建议：</strong>{alert.suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 bg-rose-50 rounded-xl">
              <p className="text-sm text-rose-600">
                <strong>温馨提示：</strong>
                以上风险提示由系统自动识别，仅供参考。最终治疗方案需由专业医生评估确定。
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-4">
                <Camera className="w-8 h-8 text-rose-500" />
              </div>
              <h4 className="font-serif text-xl font-semibold text-rose-800">照片采集指引</h4>
              <p className="text-rose-400 mt-2">
                请按以下指引拍摄顾客照片，便于医生术前评估
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { angle: '正面照', desc: '正视镜头，表情自然', icon: '👤' },
                { angle: '左侧面', desc: '90°侧面，耳朵可见', icon: '👈' },
                { angle: '右侧面', desc: '90°侧面，耳朵可见', icon: '👉' },
                { angle: '45°左侧', desc: '半侧面，展示轮廓', icon: '↙️' },
                { angle: '45°右侧', desc: '半侧面，展示轮廓', icon: '↘️' },
                { angle: '仰头位', desc: '头部微仰，展示下颌', icon: '⬆️' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="aspect-square bg-cream-50 rounded-2xl border-2 border-dashed border-rose-200
                           flex flex-col items-center justify-center cursor-pointer
                           hover:border-rose-400 hover:bg-rose-50 transition-all group"
                >
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</span>
                  <p className="font-medium text-rose-700">{item.angle}</p>
                  <p className="text-xs text-rose-400 mt-1">{item.desc}</p>
                  <button className="mt-3 px-4 py-1.5 bg-white rounded-full text-xs text-rose-500 shadow-sm
                                   opacity-0 group-hover:opacity-100 transition-opacity">
                    上传照片
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-mint-50 rounded-xl">
              <p className="text-sm text-mint-600">
                <strong>拍摄须知：</strong>
                1. 请在自然光下拍摄，避免使用美颜滤镜
                2. 请顾客卸妆后拍摄，确保皮肤状态真实
                3. 照片将严格保密，仅用于医疗评估
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mint-100 mb-4">
                <Stethoscope className="w-8 h-8 text-mint-500" />
              </div>
              <h4 className="font-serif text-xl font-semibold text-rose-800">智能分诊建议</h4>
              <p className="text-rose-400 mt-2">
                系统根据顾客诉求和医生专长，推荐以下医生
              </p>
            </div>

            {suggestedDoctor ? (
              <div className="p-6 bg-gradient-to-br from-mint-50 to-rose-50 rounded-2xl border-2 border-mint-300">
                <div className="flex items-center gap-4">
                  <img
                    src={suggestedDoctor.avatar}
                    alt={suggestedDoctor.name}
                    className="w-20 h-20 rounded-full bg-white shadow-md"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xl font-serif font-bold text-rose-800">
                        {suggestedDoctor.name}
                      </h5>
                      <Tag variant="mint">推荐医生</Tag>
                    </div>
                    <p className="text-rose-500 mt-1">
                      {suggestedDoctor.title} · {suggestedDoctor.departmentName}
                    </p>
                    <p className="text-sm text-rose-400 mt-1">{suggestedDoctor.room}</p>
                  </div>
                  <div className="text-right">
                    <Tag variant={suggestedDoctor.status === 'available' ? 'mint' : 'rose'}>
                      {suggestedDoctor.status === 'available' ? '可接诊' : '接诊中'}
                    </Tag>
                    <p className="text-sm text-rose-400 mt-2">
                      今日已接诊 {suggestedDoctor.todayPatientCount} 人
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-cream-200">
                  <p className="text-sm text-rose-500 mb-2">擅长项目</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedDoctor.specialties.slice(0, 5).map((s) => (
                      <Tag key={s} variant="rose">{s}</Tag>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-2xl">
                <p className="text-rose-400">暂无合适的医生推荐</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <p className="text-sm text-rose-400">求美诉求</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[...formData.skinConcerns, ...formData.facialConcerns, ...formData.bodyConcerns].slice(0, 6).map((c) => (
                    <Tag key={c} variant="rose" size="sm">{c}</Tag>
                  ))}
                </div>
              </div>
              <div className="card p-4">
                <p className="text-sm text-rose-400">风险等级</p>
                <div className="mt-2">
                  {riskAlerts.length === 0 ? (
                    <Tag variant="mint">低风险</Tag>
                  ) : riskAlerts.some((r) => r.level === 'high') ? (
                    <Tag variant="coral">高风险</Tag>
                  ) : (
                    <Tag variant="rose">中风险</Tag>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-rose-700 mb-2">分诊调整说明（选填）</label>
              <textarea
                placeholder="如手动调整医生，请填写调整原因..."
                className="input-field min-h-[80px] resize-none"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-rose-500" />
        </button>
        <div>
          <h2 className="text-xl font-serif font-bold text-rose-800">初诊问卷</h2>
          <p className="text-sm text-rose-400">
            {customer.name} · {customer.age}岁 · {customer.sourceChannel}
          </p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
                            ${currentStep > step.id
                              ? 'bg-mint-500 text-white'
                              : currentStep === step.id
                                ? 'bg-rose-gradient text-white shadow-rose'
                                : 'bg-cream-100 text-rose-400'}`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-rose-700' : 'text-rose-400'}`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-6 ${currentStep > step.id ? 'bg-mint-300' : 'bg-cream-200'}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-[400px]">{renderStepContent()}</div>

        <div className="flex justify-between mt-8 pt-6 border-t border-cream-200">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`btn-secondary flex items-center gap-2 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" />
            上一步
          </button>

          {currentStep < steps.length ? (
            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
              下一步
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
              确认分诊
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireForm;
