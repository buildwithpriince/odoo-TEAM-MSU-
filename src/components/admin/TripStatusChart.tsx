import React, { useState } from 'react';
import { TripStatusBreakdown } from '../../types/adminAnalytics';
import { Compass, CheckCircle2, Clock, MapPin } from 'lucide-react';

interface TripStatusChartProps {
  data: TripStatusBreakdown[];
  totalTrips: number;
}

export const TripStatusChart: React.FC<TripStatusChartProps> = ({
  data,
  totalTrips
}) => {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  if (!data || data.length === 0 || totalTrips === 0) {
    return (
      <div className="editorial-card p-6 flex flex-col items-center justify-center min-h-[320px] text-center">
        <Compass className="w-8 h-8 text-[#8F8175]/50 mb-2" />
        <h3 className="font-serif-heading font-bold text-[#2C221E] text-base">No active trip statuses</h3>
        <p className="text-xs text-[#8F8175] max-w-xs mt-1">
          Trip status analytics will display once journeys are registered.
        </p>
      </div>
    );
  }

  // Calculate SVG donut segments
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const segments = data.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeOffset;
    cumulativeOffset += (item.percentage / 100) * circumference;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return Clock;
      case 'upcoming':
        return MapPin;
      case 'completed':
        return CheckCircle2;
      default:
        return Compass;
    }
  };

  const activeItem = hoveredStatus ? data.find(d => d.status === hoveredStatus) : null;

  return (
    <div className="editorial-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
      
      {/* Header */}
      <div className="pb-2 border-b border-[#F0EAE1]">
        <h2 className="font-serif-heading text-lg font-bold text-[#2C221E]">Trip Status Breakdown</h2>
        <p className="text-xs text-[#8F8175] mt-0.5">Distribution of platform journeys by lifecycle stage</p>
      </div>

      {/* Donut Chart and Center Counter */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F0EAE1"
              strokeWidth={strokeWidth - 4}
            />

            {/* Segments */}
            {segments.map((seg) => {
              const isHovered = hoveredStatus === seg.status;
              return (
                <circle
                  key={seg.status}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredStatus(seg.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                />
              );
            })}
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="font-serif-heading text-2xl font-bold text-[#2C221E]">
              {activeItem ? activeItem.count : totalTrips}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175]">
              {activeItem ? activeItem.label : 'Total Trips'}
            </span>
          </div>
        </div>

        {/* Legend & Breakdown List */}
        <div className="space-y-2.5 w-full sm:w-48">
          {data.map((item) => {
            const Icon = getStatusIcon(item.status);
            const isHovered = hoveredStatus === item.status;

            return (
              <div
                key={item.status}
                onMouseEnter={() => setHoveredStatus(item.status)}
                onMouseLeave={() => setHoveredStatus(null)}
                className={`p-2 rounded-xl transition-all cursor-pointer border ${
                  isHovered
                    ? 'bg-white border-[#EAE2D5] shadow-xs translate-x-1'
                    : 'bg-[#F9F6F0]/60 border-transparent hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-bold text-[#2C221E]">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold text-[#2C221E]">{item.count}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8F8175] mt-1">
                  <span>{item.percentage}% share</span>
                  <Icon className="w-3 h-3 text-[#8F8175]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Insight */}
      <div className="pt-2 border-t border-[#F0EAE1] text-[11px] text-[#8F8175]">
        <span>Most active journeys are in early itinerary development</span>
      </div>

    </div>
  );
};
