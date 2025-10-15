'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import Dialog, { DialogContent, DialogFooter } from '@/components/ui/Dialog';

interface BulkDeleteConfirmationDialogProps {
  isOpen: boolean;
  selectedCount: number;
  totalAvailable: number;
  isSelectAll: boolean;
  excludedCount: number;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function BulkDeleteConfirmationDialog({
  isOpen,
  selectedCount,
  totalAvailable,
  isSelectAll,
  excludedCount,
  onClose,
  onConfirm,
  isDeleting,
}: BulkDeleteConfirmationDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const [requiredCode, setRequiredCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Generate new random code when dialog opens
      setRequiredCode(crypto.randomUUID().slice(0, 8).toUpperCase());
      setConfirmText('');
    } else {
      setConfirmText('');
    }
  }, [isOpen]);

  const selectionSummary = useMemo(() => {
    if (isSelectAll) {
      if (excludedCount > 0) {
        return 'all ' + totalAvailable.toLocaleString() + ' CVEs matching the current filters except ' + excludedCount.toLocaleString() + ' deselected entries';
      }
      return 'all ' + selectedCount.toLocaleString() + ' CVEs matching the current filters';
    }

    return selectedCount.toLocaleString() + ' selected ' + (selectedCount === 1 ? 'CVE' : 'CVEs');
  }, [isSelectAll, selectedCount, excludedCount, totalAvailable]);

  const isConfirmValid = confirmText === requiredCode && selectedCount > 0;

  const handleConfirm = () => {
    if (isConfirmValid && !isDeleting) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center space-x-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
          <span>Delete Selected CVEs</span>
        </div>
      }
      maxWidth="md"
      showCloseButton={!isDeleting}
      footer={
        <DialogFooter>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmValid || isDeleting}
            className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 border border-transparent rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-red-500/25"
          >
            {isDeleting ? (
              <>
                <div className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <TrashIcon className="w-4 h-4 mr-2 inline" />
                Delete CVEs
              </>
            )}
          </button>
        </DialogFooter>
      }
    >
      <DialogContent className="space-y-5">
        <div className="text-sm text-gray-300 space-y-4">
          <p>
            You are about to permanently delete{' '}
            <span className="font-semibold text-white">{selectionSummary}</span>. This action cannot be undone.
          </p>
          <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="ml-3 text-sm text-red-300 space-y-1">
                <p>All associated data such as descriptions, metrics, labels, references, and affected products will be removed.</p>
                {isSelectAll && (
                  <p>
                    This includes every CVE that matches the current filters{' '}
                    {excludedCount > 0 && 'Entries you manually deselected on individual rows will be preserved.'}
                  </p>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Type <span className="font-mono bg-gray-700/60 px-2 py-1 rounded text-gray-200">{requiredCode}</span> to confirm.
          </p>
        </div>

        <input
          type="text"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value.trimStart())}
          placeholder={requiredCode}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 backdrop-blur-sm transition-all duration-200"
          disabled={isDeleting}
        />
      </DialogContent>
    </Dialog>
  );
}
