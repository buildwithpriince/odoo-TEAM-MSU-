import React from 'react';
import { 
  BarChart3, 
  MapPin, 
  Sparkles, 
  Users,
  Compass
} from 'lucide-react';
import { AdminTab } from '../../types/adminAnalytics';

interface AdminTabsProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  citiesCount?: number;
  activitiesCount?: number;
  usersCount?: number;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({
  activeTab,
  onTabChange,
  citiesCount,
  activitiesCount,
  usersCount
}) => {
  const tabs: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'cities', label: 'Popular Cities', icon: MapPin, badge: citiesCount },
    { id: 'activities', label: 'Popular Activities', icon: Sparkles, badge: activitiesCount },
    { id: 'users', label: 'User Trends & Analytics', icon: Users, badge: usersCount },
  ];

  return (
    <div className="border-b border-[#EAE2D5]">
      <nav 
        className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px"
        aria-label="Admin Analytics Navigation Tabs"
        role="tablist"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              id={`admin-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`admin-tabpanel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-3 px-3.5 sm:px-4 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#964223] text-[#964223]'
                  : 'border-transparent text-[#6B5E55] hover:text-[#2C221E] hover:border-[#D4C7B8]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#964223]' : 'text-[#8F8175]'}`} />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-[#964223]/15 text-[#964223]' : 'bg-[#EAE2D5] text-[#6B5E55]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
