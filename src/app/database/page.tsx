'use client';

import { useState, useMemo } from 'react';
import { CVEDatabase, CVERecord, CVEFilter } from '@/data/cveTypes';
import cveData from '@/data/chromium_cve_details.json';
import Link from 'next/link';

export default function DatabasePage() {
  const [filter, setFilter] = useState<CVEFilter>({
    operatingSystems: [],
    components: [],
    search: ''
  });

  const database = cveData as CVEDatabase;
  const cveList = Object.entries(database.cve_details);

  const allOperatingSystems = useMemo(() => {
    const osSet = new Set<string>();
    cveList.forEach(([, cve]) => {
      cve.labels.operating_systems.forEach(os => osSet.add(os));
    });
    return Array.from(osSet).sort();
  }, [cveList]);

  const allComponents = useMemo(() => {
    const componentSet = new Set<string>();
    cveList.forEach(([, cve]) => {
      cve.labels.components.forEach(component => componentSet.add(component));
    });
    return Array.from(componentSet).sort();
  }, [cveList]);

  const filteredCVEs = useMemo(() => {
    return cveList.filter(([cveId, cve]) => {
      if (filter.search && !cveId.toLowerCase().includes(filter.search.toLowerCase()) && 
          !cve.containers.cna.descriptions[0]?.value.toLowerCase().includes(filter.search.toLowerCase())) {
        return false;
      }

      if (filter.operatingSystems.length > 0 && 
          !filter.operatingSystems.some(os => cve.labels.operating_systems.includes(os))) {
        return false;
      }

      if (filter.components.length > 0 && 
          !filter.components.some(component => cve.labels.components.includes(component))) {
        return false;
      }

      return true;
    });
  }, [cveList, filter]);

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

  const getSeverityColor = (cve: CVERecord) => {
    const adp = cve.containers.adp?.[0];
    const cvss = adp?.metrics?.find(m => m.cvssV3_1)?.cvssV3_1;
    if (!cvss) return 'bg-gray-600';
    
    const score = cvss.baseScore;
    if (score >= 9.0) return 'bg-red-600';
    if (score >= 7.0) return 'bg-orange-600';
    if (score >= 4.0) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const getSeverityScore = (cve: CVERecord) => {
    const adp = cve.containers.adp?.[0];
    const cvss = adp?.metrics?.find(m => m.cvssV3_1)?.cvssV3_1;
    return cvss?.baseScore || 'N/A';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
            CVE Database
          </h1>
          <p className="text-gray-300 mb-4">
            Browse and filter {database.total_cves} Chromium CVEs
          </p>
          <p className="text-sm text-gray-400">
            Last updated: {database.fetched_at}
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
                {allOperatingSystems.map(os => (
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
                {allComponents.map(component => (
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
            <div className="mb-4 text-sm text-gray-400">
              Showing {filteredCVEs.length} of {database.total_cves} CVEs
            </div>
            
            <div className="space-y-4">
              {filteredCVEs.map(([cveId, cve]) => (
                <Link key={cveId} href={`/database/${cveId}`}>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-blue-400">{cveId}</h3>
                        <div className={`px-2 py-1 rounded text-xs font-medium text-white ${getSeverityColor(cve)}`}>
                          {getSeverityScore(cve)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(cve.cveMetadata.datePublished).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {cve.containers.cna.descriptions[0]?.value || 'No description available'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {cve.labels.operating_systems.map(os => (
                        <span key={os} className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
                          {os}
                        </span>
                      ))}
                      {cve.labels.components.map(component => (
                        <span key={component} className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                          {component}
                        </span>
                      ))}
                    </div>
                    
                    {cve.containers.cna.references.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {cve.containers.cna.references.slice(0, 2).map((ref, index) => (
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
            
            {filteredCVEs.length === 0 && (
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