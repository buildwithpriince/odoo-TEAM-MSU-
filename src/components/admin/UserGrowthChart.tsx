import React, { useState } from 'react';
import { TrendDataPoint } from '../../types/adminAnalytics';
import { Users, UserPlus } from 'lucide-react';

interface UserGrowthChartProps {
  data: TrendDataPoint[];
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return null;
  }

  const chartHeight = 180;
  const chartWidth = 500;
  const paddingX = 35;
  const paddingY = 25;

  const maxUsers = Math.max(...data.map(d => d.usersRegistered), 3);

  const getX = (index: number) => {
    if (data.length === 1) return chartWidth / 2;
    return paddingX + (index / (data.length - 1)) * (chartWidth - 2 * paddingX);
  };

  const getY = (value: number) => {
    return chartHeight - paddingY - (value / maxUsers) * (chartHeight - 2 * paddingY);
  };

  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.usersRegistered) }));
  
  const linePath = points.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + curr.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }, '');

  const areaPath = linePath 
    ? `${linePath} L ${getX(data.length - 1)} ${chartHeight - paddingY} L ${getX(0)} ${chartHeight - paddingY} Z`
    : '';

  return (
    <div className="editorial-card p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
        <div>
          <h3 className="font-serif-heading text-base font-bold text-[#2C221E]">User Registration Velocity</h3>
          <p className="text-xs text-[#8F8175]">Monthly influx of travelers joining GlobeTrotter</p>
        </div>
        <div className="w-7 h-7 rounded-lg bg-[#EBE7DF] text-[#4A6B70] flex items-center justify-center">
          <UserPlus className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A6B70" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4A6B70" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio) => {
            const y = paddingY + ratio * (chartHeight - 2 * paddingY);
            const val = Math.round(maxUsers * (1 - ratio));
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#EAE2D5"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#8F8175"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area */}
          <path d={areaPath} fill="url(#userGrowthGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#4A6B70"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Points */}
          {data.map((d, idx) => {
            const x = getX(idx);
            const y = getY(d.usersRegistered);
            const isHovered = hoveredIdx === idx;

            return (
              <g key={d.date} className="cursor-pointer">
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? '5' : '3.5'}
                  fill="#4A6B70"
                  stroke="#FCFAF6"
                  strokeWidth="2"
                />
                <rect
                  x={x - 15}
                  y={0}
                  width="30"
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
                <text
                  x={x}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isHovered ? '#2C221E' : '#8F8175'}
                  fontWeight={isHovered ? 'bold' : 'normal'}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredIdx !== null && data[hoveredIdx] && (
          <div
            className="absolute bg-[#2C221E] text-white px-2.5 py-1.5 rounded-lg text-[11px] shadow-lg pointer-events-none"
            style={{
              left: `${(getX(hoveredIdx) / chartWidth) * 100}%`,
              top: '20%',
              transform: 'translateX(-50%)'
            }}
          >
            <span className="font-bold">{data[hoveredIdx].usersRegistered}</span> new travelers
          </div>
        )}
      </div>
    </div>
  );
};
