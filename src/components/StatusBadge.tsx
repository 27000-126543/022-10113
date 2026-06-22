import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'queued' | 'calling' | 'consulting' | 'completed' | 'available' | 'busy' | 'offline';
  size?: 'sm' | 'md';
}

const statusConfig = {
  queued: { label: '等候中', className: 'bg-amber-100 text-amber-700' },
  calling: { label: '叫号中', className: 'bg-rose-100 text-rose-600 animate-pulse-soft' },
  consulting: { label: '接诊中', className: 'bg-mint-100 text-mint-700' },
  completed: { label: '已完成', className: 'bg-gray-100 text-gray-600' },
  available: { label: '空闲', className: 'bg-mint-100 text-mint-700' },
  busy: { label: '接诊中', className: 'bg-amber-100 text-amber-700' },
  offline: { label: '离线', className: 'bg-gray-100 text-gray-500' },
};

export const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full font-medium', sizeClass, config.className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', {
        'bg-mint-500': status === 'available' || status === 'completed',
        'bg-amber-500': status === 'queued' || status === 'busy',
        'bg-rose-500': status === 'calling' || status === 'consulting',
        'bg-gray-400': status === 'offline',
      })}></span>
      {config.label}
    </span>
  );
};
