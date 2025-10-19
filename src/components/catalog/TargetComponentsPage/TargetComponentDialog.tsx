import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import EscalationManager from './EscalationManager';

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
  onEscalationsUpdate?: () => void;
}

export interface TargetComponentFormData {
  id?: string;
  name: string;
  description: string;
  sourcePrivilegeId?: string;
  targetPrivilegeId?: string;
}

export default function TargetComponentDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
  privileges,
  onEscalationsUpdate,
}: TargetComponentDialogProps) {
  const [formData, setFormData] = useState<TargetComponentFormData>({
    name: '',
    description: '',
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
    setFormData(prev => ({
      ...prev,
      name,
    }));
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

          {/* Component Name - Editable text input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Component Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="e.g., V8 JavaScript Engine, Blink Rendering Engine, etc."
              required
            />
            <p className="text-xs text-gray-400 mt-2">
              Enter any component name. This will be used to categorize CVEs.
            </p>
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

          {mode === 'create' && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                💡 After creating the component, you can add specific privilege escalation paths using the Escalation Manager.
              </p>
            </div>
          )}

          {/* Escalation Manager (Edit Mode Only) */}
          {mode === 'edit' && formData.id && (
            <div className="pt-6 border-t border-gray-600">
              <EscalationManager
                componentId={formData.id}
                componentName={formData.name}
                privileges={privileges}
                onUpdate={() => onEscalationsUpdate?.()}
              />
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
