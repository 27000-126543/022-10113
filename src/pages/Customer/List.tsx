import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, User, Phone, Calendar, QrCode } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Tag } from '@/components/Tag';
import { ScanModal, ScanResult } from '@/components/ScanModal';
import { sourceChannels } from '@/mock';
import { maskIdCard, maskPhone } from '@/utils/validator';
import { formatFullDate, getGenderText } from '@/utils/format';

const CustomerList = () => {
  const navigate = useNavigate();
  const { customers, addCustomer } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [scanModalOpen, setScanModalOpen] = useState(false);

  const filteredCustomers = customers.filter((customer) => {
    const matchSearch = customer.name.includes(searchTerm) ||
      customer.phone.includes(searchTerm) ||
      customer.appointmentItem.includes(searchTerm);
    const matchChannel = !filterChannel || customer.sourceChannel === filterChannel;
    return matchSearch && matchChannel;
  });

  const handleScanSuccess = (data: ScanResult) => {
    const existingCustomer = customers.find((c) => c.idCard === data.idCard);
    if (existingCustomer) {
      navigate(`/customers/${existingCustomer.id}`);
      return;
    }

    const newCustomer = addCustomer({
      name: data.name,
      idCard: data.idCard,
      phone: data.phone,
      age: data.age,
      gender: data.gender,
      sourceChannel: data.sourceChannel,
      appointmentItem: data.appointmentItem,
      tags: ['新客', '扫码建档'],
    });

    navigate(`/customers/${newCustomer.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索姓名、手机号、预约项目..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300
                         transition-all duration-200"
              />
            </div>

            <div className="relative">
              <Filter className="w-5 h-5 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-cream-50 border border-cream-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300
                         transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="">全部渠道</option>
                {sourceChannels.map((channel) => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setScanModalOpen(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              扫码建档
            </button>
            <button
              onClick={() => navigate('/customers/new')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              新增顾客
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            onClick={() => navigate(`/customers/${customer.id}`)}
            className="card p-5 cursor-pointer hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-rose-gradient flex items-center justify-center text-white text-xl font-serif font-medium">
                {customer.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-rose-800 truncate">{customer.name}</h4>
                  <Tag variant="gray" size="sm">
                    {getGenderText(customer.gender)} · {customer.age}岁
                  </Tag>
                </div>
                <p className="text-sm text-rose-400 mt-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {maskPhone(customer.phone)}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-cream-200 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-rose-400">来院渠道</span>
                <Tag variant="rose" size="sm">{customer.sourceChannel}</Tag>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-rose-400">预约项目</span>
                <span className="text-rose-600 font-medium">{customer.appointmentItem}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-rose-400">
                <Calendar className="w-3.5 h-3.5" />
                {formatFullDate(customer.createdAt)}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {customer.tags.slice(0, 3).map((tag) => (
                <Tag key={tag} variant="mint" size="sm">{tag}</Tag>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="card p-12 text-center">
          <User className="w-16 h-16 mx-auto text-rose-200 mb-4" />
          <p className="text-rose-400">暂无匹配的顾客</p>
          <button
            onClick={() => navigate('/customers/new')}
            className="btn-primary mt-4"
          >
            新增顾客
          </button>
        </div>
      )}

      <ScanModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};

export default CustomerList;
