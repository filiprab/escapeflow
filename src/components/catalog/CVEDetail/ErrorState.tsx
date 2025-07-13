import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  const isNotFound = error.includes('not found');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            {isNotFound ? 'CVE Not Found' : 'Error Loading CVE'}
          </h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-x-4">
            {!isNotFound && (
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            )}
            <Link 
              href="/catalog"
              className="inline-flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}