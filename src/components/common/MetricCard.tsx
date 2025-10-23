import React from 'react';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  colorClass?: string; // Tailwind bg/border color e.g. 'border-orange-600'
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  colorClass = 'border-orange-600',
}) => {
  return (
    <div className={`bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg p-5 border ${colorClass} border-opacity-30`}> 
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="text-gray-300">{title}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};
