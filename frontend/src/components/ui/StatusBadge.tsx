import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  Draft: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    label: 'Draft',
  },
  Generated: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Generated',
  },
  Finalized: {
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    label: 'Finalized',
  },
  Exported: {
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    label: 'Exported',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status] || statusConfig.Draft;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
