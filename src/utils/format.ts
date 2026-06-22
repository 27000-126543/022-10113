export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatFullDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const formatWaitTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
};

export const getWaitTimeColor = (minutes: number): string => {
  if (minutes < 15) return 'text-mint-500';
  if (minutes < 30) return 'text-amber-500';
  return 'text-coral-500';
};

export const getGenderText = (gender: 'male' | 'female'): string => {
  return gender === 'male' ? '男' : '女';
};

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    queued: '等候中',
    calling: '叫号中',
    consulting: '接诊中',
    completed: '已完成',
    available: '空闲',
    busy: '接诊中',
    offline: '离线',
  };
  return statusMap[status] || status;
};
