'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PoCInput, { type ProofOfConcept } from './PoCInput';

interface CVEFormData {
  descriptions: Array<{ lang: string; description: string }>;
  references?: string[];
  labels?: {
    operatingSystems: string[];
    targetComponent: string | null;
  };
  proofOfConcepts?: ProofOfConcept[];
}

interface EditStepProps {
  cveId: string;
  setCveId: (value: string) => void;
  formData: CVEFormData;
  setFormData: (value: CVEFormData) => void;
  prefetched: boolean;
  onStartOver: () => void;
  loading: boolean;
  allowedOS: string[];
  // Form manipulation functions
  toggleOS: (os: string) => void;
  setTargetComponent: (component: string | null) => void;
  addReference: () => void;
  removeReference: (index: number) => void;
  updateReference: (index: number, value: string) => void;
}

export default function EditStep({
  cveId,
  setCveId,
  formData,
  setFormData,
  prefetched,
  onStartOver,
  loading,
  allowedOS,
  toggleOS,
  setTargetComponent,
  addReference,
  removeReference,
  updateReference
}: EditStepProps) {
  const [availableComponents, setAvailableComponents] = useState<string[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [showAllReferences, setShowAllReferences] = useState(false);

  // Fetch available components on mount
  useEffect(() => {
    fetchAvailableComponents();
  }, []);

  const fetchAvailableComponents = async () => {
    try {
      setLoadingComponents(true);
      const response = await fetch('/api/cves?type=filters');
      const data = await response.json();
      setAvailableComponents(data.components || []);
    } catch (err) {
      console.error('Failed to fetch components:', err);
      setAvailableComponents([]);
    } finally {
      setLoadingComponents(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with CVE ID and Source Info */}
      <div className="bg-gray-700/30 backdrop-blur-sm p-6 rounded-xl border border-gray-600/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-white">
              CVE ID: {cveId.toUpperCase() || 'Not specified'}
            </div>
            {prefetched && (
              <div className="text-sm text-green-400 mt-2 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Data fetched from NVD
              </div>
            )}
            {!prefetched && (
              <div className="text-sm text-gray-400 mt-2">
                Manual entry mode
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onStartOver}
            className="text-sm text-blue-400 hover:text-blue-300 px-4 py-2 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-all duration-200"
            disabled={loading}
          >
            Start Over
          </button>
        </div>
      </div>
      
      {/* CVE ID Input (editable in edit mode) */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">
          CVE ID <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={cveId}
          onChange={(e) => setCveId(e.target.value)}
          placeholder="CVE-2024-1234"
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200"
          disabled={loading}
        />
      </div>
        
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.descriptions[0]?.description || ''}
          onChange={(e) => setFormData({
            ...formData,
            descriptions: [{ lang: 'en', description: e.target.value }]
          })}
          rows={4}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200 resize-none"
          placeholder="Enter CVE description..."
          disabled={loading}
        />
      </div>

      {/* Operating Systems */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-4">Operating Systems</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {allowedOS.map((os) => (
            <label key={os} className="flex items-center space-x-3 p-3 bg-gray-700/20 hover:bg-gray-700/40 rounded-lg cursor-pointer transition-colors duration-200">
              <input
                type="checkbox"
                checked={formData.labels?.operatingSystems?.includes(os) || false}
                onChange={() => toggleOS(os)}
                className="w-4 h-4 text-blue-500 bg-gray-700/50 border-gray-600/50 rounded focus:ring-blue-500 focus:ring-2"
                disabled={loading}
              />
              <span className="text-sm text-gray-300 font-medium">{os}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Target Component */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">
          Target Component
          <span className="ml-2 text-xs text-gray-400 font-normal">
            (Select the primary affected component)
          </span>
        </label>
        <select
          className="select-input w-full"
          onChange={(e) => {
            const value = e.target.value === '' ? null : e.target.value;
            setTargetComponent(value);
          }}
          disabled={loading || loadingComponents}
          value={formData.labels?.targetComponent || ''}
        >
          <option value="">{loadingComponents ? 'Loading components...' : 'No component selected'}</option>
          {availableComponents.map((component) => (
            <option key={component} value={component}>
              {component}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-2">
          Select the primary component targeted by this CVE. Components are defined in the Target Components catalog.
        </p>
      </div>

      {/* References */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">References</label>
        <div className="space-y-3">
          {(showAllReferences
            ? formData.references
            : formData.references?.slice(0, 5)
          )?.map((ref, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="url"
                value={ref}
                onChange={(e) => updateReference(index, e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => removeReference(index)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                disabled={loading}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ))}

          {/* Show More/Less Toggle */}
          {(formData.references?.length || 0) > 5 && (
            <button
              type="button"
              onClick={() => setShowAllReferences(!showAllReferences)}
              className="w-full text-sm text-gray-400 hover:text-gray-200 transition-colors p-3 hover:bg-gray-700/30 rounded-lg border border-gray-600/30"
              disabled={loading}
            >
              {showAllReferences
                ? `Show Less (hiding ${(formData.references?.length || 0) - 5} references)`
                : `Show More (${(formData.references?.length || 0) - 5} more references)`
              }
            </button>
          )}

          <button
            type="button"
            onClick={addReference}
            className="text-sm text-blue-400 hover:text-blue-300 px-4 py-2 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-all duration-200 font-medium"
            disabled={loading}
          >
            + Add Reference
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-600/50" />

      {/* Proof of Concept */}
      <PoCInput
        value={formData.proofOfConcepts || []}
        onChange={(proofOfConcepts) => {
          setFormData({
            ...formData,
            proofOfConcepts
          });
        }}
        disabled={loading}
      />
    </div>
  );
}