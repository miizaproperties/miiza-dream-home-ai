import React from 'react';
import LoadingSpinner from './loading-spinner';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  className?: string;
  message?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  className, 
  message = 'Loading...' 
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center min-h-[200px] space-y-4',
      className
    )}>
      <LoadingSpinner size="lg" />
      <p className="text-gray-600 text-sm animate-pulse">{message}</p>
    </div>
  );
};

export default PageLoader;
