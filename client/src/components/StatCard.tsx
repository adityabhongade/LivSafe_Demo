import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ReactNode;
  iconColor: string;
  iconBgColor: string;
}

export function StatCard({
  title,
  value,
  change,
  icon,
  iconColor,
  iconBgColor,
}: StatCardProps) {
  return (
    <div className="workspace-stat rounded-lg p-5 border border-primary-600 transition-colors duration-200 hover:border-primary-500">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-primary-200">{title}</h3>
        <span className="workspace-stat__icon" aria-hidden="true">{icon}</span>
      </div>
      <p className="text-3xl font-semibold text-white mb-1 tabular-nums">{value}</p>
      {change && <p className="text-sm text-primary-200">{change}</p>}
    </div>
  );
}
