import React from 'react';

export const RouteBackground: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden opacity-10">
      <svg
        className="absolute top-0 left-0 w-full min-h-[150vh] text-[#964223]"
        preserveAspectRatio="none"
        viewBox="0 0 1000 2000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 100,0 C 150,400 850,600 900,1000 C 950,1400 150,1600 200,2000"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="12 12"
          strokeLinecap="round"
        />
        
        {/* Decorative Map Pins along the path */}
        <circle cx="115" cy="115" r="8" fill="currentColor" opacity="0.5" />
        <circle cx="650" cy="530" r="12" fill="currentColor" opacity="0.3" />
        <circle cx="900" cy="1000" r="10" fill="currentColor" opacity="0.4" />
        <circle cx="450" cy="1480" r="8" fill="currentColor" opacity="0.5" />
        <circle cx="200" cy="2000" r="12" fill="currentColor" opacity="0.3" />
      </svg>
    </div>
  );
};
