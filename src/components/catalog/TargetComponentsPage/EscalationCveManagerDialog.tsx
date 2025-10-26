'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CVE {
  cveId: string;
  datePublished: string;
  dateLastModified: string;
  descriptions: Array<{
    lang: string;
    value: string;
  }>;
  metrics: Array<{
    cvssV3?: {
      baseScore: number;
      baseSeverity: string;
    };
  }>;
}

interface EscalationCveManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  escalationId: string;
  escalationPath: {
    sourceLevel: string;
    targetLevel: string;
    techniqueName: string;
    componentName: string;
  };
}

export default function EscalationCveManagerDialog({
  isOpen,
  onClose,
  escalationId,
  escalationPath,
}: EscalationCveManagerDialogProps) {
  const [linkedCves, setLinkedCves] = useState<CVE[]>([]);
  const [cveIdInput, setCveIdInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLinkedCves();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, escalationId]);

  const fetchLinkedCves = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/escalations/${escalationId}/cves`);
      if (!response.ok) throw new Error('Failed to fetch linked CVEs');
      const data = await response.json();
      setLinkedCves(data.cves || []);
    } catch (err) {
      console.error('Error fetching linked CVEs:', err);
      alert('Failed to load linked CVEs');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkCve = async () => {
    const cveId = cveIdInput.trim().toUpperCase();

    if (!cveId) {
      alert('Please enter a CVE ID');
      return;
    }

    // Basic CVE ID format validation
    if (!/^CVE-\d{4}-\d{4,}$/i.test(cveId)) {
      alert('Invalid CVE ID format. Expected format: CVE-YYYY-NNNN (e.g., CVE-2024-1234)');
      return;
    }

    // Check if already linked
    if (linkedCves.some(cve => cve.cveId === cveId)) {
      alert('This CVE is already linked to this escalation');
      return;
    }

    try {
      setLinking(true);

      const response = await fetch(`/api/escalations/${escalationId}/cves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cveId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to link CVE');
      }

      // Clear input and refresh linked CVEs
      setCveIdInput('');
      await fetchLinkedCves();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to link CVE');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkCve = async (cveId: string) => {
    try {
      setUnlinking(cveId);
      const response = await fetch(
        `/api/escalations/${escalationId}/cves?cveId=${encodeURIComponent(cveId)}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unlink CVE');
      }

      // Refresh linked CVEs
      await fetchLinkedCves();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to unlink CVE');
    } finally {
      setUnlinking(null);
    }
  };

  const getCvssColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'LOW': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700/50 px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Manage CVEs</h2>
            <p className="text-sm text-gray-400 mt-1">
              {escalationPath.componentName}: {escalationPath.sourceLevel} → {escalationPath.targetLevel}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              via {escalationPath.techniqueName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Linked CVEs Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Linked CVEs ({linkedCves.length})</h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="text-gray-400 text-sm">Loading...</div>
              </div>
            ) : linkedCves.length === 0 ? (
              <div className="bg-gray-700/30 rounded-lg border border-gray-600 p-6 text-center">
                <p className="text-gray-400 text-sm">No CVEs linked to this escalation yet</p>
                <p className="text-gray-500 text-xs mt-1">Use the form below to link CVEs by ID</p>
              </div>
            ) : (
              <div className="space-y-2">
                {linkedCves.map((cve) => {
                  const description = cve.descriptions.find(d => d.lang === 'en')?.value || 'No description';
                  const metric = cve.metrics[0];
                  const cvssScore = metric?.cvssV3?.baseScore;
                  const severity = metric?.cvssV3?.baseSeverity;

                  return (
                    <div
                      key={cve.cveId}
                      className="flex items-start justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-white">{cve.cveId}</h4>
                          {cvssScore && severity && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getCvssColor(severity)}`}>
                              {severity} {cvssScore}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Published: {new Date(cve.datePublished).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnlinkCve(cve.cveId)}
                        disabled={unlinking === cve.cveId}
                        className="ml-4 p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        title="Unlink CVE"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Link CVE Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Link CVE</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={cveIdInput}
                onChange={(e) => setCveIdInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLinkCve()}
                placeholder="Enter CVE ID (e.g., CVE-2024-1234)"
                className="flex-1 bg-gray-700/50 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
              />
              <button
                onClick={handleLinkCve}
                disabled={linking || !cveIdInput.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusIcon className="w-4 h-4" />
                {linking ? 'Linking...' : 'Link CVE'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter the CVE ID of a vulnerability that exists in your database. The CVE must be added to the database first via the CVE Database page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
