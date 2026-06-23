import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { SavedBusiness } from '../types';
import { Target, MailOpen, Activity, Sparkles, CheckCircle2 } from 'lucide-react';

interface PipelineStatsProps {
  savedLeads: SavedBusiness[];
}

export default function PipelineStats({ savedLeads }: PipelineStatsProps) {
  const stats = useMemo(() => {
    let newCount = 0;
    let contactedCount = 0;
    let interestedCount = 0;
    let dncCount = 0;

    savedLeads.forEach((lead) => {
      const status = lead.status || 'New';
      if (status === 'New') newCount++;
      else if (status === 'Contacted') contactedCount++;
      else if (status === 'Interested') interestedCount++;
      else if (status === 'Do Not Contact') dncCount++;
    });

    const total = savedLeads.length;
    const contactedRate = total > 0 ? Math.round(((contactedCount + interestedCount) / total) * 100) : 0;
    const conversionRate = (contactedCount + interestedCount) > 0 
      ? Math.round((interestedCount / (contactedCount + interestedCount)) * 100) 
      : 0;

    // Chart data format
    const chartData = [
      { name: 'New Leads', value: newCount, color: '#64748b' },
      { name: 'Contacted', value: contactedCount, color: '#6366f1' },
      { name: 'Interested', value: interestedCount, color: '#10b981' },
      { name: 'Do Not Contact', value: dncCount, color: '#f43f5e' },
    ].filter(item => item.value > 0);

    return {
      newCount,
      contactedCount,
      interestedCount,
      dncCount,
      total,
      contactedRate,
      conversionRate,
      chartData
    };
  }, [savedLeads]);

  // If no chart data can be created, don't show empty charts
  const hasData = stats.chartData.length > 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = stats.total > 0 ? Math.round((data.value / stats.total) * 100) : 0;
      return (
        <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-lg text-xs leading-none">
          <p className="font-extrabold">{data.name}</p>
          <p className="mt-1.5 text-indigo-300 font-bold">
            {data.value} {data.value === 1 ? 'lead' : 'leads'} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-5 border border-slate-200 bg-white dark:border-slate-850 dark:bg-slate-950 rounded-2xl shadow-xs">
      
      {/* Col 1: Visual Pie Chart Panel */}
      <div className="lg:col-span-1 flex flex-col justify-between items-center bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 p-4.5 rounded-2xl min-h-[250px]">
        <div className="w-full text-left">
          <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
            Pipeline Distribution
          </h4>
        </div>

        {hasData ? (
          <div className="w-full h-[180px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Summary Ring text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.total}</span>
              <span className="text-[10px] uppercase font-extrabold text-slate-405 dark:text-slate-500 tracking-widest leading-none">Total</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
            No active status data to visualize
          </div>
        )}

        {/* Small inline color keys */}
        <div className="flex flex-wrap justify-center gap-x-3.5 gap-y-1.5 mt-2">
          {stats.chartData.map((item) => (
            <div key={item.name} className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-405">
                {item.name}: <span className="text-slate-800 dark:text-slate-200 font-extrabold">{item.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Col 2: Metric grid cards */}
      <div className="lg:col-span-1 grid grid-cols-2 gap-3">
        {/* New Leads badge card */}
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/20 dark:bg-slate-900/10 dark:border-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">New Leads</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-850 dark:text-white leading-none">{stats.newCount}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">Ready for triage</p>
          </div>
        </div>

        {/* Contacted leads status card */}
        <div className="p-4 rounded-2xl border border-indigo-100/50 bg-indigo-50/5 dark:bg-slate-900/10 dark:border-indigo-950 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Contacted</span>
            <MailOpen className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-indigo-700 dark:text-indigo-400 leading-none">{stats.contactedCount}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">Outreach underway</p>
          </div>
        </div>

        {/* Interested conversions card */}
        <div className="p-4 rounded-2xl border border-emerald-100/50 bg-emerald-50/5 dark:bg-slate-900/10 dark:border-emerald-950 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Interested</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-none">{stats.interestedCount}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">High intent targets</p>
          </div>
        </div>

        {/* Excluded DNC card */}
        <div className="p-4 rounded-2xl border border-rose-100/50 bg-rose-50/5 dark:bg-slate-900/10 dark:border-rose-950 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-455 tracking-wider">Excluded (DNC)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-rose-700 dark:text-rose-403 leading-none">{stats.dncCount}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">Opted out</p>
          </div>
        </div>
      </div>

      {/* Col 3: Key Health Indicators & Outreach Speedometer */}
      <div className="lg:col-span-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-100/5 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 p-5 rounded-2xl justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Health Diagnostics
            </h4>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>

          {/* Outreach rate row */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-705 dark:text-slate-310">
              <span className="flex items-center space-x-1">
                <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Outreach Coverage</span>
              </span>
              <span>{stats.contactedRate}%</span>
            </div>
            {/* progress indicator */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.contactedRate}%` }}
              />
            </div>
          </div>

          {/* Conversion rate row */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-705 dark:text-slate-310">
              <span className="flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Interested Conversion</span>
              </span>
              <span>{stats.conversionRate}%</span>
            </div>
            {/* progress indicator */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-505 dark:bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.conversionRate}%`, backgroundColor: '#10b981' }}
              />
            </div>
          </div>
        </div>

        {/* Narrative recommendation */}
        <div className="mt-4 pt-3.5 border-t border-slate-150/50 dark:border-slate-800/50 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
          {stats.total === 0 ? (
            'Bookmark leads from active searches to unlock real-time CRM health scoring and outreach pipeline analytics.'
          ) : stats.newCount > 0 ? (
            `You have ${stats.newCount} non-contacted prospects. Draft an email pitch and transition their outreach status to contacted.`
          ) : stats.interestedCount === 0 ? (
            'Excellent! All leads have been triaged. Focus on personalized outreach to convert active campaigns to interested state.'
          ) : (
            `Outstanding progress! Your lead list conversion is at ${stats.conversionRate}%. Nurture active "Interested" partnerships.`
          )}
        </div>
      </div>

    </div>
  );
}
