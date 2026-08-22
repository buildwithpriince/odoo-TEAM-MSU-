import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Compass, Sparkles, MapPin, Luggage, ArrowUpRight } from 'lucide-react';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8] text-[#2C221E]">
      <div className="bg-noise fixed inset-0 pointer-events-none z-[-1]" />
      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="border-t border-[#EAE2D5] bg-[#FCFAF6]/80 mt-auto py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#964223] flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif-heading font-bold text-[#2C221E] text-base">
                  Globe<span className="text-[#964223] italic font-normal">Trotter</span>
                </span>
                <p className="text-[11px] text-[#8F8175]">Crafted for multi-city explorers & thoughtful travelers</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-semibold text-[#6B5E55]">
              <Link to="/trips" className="hover:text-[#964223] transition-colors">My Journeys</Link>
              <Link to="/calendar" className="hover:text-[#964223] transition-colors">Calendar Timeline</Link>
              <Link to="/explore" className="hover:text-[#964223] transition-colors">Destinations</Link>
              <Link to="/community" className="hover:text-[#964223] transition-colors">Community</Link>
              <Link to="/builder" className="hover:text-[#964223] transition-colors">Itinerary Builder</Link>
              <Link to="/budget" className="hover:text-[#964223] transition-colors">Budget Calculator</Link>
              <Link to="/profile" className="hover:text-[#964223] transition-colors">Traveler Settings</Link>
            </div>

            <div className="text-xs text-[#8F8175] flex items-center gap-1.5 bg-[#F0EAE1] px-3.5 py-1.5 rounded-full border border-[#E3D9CB]">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="font-medium text-[#4A3E37]">Live Multi-Leg Sync</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
