'use client';

import { useState, useEffect } from 'react';
import { CVEFilter } from '@/data/cveTypes';
import { getCVEs, getFilterOptions, CVEApiResponse, CVEApiError, FilterOptions } from '@/lib/api/cve';
import { CVEListItem } from '@/types/cve';
import Link from 'next/link';

export default function CatalogPage() {
  const [filter, setFilter] = useState<CVEFilter>({
    operatingSystems: [],
    components: [],
    search: ''
  });
  const [cveData, setCveData] = useState<CVEApiResponse | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ operatingSystems: [], components: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch CVE data and filter options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [cveResponse, filterResponse] = await Promise.all([
          getCVEs({ ...filter, page, limit }),
          getFilterOptions()
        ]);
        
        setCveData(cveResponse);
        setFilterOptions(filterResponse);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err instanceof CVEApiError ? err.message : 'Failed to load CVE data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, page]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter.search, filter.operatingSystems, filter.components]);

  const toggleOSFilter = (os: string) => {
    setFilter(prev => ({
      ...prev,
      operatingSystems: prev.operatingSystems.includes(os)
        ? prev.operatingSystems.filter(item => item !== os)
        : [...prev.operatingSystems, os]
    }));
  };

  const toggleComponentFilter = (component: string) => {
    setFilter(prev => ({
      ...prev,
      components: prev.components.includes(component)
        ? prev.components.filter(item => item !== component)
        : [...prev.components, component]
    }));
  };

  const getSeverityColor = (cve: CVEListItem) => {
    const metric = cve.metrics?.[0];
    if (!metric?.baseScore) return 'bg-gray-600';
    
    const score = metric.baseScore;
    if (score >= 9.0) return 'bg-red-600';
    if (score >= 7.0) return 'bg-orange-600';
    if (score >= 4.0) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const getSeverityScore = (cve: CVEListItem) => {
    const metric = cve.metrics?.[0];
    return metric?.baseScore || 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading CVE database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading CVE data:</p>
          <p className="text-gray-300">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!cveData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
            CVE Database
          </h1>
          <p className="text-gray-300 mb-4">
            Browse and filter {cveData.total} Chromium CVEs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Search</h3>
              <input
                type="text"
                placeholder="Search CVE ID or description..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>

            {/* Operating Systems Filter */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Operating Systems</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {filterOptions.operatingSystems.map(os => (
                  <label key={os} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filter.operatingSystems.includes(os)}
                      onChange={() => toggleOSFilter(os)}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{os}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Components Filter */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Components</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {filterOptions.components.map(component => (
                  <label key={component} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filter.components.includes(component)}
                      onChange={() => toggleComponentFilter(component)}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{component}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* CVE List */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Showing {cveData.cves.length} of {cveData.total} CVEs (Page {cveData.page} of {cveData.totalPages})
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(cveData.totalPages, p + 1))}
                  disabled={page >= cveData.totalPages}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
                >
                  Next
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {cveData.cves.map((cve) => (
                <Link key={cve.cveId} href={`/database/${cve.cveId}`}>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-blue-400">{cve.cveId}</h3>
                        <div className={`px-2 py-1 rounded text-xs font-medium text-white ${getSeverityColor(cve)}`}>
                          {getSeverityScore(cve)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(cve.datePublished).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {cve.descriptions[0]?.description || 'No description available'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {cve.labels?.[0]?.operatingSystems?.map((os) => (
                        <span key={os} className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
                          {os}
                        </span>
                      ))}
                      {cve.labels?.[0]?.components?.map((component) => (
                        <span key={component} className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                          {component}
                        </span>
                      ))}
                    </div>
                    
                    {cve.references && cve.references.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {cve.references.slice(0, 2).map((ref, index) => (
                          <span
                            key={index}
                            className="text-xs text-blue-400"
                          >
                            Reference {index + 1}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            
            {cveData.cves.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No CVEs found matching the current filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}