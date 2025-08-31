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
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <CheckIcon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}
    </>
  );
}