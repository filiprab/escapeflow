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
    <div className="group bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 hover:border-blue-500/30 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Description</h2>
        {onUpdate && !isEditing && (
          <button
            onClick={handleEdit}
            className="group/edit flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-all duration-300"
            disabled={isUpdating}
          >
            <PencilIcon className="w-4 h-4 group-hover/edit:rotate-12 transition-transform duration-300" />
            <span className="font-medium">Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6">
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full min-h-32 p-4 bg-gray-700/30 backdrop-blur-lg border border-gray-600/50 rounded-xl resize-y focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-200 placeholder-gray-400 transition-all duration-300"
            placeholder="Enter CVE description..."
            disabled={isUpdating}
          />
          
          {error && (
            <div className="text-red-300 text-sm bg-red-500/20 border border-red-500/30 p-3 rounded-xl backdrop-blur-lg">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25"
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
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-700/30 backdrop-blur-lg border border-gray-600/50 text-gray-300 rounded-xl hover:bg-gray-600/30 hover:border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium hover:scale-[1.02]"
            >
              <XMarkIcon className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-300 leading-relaxed text-lg">
          {currentDescription || 'No description available'}
        </p>
      )}
    </div>
  );
}