'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, BoltIcon } from '@heroicons/react/24/outline';
import ExploitationTechniqueDialog, { ExploitationTechniqueFormData } from './ExploitationTechniqueDialog';

interface PrivilegeContext {
  id: string;
  level: string;
  color: string;
  order: number;
}

interface TargetComponent {
  id: string;
  name: string;
  description: string;
  sourcePrivilege: PrivilegeContext;
  targetPrivilege: PrivilegeContext;
}

interface ExploitationTechnique {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  mitigations: string[];
  references: string[];
  contextSpecificImpact: string[];
  targetComponentId: string;
  targetComponent: TargetComponent;
  cveCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AttackVectorsPage() {
  const [techniques, setTechniques] = useState<ExploitationTechnique[]>([]);
  const [components, setComponents] = useState<TargetComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingTechnique, setEditingTechnique] = useState<ExploitationTechnique | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTechniques();
    fetchComponents();
  }, []);

  const fetchTechniques = async () => {
    try {
      const response = await fetch('/api/techniques');
      if (!response.ok) throw new Error('Failed to fetch techniques');
      const data = await response.json();
      setTechniques(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchComponents = async () => {
    try {
      const response = await fetch('/api/components');
      if (!response.ok) throw new Error('Failed to fetch components');
      const data = await response.json();
      // API returns {components: [...], total: number}
      setComponents(data.components || []);
    } catch (err) {
      console.error('Error fetching components:', err);
    }
  };

  const handleCreate = () => {
    setDialogMode('create');
    setEditingTechnique(null);
    setDialogOpen(true);
  };

  const handleEdit = (technique: ExploitationTechnique) => {
    setDialogMode('edit');
    setEditingTechnique(technique);
    setDialogOpen(true);
  };

  const handleSave = async (data: ExploitationTechniqueFormData) => {
    try {
      if (dialogMode === 'create') {
        const response = await fetch('/api/techniques', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create technique');
        }

        // Link CVEs if any were added during creation
        if (data.cveIdsToLink && data.cveIdsToLink.length > 0) {
          const createdTechnique = await response.json();

          // Link each CVE to the newly created technique
          for (const cveId of data.cveIdsToLink) {
            try {
              await fetch(`/api/techniques/${createdTechnique.id}/cves`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cveId }),
              });
            } catch (linkError) {
              console.error(`Failed to link CVE ${cveId}:`, linkError);
              // Continue linking other CVEs even if one fails
            }
          }
        }
      } else if (data.id) {
        const response = await fetch(`/api/techniques/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update technique');
        }
      }

      setDialogOpen(false);
      setEditingTechnique(null);
      fetchTechniques();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save technique');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/techniques/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete technique');
      }

      setDeleteConfirmId(null);
      fetchTechniques();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete technique');
    } finally {
      setDeletingId(null);
    }
  };

  // Group techniques by target component
  const techniquesByComponent = techniques.reduce((acc, technique) => {
    const key = technique.targetComponent.id;
    if (!acc[key]) {
      acc[key] = {
        component: technique.targetComponent,
        techniques: [],
      };
    }
    acc[key].techniques.push(technique);
    return acc;
  }, {} as Record<string, { component: TargetComponent; techniques: ExploitationTechnique[] }>);

  // Sort by escalation order
  const sortedGroups = Object.values(techniquesByComponent).sort(
    (a, b) => a.component.sourcePrivilege.order - b.component.sourcePrivilege.order
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading attack vectors...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
          <div className="flex items-center justify-center py-12">
            <div className="text-red-400">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Attack Vectors</h2>
            <p className="text-gray-300">
              Exploitation techniques used to escalate privileges across browser security boundaries.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Create New
          </button>
        </div>

        {/* Techniques grouped by component */}
        {techniques.length === 0 ? (
          <div className="text-center py-12">
            <BoltIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No attack vectors defined yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedGroups.map(({ component, techniques: groupTechniques }) => (
              <div key={component.id} className="space-y-3">
                {/* Component header */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{component.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: `${component.sourcePrivilege.color}20`, color: component.sourcePrivilege.color }}
                      >
                        {component.sourcePrivilege.level}
                      </span>
                      <span>→</span>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: `${component.targetPrivilege.color}20`, color: component.targetPrivilege.color }}
                      >
                        {component.targetPrivilege.level}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Techniques for this component */}
                {groupTechniques.map((technique) => (
                  <div
                    key={technique.id}
                    className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50 hover:border-gray-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-1">{technique.name}</h4>
                        <p className="text-gray-300 text-sm">{technique.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(technique)}
                          className="p-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg transition-colors"
                          title="Edit technique & link CVEs"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(technique.id)}
                          className="p-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition-colors"
                          title="Delete technique"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* CVE count */}
                    {technique.cveCount > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded">
                          {technique.cveCount} linked CVE{technique.cveCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Delete confirmation */}
                    {deleteConfirmId === technique.id && (
                      <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-300 text-sm mb-3">
                          Are you sure you want to delete <strong>{technique.name}</strong>?
                        </p>
                        {technique.cveCount > 0 && (
                          <p className="text-yellow-300 text-xs mb-3">
                            ⚠️ This technique is linked to {technique.cveCount} CVE(s). The links will be removed.
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(technique.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
                            disabled={deletingId === technique.id}
                          >
                            {deletingId === technique.id ? 'Deleting...' : 'Delete'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                            disabled={deletingId === technique.id}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <ExploitationTechniqueDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initialData={editingTechnique ? {
          id: editingTechnique.id,
          name: editingTechnique.name,
          description: editingTechnique.description,
          detailedDescription: editingTechnique.detailedDescription,
          mitigations: editingTechnique.mitigations,
          references: editingTechnique.references,
          contextSpecificImpact: editingTechnique.contextSpecificImpact,
          targetComponentId: editingTechnique.targetComponentId,
        } : undefined}
        mode={dialogMode}
        components={components}
      />
    </div>
  );
}
