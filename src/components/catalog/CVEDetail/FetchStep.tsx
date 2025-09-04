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

      {/* Source Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">
          Data Source <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setSource('NVD')}
            className={`p-4 border-2 rounded-xl text-center transition-all duration-200 ${
              source === 'NVD' 
                ? 'border-blue-500 bg-blue-500/20 text-white backdrop-blur-sm shadow-lg shadow-blue-500/25' 
                : 'border-gray-600/50 bg-gray-700/30 text-gray-300 hover:border-gray-500/50 hover:bg-gray-600/30'
            }`}
            disabled={loading}
          >
            <div className="font-semibold text-lg mb-1">NVD</div>
            <div className={`text-sm ${
              source === 'NVD' ? 'text-blue-200' : 'text-gray-400'
            }`}>National Vulnerability Database</div>
          </button>
          
          <button
            type="button"
            onClick={() => setSource('CVE.org')}
            className={`p-4 border-2 rounded-xl text-center transition-all duration-200 ${
              source === 'CVE.org' 
                ? 'border-blue-500 bg-blue-500/20 text-white backdrop-blur-sm shadow-lg shadow-blue-500/25' 
                : 'border-gray-600/50 bg-gray-700/30 text-gray-300 hover:border-gray-500/50 hover:bg-gray-600/30'
            }`}
            disabled={loading}
          >
            <div className="font-semibold text-lg mb-1">CVE.org</div>
            <div className={`text-sm ${
              source === 'CVE.org' ? 'text-blue-200' : 'text-gray-400'
            }`}>MITRE Corporation</div>
          </button>
        </div>
      </div>

      {/* Fetch Button */}
      <div className="pt-6">
        <button
          onClick={onFetch}
          disabled={loading || !cveId.trim()}
          className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-blue-500/25 font-medium"
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
      <div className="pt-6 border-t border-gray-600/50">
        <button
          type="button"
          onClick={onSkipToManual}
          className="w-full text-sm text-gray-400 hover:text-gray-200 transition-colors p-3 hover:bg-gray-700/30 rounded-lg"
          disabled={loading}
        >
          Can&apos;t find CVE data? Enter manually instead →
        </button>
      </div>
    </div>
  );
}