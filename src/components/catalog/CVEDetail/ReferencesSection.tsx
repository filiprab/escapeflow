import { useState } from 'react';
import { LinkIcon, PencilIcon, XMarkIcon, CheckIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CVERecord } from '@/types/cve';

interface ReferencesSectionProps {
  cve: CVERecord;
  onUpdate?: (field: string, data: unknown) => Promise<unknown>;
  isUpdating?: boolean;
}

export default function ReferencesSection({ cve, onUpdate, isUpdating }: ReferencesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReferences, setEditedReferences] = useState<string[]>([]);
  const [newReference, setNewReference] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currentReferences = cve.references?.map(ref => ref.url) || [];

  const handleEdit = () => {
    setEditedReferences([...currentReferences]);
    setIsEditing(true);
    setError(null);
    setNewReference('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedReferences([]);
    setNewReference('');
    setError(null);
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    
    try {
      setError(null);
      await onUpdate('references', { references: editedReferences });
      setIsEditing(false);
      setNewReference('');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to update references');
    }
  };

  const removeReference = (index: number) => {
    setEditedReferences(prev => prev.filter((_, i) => i !== index));
  };

  const addReference = () => {
    const trimmed = newReference.trim();
    if (trimmed) {
      // Basic URL validation
      try {
        new URL(trimmed);
        if (!editedReferences.includes(trimmed)) {
          setEditedReferences(prev => [...prev, trimmed]);
          setNewReference('');
        }
      } catch {
        setError('Please enter a valid URL');
      }
    }
  };

  const handleReferenceKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addReference();
    }
  };

  const updateReference = (index: number, newUrl: string) => {
    setEditedReferences(prev => 
      prev.map((url, i) => i === index ? newUrl : url)
    );
  };

  if (!isEditing && (!cve.references || cve.references.length === 0)) {
    if (!onUpdate) return null;
    
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">References</h2>
          <button
            onClick={handleEdit}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            disabled={isUpdating}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add References</span>
          </button>
        </div>
        <p className="text-gray-500 text-sm">No references available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">References</h2>
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
          {/* Existing references */}
          <div className="space-y-3">
            {editedReferences.map((url, index) => (
              <div key={index} className="flex items-center space-x-2">
                <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateReference(index, e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                  disabled={isUpdating}
                />
                <button
                  onClick={() => removeReference(index)}
                  className="p-1 text-red-500 hover:text-red-700"
                  disabled={isUpdating}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {editedReferences.length === 0 && (
              <p className="text-gray-500 text-sm">No references specified</p>
            )}
          </div>

          {/* Add new reference */}
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
            <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="url"
              value={newReference}
              onChange={(e) => setNewReference(e.target.value)}
              onKeyPress={handleReferenceKeyPress}
              placeholder="Add new reference URL..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isUpdating}
            />
            <button
              onClick={addReference}
              disabled={!newReference.trim() || isUpdating}
              className="p-1 text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
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
        <div className="space-y-3">
          {currentReferences.map((url, index) => (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              <span className="break-all">{url}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}