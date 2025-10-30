'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CVESectionProps {
  escalationId?: string;
}

interface CVEData {
  cveId: string;
  descriptions: Array<{ description: string }>;
  metrics: Array<{ baseScore?: number; baseSeverity?: string }>;
}

export function CVESection({ escalationId }: CVESectionProps) {
  const [cves, setCves] = useState<CVEData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!escalationId) {
      setCves([]);
      return;
    }

    const fetchCVEs = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/escalations/${escalationId}/cves`);
        if (response.ok) {
          const data = await response.json();
          setCves(data.cves || []);
        }
      } catch (error) {
        console.error('Error fetching escalation CVEs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCVEs();
  }, [escalationId]);

  if (!escalationId || (!loading && cves.length === 0)) {
    return null;
  }

  if (loading) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Associated CVEs</h3>
        <p className="text-gray-400 text-sm">Loading CVEs...</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-3">Associated CVEs ({cves.length})</h3>
      <div className="space-y-2">
        {cves.map((cve) => {
          const description = cve.descriptions?.[0]?.description || 'No description available';

          return (
            <Link
              key={cve.cveId}
              href={`/catalog/${cve.cveId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:border-red-500/50 hover:bg-gray-800/70 transition-all duration-200 cursor-pointer">
                <h4 className="text-white font-semibold group-hover:text-red-400 transition-colors mb-2">
                  {cve.cveId}
                </h4>
                <p className="text-gray-400 text-sm line-clamp-2">{description}</p>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}