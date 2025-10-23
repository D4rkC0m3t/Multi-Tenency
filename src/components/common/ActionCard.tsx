import React from 'react';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  onClick: () => void;
  colorClass?: string; // Tailwind border/color class
}

export const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  description,
  ctaLabel,
  onClick,
  colorClass = 'border-orange-600',
}) => {
  return (
    <div className={`bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg p-5 border ${colorClass} border-opacity-30`}> 
      <div className="flex items-center mb-3">
        {icon}
        <h3 className="ml-2 text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-gray-300 mb-4">{description}</p>
      <button
        onClick={onClick}
        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded"
      >
        {ctaLabel}
      </button>
    </div>
  );
};
