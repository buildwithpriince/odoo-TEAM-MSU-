import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AnalyticsKpiCardProps {
  label: string;
  value: string | number;
  description?: string;
  trend?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  onClick?: () => void;
}

export const AnalyticsKpiCard: React.FC<AnalyticsKpiCardProps> = ({
  label,
  value,
  description,
  trend,
  isPositive = true,
  icon: Icon,
  iconBgColor = 'bg-[#F0EAE1]',
  iconColor = 'text-[#964223]',
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`editorial-card-hover p-5 flex flex-col justify-between ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8F8175]">
            {label}
          </span>
          <div className={`w-8 h-8 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <p className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C221E] tracking-tight">
            {value}
          </p>
          {trend && (
            <span className={`text-[11px] font-bold ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
              {trend}
            </span>
          )}
        </div>
      </div>

      {description && (
        <p className="text-xs text-[#8F8175] mt-2 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
