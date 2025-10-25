'use client';

import { CloudArrowDownIcon } from '@heroicons/react/24/outline';

interface FetchStepProps {
  cveId: string;
  setCveId: (value: string) => void;
  onFetch: () => void;
  loading: boolean;
}

export default function FetchStep({
  cveId,
  setCveId,
  onFetch,
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

      {/* Data Source Info */}
      <div className="bg-gray-700/30 backdrop-blur-sm p-4 rounded-xl border border-gray-600/50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <div>
            <div className="font-medium text-white">NVD</div>
            <div className="text-sm text-gray-400">National Vulnerability Database</div>
          </div>
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
              Fetch CVE Data from NVD
            </>
          )}
        </button>
      </div>
    </div>
  );
}