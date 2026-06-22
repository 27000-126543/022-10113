import { useState, useEffect } from 'react';
import { X, QrCode, ScanLine, Check, User, Phone, FileText, Calendar } from 'lucide-react';
import { sourceChannels } from '@/mock';
import { validateIdCard } from '@/utils/validator';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: ScanResult) => void;
}

export interface ScanResult {
  name: string;
  idCard: string;
  phone: string;
  age: number;
  gender: 'male' | 'female';
  sourceChannel: string;
  appointmentItem: string;
}

const generateValidIdCard = (baseId: string): string => {
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(baseId[i]) * weights[i];
  }
  const checkCode = checkCodes[sum % 11];
  return baseId + checkCode;
};

const mockIdCards = [
  { name: '张雨薇', idCard: generateValidIdCard('31011519950812345'), phone: '13912345678', channel: '小红书', item: '光子嫩肤' },
  { name: '李静怡', idCard: generateValidIdCard('32010419920322456'), phone: '13823456789', channel: '老客转介', item: '玻尿酸填充' },
  { name: '王梦瑶', idCard: generateValidIdCard('33010619981105567'), phone: '13734567890', channel: '大众点评', item: '双眼皮' },
  { name: '陈雅婷', idCard: generateValidIdCard('44010319900518678'), phone: '13645678901', channel: '抖音', item: '热玛吉' },
  { name: '刘诗涵', idCard: generateValidIdCard('51010719960428789'), phone: '13556789012', channel: '朋友推荐', item: '隆鼻' },
];

export const ScanModal = ({ isOpen, onClose, onScanSuccess }: ScanModalProps) => {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanType, setScanType] = useState<'idcard' | 'appointment'>('idcard');

  useEffect(() => {
    if (isOpen) {
      setScanning(false);
      setScanProgress(0);
      setScanSuccess(false);
    }
  }, [isOpen]);

  const handleStartScan = () => {
    setScanning(true);
    setScanProgress(0);
    setScanSuccess(false);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanSuccess(true);
          setScanning(false);

          const randomIndex = Math.floor(Math.random() * mockIdCards.length);
          const mockData = mockIdCards[randomIndex];
          const idResult = validateIdCard(mockData.idCard);

          setTimeout(() => {
            onScanSuccess({
              name: mockData.name,
              idCard: mockData.idCard,
              phone: mockData.phone,
              age: idResult.age || 28,
              gender: idResult.gender || 'female',
              sourceChannel: mockData.channel,
              appointmentItem: mockData.item,
            });
            onClose();
          }, 800);

          return 100;
        }
        return prev + 5;
      });
    }, 50);

    return () => clearInterval(interval);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md mx-4 overflow-hidden animate-slide-up">
        <div className="bg-rose-gradient p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold">扫码建档</h3>
                <p className="text-sm text-white/80">扫描身份证或预约二维码</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setScanType('idcard')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${scanType === 'idcard'
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
            >
              身份证扫码
            </button>
            <button
              onClick={() => setScanType('appointment')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${scanType === 'appointment'
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
            >
              预约二维码
            </button>
          </div>

          <div className="relative aspect-square bg-gradient-to-br from-rose-50 to-cream-50 rounded-2xl flex items-center justify-center overflow-hidden mb-6">
            <div className="absolute inset-8 border-2 border-rose-300 rounded-xl">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-rose-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-rose-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-rose-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-rose-500 rounded-br-lg"></div>
            </div>

            {!scanning && !scanSuccess && (
              <div className="text-center">
                <ScanLine className="w-16 h-16 text-rose-300 mx-auto mb-3" />
                <p className="text-rose-400 text-sm">
                  {scanType === 'idcard' ? '将身份证放入框内' : '将预约二维码放入框内'}
                </p>
              </div>
            )}

            {scanning && (
              <div className="text-center w-full px-8">
                <div className="relative h-32 mb-4">
                  <div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent"
                    style={{ top: `${scanProgress * 0.8}%`, animation: 'scanLine 2s linear infinite' }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-rose-200" />
                  </div>
                </div>
                <p className="text-rose-500 text-sm mb-2">正在识别...</p>
                <div className="w-full bg-rose-100 rounded-full h-2">
                  <div
                    className="bg-rose-gradient h-2 rounded-full transition-all duration-100"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {scanSuccess && (
              <div className="text-center">
                <div className="w-16 h-16 bg-mint-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <p className="text-mint-600 font-medium">识别成功</p>
              </div>
            )}
          </div>

          {!scanning && !scanSuccess && (
            <button
              onClick={handleStartScan}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <ScanLine className="w-5 h-5" />
              开始{scanType === 'idcard' ? '扫描身份证' : '扫描预约码'}
            </button>
          )}

          <div className="mt-6 p-4 bg-cream-50 rounded-xl">
            <p className="text-xs text-rose-500 mb-2 font-medium">
              {scanType === 'idcard' ? '识别信息：' : '预约信息：'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-rose-400">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                姓名
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                身份证号
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                手机号
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                预约项目
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
