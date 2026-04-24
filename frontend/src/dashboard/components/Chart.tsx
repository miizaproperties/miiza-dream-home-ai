import React from 'react';

interface ChartProps {
  type: 'bar' | 'line' | 'pie';
  data: Array<{ name: string; value: number; [key: string]: any }>;
  xKey?: string;
  yKey?: string;
  height?: number;
}

export const Chart: React.FC<ChartProps> = ({ 
  type, 
  data, 
  xKey = 'name', 
  yKey = 'value',
  height = 300 
}) => {
  // Simple chart visualization using CSS
  // For production, you'd use a library like recharts or chart.js
  
  if (type === 'pie') {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }
    
    const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    if (total === 0) {
      return (
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }
    
    let currentAngle = 0;
    
    return (
      <div className="relative" style={{ width: '100%', height: `${height}px` }}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {data.map((item, index) => {
            const value = Number(item.value) || 0;
            const percentage = (value / total) * 100;
            const angle = (percentage / 100) * 360;
            const largeArc = percentage > 50 ? 1 : 0;
            
            const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
            const x2 = 100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
            const y2 = 100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
            
            const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140'];
            const color = colors[index % colors.length];
            
            const pathData = [
              `M 100 100`,
              `L ${x1} ${y1}`,
              `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            currentAngle += angle;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>
    );
  }
  
  if (type === 'bar') {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }
    
    const values = data.map(item => Number(item.value) || 0);
    const maxValue = Math.max(...values) || 1;
    
    return (
      <div className="space-y-2" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const value = Number(item.value) || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
          const color = colors[index % colors.length];
          
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-600 truncate">{item[xKey]}</div>
              <div className="flex-1">
                <div className="relative h-8 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {item.value}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  
  if (type === 'line') {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }
    
    const values = data.map(item => Number(item[yKey] || item.value) || 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;
    
    const points = data.map((item, index) => {
      const value = Number(item[yKey] || item.value) || 0;
      const x = data.length > 1 ? (index / (data.length - 1)) * 100 : 50;
      const y = 100 - (((value - minValue) / range) * 100);
      return `${x},${isNaN(y) ? 50 : y}`;
    }).join(' ');
    
    return (
      <div style={{ height: `${height}px` }} className="relative">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke="#667eea"
            strokeWidth="2"
          />
          {data.map((item, index) => {
            const value = Number(item[yKey] || item.value) || 0;
            const x = data.length > 1 ? (index / (data.length - 1)) * 100 : 50;
            const y = 100 - (((value - minValue) / range) * 100);
            if (isNaN(x) || isNaN(y)) return null;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill="#667eea"
              />
            );
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {data.map((item, index) => (
            <span key={index} className="truncate" style={{ width: `${100 / data.length}%` }}>
              {item[xKey]}
            </span>
          ))}
        </div>
      </div>
    );
  }
  
  return null;
};

