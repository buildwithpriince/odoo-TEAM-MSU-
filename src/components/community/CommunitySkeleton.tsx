import React from 'react';

export const CommunitySkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="editorial-card p-6 sm:p-7 space-y-5 animate-pulse">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#EAE2D5]" />
              <div className="space-y-2">
                <div className="w-32 h-3.5 bg-[#EAE2D5] rounded-md" />
                <div className="w-24 h-2.5 bg-[#F0EAE1] rounded-md" />
              </div>
            </div>
            <div className="w-16 h-7 bg-[#F0EAE1] rounded-xl" />
          </div>

          {/* Title & badge */}
          <div className="space-y-2">
            <div className="w-28 h-4 bg-[#F0EAE1] rounded-md" />
            <div className="w-3/4 h-6 bg-[#EAE2D5] rounded-lg" />
          </div>

          {/* Cover image */}
          <div className="w-full h-60 bg-[#EAE2D5] rounded-2xl" />

          {/* Route & metadata */}
          <div className="space-y-2">
            <div className="w-48 h-3 bg-[#F0EAE1] rounded-md" />
            <div className="flex gap-2">
              <div className="w-24 h-6 bg-[#F0EAE1] rounded-xl" />
              <div className="w-24 h-6 bg-[#F0EAE1] rounded-xl" />
              <div className="w-24 h-6 bg-[#F0EAE1] rounded-xl" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="w-full h-3 bg-[#F0EAE1] rounded-md" />
            <div className="w-4/5 h-3 bg-[#F0EAE1] rounded-md" />
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between">
            <div className="w-24 h-4 bg-[#F0EAE1] rounded-md" />
            <div className="flex gap-2">
              <div className="w-20 h-8 bg-[#F0EAE1] rounded-xl" />
              <div className="w-28 h-8 bg-[#EAE2D5] rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
