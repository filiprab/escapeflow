import { useState } from 'react';
import { PencilIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { CVERecord } from '@/types/cve';

interface DescriptionSectionProps {
  cve: CVERecord;
  onUpdate?: (field: string, data: unknown) => Promise<unknown>;
  isUpdating?: boolean;
}

export default function DescriptionSection({ cve, onUpdate, isUpdating }: DescriptionSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currentDescription = cve.descriptions?.[0]?.description || '';

  const handleEdit = () => {
    setEditedDescription(currentDescription);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDescription('');
    setError(null);
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    
    try {
      setError(null);
      await onUpdate('description', { description: editedDescription });
      setIsEditing(false);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to update description');
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Description</h2>
        {onUpdate && !isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            disabled={isUpdating}
          >
            <PencilIcon className="w-4 h-4" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full min-h-32 p-3 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter CVE description..."
            disabled={isUpdating}
          />
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 leading-relaxed">
          {currentDescription || 'No description available'}
        </p>
      )}
    </div>
  );
}