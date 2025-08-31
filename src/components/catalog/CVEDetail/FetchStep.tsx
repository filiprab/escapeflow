'use client';

import { CloudArrowDownIcon } from '@heroicons/react/24/outline';

type Source = 'NVD' | 'CVE.org';

interface FetchStepProps {
  cveId: string;
  setCveId: (value: string) => void;
  source: Source;
  setSource: (value: Source) => void;
  onFetch: () => void;
  onSkipToManual: () => void;
  loading: boolean;
}

export default function FetchStep({
  cveId,
  setCveId,
  source,
  setSource,
  onFetch,
  onSkipToManual,
  loading
}: FetchStepProps) {
  return (
    <div className="space-y-6">
      {/* CVE ID Input */}
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

      {/* Source Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data Source <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSource('NVD')}
            className={`p-3 border-2 rounded-lg text-center transition-colors ${
              source === 'NVD' 
                ? 'border-blue-500 bg-blue-50 text-blue-900' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            disabled={loading}
          >
            <div className="font-medium">NVD</div>
            <div className="text-sm text-gray-500">National Vulnerability Database</div>
          </button>
          
          <button
            type="button"
            onClick={() => setSource('CVE.org')}
            className={`p-3 border-2 rounded-lg text-center transition-colors ${
              source === 'CVE.org' 
                ? 'border-blue-500 bg-blue-50 text-blue-900' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            disabled={loading}
          >
            <div className="font-medium">CVE.org</div>
            <div className="text-sm text-gray-500">MITRE Corporation</div>
          </button>
        </div>
      </div>

      {/* Fetch Button */}
      <div className="pt-4">
        <button
          onClick={onFetch}
          disabled={loading || !cveId.trim()}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <div className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Fetching CVE Data...
            </>
          ) : (
            <>
              <CloudArrowDownIcon className="w-5 h-5 mr-2" />
              Fetch CVE Data from {source}
            </>
          )}
        </button>
      </div>

      {/* Manual Entry Option */}
      <div className="pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onSkipToManual}
          className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
          disabled={loading}
        >
          Can&apos;t find CVE data? Enter manually instead →
        </button>
      </div>
    </div>
  );
}