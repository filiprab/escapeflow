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
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-medium text-gray-900">
              CVE ID: {cveId.toUpperCase() || 'Not specified'}
            </div>
            {prefetched && (
              <div className="text-sm text-green-600 mt-1">
                ✓ Data fetched from {source}
              </div>
            )}
            {!prefetched && (
              <div className="text-sm text-gray-600 mt-1">
                Manual entry mode
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onStartOver}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            disabled={loading}
          >
            Start Over
          </button>
        </div>
      </div>
      
      {/* CVE ID Input (editable in edit mode) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CVE ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={cveId}
          onChange={(e) => setCveId(e.target.value)}
          placeholder="CVE-2024-1234"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        />
      </div>
        
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.descriptions[0]?.description || ''}
          onChange={(e) => setFormData({
            ...formData,
            descriptions: [{ lang: 'en', description: e.target.value }]
          })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter CVE description..."
          disabled={loading}
        />
      </div>

      {/* Operating Systems */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Operating Systems</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {allowedOS.map((os) => (
            <label key={os} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={formData.labels?.operatingSystems?.includes(os) || false}
                onChange={() => toggleOS(os)}
                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">{os}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Components */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Components</label>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {formData.labels?.components?.map((component) => (
              <span key={component} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {component}
                <button
                  type="button"
                  onClick={() => removeComponent(component)}
                  className="ml-1 text-purple-500 hover:text-purple-700"
                  disabled={loading}
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add component and press Enter..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <label className="block text-sm font-medium text-gray-700 mb-2">References</label>
        <div className="space-y-2">
          {formData.references?.map((ref, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="url"
                value={ref}
                onChange={(e) => updateReference(index, e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => removeReference(index)}
                className="p-2 text-red-500 hover:text-red-700"
                disabled={loading}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addReference}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={loading}
          >
            + Add Reference
          </button>
        </div>
      </div>
    </div>
  );
}