'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCVEById, CVEApiError } from '@/lib/api/cve';
import { CVERecord, CVEMetric } from '@/types/cve';
import Link from 'next/link';
import { ArrowLeftIcon, LinkIcon } from '@heroicons/react/24/outline';

export default function CVEDetailPage() {
  const params = useParams();
  const cveId = params.cveId as string;
  const [cve, setCve] = useState<CVERecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCVE = async () => {
      try {
        setLoading(true);
        setError(null);
        const cveData = await getCVEById(cveId);
        setCve(cveData);
      } catch (err) {
        console.error('Failed to fetch CVE:', err);
        setError(err instanceof CVEApiError ? err.message : 'Failed to load CVE data');
      } finally {
        setLoading(false);
      }
    };

    if (cveId) {
      fetchCVE();
    }
  }, [cveId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading CVE details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading CVE</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="space-x-4">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
              <Link 
                href="/catalog"
                className="inline-flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Back to Catalog</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cve) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-400 mb-4">CVE Not Found</h1>
            <p className="text-gray-400 mb-6">The CVE {cveId} was not found in the database.</p>
            <Link 
              href="/catalog"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getSeverityColor = (cve: CVERecord) => {
    const metric = cve.metrics?.[0];
    if (!metric?.baseScore) return 'bg-gray-600';
    
    const score = metric.baseScore;
    if (score >= 9.0) return 'bg-red-600';
    if (score >= 7.0) return 'bg-orange-600';
    if (score >= 4.0) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const getSeverityScore = (cve: CVERecord) => {
    const metric = cve.metrics?.[0];
    return metric?.baseScore || 'N/A';
  };

  const getSeverityLabel = (score: number) => {
    if (score >= 9.0) return 'Critical';
    if (score >= 7.0) return 'High';
    if (score >= 4.0) return 'Medium';
    return 'Low';
  };

  const cvssMetrics: CVEMetric | undefined = cve.metrics?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/catalog"
            className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Catalog</span>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-blue-400">{cveId}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Published: {new Date(cve.datePublished).toLocaleDateString()}</span>
                <span>Updated: {new Date(cve.dateUpdated).toLocaleDateString()}</span>
                <span>State: {cve.state}</span>
              </div>
            </div>
            
            {cvssMetrics && (
              <div className="text-right">
                <div className={`inline-block px-4 py-2 rounded-lg text-white font-bold ${getSeverityColor(cve)}`}>
                  {getSeverityScore(cve)} / 10.0
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {getSeverityLabel(cvssMetrics?.baseScore || 0)} Severity
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-gray-300 leading-relaxed">
            {cve.descriptions?.[0]?.description || 'No description available'}
          </p>
        </div>

        {/* Labels */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4">Classification</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Operating Systems</h3>
              <div className="flex flex-wrap gap-2">
                {cve.labels?.[0]?.operatingSystems?.map((os) => (
                  <span key={os} className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
                    {os}
                  </span>
                )) || <span className="text-gray-500 text-sm">None specified</span>}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Components</h3>
              <div className="flex flex-wrap gap-2">
                {cve.labels?.[0]?.components?.map((component) => (
                  <span key={component} className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                    {component}
                  </span>
                )) || <span className="text-gray-500 text-sm">None specified</span>}
              </div>
            </div>
          </div>
        </div>

        {/* CVSS Metrics */}
        {cvssMetrics && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
            <h2 className="text-xl font-semibold mb-4">CVSS v3.1 Metrics</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-400">Attack Vector</div>
                <div className="font-medium">{cvssMetrics?.attackVector || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Attack Complexity</div>
                <div className="font-medium">{cvssMetrics?.attackComplexity || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Privileges Required</div>
                <div className="font-medium">{cvssMetrics?.privilegesRequired || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">User Interaction</div>
                <div className="font-medium">{cvssMetrics?.userInteraction || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Scope</div>
                <div className="font-medium">{cvssMetrics?.scope || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Confidentiality</div>
                <div className="font-medium">{cvssMetrics?.confidentialityImpact || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Integrity</div>
                <div className="font-medium">{cvssMetrics?.integrityImpact || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Availability</div>
                <div className="font-medium">{cvssMetrics?.availabilityImpact || 'N/A'}</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="text-sm text-gray-400">Vector String</div>
              <div className="font-mono text-sm bg-gray-700 px-3 py-2 rounded mt-1">
                {cvssMetrics?.vectorString || 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Problem Types */}
        {cve.problemTypes && cve.problemTypes.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
            <h2 className="text-xl font-semibold mb-4">Problem Types</h2>
            <div className="space-y-3">
              {cve.problemTypes.map((problemType, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-gray-300">{problemType.description}</span>
                  {problemType.cweId && (
                    <span className="px-2 py-1 bg-red-600/20 text-red-300 rounded text-xs font-mono">
                      {problemType.cweId}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Affected Versions */}
        {cve.affectedProducts && cve.affectedProducts.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
            <h2 className="text-xl font-semibold mb-4">Affected Products</h2>
            <div className="space-y-4">
              {cve.affectedProducts.map((affected, index) => (
                <div key={index} className="border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="font-medium">{affected.vendor} {affected.product}</span>
                  </div>
                  <div className="space-y-2">
                    {affected.versions?.map((version, vIndex) => (
                      <div key={vIndex} className="text-sm">
                        <span className="text-gray-400">Version:</span>
                        <span className="ml-2 font-mono">{version.version}</span>
                        <span className="ml-4 text-gray-400">Status:</span>
                        <span className="ml-2 text-red-300">{version.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {cve.references && cve.references.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
            <h2 className="text-xl font-semibold mb-4">References</h2>
            <div className="space-y-3">
              {cve.references.map((ref, index) => (
                <a
                  key={index}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span className="break-all">{ref.url}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}