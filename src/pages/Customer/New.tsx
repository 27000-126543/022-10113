import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, CheckCircle, XCircle, User, Phone, FileText } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { validateIdCard, validatePhone } from '@/utils/validator';
import { sourceChannels } from '@/mock';

const NewCustomer = () => {
  const navigate = useNavigate();
  const { addCustomer } = useAppStore();

  const [formData, setFormData] = useState({
    name: '',
    idCard: '',
    phone: '',
    gender: 'female' as 'male' | 'female',
    age: '',
    sourceChannel: '',
    appointmentItem: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'idCard' && value.length === 18) {
      const result = validateIdCard(value);
      if (result.valid) {
        setFormData((prev) => ({
          ...prev,
          age: result.age?.toString() || '',
          gender: result.gender || 'female',
        }));
        setErrors((prev) => ({ ...prev, idCard: '' }));
      } else {
        setErrors((prev) => ({ ...prev, idCard: result.error || '' }));
      }
    }

    if (field === 'phone' && value.length === 11) {
      const result = validatePhone(value);
      if (result.valid) {
        setErrors((prev) => ({ ...prev, phone: '' }));
      } else {
        setErrors((prev) => ({ ...prev, phone: result.error || '' }));
      }
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }

    if (!formData.idCard) {
      newErrors.idCard = '请输入身份证号';
    } else {
      const result = validateIdCard(formData.idCard);
      if (!result.valid) {
        newErrors.idCard = result.error || '身份证格式不正确';
      }
    }

    if (!formData.phone) {
      newErrors.phone = '请输入手机号';
    } else {
      const result = validatePhone(formData.phone);
      if (!result.valid) {
        newErrors.phone = result.error || '手机号格式不正确';
      }
    }

    if (!formData.sourceChannel) {
      newErrors.sourceChannel = '请选择来院渠道';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      idCard: true,
      phone: true,
      sourceChannel: true,
    });

    if (!validateForm()) return;

    const newCustomer = addCustomer({
      name: formData.name,
      idCard: formData.idCard,
      phone: formData.phone,
      age: parseInt(formData.age) || 0,
      gender: formData.gender,
      sourceChannel: formData.sourceChannel,
      appointmentItem: formData.appointmentItem,
      tags: ['新客'],
    });

    navigate(`/customers/${newCustomer.id}`);
  };

  const idCardResult = formData.idCard ? validateIdCard(formData.idCard) : null;
  const phoneResult = formData.phone ? validatePhone(formData.phone) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-rose-500" />
        </button>
        <div>
          <h2 className="text-xl font-serif font-bold text-rose-800">新增顾客档案</h2>
          <p className="text-sm text-rose-400">录入顾客基本信息</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-gradient flex items-center justify-center text-white">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-rose-800">快捷建档</h4>
              <p className="text-sm text-rose-400">可通过扫码快速录入身份证信息</p>
            </div>
            <button type="button" className="btn-secondary ml-auto">
              扫码录入
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h4 className="font-serif font-semibold text-rose-800 mb-6">基本信息</h4>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-rose-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                姓名 <span className="text-coral-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="请输入姓名"
                className={`input-field ${touched.name && errors.name ? 'border-coral-400 focus:ring-coral-200' : ''}`}
              />
              {touched.name && errors.name && (
                <p className="text-xs text-coral-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-rose-700 mb-2">性别</label>
              <div className="flex gap-4">
                {['female', 'male'].map((g) => (
                  <label
                    key={g}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 cursor-pointer text-center transition-all
                              ${formData.gender === g
                                ? 'border-rose-400 bg-rose-50 text-rose-700'
                                : 'border-cream-200 text-rose-500 hover:border-rose-200'}`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      className="sr-only"
                    />
                    {g === 'female' ? '女' : '男'}
                  </label>
                ))}
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-rose-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                身份证号 <span className="text-coral-500">*</span>
              </label>
              <input
                type="text"
                value={formData.idCard}
                onChange={(e) => handleChange('idCard', e.target.value)}
                onBlur={() => handleBlur('idCard')}
                placeholder="请输入18位身份证号"
                maxLength={18}
                className={`input-field pr-10 ${touched.idCard && errors.idCard ? 'border-coral-400 focus:ring-coral-200' : ''}`}
              />
              {formData.idCard && (
                <div className="absolute right-3 top-9">
                  {idCardResult?.valid ? (
                    <CheckCircle className="w-5 h-5 text-mint-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-coral-500" />
                  )}
                </div>
              )}
              {touched.idCard && errors.idCard && (
                <p className="text-xs text-coral-500 mt-1">{errors.idCard}</p>
              )}
              {idCardResult?.valid && idCardResult.age && (
                <p className="text-xs text-mint-500 mt-1">
                  已自动识别：{idCardResult.age}岁，{idCardResult.gender === 'female' ? '女' : '男'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-rose-700 mb-2">年龄</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="岁"
                className="input-field"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-rose-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                手机号 <span className="text-coral-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                placeholder="请输入11位手机号"
                maxLength={11}
                className={`input-field pr-10 ${touched.phone && errors.phone ? 'border-coral-400 focus:ring-coral-200' : ''}`}
              />
              {formData.phone && (
                <div className="absolute right-3 top-9">
                  {phoneResult?.valid ? (
                    <CheckCircle className="w-5 h-5 text-mint-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-coral-500" />
                  )}
                </div>
              )}
              {touched.phone && errors.phone && (
                <p className="text-xs text-coral-500 mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-rose-700 mb-2">
                来院渠道 <span className="text-coral-500">*</span>
              </label>
              <select
                value={formData.sourceChannel}
                onChange={(e) => handleChange('sourceChannel', e.target.value)}
                onBlur={() => handleBlur('sourceChannel')}
                className={`input-field appearance-none cursor-pointer ${touched.sourceChannel && errors.sourceChannel ? 'border-coral-400' : ''}`}
              >
                <option value="">请选择渠道</option>
                {sourceChannels.map((channel) => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
              {touched.sourceChannel && errors.sourceChannel && (
                <p className="text-xs text-coral-500 mt-1">{errors.sourceChannel}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-rose-700 mb-2">预约项目</label>
              <input
                type="text"
                value={formData.appointmentItem}
                onChange={(e) => handleChange('appointmentItem', e.target.value)}
                placeholder="请输入预约项目（选填）"
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="btn-secondary"
          >
            取消
          </button>
          <button type="submit" className="btn-primary">
            创建档案
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCustomer;
