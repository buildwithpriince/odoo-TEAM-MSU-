import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  User, 
  Plus, 
  Menu, 
  X, 
  LogOut,
  Sparkles,
  Plane,
  Luggage,
  DollarSign,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { useCurrency } from '../context/CurrencyContext';

const CurrencySwitcher = () => {
  const { currency, setCurrency } = useCurrency();
  
  return (
    <div className="relative group">
      <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F0EAE1]/70 hover:bg-[#EAE2D5] border border-[#E3D9CB] text-xs font-bold text-[#2C221E] transition-colors">
        <span>{currency === 'INR' ? '₹ INR' : '$ USD'}</span>
        <ChevronDown className="w-3 h-3 text-[#8F8175]" />
      </button>
      <div className="absolute right-0 top-full mt-1 w-24 bg-white rounded-xl shadow-lg border border-[#EAE2D5] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
        <button 
          onClick={() => setCurrency('USD')}
          className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#F5F1E8] ${currency === 'USD' ? 'text-[#964223]' : 'text-[#6B5E55]'}`}
        >
          $ USD
        </button>
        <button 
          onClick={() => setCurrency('INR')}
          className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#F5F1E8] ${currency === 'INR' ? 'text-[#964223]' : 'text-[#6B5E55]'}`}
        >
          ₹ INR
        </button>
      </div>
    </div>
  );
};

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { activeTrip } = useTrip();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Sparkles },
    { name: 'My Trips', path: '/trips', icon: Luggage },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FCFAF6]/90 backdrop-blur-md border-b border-[#EAE2D5] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo */}
          <Link 
            to="/" 
            id="brand-logo-btn"
            className="flex items-center gap-3 group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#964223] flex items-center justify-center text-[#FAF7F2] shadow-sm shadow-[#964223]/20 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-5 h-5 transition-transform group-hover:rotate-45 duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-heading font-bold text-2xl tracking-tight text-[#2C221E] leading-none">
                Globe<span className="text-[#964223] font-normal italic">Trotter</span>
              </span>
              <span className="text-[10px] font-semibold text-[#8F8175] uppercase tracking-widest leading-tight mt-0.5">
                Multi-City Travel Planner
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F0EAE1]/70 p-1.5 rounded-2xl border border-[#E3D9CB]">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  id={`nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 ${
                    isActive
                      ? 'bg-[#FCFAF6] text-[#2C221E] shadow-xs font-bold'
                      : 'text-[#6B5E55] hover:text-[#2C221E] hover:bg-[#FCFAF6]/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#964223]' : 'text-[#8F8175]'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <CurrencySwitcher />
            
            {activeTrip && (
              <Link
                to={`/builder?tripId=${activeTrip.id}`}
                id="header-active-trip-btn"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EBE3D7] hover:bg-[#E3D8C8] text-[#4A3E37] text-xs font-medium transition-colors"
                title={`Continue editing ${activeTrip.title}`}
              >
                <Plane className="w-3.5 h-3.5 text-[#964223]" />
                <span className="truncate max-w-[130px]">{activeTrip.title}</span>
              </Link>
            )}

            <Link
              to="/trips/new"
              id="header-plan-trip-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#964223] text-[#FAF7F2] text-xs font-bold shadow-xs hover:bg-[#7D351B] active:scale-98 transition-all duration-150"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Plan New Trip</span>
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E2D8C9]">
                <Link 
                  to="/profile" 
                  id="user-avatar-badge"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#EAE2D5]/70 transition-colors"
                  title={user.name}
                >
                  <div className="w-8 h-8 rounded-full bg-[#E0D4C3] border border-[#C8B8A2] text-[#2C221E] font-serif-heading font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-[#2C221E] hidden xl:inline">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  id="logout-btn-header"
                  className="p-2 text-[#8F8175] hover:text-[#964223] hover:bg-[#EAE2D5]/70 rounded-xl transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                id="header-login-btn"
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#964223] bg-[#FAF7F2] hover:bg-[#EAE2D5] border border-[#E3D9CB] transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/trips/new"
              className="p-2 rounded-xl bg-[#964223] text-white"
              aria-label="New Trip"
            >
              <Plus className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle-btn"
              className="p-2 rounded-xl text-[#4A3E37] hover:bg-[#EAE2D5] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FCFAF6] border-b border-[#EAE2D5] px-4 pt-2 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex justify-end pb-2">
            <CurrencySwitcher />
          </div>
          <div className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  id={`mobile-nav-${item.name.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#EAE2D5] text-[#2C221E] font-bold'
                      : 'text-[#6B5E55] hover:bg-[#F2ECE1]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#964223]' : 'text-[#8F8175]'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#EAE2D5] flex flex-col gap-2">
            {activeTrip && (
              <Link
                to={`/builder?tripId=${activeTrip.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#F0EAE1] text-xs font-semibold text-[#2C221E]"
              >
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#964223]" />
                  <span>Current: {activeTrip.title}</span>
                </div>
                <span className="text-[10px] text-[#964223] font-bold uppercase">Builder &rarr;</span>
              </Link>
            )}

            <Link
              to="/trips/new"
              id="mobile-plan-trip-btn"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#964223] text-white text-sm font-bold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Plan New Trip</span>
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center justify-between pt-2 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E0D4C3] border border-[#C8B8A2] flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#2C221E]">{user.name}</p>
                    <p className="text-[#8F8175] text-[10px]">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  id="mobile-logout-btn"
                  className="p-2 text-[#8F8175] hover:text-[#964223]"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl border border-[#D9CBBA] text-xs font-bold text-[#2C221E]"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
