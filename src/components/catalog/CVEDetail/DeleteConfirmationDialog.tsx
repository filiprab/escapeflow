'use client';

import { useState } from 'react';
import { ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import Dialog, { DialogContent, DialogFooter } from '@/components/ui/Dialog';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  cveId: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmationDialog({ 
  isOpen, 
  cveId, 
  onClose, 
  onConfirm, 
  isDeleting 
}: DeleteConfirmationDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const expectedText = cveId;

  const isConfirmValid = confirmText === expectedText;

  const handleConfirm = () => {
    if (isConfirmValid && !isDeleting) {
      setConfirmText('');
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('');
      onClose();
    }
  };

  const dialogTitle = (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
      </div>
      <span>Delete CVE</span>
    </div>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={dialogTitle}
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
                Delete CVE
              </>
            )}
          </button>
        </DialogFooter>
      }
    >
      <DialogContent className="space-y-4">
        <div className="text-sm text-gray-300">
          <p className="mb-4">
            This action will permanently delete <span className="font-semibold text-white">{cveId}</span> and all its associated data including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-400 ml-4">
            <li>Descriptions and references</li>
            <li>CVSS metrics and scores</li>
            <li>Labels and classifications</li>
            <li>Problem types and affected products</li>
          </ul>
        </div>

        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-300">
                This action cannot be undone
              </h3>
              <p className="text-sm text-red-300/90 mt-1">
                Please type <span className="font-mono bg-red-500/30 px-1 rounded text-red-200">{expectedText}</span> to confirm deletion.
              </p>
            </div>
          </div>
        </div>

        <div>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`Type ${expectedText} here`}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 backdrop-blur-sm transition-all duration-200"
            disabled={isDeleting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}