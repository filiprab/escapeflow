import { useState, useEffect } from 'react';
import type { PrivilegeInfo } from '@/types/attack';

interface PrivilegeModalProps {
  selectedPrivilege: string;
  onClose: () => void;
}

interface PrivilegeContext {
  id: string;
  level: string;
  capabilities: string[];
  restrictions: string[];
  examples: string[];
}

export function PrivilegeModal({ selectedPrivilege, onClose }: PrivilegeModalProps) {
  const [privInfo, setPrivInfo] = useState<PrivilegeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivilegeInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/privileges');
        if (!response.ok) throw new Error('Failed to fetch privileges');

        const { privileges } = await response.json();
        const privilege = privileges.find((p: PrivilegeContext) => p.level === selectedPrivilege);

        if (privilege) {
          setPrivInfo({
            level: privilege.level,
            capabilities: privilege.capabilities,
            restrictions: privilege.restrictions,
            examples: privilege.examples,
          });
        } else {
          setPrivInfo(null);
        }
      } catch (error) {
        console.error('Error fetching privilege info:', error);
        setPrivInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivilegeInfo();
  }, [selectedPrivilege]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl border border-gray-600 max-w-2xl w-[90vw] max-h-[80vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-600">
          <h3 className="text-xl font-bold text-white">{selectedPrivilege} - Privilege Level Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-gray-400 text-center py-8">
              Loading privilege information...
            </div>
          ) : !privInfo ? (
            <div className="text-gray-400 text-center py-8">
              No detailed information available for this privilege level.
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-green-400 uppercase tracking-wide mb-3">Capabilities</h4>
                <ul className="text-gray-300 space-y-2">
                  {privInfo.capabilities.map((cap, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-400 mr-3 mt-1">✓</span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-red-400 uppercase tracking-wide mb-3">Restrictions</h4>
                <ul className="text-gray-300 space-y-2">
                  {privInfo.restrictions.map((rest, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-red-400 mr-3 mt-1">✗</span>
                      <span>{rest}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-blue-400 uppercase tracking-wide mb-3">Command Examples</h4>
                <div className="bg-gray-900/60 rounded-lg p-4 font-mono text-sm text-gray-300 space-y-2">
                  {privInfo.examples.map((example, idx) => (
                    <div key={idx} className="text-gray-300">
                      <span className="text-blue-400">$</span> {example}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}