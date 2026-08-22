import React from 'react';
import { RefreshCw, ShieldCheck, Clock, Sparkles } from 'lucide-react';

interface AdminHeaderProps {
  lastUpdated: Date;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  lastUpdated,
  isRefreshing,
  onRefresh
}) => {
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#EAE2D5]">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#964223]/10 text-[#964223] border border-[#964223]/20">
            <ShieldCheck className="w-3 h-3" />
            ADMIN CONSOLE
          </span>
          <span className="text-xs text-[#8F8175] flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Live Platform Intelligence
          </span>
        </div>

        <h1 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#2C221E] tracking-tight">
          Platform Analytics
        </h1>

        <p className="text-xs sm:text-sm text-[#6B5E55] max-w-2xl">
          Understand how travelers use GlobeTrotter, where they go, and what they plan.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">
        <div className="text-right hidden sm:block">
          <div className="flex items-center gap-1 text-[11px] text-[#8F8175]">
            <Clock className="w-3 h-3" />
            <span>Updated: {formatTimeAgo(lastUpdated)}</span>
          </div>
          <p className="text-[10px] text-[#8F8175]/80">Aggregated from active trips</p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          id="admin-refresh-btn"
          aria-label="Refresh platform analytics data"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl btn-glass-primary text-xs font-bold shadow-sm cursor-pointer disabled:opacity-60 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Updating...' : 'Refresh Data'}</span>
        </button>
      </div>
    </div>
  );
};
