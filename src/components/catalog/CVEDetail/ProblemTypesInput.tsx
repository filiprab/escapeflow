'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

export interface ProblemType {
  description: string;
  cweId?: string;
  lang: string; // Always 'en' by default
}

interface ProblemTypesInputProps {
  value: ProblemType[];
  onChange: (problemTypes: ProblemType[]) => void;
  disabled?: boolean;
}

export default function ProblemTypesInput({ value, onChange, disabled = false }: ProblemTypesInputProps) {
  const handleAdd = () => {
    onChange([...value, { description: '', cweId: '', lang: 'en' }]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof ProblemType, fieldValue: string) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: fieldValue };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Problem Types</h3>
          <p className="text-sm text-gray-400 mt-1">
            Specify CWE IDs and descriptions for this vulnerability
          </p>
        </div>
      </div>

      {/* Problem Types List */}
      <div className="space-y-4">
        {value.length === 0 ? (
          <div className="bg-gray-700/20 border border-gray-600/30 rounded-lg p-6 text-center">
            <p className="text-gray-400 text-sm">
              No problem types defined. Click &ldquo;Add Problem Type&rdquo; to get started.
            </p>
          </div>
        ) : (
          value.map((problemType, index) => (
            <div
              key={index}
              className="bg-gray-700/30 backdrop-blur-sm p-5 rounded-xl border border-gray-600/50 space-y-4"
            >
              {/* Header with Remove Button */}
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-300">
                  Problem Type #{index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove problem type"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* CWE ID Input */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  CWE ID
                  <span className="ml-2 text-xs text-gray-400 font-normal">
                    (Example: CWE-79 or CWE-787)
                  </span>
                </label>
                <input
                  type="text"
                  value={problemType.cweId || ''}
                  onChange={(e) => handleUpdate(index, 'cweId', e.target.value)}
                  placeholder="CWE-XXX"
                  disabled={disabled}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Description
                </label>
                <textarea
                  value={problemType.description}
                  onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                  placeholder="Describe the problem type (e.g., Cross-Site Scripting, Buffer Overflow)"
                  disabled={disabled}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Button */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled}
        className="text-sm text-blue-400 hover:text-blue-300 px-4 py-2 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        + Add Problem Type
      </button>
    </div>
  );
}
