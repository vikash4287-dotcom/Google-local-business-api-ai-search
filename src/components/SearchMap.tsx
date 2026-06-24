import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { Star, MapPin, Globe, Phone, Bookmark, BookmarkCheck, LayoutGrid, Info, Sparkles, X } from 'lucide-react';
import { Business, SavedBusiness } from '../types';
import { calculateLeadScore } from '../utils/score';

interface SearchMapProps {
  leads: Business[];
  savedLeads: SavedBusiness[];
  onSaveLead: (lead: Business) => void;
  onRemoveLead: (savedId: string) => void;
  onSelectLead: (lead: Business) => void;
  citySearched: string;
}

interface LeadMarkerProps {
  lead: Business;
  isSaved: boolean;
  savedId?: string;
  onSaveLead: (lead: Business) => void;
  onRemoveLead: (savedId: string) => void;
  onSelectLead: (lead: Business) => void;
}

// Custom Marker component with local state for InfoWindow anchoring
const LeadMarker: React.FC<LeadMarkerProps> = ({
  lead,
  isSaved,
  savedId,
  onSaveLead,
  onRemoveLead,
  onSelectLead,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [isOpen, setIsOpen] = useState(false);

  const position = { lat: lead.latitude || 0, lng: lead.longitude || 0 };
  const hasWebsite = !!lead.website;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        title={lead.name}
        onClick={() => setIsOpen(true)}
      >
        <Pin
          background={isSaved ? '#6366f1' : hasWebsite ? '#10b981' : '#f43f5e'}
          glyphColor="#fff"
          borderColor={isSaved ? '#4f46e5' : hasWebsite ? '#059669' : '#e11d48'}
          scale={isSaved ? 1.15 : 1.0}
        />
      </AdvancedMarker>

      {isOpen && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setIsOpen(false)}
          headerDisabled={true}
        >
          <div className="p-1 min-w-[240px] max-w-[280px] text-slate-800 text-xs font-sans">
            <div className="flex justify-between items-start gap-1 pb-1.5 border-b border-slate-100">
              <div>
                <h4 className="font-extrabold text-slate-900 leading-tight pr-1 text-sm">
                  {lead.name}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider shrink-0">
                    {lead.category}
                  </span>
                  {(() => {
                    const { score, label } = calculateLeadScore(
                      lead.rating,
                      lead.reviewCount,
                      !!lead.website
                    );
                    return (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] bg-slate-100 border border-slate-200 text-slate-700 font-bold leading-none select-none">
                        Score: {score} ({label})
                      </span>
                    );
                  })()}
                </div>
              </div>
              <div className="flex items-center space-x-0.5 bg-amber-50 px-1.5 py-0.5 rounded text-amber-800 border border-amber-100 font-bold text-[10px] shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                <span>{lead.rating ? lead.rating.toFixed(1) : 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1.5 py-2 select-text">
              <p className="text-[11px] text-slate-500 font-medium flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{lead.address}</span>
              </p>

              {lead.phone && (
                <p className="text-[11px] text-slate-505 font-mono flex items-center gap-1">
                  <Phone className="w-3.2 h-3.2 text-slate-400 shrink-0" />
                  <span>{lead.phone}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 gap-2">
              {hasWebsite ? (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-emerald-600 font-semibold hover:underline text-[10px]"
                >
                  <Globe className="w-3 h-3" />
                  <span>Website Active</span>
                </a>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-800 border border-rose-154 shrink-0">
                  Deficit: No Site
                </span>
              )}

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => onSelectLead(lead)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md transition-all cursor-pointer"
                >
                  Inspect
                </button>

                {isSaved ? (
                  <button
                    onClick={() => {
                      if (savedId) onRemoveLead(savedId);
                      setIsOpen(false);
                    }}
                    className="p-1 text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-colors cursor-pointer"
                    title="Remove Bookmark"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onSaveLead(lead);
                    }}
                    className="p-1 text-slate-400 border border-slate-200 rounded-md hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer"
                    title="Bookmark Lead"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default function SearchMap({
  leads,
  savedLeads,
  onSaveLead,
  onRemoveLead,
  onSelectLead,
  citySearched,
}: SearchMapProps) {
  // Check for configuration
  const API_KEY =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';

  const isRealGoogleMapsKey = (key: string): boolean => {
    return typeof key === 'string' && key.trim().startsWith('AIzaSy') && key.trim().length > 30;
  };

  const hasValidKey = isRealGoogleMapsKey(API_KEY);

  // Active leads with valid coordinates
  const validCoordinates = leads.filter(l => l.latitude && l.longitude);

  // Computing responsive coordinates mapping for vector visual fallback
  const bounds = React.useMemo(() => {
    if (validCoordinates.length === 0) return null;
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    validCoordinates.forEach(c => {
      const lat = c.latitude!;
      const lng = c.longitude!;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });

    // Padding span
    const latSpan = maxLat - minLat || 0.05;
    const lngSpan = maxLng - minLng || 0.05;

    return {
      minLat: minLat - latSpan * 0.15,
      maxLat: maxLat + latSpan * 0.15,
      minLng: minLng - lngSpan * 0.15,
      maxLng: maxLng + lngSpan * 0.15,
    };
  }, [validCoordinates]);

  // Set selected lead for local popup display on mock vector map
  const [activePopupLead, setActivePopupLead] = useState<Business | null>(null);

  // Reset active popup when list of leads changes
  useEffect(() => {
    setActivePopupLead(null);
  }, [leads]);

  // Map center coordinates for Google map
  const center = React.useMemo(() => {
    if (validCoordinates.length > 0) {
      const avgLat = validCoordinates.reduce((sum, curr) => sum + (curr.latitude || 0), 0) / validCoordinates.length;
      const avgLng = validCoordinates.reduce((sum, curr) => sum + (curr.longitude || 0), 0) / validCoordinates.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 39.8283, lng: -98.5795 };
  }, [validCoordinates]);

  // Saved map check
  const savedMap = React.useMemo(() => {
    const map = new globalThis.Map<string, string>();
    savedLeads.forEach(item => {
      map.set(`${item.name.toLowerCase()}_${item.city.toLowerCase()}`, item.id);
    });
    return map;
  }, [savedLeads]);

  // If there's no valid key, render a gorgeous mock vector layout instead so we do NOT cause API load errors
  if (!hasValidKey) {
    return (
      <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/40 h-[460px] flex flex-col justify-between">
        {/* Absolute Background stylized grid & roads mimicking a live map view */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1.5px,transparent_1.5px),linear-gradient(to_bottom,#1e293b_1.5px,transparent_1.5px)] bg-[size:28px_28px] opacity-15 pointer-events-none" />
        
        {/* Decorative Roads */}
        <svg className="absolute inset-0 w-full h-full opacity-10 dark:opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M -50 150 Q 200 80 500 250 T 1100 120" fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-400 dark:text-slate-500" />
          <path d="M 250 -50 L 320 600" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-400 dark:text-slate-500" />
          <path d="M 700 -50 L 580 600" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-400 dark:text-slate-500" />
          <path d="M -50 380 Q 400 320 800 420 T 1200 350" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-400 dark:text-slate-500" />
        </svg>

        {/* Map Header with HUD state details */}
        <div className="relative z-10 flex items-center justify-between p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-850">
          <div>
            <span className="inline-flex items-center space-x-1.5 text-[10px] uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <span>Visual Directory Map</span>
            </span>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
              Active Visual Plotter • {citySearched || 'US Target City'} ({validCoordinates.length} pins)
            </h3>
          </div>
          
          <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Site Deficit
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Website Active
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Saved Lead
            </span>
          </div>
        </div>

        {/* Plotting Coordinates Canvas */}
        <div className="relative flex-1 w-full h-full min-h-0">
          {validCoordinates.map(lead => {
            if (!bounds) return null;
            const x = ((lead.longitude! - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
            const y = (1 - (lead.latitude! - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;

            const leadHashKey = `${lead.name.toLowerCase()}_${lead.city.toLowerCase()}`;
            const isSaved = savedMap.has(leadHashKey);
            const hasWebsite = !!lead.website;

            // Clamped placement coordinates
            const leftPct = Math.max(8, Math.min(92, x));
            const topPct = Math.max(12, Math.min(88, y));

            const isSelected = activePopupLead?.id === lead.id;

            return (
              <div
                key={lead.id}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
              >
                {/* Pin element */}
                <button
                  onClick={() => setActivePopupLead(lead)}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-1.5 border-white flex items-center justify-center cursor-pointer transition-all ${
                    isSaved 
                      ? 'bg-indigo-500 dark:bg-indigo-400 hover:scale-125 hover:shadow-indigo-300' 
                      : hasWebsite 
                        ? 'bg-emerald-500 dark:bg-emerald-400 hover:scale-125 hover:shadow-emerald-300' 
                        : 'bg-rose-500 dark:bg-rose-400 hover:scale-125 hover:shadow-rose-400'
                  } ${isSelected ? 'scale-130 ring-4 ring-indigo-500/20' : ''}`}
                >
                  <MapPin className="w-2.5 h-2.5 text-white shrink-0" />
                </button>

                {/* Inline Hover Label */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 whitespace-nowrap bg-slate-900/90 dark:bg-slate-950/95 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-30 select-none">
                  {lead.name}
                </div>
              </div>
            );
          })}

          {/* Active Overlay InfoWindow mimicking Google Maps InfoWindow */}
          {activePopupLead && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-35 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-[280px] p-3 select-text antialiased">
              <div className="flex justify-between items-start gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-850">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-50 leading-tight text-xs">
                    {activePopupLead.name}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                    {activePopupLead.category}
                  </p>
                </div>
                <div className="flex items-center space-x-0.5 bg-amber-50 dark:bg-amber-955/30 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 font-bold text-[9px] shrink-0">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                  <span>{activePopupLead.rating ? activePopupLead.rating.toFixed(1) : 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-1.5 py-2">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold flex items-start gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                  <span>{activePopupLead.address}</span>
                </p>

                {activePopupLead.phone && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{activePopupLead.phone}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850 gap-2">
                {activePopupLead.website ? (
                  <a
                    href={activePopupLead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline text-[9px]"
                  >
                    <Globe className="w-3 h-3 animate-spin-slow" />
                    <span>Active Website</span>
                  </a>
                ) : (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-rose-50 dark:bg-rose-950/30 text-rose-850 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 shrink-0">
                    Deficit: No Site
                  </span>
                )}

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => onSelectLead(activePopupLead)}
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-bold rounded-md transition-all cursor-pointer"
                  >
                    Inspect
                  </button>

                  {savedMap.has(`${activePopupLead.name.toLowerCase()}_${activePopupLead.city.toLowerCase()}`) ? (
                    <button
                      onClick={() => {
                        const sId = savedMap.get(`${activePopupLead.name.toLowerCase()}_${activePopupLead.city.toLowerCase()}`);
                        if (sId) onRemoveLead(sId);
                      }}
                      className="p-1 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 rounded-md hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-colors cursor-pointer"
                      title="Remove Bookmark"
                    >
                      <BookmarkCheck className="w-3 h-3 fill-current" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onSaveLead(activePopupLead)}
                      className="p-1 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 rounded-md hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors cursor-pointer"
                      title="Bookmark Lead"
                    >
                      <Bookmark className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    onClick={() => setActivePopupLead(null)}
                    className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Small subtle hints bar replacing instructions overlay entirely */}
        <div className="relative z-10 px-4 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-t border-slate-200/50 dark:border-slate-800/55 flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1 select-none">
            <Info className="w-3.5 h-3.5" />
            Interactive visual mode plots exact geographic coordinates of the {validCoordinates.length} loaded businesses instantly.
          </span>
          <span className="font-mono opacity-80 uppercase tracking-widest font-extrabold select-none">
            Active Directory Map
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-xs h-[460px]">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          key={citySearched}
          defaultCenter={center}
          defaultZoom={validCoordinates.length > 0 ? 12 : 4}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {validCoordinates.map(lead => {
            const leadHashKey = `${lead.name.toLowerCase()}_${lead.city.toLowerCase()}`;
            return (
              <LeadMarker
                key={lead.id}
                lead={lead}
                isSaved={savedMap.has(leadHashKey)}
                savedId={savedMap.get(leadHashKey)}
                onSaveLead={onSaveLead}
                onRemoveLead={onRemoveLead}
                onSelectLead={onSelectLead}
              />
            );
          })}
        </Map>
      </APIProvider>
    </div>
  );
}

