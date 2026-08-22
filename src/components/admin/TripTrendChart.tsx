import React, { useState } from 'react';
import { TrendDataPoint } from '../../types/adminAnalytics';
import { TrendingUp, Users, Luggage } from 'lucide-react';

interface TripTrendChartProps {
  data: TrendDataPoint[];
  title?: string;
  subtitle?: string;
}

export const TripTrendChart: React.FC<TripTrendChartProps> = ({
  data,
  title = 'Trips Created Over Time',
  subtitle = 'Monthly trajectory of journeys planned and traveler registrations'
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeSeries, setActiveSeries] = useState<'both' | 'trips' | 'users'>('both');

  if (!data || data.length === 0) {
    return (
      <div className="editorial-card p-6 flex flex-col items-center justify-center min-h-[320px] text-center">
        <Luggage className="w-8 h-8 text-[#8F8175]/50 mb-2" />
        <h3 className="font-serif-heading font-bold text-[#2C221E] text-base">No timeline data available yet</h3>
        <p className="text-xs text-[#8F8175] max-w-sm mt-1">
          Trends will populate as travelers create trips and register itineraries.
        </p>
      </div>
    );
  }

  const chartHeight = 220;
  const chartWidth = 560;
  const paddingX = 40;
  const paddingY = 30;

  const maxTrips = Math.max(...data.map(d => d.tripsCreated), 1);
  const maxUsers = Math.max(...data.map(d => d.usersRegistered), 1);
  const maxValue = Math.max(maxTrips, maxUsers, 5);

  const getX = (index: number) => {
    if (data.length === 1) return chartWidth / 2;
    return paddingX + (index / (data.length - 1)) * (chartWidth - 2 * paddingX);
  };

  const getY = (value: number) => {
    return chartHeight - paddingY - (value / maxValue) * (chartHeight - 2 * paddingY);
  };

  // Generate SVG path for smooth curves
  const generatePath = (getter: (d: TrendDataPoint) => number) => {
    if (data.length === 0) return '';
    if (data.length === 1) {
      const x = getX(0);
      const y = getY(getter(data[0]));
      return `M ${x - 20} ${y} L ${x + 20} ${y}`;
    }

    const points = data.map((d, i) => ({ x: getX(i), y: getY(getter(d)) }));
    return points.reduce((acc, curr, i, arr) => {
      if (i === 0) return `M ${curr.x} ${curr.y}`;
      const prev = arr[i - 1];
      const cx = (prev.x + curr.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }, '');
  };

  const generateAreaPath = (getter: (d: TrendDataPoint) => number) => {
    const linePath = generatePath(getter);
    if (!linePath) return '';
    const lastX = getX(data.length - 1);
    const firstX = getX(0);
    const bottomY = chartHeight - paddingY;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const tripsPath = generatePath(d => d.tripsCreated);
  const tripsArea = generateAreaPath(d => d.tripsCreated);
  const usersPath = generatePath(d => d.usersRegistered);
  const usersArea = generateAreaPath(d => d.usersRegistered);

  return (
    <div className="editorial-card p-5 sm:p-6 space-y-4">
      
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F0EAE1]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-heading text-lg font-bold text-[#2C221E]">{title}</h2>
          </div>
          <p className="text-xs text-[#8F8175] mt-0.5">{subtitle}</p>
        </div>

        {/* Series Filter Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSeries('both')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeSeries === 'both' ? 'bg-[#2C221E] text-white' : 'bg-[#F0EAE1] text-[#6B5E55] hover:bg-[#EAE2D5]'
            }`}
          >
            All Series
          </button>
          <button
            onClick={() => setActiveSeries('trips')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeSeries === 'trips' ? 'bg-[#964223] text-white' : 'bg-[#F0EAE1] text-[#964223] hover:bg-[#EAE2D5]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#964223] inline-block" />
            <span>Trips</span>
          </button>
          <button
            onClick={() => setActiveSeries('users')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeSeries === 'users' ? 'bg-[#4A6B70] text-white' : 'bg-[#F0EAE1] text-[#4A6B70] hover:bg-[#EAE2D5]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#4A6B70] inline-block" />
            <span>Travelers</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
          style={{ minHeight: '200px' }}
        >
          <defs>
            <linearGradient id="tripsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#964223" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#964223" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A6B70" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#4A6B70" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingY + ratio * (chartHeight - 2 * paddingY);
            const val = Math.round(maxValue * (1 - ratio));
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
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#8F8175"
                  className="font-medium"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          {(activeSeries === 'both' || activeSeries === 'trips') && (
            <path d={tripsArea} fill="url(#tripsGradient)" />
          )}
          {(activeSeries === 'both' || activeSeries === 'users') && (
            <path d={usersArea} fill="url(#usersGradient)" />
          )}

          {/* Paths */}
          {(activeSeries === 'both' || activeSeries === 'users') && (
            <path
              d={usersPath}
              fill="none"
              stroke="#4A6B70"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}
          {(activeSeries === 'both' || activeSeries === 'trips') && (
            <path
              d={tripsPath}
              fill="none"
              stroke="#964223"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {/* Data points & Interactive hover anchors */}
          {data.map((d, idx) => {
            const x = getX(idx);
            const yTrips = getY(d.tripsCreated);
            const yUsers = getY(d.usersRegistered);
            const isHovered = hoveredIndex === idx;

            return (
              <g key={d.date} className="cursor-pointer">
                {/* Hover line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={chartHeight - paddingY}
                    stroke="#2C221E"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                )}

                {/* Invisible hover area */}
                <rect
                  x={x - 20}
                  y={0}
                  width="40"
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Point markers */}
                {(activeSeries === 'both' || activeSeries === 'trips') && (
                  <circle
                    cx={x}
                    cy={yTrips}
                    r={isHovered ? '6' : '4'}
                    fill="#964223"
                    stroke="#FCFAF6"
                    strokeWidth="2"
                    className="transition-all"
                  />
                )}
                {(activeSeries === 'both' || activeSeries === 'users') && (
                  <circle
                    cx={x}
                    cy={yUsers}
                    r={isHovered ? '5' : '3.5'}
                    fill="#4A6B70"
                    stroke="#FCFAF6"
                    strokeWidth="2"
                    className="transition-all"
                  />
                )}

                {/* X-Axis label */}
                <text
                  x={x}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isHovered ? '#2C221E' : '#8F8175'}
                  fontWeight={isHovered ? 'bold' : 'normal'}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div 
            className="absolute bg-[#2C221E] text-white px-3 py-2 rounded-xl shadow-xl text-xs space-y-1 z-30 pointer-events-none transition-all"
            style={{
              left: `${(getX(hoveredIndex) / chartWidth) * 100}%`,
              top: '15%',
              transform: 'translateX(-50%)'
            }}
          >
            <p className="font-bold text-[#FAF7F2] text-[11px] pb-1 border-b border-white/10">
              {data[hoveredIndex].label}
            </p>
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-amber-300">
                <span className="w-2 h-2 rounded-full bg-[#E07A5F]" />
                Trips Created:
              </span>
              <span className="font-bold">{data[hoveredIndex].tripsCreated}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-sky-200">
                <span className="w-2 h-2 rounded-full bg-[#7DA2A9]" />
                Travelers Registered:
              </span>
              <span className="font-bold">{data[hoveredIndex].usersRegistered}</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-[#6B5E55] border-t border-[#F0EAE1]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md bg-[#964223]" />
            <span className="font-semibold text-[#2C221E]">Trips Created</span>
            <span className="text-[#8F8175]">({data.reduce((s, d) => s + d.tripsCreated, 0)} total)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md bg-[#4A6B70]" />
            <span className="font-semibold text-[#2C221E]">Registered Travelers</span>
            <span className="text-[#8F8175]">({data.reduce((s, d) => s + d.usersRegistered, 0)} total)</span>
          </div>
        </div>

        <span className="text-[11px] text-[#8F8175] italic">
          Hover points for granular counts
        </span>
      </div>

    </div>
  );
};
