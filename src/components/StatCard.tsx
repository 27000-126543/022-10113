import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
  gradient?: string;
  className?: string;
}

export const StatCard = ({ title, value, subtitle, trend, icon, gradient = 'from-rose-400 to-rose-300', className }: StatCardProps) => {
  return (
    <div className={cn('card p-5 relative overflow-hidden', className)}>
      <div className={cn('absolute top-0 right-0 w-24 h-24 bg-gradient-to-br', gradient, 'opacity-20 rounded-full -translate-y-8 translate-x-8')}></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-rose-500 text-sm font-medium">{title}</p>
          {icon && <div className="text-rose-400">{icon}</div>}
        </div>

        <p className="text-3xl font-bold text-rose-700 font-serif mt-3">{value}</p>

        <div className="flex items-center gap-justify-between mt-2">
          {trend !== undefined && (
            <span className={cn('inline-flex items-center gap-1 text-xs font-medium',
              trend >= 0 ? 'text-mint-500' : 'text-coral-500')}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </span>
          )}
          {subtitle && <span className="text-xs text-rose-400 ml-auto">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};
