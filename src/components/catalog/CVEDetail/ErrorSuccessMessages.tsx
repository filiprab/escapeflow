'use client';

import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorSuccessMessagesProps {
  error: string | null;
  success: string | null;
}

export default function ErrorSuccessMessages({ error, success }: ErrorSuccessMessagesProps) {
  return (
    <>
      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 backdrop-blur-sm">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300 backdrop-blur-sm">
          <CheckIcon className="w-5 h-5 flex-shrink-0 text-green-400" />
          <span className="text-sm">{success}</span>
        </div>
      )}
    </>
  );
}