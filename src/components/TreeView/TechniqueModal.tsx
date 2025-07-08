import type { ExploitationTechnique, TargetComponent } from '@/data/attackData';
import Link from 'next/link';

interface TechniqueModalProps {
  selectedTechnique: {
    technique: ExploitationTechnique;
    component: TargetComponent;
  };
  onClose: () => void;
}

export function TechniqueModal({ selectedTechnique, onClose }: TechniqueModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl border border-gray-600 max-w-4xl w-[95vw] max-h-[85vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-600">
          <div>
            <h3 className="text-xl font-bold text-white">{selectedTechnique.technique.name}</h3>
            <p className="text-gray-400 mt-1">Attack Technique in {selectedTechnique.component.name}</p>
          </div>
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
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h4 className="text-lg font-semibold text-blue-400 uppercase tracking-wide mb-3">Description</h4>
            <p className="text-gray-300 leading-relaxed">{selectedTechnique.technique.detailedDescription}</p>
          </div>
          
          {/* Context-Specific Impact */}
          <div>
            <h4 className="text-lg font-semibold text-orange-400 uppercase tracking-wide mb-3">
              What This Means For The Attacker
            </h4>
            <p className="text-gray-400 text-sm mb-3">
              Impact when exploiting {selectedTechnique.technique.name} in {selectedTechnique.component.name}:
            </p>
            <ul className="text-gray-300 space-y-2">
              {(selectedTechnique.technique.contextSpecificImpact || ['Context-specific impact information not available for this combination.']).map((impact: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <span className="text-orange-400 mr-3 mt-1">⚡</span>
                  <span>{impact}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* CVEs and PoCs */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-red-400 uppercase tracking-wide mb-3">
                CVEs ({selectedTechnique.technique.cves.length})
              </h4>
              {selectedTechnique.technique.cves.length > 0 ? (
                <ul className="text-gray-300 space-y-1">
                  {selectedTechnique.technique.cves.map((cve: string, idx: number) => (
                    <li key={idx} className="font-mono text-sm bg-gray-700/50 px-3 py-1 rounded">
                      {cve}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">No CVEs listed for this technique.</p>
              )}
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-orange-400 uppercase tracking-wide mb-3">
                Proof of Concepts ({selectedTechnique.technique.pocs.length})
              </h4>
              {selectedTechnique.technique.pocs.length > 0 ? (
                <ul className="text-gray-300 space-y-1">
                  {selectedTechnique.technique.pocs.map((poc: string, idx: number) => (
                    <li key={idx} className="text-sm">
                      <Link href={poc} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-400 hover:text-blue-300 underline break-all">
                        {poc}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">No PoCs listed for this technique.</p>
              )}
            </div>
          </div>
          
          {/* Mitigations */}
          <div>
            <h4 className="text-lg font-semibold text-green-400 uppercase tracking-wide mb-3">Mitigations</h4>
            <ul className="text-gray-300 space-y-2">
              {selectedTechnique.technique.mitigations.map((mitigation: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1">🛡️</span>
                  <span>{mitigation}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* References */}
          {selectedTechnique.technique.references.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-purple-400 uppercase tracking-wide mb-3">References</h4>
              <ul className="text-gray-300 space-y-1">
                {selectedTechnique.technique.references.map((ref: string, idx: number) => (
                  <li key={idx} className="text-sm">
                    <Link href={ref} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-400 hover:text-blue-300 underline break-all">
                      {ref}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}