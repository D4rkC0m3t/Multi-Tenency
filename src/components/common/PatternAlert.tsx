import React from 'react';

interface PatternAlertProps {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'urgent';
}

export const PatternAlert: React.FC<PatternAlertProps> = ({ title, description, severity }) => {
  const bgClass =
    severity === 'urgent'
      ? 'bg-red-900/80'
      : severity === 'warning'
      ? 'bg-yellow-900/80'
      : 'bg-gray-800/80';
  const borderClass =
    severity === 'urgent'
      ? 'border-red-600'
      : severity === 'warning'
      ? 'border-yellow-600'
      : 'border-gray-600';
  const textClass = 'text-white';

  return (
    <div className={`border ${borderClass} ${bgClass} rounded-lg p-4 mb-6`}>
      <h3 className={`text-lg font-semibold ${textClass}`}>{title}</h3>
      <p className={`mt-1 ${textClass}`}>{description}</p>
    </div>
  );
};
