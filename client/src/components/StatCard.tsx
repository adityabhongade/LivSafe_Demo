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
    <div className="bg-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-primary-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor} border border-opacity-20 border-white`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      {change && <p className="text-sm text-primary-200 font-medium">{change}</p>}
    </div>
  );
}
