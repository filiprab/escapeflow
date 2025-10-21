/**
 * Progress Dialog Component
 *
 * Displays real-time progress for bulk CVE import operations
 */

import Dialog from '@/components/ui/Dialog';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export interface ProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  current: number;
  total: number;
  imported: number;
  skipped: number;
  failed: number;
  currentCveId?: string;
  status: 'running' | 'complete' | 'error';
  errorMessage?: string;
}

export default function ProgressDialog({
  isOpen,
  onClose,
  current,
  total,
  imported,
  skipped,
  failed,
  currentCveId,
  status,
  errorMessage,
}: ProgressDialogProps) {
  // Calculate actual progress from imported/skipped/failed counts if total is not yet known
  const actualCurrent = imported + skipped + failed;
  const displayCurrent = Math.max(current, actualCurrent);
  const progress = total > 0 ? (displayCurrent / total) * 100 : 0;
  const isComplete = status === 'complete';
  const hasError = status === 'error';
  const canClose = isComplete || hasError;

  return (
    <Dialog isOpen={isOpen} onClose={canClose ? onClose : () => {}} title="Updating CVE Database">
      <div className="p-6 space-y-6">
        {/* Status Message */}
        <div className="text-center">
          {status === 'running' && (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
              <span className="text-gray-200 font-medium">Importing CVEs...</span>
            </div>
          )}

          {isComplete && (
            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircleIcon className="w-6 h-6" />
              <span className="text-lg font-semibold">Update Complete!</span>
            </div>
          )}

          {hasError && (
            <div className="flex items-center justify-center gap-2 text-red-400">
              <XCircleIcon className="w-6 h-6" />
              <span className="text-lg font-semibold">Update Failed</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Progress</span>
            <span>{total > 0 ? `${Math.round(progress)}%` : 'Processing...'}</span>
          </div>

          <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
            {total > 0 ? (
              <div
                className={`h-full transition-all duration-300 ease-out ${
                  hasError
                    ? 'bg-red-500'
                    : isComplete
                    ? 'bg-green-500'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse" />
            )}
          </div>

          <div className="flex justify-between text-sm text-gray-400">
            <span>
              {displayCurrent.toLocaleString()}{total > 0 ? ` / ${total.toLocaleString()}` : ' CVEs processed'}
            </span>
            {currentCveId && status === 'running' && (
              <span className="font-mono text-xs text-blue-400">{currentCveId}</span>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center backdrop-blur-sm hover:bg-green-500/15 transition-colors">
            <div className="text-3xl font-semibold text-green-400 mb-1">{imported.toLocaleString()}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Imported</div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center backdrop-blur-sm hover:bg-yellow-500/15 transition-colors">
            <div className="text-3xl font-semibold text-yellow-400 mb-1">{skipped.toLocaleString()}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Skipped</div>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center backdrop-blur-sm hover:bg-red-500/15 transition-colors">
            <div className="text-3xl font-semibold text-red-400 mb-1">{failed.toLocaleString()}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Failed</div>
          </div>
        </div>

        {/* Error Message */}
        {hasError && errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-sm text-red-300">{errorMessage}</p>
          </div>
        )}

        {/* Success Message */}
        {isComplete && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-sm text-green-300">
              Successfully imported {imported.toLocaleString()} new CVEs.
              {skipped > 0 && ` Skipped ${skipped.toLocaleString()} existing CVEs.`}
              {failed > 0 && ` Failed to import ${failed.toLocaleString()} CVEs.`}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          {!canClose && (
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              Please wait while the update completes...
            </p>
          )}

          {canClose && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-blue-500/25"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
