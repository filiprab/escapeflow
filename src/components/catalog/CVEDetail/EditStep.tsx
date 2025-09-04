'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

type Source = 'NVD' | 'CVE.org';

interface CVEFormData {
  descriptions: Array<{ lang: string; description: string }>;
  references?: string[];
  labels?: {
    operatingSystems: string[];
    components: string[];
  };
}

interface EditStepProps {
  cveId: string;
  setCveId: (value: string) => void;
  source: Source;
  formData: CVEFormData;
  setFormData: (value: CVEFormData) => void;
  prefetched: boolean;
  onStartOver: () => void;
  loading: boolean;
  allowedOS: string[];
  // Form manipulation functions
  toggleOS: (os: string) => void;
  addComponent: (component: string) => void;
  removeComponent: (component: string) => void;
  addReference: () => void;
  removeReference: (index: number) => void;
  updateReference: (index: number, value: string) => void;
}

export default function EditStep({
  cveId,
  setCveId,
  source,
  formData,
  setFormData,
  prefetched,
  onStartOver,
  loading,
  allowedOS,
  toggleOS,
  addComponent,
  removeComponent,
  addReference,
  removeReference,
  updateReference
}: EditStepProps) {
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
                Data fetched from {source}
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {allowedOS.map((os) => (
            <label key={os} className="flex items-center space-x-3 p-3 hover:bg-gray-700/30 rounded-lg cursor-pointer transition-colors duration-200 border border-gray-600/30 hover:border-gray-500/50">
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

      {/* Components */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">Components</label>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.labels?.components?.map((component) => (
              <span key={component} className="inline-flex items-center px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-sm backdrop-blur-sm">
                {component}
                <button
                  type="button"
                  onClick={() => removeComponent(component)}
                  className="ml-2 text-purple-400 hover:text-purple-200 transition-colors"
                  disabled={loading}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add component and press Enter..."
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addComponent(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            disabled={loading}
          />
        </div>
      </div>

      {/* References */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">References</label>
        <div className="space-y-3">
          {formData.references?.map((ref, index) => (
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
    </div>
  );
}