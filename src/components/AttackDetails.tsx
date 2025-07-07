'use client';

import type { AttackVector, ExploitationTechnique } from '../data/attackData';
import { targetComponents } from '../data/attackData';

interface AttackDetailsProps {
  attack: AttackVector | null;
}

export default function AttackDetails({ attack }: AttackDetailsProps) {
  // Helper function to get the technique data from attack vector
  const getTechniqueData = (attack: AttackVector): ExploitationTechnique | null => {
    const component = targetComponents.find(comp => comp.id === attack.componentId);
    if (!component) return null;
    
    return component.techniques.find(tech => tech.id === attack.techniqueId) || null;
  };

  if (!attack) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 h-full">
        <h2 className="text-xl font-bold text-white mb-4">Attack Details</h2>
        <p className="text-gray-400">Select an attack vector to view detailed information, CVE references, and proof-of-concept exploits.</p>
      </div>
    );
  }

  const techniqueData = getTechniqueData(attack);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">{attack.name}</h2>
        <p className="text-gray-300 text-sm leading-relaxed">{attack.detailedDescription}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Privilege Escalation</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="bg-gray-700 px-3 py-2 rounded-lg font-medium text-gray-200">
            {attack.sourcePrivilege}
          </span>
          <span className="text-red-400 font-bold text-xl">→</span>
          <span className="bg-red-600 px-3 py-2 rounded-lg font-medium text-white">
            {attack.targetPrivilege}
          </span>
        </div>
      </div>

      {techniqueData?.contextSpecificImpact && techniqueData.contextSpecificImpact.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-orange-400 mb-3">What This Means For The Attacker</h3>
          <p className="text-gray-400 text-sm mb-3">
            Impact when exploiting this technique in the target component:
          </p>
          <ul className="space-y-2">
            {techniqueData.contextSpecificImpact.map((impact, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-orange-400 mt-1">⚡</span>
                <span className="text-gray-300 text-sm">{impact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {attack.cves && attack.cves.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">CVE References ({attack.cves.length})</h3>
          <div className="space-y-2">
            {attack.cves.map((cve, index) => (
              <a
                key={index}
                href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg transition-colors border border-gray-600 hover:border-red-500"
              >
                <span className="font-mono text-red-400 font-semibold">{cve}</span>
                <span className="text-gray-400 text-sm ml-2">→ NVD CVE Database</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {attack.pocs && attack.pocs.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Proof of Concept ({attack.pocs.length})</h3>
          <div className="space-y-2">
            {attack.pocs.map((poc, index) => (
              <a
                key={index}
                href={poc}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg transition-colors border border-gray-600 hover:border-green-500"
              >
                <span className="text-green-400 font-semibold">PoC #{index + 1}</span>
                <span className="text-gray-400 text-sm ml-2">→ {new URL(poc).hostname}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {attack.mitigations && attack.mitigations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Mitigations</h3>
          <ul className="space-y-2">
            {attack.mitigations.map((mitigation, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">•</span>
                <span className="text-gray-300 text-sm">{mitigation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {attack.references && attack.references.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Additional References</h3>
          <div className="space-y-2">
            {attack.references.map((ref, index) => (
              <a
                key={index}
                href={ref}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg transition-colors border border-gray-600 hover:border-blue-500"
              >
                <span className="text-blue-400 font-semibold">Reference #{index + 1}</span>
                <span className="text-gray-400 text-sm ml-2">→ {new URL(ref).hostname}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 