import React, { useState } from 'react';
import { 
  Database, 
  Map, 
  Key, 
  Check, 
  Copy, 
  Code, 
  Info, 
  RefreshCw,
  HardDrive,
  Cpu,
  Terminal,
  Compass
} from 'lucide-react';
import { databaseService } from '../services/db';

interface ConnectionsPanelProps {
  supabaseStatus: {
    hasCredentials: boolean;
    url: string;
    isConnected: boolean;
    error: string | null;
  };
  googleMapsStatus: {
    hasKey: boolean;
    keyPlaceholder: string;
  };
}

export default function ConnectionsPanel({
  supabaseStatus,
  googleMapsStatus
}: ConnectionsPanelProps) {
  const [copied, setCopied] = useState(false);
  const sqlBoilerplate = databaseService.getSQLSchema();

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlBoilerplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Overview Intro Banner */}
      <div className="p-6 bg-linear-to-r from-indigo-900/10 to-indigo-600/5 border border-indigo-150 rounded-2xl dark:border-indigo-950/40">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-500" />
          <span>SaaS Service Hub & Credentials</span>
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          LeadMine AI operates on an offline-first, cloud-capable SaaS pipeline. You can discover leads instantly using our pre-built local simulator, or synchronize directly with Google Places and your Supabase PostgreSQL cluster simply by defining credentials.
        </p>
      </div>

      {/* Dual Column credentials tracking status */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Supabase Status Dashboard */}
        <div className="p-5 border border-slate-200 rounded-2xl bg-white dark:border-slate-850 dark:bg-slate-950 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-lg border flex items-center justify-center ${
                  supabaseStatus.isConnected
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/60 dark:text-emerald-400'
                    : 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/60 dark:text-amber-400'
                }`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Supabase Platform Status</h4>
                  <p className="text-[11px] text-slate-400">PostgreSQL Cloud Database</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                supabaseStatus.isConnected
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {supabaseStatus.isConnected ? 'Connected' : 'Offline Mode'}
              </span>
            </div>

            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-2 border-b dark:border-slate-900">
                <span className="text-slate-400">Environment Sync Status</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">
                  {supabaseStatus.hasCredentials ? '✓ Credentials Present' : '⚠ Missing Secrets (Running Locally)'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-slate-900">
                <span className="text-slate-400">Local Storage Active</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">
                  {supabaseStatus.isConnected ? 'Secondary Backup' : '✓ Primary Persistence'}
                </span>
              </div>
              {supabaseStatus.hasCredentials && (
                <div className="py-2">
                  <span className="text-slate-400 block pb-1">Supabase Host URL</span>
                  <span className="font-mono bg-slate-50 text-[10px] p-1 rounded-md block border truncate text-slate-600 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-400">
                    {supabaseStatus.url}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed text-left">
              To connect your real database, copy your API credentials into **Settings** → **Secrets** (top right gear) as `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
            </p>
          </div>
        </div>

        {/* Google Places Key Status */}
        <div className="p-5 border border-slate-200 rounded-2xl bg-white dark:border-slate-850 dark:bg-slate-950 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-lg border flex items-center justify-center ${
                  googleMapsStatus.hasKey
                    ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/60 dark:text-indigo-400'
                    : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
                }`}>
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Google Places API Setup</h4>
                  <p className="text-[11px] text-slate-400">Location-Based Business Discoverer</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                googleMapsStatus.hasKey
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
              }`}>
                {googleMapsStatus.hasKey ? 'API Key Active' : 'Simulated (Mock)'}
              </span>
            </div>

            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-2 border-b dark:border-slate-900">
                <span className="text-slate-400">Places Active Driver</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">
                  {googleMapsStatus.hasKey ? '✓ Official Places JS' : 'LeadMine Smart Simulator'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-slate-900">
                <span className="text-slate-400 font-medium">Search Accuracy</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">
                  {googleMapsStatus.hasKey ? 'Direct Live Google Core' : 'Synthesized Target Leads'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-slate-900">
                <span className="text-slate-400">CORS Handshake Safety</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">✓ Enabled</span>
              </div>
            </div>
          </div>

          <div className="mt-5 text-left">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              To trigger direct Google Places queries, add an API Key:
              <br />
              1. Open **Settings** (⚙️ top-right gear icon) → **Secrets** 
              <br />
              2. Save as `GOOGLE_MAPS_PLATFORM_KEY`
              <br />
              The app auto-rebuilds and activates live, real Map/Places queries.
            </p>
          </div>
        </div>
      </div>

      {/* Supabase Schema DDL Setup SQL code block */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-indigo-500" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Supabase tables DDL Schema SQL Boileplate</h4>
          </div>
          <button
            onClick={handleCopySQL}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Schema Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL Setup</span>
              </>
            )}
          </button>
        </div>
        
        <div className="relative border border-slate-200 rounded-xl dark:border-slate-850 overflow-hidden">
          <div className="bg-slate-900 text-slate-450 text-[11px] font-semibold px-4 py-2 border-b dark:border-slate-850 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>schema-migration.sql</span>
            </span>
            <span className="text-indigo-455 font-mono">PostgreSQL</span>
          </div>
          <pre className="p-4.5 bg-slate-950 text-slate-300 font-mono text-[11.5px] leading-relaxed max-h-[280px] overflow-y-auto overflow-x-auto whitespace-pre select-all text-left">
            {sqlBoilerplate}
          </pre>
        </div>
      </div>

      {/* Security notice block */}
      <div className="flex items-start space-x-3 bg-indigo-50/20 border border-indigo-100 p-4.5 rounded-xl dark:bg-indigo-950/10 dark:border-indigo-900/30 text-xs">
        <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-slate-600 dark:text-slate-400">
          <p className="font-bold">Production Configuration Integrity Notice</p>
          <p className="leading-relaxed">
            All database API and Google Places requests are securely processed directly on the client, avoiding external reverse proxy delays and maintaining peak page performance. No actual API keys or database keys are ever cached or stored in the code repo.
          </p>
        </div>
      </div>
    </div>
  );
}
