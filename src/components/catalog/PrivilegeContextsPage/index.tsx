'use client';

import { useState, useEffect } from 'react';
import { ShieldCheckIcon, LockClosedIcon, CommandLineIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import PrivilegeContextDialog, { PrivilegeContextFormData } from './PrivilegeContextDialog';
import { useToast } from '@/context/ToastContext';

interface PrivilegeContext {
  id: string;
  level: string;
  capabilities: string[];
  restrictions: string[];
  examples: string[];
  color: string;
  description?: string;
  order: number;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    hover: 'hover:border-blue-400/50',
  },
  green: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/30',
    hover: 'hover:border-green-400/50',
  },
  yellow: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    hover: 'hover:border-yellow-400/50',
  },
  orange: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    hover: 'hover:border-orange-400/50',
  },
  red: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
    hover: 'hover:border-red-400/50',
  },
  gray: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    border: 'border-gray-500/30',
    hover: 'hover:border-gray-400/50',
  },
};

export default function PrivilegeContextsPage() {
  const { showToast } = useToast();
  const [privileges, setPrivileges] = useState<PrivilegeContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrivilege, setSelectedPrivilege] = useState<PrivilegeContext | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingPrivilege, setEditingPrivilege] = useState<PrivilegeContext | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchPrivileges();
  }, []);

  const fetchPrivileges = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/privileges');

      if (!response.ok) {
        throw new Error('Failed to fetch privilege contexts');
      }

      const data = await response.json();
      setPrivileges(data.privileges);
    } catch (err) {
      console.error('Error fetching privileges:', err);
      setError(err instanceof Error ? err.message : 'Failed to load privilege contexts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setDialogMode('create');
    setEditingPrivilege(null);
    setDialogOpen(true);
  };

  const handleEdit = (privilege: PrivilegeContext) => {
    setDialogMode('edit');
    setEditingPrivilege(privilege);
    setDialogOpen(true);
  };

  const handleSave = async (data: PrivilegeContextFormData) => {
    const url = dialogMode === 'create'
      ? '/api/privileges'
      : `/api/privileges/${data.id}`;

    const method = dialogMode === 'create' ? 'POST' : 'PUT';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save privilege context');
    }

    await fetchPrivileges();
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/privileges/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete privilege context');
      }

      await fetchPrivileges();
      setDeleteConfirmId(null);
      showToast('Privilege context deleted successfully', 'success', 2000);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete privilege context', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading privilege contexts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
        <p className="text-red-300">{error}</p>
        <button
          onClick={fetchPrivileges}
          className="mt-4 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const getColorClasses = (color: keyof typeof colorClasses) => colorClasses[color] || colorClasses.gray;

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Privilege Contexts</h2>
            <p className="text-gray-300">
              Browser sandbox escape chain showing privilege escalation contexts and security boundaries.
              Each level represents a distinct security context with specific capabilities and restrictions.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            Create New
          </button>
        </div>

        <div className="grid gap-4 mb-6">
          {privileges.map((privilege) => {
            const colors = getColorClasses(privilege.color as keyof typeof colorClasses);
            const isSelected = selectedPrivilege?.level === privilege.level;

            return (
              <div
                key={privilege.level}
                className={`bg-gray-700/30 rounded-xl p-6 border ${colors.border} ${colors.hover} transition-all duration-300 ${
                  isSelected ? 'ring-2 ring-offset-2 ring-offset-gray-900 ' + colors.border : ''
                }`}
              >
                <button
                  onClick={() => setSelectedPrivilege(isSelected ? null : privilege)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${colors.text}`}>{privilege.level}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {privilege.description || 'Security boundary in browser sandbox escape chain'}
                      </p>
                    </div>
                    <div className="flex gap-3 ml-4">
                      <span className={`px-3 py-1 ${colors.bg} ${colors.text} text-xs font-medium rounded-full border ${colors.border}`}>
                        {privilege.capabilities.length} Capabilities
                      </span>
                      <span className={`px-3 py-1 ${colors.bg} ${colors.text} text-xs font-medium rounded-full border ${colors.border}`}>
                        {privilege.restrictions.length} Restrictions
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(privilege);
                        }}
                        className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                        title="Edit privilege context"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(privilege.id);
                        }}
                        className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                        title="Delete privilege context"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {!isSelected && !deleteConfirmId && (
                    <p className={`text-xs ${colors.text} font-medium mt-2`}>
                      Click to view details
                    </p>
                  )}
                </button>

                {isSelected && (
                  <div className="mt-6 pt-6 border-t border-gray-600/50 space-y-6">
                    {/* Capabilities */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheckIcon className={`w-5 h-5 ${colors.text}`} />
                        <h4 className="text-sm font-semibold text-white">Capabilities</h4>
                      </div>
                      <ul className="space-y-2">
                        {privilege.capabilities.map((capability, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className={`mt-1.5 w-1.5 h-1.5 ${colors.bg} rounded-full flex-shrink-0`}></span>
                            <span>{capability}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Restrictions */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <LockClosedIcon className="w-5 h-5 text-red-400" />
                        <h4 className="text-sm font-semibold text-white">Restrictions</h4>
                      </div>
                      <ul className="space-y-2">
                        {privilege.restrictions.map((restriction, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="mt-1.5 w-1.5 h-1.5 bg-red-500/30 rounded-full flex-shrink-0"></span>
                            <span>{restriction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Example Commands */}
                    {privilege.examples.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CommandLineIcon className="w-5 h-5 text-purple-400" />
                          <h4 className="text-sm font-semibold text-white">Example Commands</h4>
                        </div>
                        <div className="space-y-2">
                          {privilege.examples.map((example, idx) => (
                            <pre
                              key={idx}
                              className="bg-gray-900/50 border border-gray-600/30 rounded-lg p-3 overflow-x-auto text-xs font-mono text-gray-300"
                            >
                              {example}
                            </pre>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Delete confirmation overlay */}
                {deleteConfirmId === privilege.id && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm mb-3">
                      Are you sure you want to delete this privilege context? This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(privilege.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {privileges.length === 0 && (
          <div className="text-center py-12">
            <ShieldCheckIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No privilege contexts found in the database.</p>
            <p className="text-gray-500 text-sm mt-2">
              Privilege contexts are automatically extracted from target components.
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <PrivilegeContextDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initialData={editingPrivilege ? {
          id: editingPrivilege.id,
          level: editingPrivilege.level,
          capabilities: editingPrivilege.capabilities,
          restrictions: editingPrivilege.restrictions,
          examples: editingPrivilege.examples,
          color: editingPrivilege.color,
          order: editingPrivilege.order,
          description: editingPrivilege.description || '',
        } : undefined}
        mode={dialogMode}
      />
    </div>
  );
}
