'use client';

import { useState, useEffect } from 'react';
import { CubeIcon, ArrowRightIcon, BugAntIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import TargetComponentDialog, { TargetComponentFormData } from './TargetComponentDialog';

interface TargetComponent {
  id: string;
  name: string;
  description: string;
  sourcePrivilege: {
    level: string;
    color: string;
  };
  targetPrivilege: {
    level: string;
    color: string;
  };
  cveCount: number;
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

interface PrivilegeContext {
  id: string;
  level: string;
  color: string;
  order: number;
}

export default function TargetComponentsPage() {
  const [components, setComponents] = useState<TargetComponent[]>([]);
  const [privileges, setPrivileges] = useState<PrivilegeContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingComponent, setEditingComponent] = useState<TargetComponent | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchComponents();
    fetchPrivileges();
  }, []);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/components');

      if (!response.ok) {
        throw new Error('Failed to fetch target components');
      }

      const data = await response.json();
      setComponents(data.components);
    } catch (err) {
      console.error('Error fetching components:', err);
      setError(err instanceof Error ? err.message : 'Failed to load target components');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivileges = async () => {
    try {
      const response = await fetch('/api/privileges');
      if (!response.ok) {
        throw new Error('Failed to fetch privileges');
      }
      const data = await response.json();
      setPrivileges(data.privileges);
    } catch (err) {
      console.error('Error fetching privileges:', err);
    }
  };

  const handleCreate = () => {
    setDialogMode('create');
    setEditingComponent(null);
    setDialogOpen(true);
  };

  const handleEdit = (component: TargetComponent) => {
    setDialogMode('edit');
    setEditingComponent(component);
    setDialogOpen(true);
  };

  const handleSave = async (data: TargetComponentFormData) => {
    const url = dialogMode === 'create'
      ? '/api/components'
      : `/api/components/${data.id}`;

    const method = dialogMode === 'create' ? 'POST' : 'PUT';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save target component');
    }

    await fetchComponents();
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const response = await fetch(`/api/components/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete target component');
      }

      await fetchComponents();
      setDeleteConfirmId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete target component');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading target components...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
        <p className="text-red-300">{error}</p>
        <button
          onClick={fetchComponents}
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
            <h2 className="text-2xl font-bold text-white mb-2">Target Components</h2>
            <p className="text-gray-300">
              Browser attack surfaces mapped to CVE labels. Each component represents a specific code module that can be targeted for exploitation.
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

        <div className="grid gap-4">
          {components.map((component) => {
            const sourceColors = getColorClasses(component.sourcePrivilege.color as keyof typeof colorClasses);
            const targetColors = getColorClasses(component.targetPrivilege.color as keyof typeof colorClasses);

            return (
              <div
                key={component.id}
                className={`bg-gray-700/30 rounded-xl p-6 border ${sourceColors.border} ${sourceColors.hover} transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CubeIcon className={`w-6 h-6 ${sourceColors.text}`} />
                      <h3 className="text-xl font-bold text-white">{component.name}</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{component.description}</p>

                    {/* Privilege Escalation Badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 ${sourceColors.bg} ${sourceColors.text} rounded-md border ${sourceColors.border}`}>
                        {component.sourcePrivilege.level}
                      </span>
                      <ArrowRightIcon className="w-4 h-4 text-gray-500" />
                      <span className={`text-xs px-2 py-1 ${targetColors.bg} ${targetColors.text} rounded-md border ${targetColors.border}`}>
                        {component.targetPrivilege.level}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-2">
                    {/* CVE Count Badge */}
                    {component.cveCount > 0 ? (
                      <Link
                        href={`/catalog?component=${encodeURIComponent(component.name)}`}
                        className={`px-4 py-2 ${sourceColors.bg} ${sourceColors.text} text-sm font-medium rounded-lg border ${sourceColors.border} hover:bg-opacity-80 transition-all flex items-center gap-2`}
                      >
                        <BugAntIcon className="w-5 h-5" />
                        <span>{component.cveCount} CVEs</span>
                      </Link>
                    ) : (
                      <span className="px-4 py-2 bg-gray-600/20 text-gray-500 text-sm rounded-lg border border-gray-600/30">
                        No CVEs
                      </span>
                    )}

                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(component)}
                      className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                      title="Edit component"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeleteConfirmId(component.id)}
                      className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                      title="Delete component"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirmId === component.id && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm mb-2">
                      Are you sure you want to delete <strong>{component.name}</strong>?
                    </p>
                    {component.cveCount > 0 && (
                      <p className="text-yellow-300 text-xs mb-3">
                        ⚠️ This component is referenced by {component.cveCount} CVE(s). They will show no component after deletion.
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(component.id)}
                        disabled={deletingId === component.id}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm disabled:opacity-50"
                      >
                        {deletingId === component.id ? 'Deleting...' : 'Delete'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        disabled={deletingId === component.id}
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

        {components.length === 0 && (
          <div className="text-center py-12">
            <CubeIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No target components found in the database.</p>
            <p className="text-gray-500 text-sm mt-2">
              Target components need to be seeded.
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <TargetComponentDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initialData={editingComponent ? {
          id: editingComponent.id,
          name: editingComponent.name,
          description: editingComponent.description,
          sourcePrivilegeId: privileges.find(p => p.level === editingComponent.sourcePrivilege.level)?.id || '',
          targetPrivilegeId: privileges.find(p => p.level === editingComponent.targetPrivilege.level)?.id || '',
        } : undefined}
        mode={dialogMode}
        privileges={privileges}
      />
    </div>
  );
}
