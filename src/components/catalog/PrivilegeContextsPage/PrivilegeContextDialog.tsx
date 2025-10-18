import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface PrivilegeContextDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PrivilegeContextFormData) => Promise<void>;
  initialData?: PrivilegeContextFormData;
  mode: 'create' | 'edit';
}

export interface PrivilegeContextFormData {
  id?: string;
  level: string;
  capabilities: string[];
  restrictions: string[];
  examples: string[];
  color: string;
  order: number;
  description: string;
}

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'gray', label: 'Gray', class: 'bg-gray-500' },
];

export default function PrivilegeContextDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}: PrivilegeContextDialogProps) {
  const [formData, setFormData] = useState<PrivilegeContextFormData>({
    level: '',
    capabilities: [''],
    restrictions: [''],
    examples: [''],
    color: 'blue',
    order: 1,
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        level: '',
        capabilities: [''],
        restrictions: [''],
        examples: [''],
        color: 'blue',
        order: 1,
        description: '',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Filter out empty strings
    const cleanedData = {
      ...formData,
      capabilities: formData.capabilities.filter(c => c.trim() !== ''),
      restrictions: formData.restrictions.filter(r => r.trim() !== ''),
      examples: formData.examples.filter(ex => ex.trim() !== ''),
    };

    // Validation
    if (!cleanedData.level.trim()) {
      setError('Level is required');
      return;
    }
    if (cleanedData.capabilities.length === 0) {
      setError('At least one capability is required');
      return;
    }
    if (cleanedData.restrictions.length === 0) {
      setError('At least one restriction is required');
      return;
    }

    try {
      setSaving(true);
      await onSave(cleanedData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save privilege context');
    } finally {
      setSaving(false);
    }
  };

  const addArrayItem = (field: 'capabilities' | 'restrictions' | 'examples') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field: 'capabilities' | 'restrictions' | 'examples', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (field: 'capabilities' | 'restrictions' | 'examples', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'create' ? 'Create Privilege Context' : 'Edit Privilege Context'}
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

          {/* Level and Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Level <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., V8 Heap Sandbox"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Escalation Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                min="1"
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color
            </label>
            <div className="flex gap-3">
              {COLOR_OPTIONS.map(({ value, label, class: colorClass }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: value }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    formData.color === value
                      ? 'border-white bg-gray-700'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  } transition-all`}
                >
                  <div className={`w-4 h-4 rounded ${colorClass}`}></div>
                  <span className="text-sm text-gray-300">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
              rows={2}
              placeholder="Optional description of this privilege context"
            />
          </div>

          {/* Capabilities */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Capabilities <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {formData.capabilities.map((capability, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={capability}
                    onChange={(e) => updateArrayItem('capabilities', index, e.target.value)}
                    className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                    placeholder="e.g., Execute JavaScript code"
                  />
                  {formData.capabilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('capabilities', index)}
                      className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('capabilities')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Add Capability
              </button>
            </div>
          </div>

          {/* Restrictions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Restrictions <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {formData.restrictions.map((restriction, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={restriction}
                    onChange={(e) => updateArrayItem('restrictions', index, e.target.value)}
                    className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                    placeholder="e.g., Limited to V8 heap memory"
                  />
                  {formData.restrictions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('restrictions', index)}
                      className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('restrictions')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Add Restriction
              </button>
            </div>
          </div>

          {/* Examples */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Example Commands
            </label>
            <div className="space-y-2">
              {formData.examples.map((example, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={example}
                    onChange={(e) => updateArrayItem('examples', index, e.target.value)}
                    className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm font-mono"
                    placeholder="e.g., typeof window === 'object'"
                  />
                  {formData.examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('examples', index)}
                      className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('examples')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Add Example
              </button>
            </div>
          </div>
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
