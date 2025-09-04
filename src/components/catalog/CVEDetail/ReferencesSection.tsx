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
      <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 hover:border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">References</h2>
          <button
            onClick={handleEdit}
            className="group/edit flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-all duration-300"
            disabled={isUpdating}
          >
            <PlusIcon className="w-4 h-4 group-hover/edit:rotate-12 transition-transform duration-300" />
            <span className="font-medium">Add References</span>
          </button>
        </div>
        <p className="text-gray-400 text-sm">No references available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 hover:border-cyan-500/30 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">References</h2>
        {onUpdate && !isEditing && (
          <button
            onClick={handleEdit}
            className="group/edit flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-all duration-300"
            disabled={isUpdating}
          >
            <PencilIcon className="w-4 h-4 group-hover/edit:rotate-12 transition-transform duration-300" />
            <span className="font-medium">Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {/* Existing references */}
          <div className="space-y-3">
            {editedReferences.map((url, index) => (
              <div key={index} className="flex items-center space-x-3">
                <LinkIcon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateReference(index, e.target.value)}
                  className="flex-1 px-4 py-3 text-sm bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm transition-all duration-200"
                  placeholder="https://example.com"
                  disabled={isUpdating}
                />
                <button
                  onClick={() => removeReference(index)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  disabled={isUpdating}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {editedReferences.length === 0 && (
              <p className="text-gray-400 text-sm">No references specified</p>
            )}
          </div>

          {/* Add new reference */}
          <div className="flex items-center space-x-3 pt-4 border-t border-gray-600/50">
            <LinkIcon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <input
              type="url"
              value={newReference}
              onChange={(e) => setNewReference(e.target.value)}
              onKeyPress={handleReferenceKeyPress}
              placeholder="Add new reference URL..."
              className="flex-1 px-4 py-3 text-sm bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm transition-all duration-200"
              disabled={isUpdating}
            />
            <button
              onClick={addReference}
              disabled={!newReference.trim() || isUpdating}
              className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 rounded-lg disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="text-red-300 text-sm bg-red-500/20 border border-red-500/30 p-3 rounded-lg backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="flex items-center space-x-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Save</span>
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-700/50 hover:border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <XMarkIcon className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {currentReferences.map((url, index) => (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 text-cyan-300 hover:text-cyan-200 hover:bg-gray-700/50 hover:border-gray-500/50 transition-all duration-200 group"
            >
              <LinkIcon className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <span className="break-all text-sm">{url}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}