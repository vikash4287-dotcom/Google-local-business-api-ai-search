import React, { useState, useMemo } from 'react';
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Bookmark, 
  BookmarkCheck, 
  AlertCircle, 
  FileSpreadsheet, 
  CheckCircle,
  Eye,
  Activity
} from 'lucide-react';
import { Business, SavedBusiness } from '../types';
import { calculateLeadScore } from '../utils/score';

interface ResultsTableProps {
  leads: Business[];
  savedLeads: SavedBusiness[];
  onSaveLead: (lead: Business) => void;
  onRemoveLead: (savedId: string) => void;
  onSelectLead: (lead: Business) => void;
  isLoading: boolean;
  citySearched: string;
}

export default function ResultsTable({
  leads,
  savedLeads,
  onSaveLead,
  onRemoveLead,
  onSelectLead,
  isLoading,
  citySearched
}: ResultsTableProps) {
  // Sorting States
  const [sortField, setSortField] = useState<'rating' | 'reviewCount' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Track if they've already saved a lead to handle toggles
  const savedMap = useMemo(() => {
    const map = new Map<string, string>(); // matches (name+city) -> id
    savedLeads.forEach(item => {
      map.set(`${item.name.toLowerCase()}_${item.city.toLowerCase()}`, item.id);
    });
    return map;
  }, [savedLeads]);

  // Sort and Paginate Leads
  const processedLeads = useMemo(() => {
    let result = [...leads];

    if (sortField) {
      result.sort((a, b) => {
        const valA = (sortField === 'rating' ? a.rating : a.reviewCount) || 0;
        const valB = (sortField === 'rating' ? b.rating : b.reviewCount) || 0;
        
        if (sortDirection === 'asc') {
          return valA - valB;
        } else {
          return valB - valA;
        }
      });
    }

    return result;
  }, [leads, sortField, sortDirection]);

  // Paginated selection
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [processedLeads, currentPage]);

  const totalPages = Math.ceil(processedLeads.length / itemsPerPage);

  // Dynamic JSON-LD Schema for Search Results to support rich snippets
  const schemaJsonLd = useMemo(() => {
    if (!leads || leads.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "numberOfItems": leads.length,
      "name": `Business Leads in ${citySearched}`,
      "itemListElement": leads.map((lead, index) => {
        const item: any = {
          "@type": "LocalBusiness",
          "name": lead.name,
          "category": lead.category,
        };
        if (lead.address) {
          item.address = {
            "@type": "PostalAddress",
            "streetAddress": lead.address,
            "addressLocality": lead.city,
          };
        }
        if (lead.phone) {
          item.telephone = lead.phone;
        }
        if (lead.website) {
          item.url = lead.website;
        }
        if (lead.rating !== undefined) {
          item.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": lead.rating,
            "ratingCount": lead.reviewCount || 0,
            "reviewCount": lead.reviewCount || 0,
            "bestRating": "5",
            "worstRating": "1"
          };
        }
        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": item
        };
      })
    };
  }, [leads, citySearched]);

  // Sorting Handler
  const handleSort = (field: 'rating' | 'reviewCount') => {
    if (sortField === field) {
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else {
        setSortField(null); // Reset
      }
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page
  };

  // Export to CSV Function
  const exportToCSV = () => {
    if (leads.length === 0) return;

    const headers = ['Business Name', 'Category', 'Rating', 'Reviews Count', 'Website', 'Phone Number', 'Address', 'City'];
    const rows = leads.map(lead => [
      `"${lead.name.replace(/"/g, '""')}"`,
      lead.category,
      lead.rating || 'N/A',
      lead.reviewCount || 0,
      lead.website || 'No Website',
      `"${lead.phone || ''}"`,
      `"${(lead.address || '').replace(/"/g, '""')}"`,
      lead.city
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LocalShop_Leads_${citySearched.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border rounded-xl dark:bg-slate-900 border-slate-200 dark:border-slate-800 animate-pulse">
        <div className="w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
        <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Mining deep into business data...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border rounded-2xl dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-800/60 mb-4 text-slate-400">
          <AlertCircle className="w-10 h-10 stroke-1.5 text-indigo-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Lead Matches Found</h3>
        <p className="max-w-md mt-2 text-sm text-slate-500 dark:text-slate-400">
          Try expanding your search parameters, selecting a other category, or exploring different cities (e.g., Seattle, Denver, Chicago) to uncover hidden agency clients.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {schemaJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(schemaJsonLd)}
        </script>
      )}
      {/* Table Action Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 border border-slate-150 p-4 rounded-xl dark:bg-slate-900/60 dark:border-slate-800 gap-4">
        <div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block md:inline">
            Search Counter: <span className="text-indigo-600 dark:text-indigo-400">{processedLeads.length}</span> lead matches discovered in {citySearched}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 block">Identified high-conversion potential marketing deficits.</span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Prioritize / Sort Drodown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider shrink-0 block">Sort Leads:</span>
            <select
              value={
                sortField === 'rating' && sortDirection === 'desc' ? 'rating-desc' :
                sortField === 'rating' && sortDirection === 'asc' ? 'rating-asc' :
                sortField === 'reviewCount' && sortDirection === 'desc' ? 'reviews-desc' :
                'default'
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'rating-desc') {
                  setSortField('rating');
                  setSortDirection('desc');
                } else if (val === 'rating-asc') {
                  setSortField('rating');
                  setSortDirection('asc');
                } else if (val === 'reviews-desc') {
                  setSortField('reviewCount');
                  setSortDirection('desc');
                } else {
                  setSortField(null);
                  setSortDirection('desc');
                }
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 dark:text-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all focus:border-indigo-505 outline-hidden cursor-pointer"
            >
              <option value="default">Default Match</option>
              <option value="rating-desc">Rating (High to Low)</option>
              <option value="rating-asc">Rating (Low to High)</option>
              <option value="reviews-desc">Review Count</option>
            </select>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer justify-center"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export All CSV Leads</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden border border-slate-200 bg-white rounded-xl dark:border-slate-850 dark:bg-slate-950 overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-55/60 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-5">Business Name</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Lead Quality Score</th>
                <th className="py-4 px-4">
                  <button onClick={() => handleSort('rating')} className="flex items-center space-x-1.5 hover:text-slate-800 dark:hover:text-slate-200">
                    <span>Rating</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </th>
                <th className="py-4 px-4">
                  <button onClick={() => handleSort('reviewCount')} className="flex items-center space-x-1.5 hover:text-slate-800 dark:hover:text-slate-200">
                    <span>Reviews</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </th>
                <th className="py-4 px-4">Website</th>
                <th className="py-4 px-4">Phone</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
              {paginatedLeads.map((lead) => {
                const leadHashKey = `${lead.name.toLowerCase()}_${lead.city.toLowerCase()}`;
                const isSaved = savedMap.has(leadHashKey);
                const savedId = savedMap.get(leadHashKey);

                return (
                  <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    {/* Name & Address */}
                    <td className="py-4 px-5 max-w-[240px]">
                      <button 
                        onClick={() => onSelectLead(lead)}
                        className="font-bold text-slate-900 dark:text-slate-100 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors font-sans truncate block w-full outline-hidden"
                      >
                        {lead.name}
                      </button>
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center space-x-1 mt-0.5 truncate" title={lead.address}>
                        <MapPin className="w-3 h-3 text-slate-300" />
                        <span>{lead.address}</span>
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {lead.category}
                    </td>

                    {/* Lead Quality Score Badge */}
                    <td className="py-4 px-4">
                      {(() => {
                        const { score, label, badgeClass, dotColor } = calculateLeadScore(
                          lead.rating,
                          lead.reviewCount,
                          !!lead.website
                        );
                        return (
                          <div 
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border shadow-xs transition-transform hover:scale-102 cursor-help ${badgeClass}`}
                            title={`Audited Deficits score evaluation:\n• Rating Deficit: ${lead.rating !== undefined ? (5.0 - lead.rating).toFixed(1) : 'No Rating'}\n• Reviews Count: ${lead.reviewCount || 0}\n• Custom Website: ${lead.website ? 'Provided' : 'No Website (Deficit)'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                            <span className="font-mono">{score}</span>
                            <span className="opacity-40">-</span>
                            <span>{label}</span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-4 text-sm font-semibold">
                      <div className="flex items-center space-x-1">
                        <Star className={`w-3.5 h-3.5 fill-amber-400 text-amber-400`} />
                        <span>{lead.rating ? lead.rating.toFixed(1) : 'N/A'}</span>
                      </div>
                    </td>

                    {/* Reviews */}
                    <td className="py-4 px-4 text-xs font-semibold">
                      <span className={lead.reviewCount && lead.reviewCount < 20 ? 'text-amber-600 dark:text-amber-400' : ''}>
                        {lead.reviewCount || 0} reviews
                      </span>
                    </td>

                    {/* Website */}
                    <td className="py-4 px-4 text-sm">
                      {lead.website ? (
                        <a 
                          href={lead.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium hover:underline text-xs"
                        >
                          <Globe className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">Visit Site</span>
                        </a>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-100 dark:border-rose-900/30">
                          No Website (High Value)
                        </span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-4 text-xs font-mono">
                      {lead.phone ? (
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{lead.phone}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">No phone</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onSelectLead(lead)}
                          className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                          title="View analysis and marketing plans"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Details</span>
                        </button>

                        {isSaved ? (
                          <button
                            onClick={() => onRemoveLead(savedId!)}
                            className="p-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-905 dark:text-indigo-300 rounded-lg hover:bg-rose-50 hover:border-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:hover:border-rose-905 dark:hover:text-rose-300 transition-all cursor-pointer"
                            title="Remove Saved Lead"
                          >
                            <BookmarkCheck className="w-4 h-4 fill-indigo-600 dark:fill-indigo-400 text-indigo-600 dark:text-indigo-400" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onSaveLead(lead)}
                            className="p-1.5 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-all cursor-pointer"
                            title="Save Lead"
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Bento Card Grid (Fallback Layout for mobile layout) */}
      <div className="grid grid-cols-1 gap-4.5 md:hidden">
        {paginatedLeads.map((lead) => {
          const leadHashKey = `${lead.name.toLowerCase()}_${lead.city.toLowerCase()}`;
          const isSaved = savedMap.has(leadHashKey);
          const savedId = savedMap.get(leadHashKey);

          return (
            <div 
              key={lead.id} 
              className="p-5 border border-slate-150 rounded-2xl bg-white dark:bg-slate-950 dark:border-slate-850 shadow-xs flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-bold tracking-widest text-indigo-600 bg-indigo-55/10 dark:text-indigo-400 px-2 py-0.5 rounded-md uppercase">
                    {lead.category}
                  </span>
                  {(() => {
                    const { score, label, badgeClass, dotColor } = calculateLeadScore(
                      lead.rating,
                      lead.reviewCount,
                      !!lead.website
                    );
                    return (
                      <div 
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider ${badgeClass}`}
                        title={`Score: ${score}`}
                      >
                        <span className={`w-1 h-1 rounded-full ${dotColor}`} />
                        <span>Lead Score: {score}</span>
                      </div>
                    );
                  })()}
                  <div className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/30">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">{lead.rating ? lead.rating.toFixed(1) : 'N/A'}</span>
                  </div>
                </div>

                <h4 
                  onClick={() => onSelectLead(lead)}
                  className="font-bold text-slate-900 dark:text-slate-100 text-base mt-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                >
                  {lead.name}
                </h4>

                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center space-x-1.5 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-300" />
                  <span className="truncate">{lead.address}</span>
                </p>

                <div className="mt-3.5 flex flex-wrap gap-2 text-xs">
                  <span className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 px-2 py-1 rounded-md text-slate-500 font-medium dark:text-slate-400">
                    {lead.reviewCount || 0} reviews
                  </span>
                  
                  {lead.website ? (
                    <span className="bg-emerald-55/10 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/20 px-2.5 py-1 rounded-md flex items-center space-x-1 inline-flex font-medium text-[11px]">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Has Site</span>
                    </span>
                  ) : (
                    <span className="bg-rose-55/10 text-rose-800 dark:text-rose-300 border border-rose-100 dark:border-rose-900/20 px-2.5 py-1 rounded-md flex items-center space-x-1 inline-flex font-bold text-[11px]">
                      <span>No Website</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-850 pt-4.5 gap-2.5">
                {lead.phone ? (
                  <span className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 font-mono">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{lead.phone}</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">No phone</span>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectLead(lead)}
                    className="px-3.5 py-1.5 bg-slate-100 border dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Inspect</span>
                  </button>

                  {isSaved ? (
                    <button
                      onClick={() => onRemoveLead(savedId!)}
                      className="p-1 px-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-905 dark:text-indigo-300 rounded-lg hover:bg-rose-55/10 hover:text-rose-800 hover:border-rose-100 transition-colors cursor-pointer"
                    >
                      <BookmarkCheck className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onSaveLead(lead)}
                      className="p-1 px-2.5 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-slate-800 mt-4 h-12">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Showing Page <span className="text-slate-800 dark:text-slate-200">{currentPage}</span> of <span className="text-slate-800 dark:text-slate-200">{totalPages}</span>
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 dark:text-slate-400 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 dark:text-slate-400 cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
