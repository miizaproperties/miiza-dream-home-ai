import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 border border-blue-200/60 shadow-md hover:shadow-xl transition-all duration-300 hover:border-blue-300/70 hover:from-blue-100/40 hover:to-blue-50/30">
      <div className="flex flex-col h-full">
        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">{title}</p>
        <div className="flex-1">
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-3 inline-flex items-center">
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-400 ml-2">from last month</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
