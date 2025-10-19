import { useState, useEffect } from 'react';
import { PencilIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { CVERecord } from '@/types/cve';

interface ClassificationSectionProps {
  cve: CVERecord;
  onUpdate?: (field: string, data: unknown) => Promise<unknown>;
  isUpdating?: boolean;
}

export default function ClassificationSection({ cve, onUpdate, isUpdating }: ClassificationSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedOS, setEditedOS] = useState<string[]>([]);
  const [editedTargetComponent, setEditedTargetComponent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableComponents, setAvailableComponents] = useState<string[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(false);

  const allowedOS = ['Android', 'iOS', 'Windows', 'Linux', 'macOS'];
  const currentOS = cve.labels?.operatingSystems || [];
  const currentTargetComponent = cve.labels?.targetComponent || null;

  // Fetch available components when entering edit mode
  useEffect(() => {
    if (isEditing && availableComponents.length === 0) {
      fetchAvailableComponents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const fetchAvailableComponents = async () => {
    try {
      setLoadingComponents(true);
      const response = await fetch('/api/cves?type=filters');
      const data = await response.json();
      setAvailableComponents(data.components || []);
    } catch (err) {
      console.error('Failed to fetch components:', err);
      setAvailableComponents([]);
    } finally {
      setLoadingComponents(false);
    }
  };

  const handleEdit = () => {
    setEditedOS([...currentOS]);
    setEditedTargetComponent(currentTargetComponent);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedOS([]);
    setEditedTargetComponent(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!onUpdate) return;

    try {
      setError(null);
      await onUpdate('labels', {
        operatingSystems: editedOS,
        targetComponent: editedTargetComponent
      });
      setIsEditing(false);
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

  return (
    <div className="group bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 hover:border-green-500/30 shadow-2xl hover:shadow-green-500/10 transition-all duration-300 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Classification</h2>
        {onUpdate && !isEditing && (
          <button
            onClick={handleEdit}
            className="group/edit flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-all duration-300 hover:scale-105"
            disabled={isUpdating}
          >
            <PencilIcon className="w-4 h-4 group-hover/edit:rotate-12 transition-transform duration-300" />
            <span className="font-medium">Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6">
          {/* Operating Systems Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Operating Systems</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allowedOS.map((os) => (
                <label 
                  key={os}
                  className="flex items-center gap-3 p-3 hover:bg-gray-700/30 rounded-xl cursor-pointer transition-all duration-300 border border-gray-600/30 hover:border-green-500/30"
                >
                  <input
                    type="checkbox"
                    checked={editedOS.includes(os)}
                    onChange={() => toggleOS(os)}
                    className="w-4 h-4 text-green-500 bg-gray-700/30 border-gray-600 rounded focus:ring-green-500/50 focus:ring-2"
                    disabled={isUpdating}
                  />
                  <span className="text-sm text-gray-200 font-medium">{os}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Target Component Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Target Component</h3>
            <select
              value={editedTargetComponent || ''}
              onChange={(e) => setEditedTargetComponent(e.target.value || null)}
              className="select-input w-full"
              disabled={isUpdating || loadingComponents}
            >
              <option value="">{loadingComponents ? 'Loading components...' : 'No component selected'}</option>
              {availableComponents.map((component) => (
                <option key={component} value={component}>
                  {component}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-2">
              Select the primary component targeted by this CVE. Components are defined in the Target Components catalog.
            </p>
          </div>

          {error && (
            <div className="text-red-300 text-sm bg-red-500/20 border border-red-500/30 p-3 rounded-xl backdrop-blur-lg">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium hover:scale-[1.02] shadow-lg hover:shadow-green-500/25"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Operating Systems</h3>
            <div className="flex flex-wrap gap-3">
              {currentOS.length > 0 ? (
                currentOS.map((os) => (
                  <span key={os} className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl text-sm font-medium border border-blue-500/30">
                    {os}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm font-medium italic">None specified</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Target Component</h3>
            <div className="flex flex-wrap gap-3">
              {currentTargetComponent ? (
                <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl text-sm font-medium border border-purple-500/30">
                  {currentTargetComponent}
                </span>
              ) : (
                <span className="text-gray-400 text-sm font-medium italic">Unlabeled</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}