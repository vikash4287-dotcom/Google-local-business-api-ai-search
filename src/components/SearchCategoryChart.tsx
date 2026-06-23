import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SearchHistory } from '../types';
import { PieChart as ChartIcon, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchCategoryChartProps {
  searchHistory: SearchHistory[];
}

export default function SearchCategoryChart({ searchHistory }: SearchCategoryChartProps) {
  // Process the last 10 searches to get the category distribution
  const chartData = useMemo(() => {
    const last10 = searchHistory.slice(0, 10);
    const counts: Record<string, { name: string; value: number; totalLeads: number }> = {};

    last10.forEach(item => {
      const cat = item.category || 'Other';
      if (!counts[cat]) {
        counts[cat] = { name: cat, value: 0, totalLeads: 0 };
      }
      counts[cat].value += 1; // Number of search queries
      counts[cat].totalLeads += item.resultsCount || 0; // Cumulative leads discovered
    });

    return Object.values(counts).sort((a, b) => b.value - a.value);
  }, [searchHistory]);

  const totalSearchesAnalyzed = useMemo(() => {
    return Math.min(searchHistory.length, 10);
  }, [searchHistory]);

  const totalLeadsRepresented = useMemo(() => {
    return searchHistory.slice(0, 10).reduce((acc, item) => acc + (item.resultsCount || 0), 0);
  }, [searchHistory]);

  // Premium, well-balanced SaaS color palette
  const COLORS = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#0ea5e9', // Sky
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f43f5e', // Rose
    '#3b82f6', // Blue
    '#64748b', // Slate
  ];

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10">
        <ChartIcon className="w-8 h-8 text-slate-400 mb-2 animate-pulse" />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          No analytics available. Start searching to view category metrics!
        </p>
      </div>
    );
  }

  // Custom tooltips with Tailwind CSS for full dark mode support
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3 rounded-xl shadow-xl space-y-1 text-xs">
          <p className="font-black text-slate-900 dark:text-slate-50">{data.name}</p>
          <div className="flex flex-col space-y-0.5 text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            <p className="flex justify-between gap-4">
              <span>Searches:</span>
              <span className="text-indigo-650 dark:text-indigo-400 font-black">{data.value}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span>Leads Discovered:</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold">{data.totalLeads}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Header section with subtitle */}
      <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-850 gap-2.5">
        <div className="flex items-center space-x-2">
          <ChartIcon className="w-5 h-5 text-slate-400" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Category Discovery Share (Last {totalSearchesAnalyzed})</h4>
        </div>
        <div className="flex items-center space-x-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md">
          <Sparkles className="w-3 h-3" />
          <span>{totalLeadsRepresented} Leads</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center flex-1 pt-4">
        {/* The Donut Chart */}
        <div className="col-span-1 md:col-span-6 relative flex items-center justify-center h-[200px] select-none">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text on the donut */}
          <div className="absolute text-center flex flex-col items-center justify-centerpointer-events-none">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {totalSearchesAnalyzed}
            </span>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">
              Searches
            </span>
          </div>
        </div>

        {/* Categories statistics listing */}
        <div className="col-span-1 md:col-span-6 space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {chartData.map((item, index) => {
            const percentage = ((item.value / totalSearchesAnalyzed) * 105).toFixed(0); // scale up or percentage share correctly
            const percentValue = ((item.value / totalSearchesAnalyzed) * 100).toFixed(0);
            return (
              <div 
                key={item.name}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-transparent hover:border-slate-100 dark:hover:border-slate-850/60 transition-all text-xs"
              >
                <div className="flex items-center space-x-2 truncate mr-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-350 truncate" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2.5 shrink-0 text-slate-400 dark:text-slate-500 font-semibold font-mono">
                  <span>{item.value} {item.value === 1 ? 'qry' : 'qries'}</span>
                  <span className="text-slate-200 dark:text-slate-800 font-normal">|</span>
                  <span className="text-slate-700 dark:text-slate-205 font-bold font-sans">{percentValue}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
