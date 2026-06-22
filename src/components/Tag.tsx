import { cn } from '@/lib/utils';

interface TagProps {
  children: React.ReactNode;
  variant?: 'rose' | 'mint' | 'coral' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Tag = ({ children, variant = 'rose', size = 'md', className }: TagProps) => {
  const variantClasses = {
    rose: 'bg-rose-100 text-rose-600',
    mint: 'bg-mint-100 text-mint-600',
    coral: 'bg-coral-100 text-coral-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {children}
    </span>
  );
};
