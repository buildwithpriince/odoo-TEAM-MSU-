import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  DollarSign, 
  PieChart as PieIcon, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  Sparkles,
  Plane,
  Building,
  Utensils,
  Ticket,
  Car,
  CreditCard,
  Trash2,
  AlertTriangle,
  Layers,
  Percent
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { BudgetItem, BudgetCategory } from '../types';

export const TripBudget: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tripIdParam = searchParams.get('tripId');
  const { trips, activeTrip, addBudgetItem, updateBudgetItem, removeBudgetItem, toggleBudgetItemPaid } = useTrip();

  const selectedTrip = trips.find(t => t.id === tripIdParam) || activeTrip || trips[0];

  const [category, setCategory] = useState<BudgetCategory>('Food & Drinks');
  const [estimatedCost, setEstimatedCost] = useState('150');
  const [actualCost, setActualCost] = useState('0');
  const [notes, setNotes] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  if (!selectedTrip) {
    return (
      <div className="editorial-card p-12 text-center max-w-md mx-auto my-12 space-y-4">
        <h2 className="font-serif-heading text-xl font-bold text-[#2C221E]">No Journey Selected</h2>
        <p className="text-[#6B5E55] text-xs">Select or plan a trip to calculate and track your travel budget.</p>
        <Link to="/trips/new" className="px-5 py-2.5 bg-[#964223] text-white rounded-xl text-xs font-bold inline-block">
          Create New Journey
        </Link>
      </div>
    );
  }

  // Calculate costs from budget items
  const budgetItems = selectedTrip.budgetItems || [];
  
  // Calculate activity costs from stops
  const activitiesTotal = (selectedTrip.stops || []).reduce((sum, stop) => {
    return sum + (stop.days || []).reduce((dSum, day) => {
      return dSum + (day.activities || []).reduce((aSum, a) => aSum + (a.cost || 0), 0);
    }, 0);
  }, 0);

  const totalEstimated = budgetItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + (item.actualCost || 0), 0);
  const totalTarget = selectedTrip.totalBudget || 3000;
  
  const effectiveTotal = totalActual > 0 ? totalActual : totalEstimated;
  const remaining = totalTarget - effectiveTotal;
  const isOverBudget = remaining < 0;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: BudgetItem = {
      id: 'b-' + Date.now(),
      category,
      estimatedCost: Number(estimatedCost) || 0,
      actualCost: Number(actualCost) || 0,
      paid: isPaid,
      notes: notes.trim()
    };

    addBudgetItem(selectedTrip.id, newItem);
    setNotes('');
    setEstimatedCost('120');
    setActualCost('0');
    setIsPaid(false);
  };

  const getCategoryMeta = (cat: BudgetCategory) => {
    switch (cat) {
      case 'Flights': return { icon: Plane, color: '#2E6171', bg: 'bg-[#2E6171]/10 text-[#2E6171]' };
      case 'Lodging': return { icon: Building, color: '#7D4E57', bg: 'bg-[#7D4E57]/10 text-[#7D4E57]' };
      case 'Food & Drinks': return { icon: Utensils, color: '#C85A32', bg: 'bg-[#C85A32]/10 text-[#C85A32]' };
      case 'Activities': return { icon: Ticket, color: '#3F6E54', bg: 'bg-[#3F6E54]/10 text-[#3F6E54]' };
      case 'Transit': return { icon: Car, color: '#D97706', bg: 'bg-[#D97706]/10 text-[#D97706]' };
      default: return { icon: CreditCard, color: '#6B5E55', bg: 'bg-[#6B5E55]/10 text-[#6B5E55]' };
    }
  };

  // Group items by category for breakdown & chart
  const categoriesList: BudgetCategory[] = ['Flights', 'Lodging', 'Food & Drinks', 'Activities', 'Transit', 'Misc'];
  const categoryStats = categoriesList.map(cat => {
    const items = budgetItems.filter(b => b.category === cat);
    const est = items.reduce((s, i) => s + (i.estimatedCost || 0), 0);
    const act = items.reduce((s, i) => s + (i.actualCost || 0), 0);
    const effective = act > 0 ? act : est;
    const percent = totalEstimated > 0 ? Math.round((est / totalEstimated) * 100) : 0;
    const meta = getCategoryMeta(cat);
    return {
      category: cat,
      estimated: est,
      actual: act,
      effective,
      percent,
      count: items.length,
      color: meta.color
    };
  }).filter(c => c.estimated > 0 || c.actual > 0);

  // SVG Donut Chart calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="editorial-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE2D5]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#964223] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Budget & Expense Manager</span>
            </div>
            <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C221E]">
              {selectedTrip.title}
            </h1>
            <p className="text-xs text-[#6B5E55] mt-1">
              Synchronized tracking for {selectedTrip.stops?.map(s => s.cityName).join(', ')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to={`/builder?tripId=${selectedTrip.id}`}
              className="px-4 py-2 rounded-xl bg-[#F0EAE1] hover:bg-[#EAE2D5] text-[#2C221E] text-xs font-bold transition-colors border border-[#E3D9CB]"
            >
              &larr; Return to Itinerary Builder
            </Link>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="editorial-card p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175]">Target Budget</span>
            <p className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C221E] mt-1">
              ${totalTarget.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#8F8175] mt-0.5">Assigned at trip scaffold</p>
          </div>

          <div className="editorial-card p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175]">Estimated Expenses</span>
            <p className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#964223] mt-1">
              ${totalEstimated.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#8F8175] mt-0.5">{budgetItems.length} line items tracked</p>
          </div>

          <div className={`editorial-card p-5 ${isOverBudget ? 'bg-rose-50/70 border-rose-200' : 'bg-[#FAF7F2]'}`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175]">
              {isOverBudget ? 'Budget Overrun' : 'Remaining Balance'}
            </span>
            <p className={`font-serif-heading text-2xl sm:text-3xl font-bold mt-1 ${
              isOverBudget ? 'text-rose-700' : 'text-emerald-700'
            }`}>
              {isOverBudget ? `-$${Math.abs(remaining).toLocaleString()}` : `$${remaining.toLocaleString()}`}
            </p>
            <p className="text-[11px] text-[#8F8175] mt-0.5">
              {isOverBudget ? 'Exceeds target limit' : 'Under allocated budget'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Donut Chart & Category distribution */}
        <div className="lg:col-span-5 editorial-card p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <h3 className="font-serif-heading text-lg font-bold text-[#2C221E] flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#964223]" />
                <span>Expense Breakdown</span>
              </h3>
              <span className="text-xs text-[#8F8175] font-semibold">By Category</span>
            </div>

            {/* SVG Donut */}
            <div className="relative flex items-center justify-center my-6">
              <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke="#EAE2D5"
                  strokeWidth="18"
                  fill="transparent"
                />
                {categoryStats.map((catStat) => {
                  const strokeDasharray = `${(catStat.percent / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                  accumulatedPercent += catStat.percent;

                  return (
                    <circle
                      key={catStat.category}
                      cx="90"
                      cy="90"
                      r={radius}
                      stroke={catStat.color}
                      strokeWidth="18"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      fill="transparent"
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(catStat.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] uppercase font-bold text-[#8F8175]">Total Estimated</span>
                <span className="font-serif-heading font-bold text-xl text-[#2C221E]">
                  ${totalEstimated.toLocaleString()}
                </span>
                {hoveredCategory && (
                  <span className="text-[10px] font-semibold text-[#964223] truncate max-w-[90px]">
                    {hoveredCategory}
                  </span>
                )}
              </div>
            </div>

            {/* Category Legend & Progress Bars */}
            <div className="space-y-3 pt-2">
              {categoryStats.map((stat) => {
                const meta = getCategoryMeta(stat.category);
                const Icon = meta.icon;

                return (
                  <div 
                    key={stat.category} 
                    className={`p-2.5 rounded-xl transition-colors ${
                      hoveredCategory === stat.category ? 'bg-[#FAF7F2]' : ''
                    }`}
                    onMouseEnter={() => setHoveredCategory(stat.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: stat.color }} 
                        />
                        <span className="font-semibold text-[#2C221E]">{stat.category}</span>
                      </div>
                      <span className="font-bold text-[#2C221E]">
                        ${stat.estimated.toLocaleString()} ({stat.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#EAE2D5] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${stat.percent}%`, backgroundColor: stat.color }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E0D7C8] text-[11px] text-[#6B5E55] mt-4">
            <span className="font-bold text-[#2C221E] block mb-0.5">Budget Tip:</span>
            Daily scheduled activities in the itinerary currently contribute <strong>${activitiesTotal}</strong> in direct entry fees and experiences.
          </div>
        </div>

        {/* Right: Detailed Expense Table & Add Expense Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Add Expense Form */}
          <div className="editorial-card p-6 space-y-4">
            <h3 className="font-serif-heading text-lg font-bold text-[#2C221E]">
              + Log New Budget Expense
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B5E55] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BudgetCategory)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E]"
                  >
                    <option value="Flights">Flights & Transport</option>
                    <option value="Lodging">Lodging / Hotels</option>
                    <option value="Food & Drinks">Food & Drinks</option>
                    <option value="Activities">Activities & Passes</option>
                    <option value="Transit">Local Transit / Cabs</option>
                    <option value="Misc">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B5E55] mb-1">
                    Estimated Cost ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B5E55] mb-1">
                    Actual Booked ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B5E55] mb-1">
                    Notes / Booking Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4 nights at heritage boutique stay"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E]"
                  />
                </div>

                <div className="flex items-center gap-3 sm:justify-end pb-1">
                  <label className="inline-flex items-center gap-1.5 text-xs text-[#2C221E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPaid}
                      onChange={(e) => setIsPaid(e.target.checked)}
                      className="rounded text-[#964223] focus:ring-[#964223]"
                    />
                    <span className="font-semibold text-[11px]">Paid</span>
                  </label>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#964223] text-white text-xs font-bold hover:bg-[#7D351B] transition-colors shrink-0 cursor-pointer"
                  >
                    + Add Item
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Expense Line Items List */}
          <div className="editorial-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
              <h3 className="font-serif-heading text-lg font-bold text-[#2C221E]">
                Budget Line Items ({budgetItems.length})
              </h3>
              <span className="text-xs text-[#8F8175]">Click Paid pill to toggle</span>
            </div>

            <div className="space-y-2.5">
              {budgetItems.map((item) => {
                const meta = getCategoryMeta(item.category);
                const Icon = meta.icon;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E0D7C8] hover:border-[#D4C4B0] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${meta.bg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-xs text-[#2C221E]">{item.category}</p>
                          {item.notes && (
                            <span className="text-[11px] text-[#8F8175] truncate max-w-[200px]">· {item.notes}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6B5E55] mt-0.5">
                          Est: ${item.estimatedCost} {item.actualCost > 0 ? `· Actual: $${item.actualCost}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleBudgetItemPaid(selectedTrip.id, item.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          item.paid
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-[#EAE2D5] text-[#6B5E55] hover:bg-[#D9CBBA]'
                        }`}
                      >
                        {item.paid ? '✓ Paid' : 'Pending'}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeBudgetItem(selectedTrip.id, item.id)}
                        className="p-1 text-[#8F8175] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
