import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { TARGET_COMPONENTS, getComponentDescription } from '@/lib/utils/component-mapping';

interface PrivilegeContext {
  id: string;
  level: string;
  color: string;
  order: number;
}

interface TargetComponentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TargetComponentFormData) => Promise<void>;
  initialData?: TargetComponentFormData;
  mode: 'create' | 'edit';
  privileges: PrivilegeContext[];
}

export interface TargetComponentFormData {
  id?: string;
  name: string;
  description: string;
  sourcePrivilegeId: string;
  targetPrivilegeId: string;
}

export default function TargetComponentDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
  privileges,
}: TargetComponentDialogProps) {
  const [formData, setFormData] = useState<TargetComponentFormData>({
    name: '',
    description: '',
    sourcePrivilegeId: '',
    targetPrivilegeId: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        description: '',
        sourcePrivilegeId: '',
        targetPrivilegeId: '',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Component name is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.sourcePrivilegeId) {
      setError('Source privilege is required');
      return;
    }
    if (!formData.targetPrivilegeId) {
      setError('Target privilege is required');
      return;
    }
    if (formData.sourcePrivilegeId === formData.targetPrivilegeId) {
      setError('Source and target privileges must be different');
      return;
    }

    try {
      setSaving(true);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save target component');
    } finally {
      setSaving(false);
    }
  };

  const handleNameChange = (name: string) => {
    const description = getComponentDescription(name as typeof TARGET_COMPONENTS[number]);
    setFormData(prev => ({
      ...prev,
      name,
      description: description || prev.description,
    }));
  };

  // Sort privileges by escalation order
  const sortedPrivileges = [...privileges].sort((a, b) => a.order - b.order);

  // Get color classes for privilege badges
  const getPrivilegeColor = (level: string) => {
    const priv = privileges.find(p => p.level === level);
    if (!priv) return 'bg-gray-500';
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      gray: 'bg-gray-500',
    };
    return colorMap[priv.color] || 'bg-gray-500';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'create' ? 'Create Target Component' : 'Edit Target Component'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Component Name - Dropdown for create, read-only for edit */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Component Name <span className="text-red-400">*</span>
            </label>
            {mode === 'create' ? (
              <select
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="select-input w-full"
                required
              >
                <option value="">Select a component...</option>
                {TARGET_COMPONENTS.map((component) => (
                  <option key={component} value={component}>
                    {component}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full bg-gray-700/50 text-gray-400 rounded-lg px-4 py-2 border border-gray-600">
                {formData.name}
                <p className="text-xs text-gray-500 mt-1">
                  Component names cannot be edited (they match CVE labels)
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Describe this component's role in the browser attack surface"
              required
            />
          </div>

          {/* Source Privilege */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Source Privilege (Escalates FROM) <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.sourcePrivilegeId}
              onChange={(e) => setFormData(prev => ({ ...prev, sourcePrivilegeId: e.target.value }))}
              className="select-input w-full"
              required
            >
              <option value="">Select source privilege...</option>
              {sortedPrivileges.map((priv) => (
                <option key={priv.id} value={priv.id}>
                  {priv.level} (Order: {priv.order})
                </option>
              ))}
            </select>
            {formData.sourcePrivilegeId && (
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${getPrivilegeColor(
                  privileges.find(p => p.id === formData.sourcePrivilegeId)?.level || ''
                )}`}></div>
                <span className="text-xs text-gray-400">
                  {privileges.find(p => p.id === formData.sourcePrivilegeId)?.level}
                </span>
              </div>
            )}
          </div>

          {/* Target Privilege */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Privilege (Escalates TO) <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.targetPrivilegeId}
              onChange={(e) => setFormData(prev => ({ ...prev, targetPrivilegeId: e.target.value }))}
              className="select-input w-full"
              required
            >
              <option value="">Select target privilege...</option>
              {sortedPrivileges.map((priv) => (
                <option key={priv.id} value={priv.id}>
                  {priv.level} (Order: {priv.order})
                </option>
              ))}
            </select>
            {formData.targetPrivilegeId && (
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${getPrivilegeColor(
                  privileges.find(p => p.id === formData.targetPrivilegeId)?.level || ''
                )}`}></div>
                <span className="text-xs text-gray-400">
                  {privileges.find(p => p.id === formData.targetPrivilegeId)?.level}
                </span>
              </div>
            )}
          </div>

          {/* Escalation Direction Validation Hint */}
          {formData.sourcePrivilegeId && formData.targetPrivilegeId && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                <strong>Escalation Path:</strong> {privileges.find(p => p.id === formData.sourcePrivilegeId)?.level} → {privileges.find(p => p.id === formData.targetPrivilegeId)?.level}
              </p>
              {formData.sourcePrivilegeId === formData.targetPrivilegeId && (
                <p className="text-red-300 text-xs mt-1">⚠️ Source and target must be different</p>
              )}
              {(() => {
                const source = privileges.find(p => p.id === formData.sourcePrivilegeId);
                const target = privileges.find(p => p.id === formData.targetPrivilegeId);
                if (source && target && source.order >= target.order) {
                  return (
                    <p className="text-red-300 text-xs mt-1">
                      ⚠️ Invalid direction: source (order {source.order}) must come before target (order {target.order})
                    </p>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
