import { targetComponents } from '@/data/attackData';
import type { PrivilegeInfo } from '@/data/attackData';

interface PrivilegeModalProps {
  selectedPrivilege: string;
  onClose: () => void;
}

// Helper function to get privilege information
const getPrivilegeInfo = (privilegeLevel: string): PrivilegeInfo | null => {
  for (const component of targetComponents) {
    if (component.sourcePrivilegeInfo?.level === privilegeLevel) {
      return component.sourcePrivilegeInfo;
    }
    if (component.targetPrivilegeInfo?.level === privilegeLevel) {
      return component.targetPrivilegeInfo;
    }
  }
  return null;
};

export function PrivilegeModal({ selectedPrivilege, onClose }: PrivilegeModalProps) {
  const privInfo = getPrivilegeInfo(selectedPrivilege);

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
          {!privInfo ? (
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