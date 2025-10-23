'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

export interface ProofOfConcept {
  title: string;
  url?: string;
  description?: string;
  author?: string;
  code?: string;
  language?: string;
}

interface PoCInputProps {
  value: ProofOfConcept[];
  onChange: (pocs: ProofOfConcept[]) => void;
  disabled?: boolean;
}

const LANGUAGE_OPTIONS = [
  { value: '', label: 'Select language...' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'bash', label: 'Bash' },
  { value: 'shell', label: 'Shell' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'other', label: 'Other' },
];

export default function PoCInput({ value, onChange, disabled = false }: PoCInputProps) {
  const handleAdd = () => {
    onChange([
      ...value,
      {
        title: '',
        url: '',
        description: '',
        author: '',
        code: '',
        language: '',
      },
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof ProofOfConcept, fieldValue: string) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: fieldValue };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Proof of Concept</h3>
          <p className="text-sm text-gray-400 mt-1">
            Add exploit code, demonstration URLs, or PoC references
          </p>
        </div>
      </div>

      {/* PoC List */}
      <div className="space-y-5">
        {value.length === 0 ? (
          <div className="bg-gray-700/20 border border-gray-600/30 rounded-lg p-6 text-center">
            <p className="text-gray-400 text-sm">
              No proof of concept added. Click &ldquo;Add PoC&rdquo; to get started.
            </p>
          </div>
        ) : (
          value.map((poc, index) => (
            <div
              key={index}
              className="bg-gray-700/30 backdrop-blur-sm p-5 rounded-xl border border-gray-600/50 space-y-4"
            >
              {/* Header with Remove Button */}
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-300">
                  PoC #{index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove PoC"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={poc.title}
                  onChange={(e) => handleUpdate(index, 'title', e.target.value)}
                  placeholder="e.g., Remote Code Execution via Buffer Overflow"
                  disabled={disabled}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  URL
                  <span className="ml-2 text-xs text-gray-400 font-normal">
                    (Optional link to GitHub, exploit-db, etc.)
                  </span>
                </label>
                <input
                  type="url"
                  value={poc.url || ''}
                  onChange={(e) => handleUpdate(index, 'url', e.target.value)}
                  placeholder="https://github.com/..."
                  disabled={disabled}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Author Input */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={poc.author || ''}
                  onChange={(e) => handleUpdate(index, 'author', e.target.value)}
                  placeholder="Author name or handle"
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
                  value={poc.description || ''}
                  onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                  placeholder="Brief description of the exploit technique..."
                  disabled={disabled}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Code Language Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Code Language
                </label>
                <select
                  value={poc.language || ''}
                  onChange={(e) => handleUpdate(index, 'language', e.target.value)}
                  disabled={disabled}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {LANGUAGE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Exploit Code
                </label>
                <textarea
                  value={poc.code || ''}
                  onChange={(e) => handleUpdate(index, 'code', e.target.value)}
                  placeholder="Paste exploit code here..."
                  disabled={disabled}
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200 resize-none font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
        + Add PoC
      </button>
    </div>
  );
}
