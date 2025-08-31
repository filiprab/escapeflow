import { useState } from 'react';
import { PencilIcon, XMarkIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CVERecord } from '@/types/cve';

interface ClassificationSectionProps {
  cve: CVERecord;
  onUpdate?: (field: string, data: unknown) => Promise<unknown>;
  isUpdating?: boolean;
}

export default function ClassificationSection({ cve, onUpdate, isUpdating }: ClassificationSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedOS, setEditedOS] = useState<string[]>([]);
  const [editedComponents, setEditedComponents] = useState<string[]>([]);
  const [newComponent, setNewComponent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const allowedOS = ['Android', 'iOS', 'Windows', 'Linux', 'macOS'];
  const currentOS = cve.labels?.operatingSystems || [];
  const currentComponents = cve.labels?.components || [];

  const handleEdit = () => {
    setEditedOS([...currentOS]);
    setEditedComponents([...currentComponents]);
    setIsEditing(true);
    setError(null);
    setNewComponent('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedOS([]);
    setEditedComponents([]);
    setNewComponent('');
    setError(null);
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    
    try {
      setError(null);
      await onUpdate('labels', { 
        operatingSystems: editedOS, 
        components: editedComponents 
      });
      setIsEditing(false);
      setNewComponent('');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to update labels');
    }
  };

  const toggleOS = (os: string) => {
    setEditedOS(prev => 
      prev.includes(os) 
        ? prev.filter(item => item !== os)
        : [...prev, os]
    );
  };

  const removeComponent = (component: string) => {
    setEditedComponents(prev => prev.filter(item => item !== component));
  };

  const addComponent = () => {
    const trimmed = newComponent.trim();
    if (trimmed && !editedComponents.includes(trimmed)) {
      setEditedComponents(prev => [...prev, trimmed]);
      setNewComponent('');
    }
  };

  const handleComponentKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addComponent();
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Classification</h2>
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
        <div className="space-y-6">
          {/* Operating Systems Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Operating Systems</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {allowedOS.map((os) => (
                <label 
                  key={os}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={editedOS.includes(os)}
                    onChange={() => toggleOS(os)}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isUpdating}
                  />
                  <span className="text-sm text-gray-700">{os}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Components Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Components</h3>
            <div className="space-y-3">
              {/* Existing components */}
              <div className="flex flex-wrap gap-2">
                {editedComponents.map((component) => (
                  <span 
                    key={component} 
                    className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {component}
                    <button
                      onClick={() => removeComponent(component)}
                      className="ml-1 text-purple-500 hover:text-purple-700"
                      disabled={isUpdating}
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {editedComponents.length === 0 && (
                  <span className="text-gray-500 text-sm">No components specified</span>
                )}
              </div>

              {/* Add new component */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newComponent}
                  onChange={(e) => setNewComponent(e.target.value)}
                  onKeyPress={handleComponentKeyPress}
                  placeholder="Add new component..."
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUpdating}
                />
                <button
                  onClick={addComponent}
                  disabled={!newComponent.trim() || isUpdating}
                  className="p-1 text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Operating Systems</h3>
            <div className="flex flex-wrap gap-2">
              {currentOS?.map((os) => (
                <span key={os} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {os}
                </span>
              )) || <span className="text-gray-500 text-sm">None specified</span>}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Components</h3>
            <div className="flex flex-wrap gap-2">
              {currentComponents?.map((component) => (
                <span key={component} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {component}
                </span>
              )) || <span className="text-gray-500 text-sm">None specified</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}