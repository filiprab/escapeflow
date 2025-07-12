'use client';

import { useParams, useRouter } from 'next/navigation';
import { CVEDatabase, CVERecord } from '@/data/cveTypes';
import cveData from '@/data/chromium_cve_details.json';
import Link from 'next/link';
import { ArrowLeftIcon, LinkIcon } from '@heroicons/react/24/outline';

export default function CVEDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cveId = params.cveId as string;
  
  const database = cveData as CVEDatabase;
  const cve = database.cve_details[cveId];

  if (!cve) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-400 mb-4">CVE Not Found</h1>
            <p className="text-gray-400 mb-6">The CVE {cveId} was not found in the database.</p>
            <Link 
              href="/database"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Database</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  const getSeverityLabel = (score: number) => {
    if (score >= 9.0) return 'Critical';
    if (score >= 7.0) return 'High';
    if (score >= 4.0) return 'Medium';
    return 'Low';
  };

  const cvssMetrics = cve.containers.adp?.[0]?.metrics?.find(m => m.cvssV3_1)?.cvssV3_1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/database"
            className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Database</span>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-blue-400">{cveId}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Published: {new Date(cve.cveMetadata.datePublished).toLocaleDateString()}</span>
                <span>Updated: {new Date(cve.cveMetadata.dateUpdated).toLocaleDateString()}</span>
                <span>State: {cve.cveMetadata.state}</span>
              </div>
            </div>
            
            {cvssMetrics && (
              <div className="text-right">
                <div className={`inline-block px-4 py-2 rounded-lg text-white font-bold ${getSeverityColor(cve)}`}>
                  {getSeverityScore(cve)} / 10.0
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {getSeverityLabel(cvssMetrics.baseScore)} Severity
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-gray-300 leading-relaxed">
            {cve.containers.cna.descriptions[0]?.value || 'No description available'}
          </p>
        </div>

        {/* Labels */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4">Classification</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Operating Systems</h3>
              <div className="flex flex-wrap gap-2">
                {cve.labels.operating_systems.map(os => (
                  <span key={os} className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
                    {os}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Components</h3>
              <div className="flex flex-wrap gap-2">
                {cve.labels.components.map(component => (
                  <span key={component} className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                    {component}
                  </span>
                ))}
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
                <div className="font-medium">{cvssMetrics.attackVector}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Attack Complexity</div>
                <div className="font-medium">{cvssMetrics.attackComplexity}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Privileges Required</div>
                <div className="font-medium">{cvssMetrics.privilegesRequired}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">User Interaction</div>
                <div className="font-medium">{cvssMetrics.userInteraction}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Scope</div>
                <div className="font-medium">{cvssMetrics.scope}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Confidentiality</div>
                <div className="font-medium">{cvssMetrics.confidentialityImpact}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Integrity</div>
                <div className="font-medium">{cvssMetrics.integrityImpact}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Availability</div>
                <div className="font-medium">{cvssMetrics.availabilityImpact}</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="text-sm text-gray-400">Vector String</div>
              <div className="font-mono text-sm bg-gray-700 px-3 py-2 rounded mt-1">
                {cvssMetrics.vectorString}
              </div>
            </div>
          </div>
        )}

        {/* Problem Types */}
        {cve.containers.cna.problemTypes.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
            <h2 className="text-xl font-semibold mb-4">Problem Types</h2>
            <div className="space-y-3">
              {cve.containers.cna.problemTypes.map((problemType, index) => (
                <div key={index}>
                  {problemType.descriptions.map((desc, descIndex) => (
                    <div key={descIndex} className="flex items-center space-x-3">
                      <span className="text-gray-300">{desc.description}</span>
                      {desc.cweId && (
                        <span className="px-2 py-1 bg-red-600/20 text-red-300 rounded text-xs font-mono">
                          {desc.cweId}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Affected Versions */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4">Affected Products</h2>
          <div className="space-y-4">
            {cve.containers.cna.affected.map((affected, index) => (
              <div key={index} className="border border-gray-600 rounded-lg p-4">
                <div className="flex items-center space-x-4 mb-3">
                  <span className="font-medium">{affected.vendor} {affected.product}</span>
                </div>
                <div className="space-y-2">
                  {affected.versions.map((version, vIndex) => (
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

        {/* References */}
        {cve.containers.cna.references.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
            <h2 className="text-xl font-semibold mb-4">References</h2>
            <div className="space-y-3">
              {cve.containers.cna.references.map((ref, index) => (
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