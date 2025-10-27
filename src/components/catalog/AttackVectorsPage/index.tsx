'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, BoltIcon, ShieldCheckIcon, ExclamationTriangleIcon, LinkIcon } from '@heroicons/react/24/outline';
import ExploitationTechniqueDialog, { ExploitationTechniqueFormData } from './ExploitationTechniqueDialog';
import { useToast } from '@/context/ToastContext';

interface ExploitationTechnique {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  mitigations: string[];
  references: string[];
  contextSpecificImpact: string[];
  cveCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AttackVectorsPage() {
  const { showToast } = useToast();
  const [techniques, setTechniques] = useState<ExploitationTechnique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTechnique, setSelectedTechnique] = useState<ExploitationTechnique | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingTechnique, setEditingTechnique] = useState<ExploitationTechnique | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTechniques();
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
        showToast('Attack vector created successfully', 'success', 2000);
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
        showToast('Attack vector updated successfully', 'success', 2000);
      }

      setDialogOpen(false);
      setEditingTechnique(null);
      fetchTechniques();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save technique', 'error');
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
      showToast('Attack vector deleted successfully', 'success', 2000);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete technique', 'error');
    } finally {
      setDeletingId(null);
    }
  };


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

        {/* Techniques list */}
        {techniques.length === 0 ? (
          <div className="text-center py-12">
            <BoltIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No attack vectors defined yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Create exploitation techniques that can be used in escalation paths
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {techniques.map((technique) => {
              const isSelected = selectedTechnique?.id === technique.id;

              return (
                <div
                  key={technique.id}
                  className={`bg-gray-700/30 rounded-lg p-6 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-purple-500/50' : ''
                  }`}
                >
                  <button
                    onClick={() => setSelectedTechnique(isSelected ? null : technique)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-1">{technique.name}</h4>
                        <p className="text-gray-300 text-sm">{technique.description}</p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(technique);
                          }}
                          className="p-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg transition-colors"
                          title="Edit technique"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(technique.id);
                          }}
                          className="p-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition-colors"
                          title="Delete technique"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Click hint */}
                    {!isSelected && !deleteConfirmId && (
                      <p className="text-xs text-purple-400 font-medium mt-2">
                        Click to view details
                      </p>
                    )}
                  </button>

                  {/* Info note - CVEs managed at escalation level */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">
                      CVEs are managed at the escalation level in Target Components
                    </p>
                  </div>

                  {/* Expanded details */}
                  {isSelected && (
                    <div className="mt-6 pt-6 border-t border-gray-600/50 space-y-6">
                      {/* Detailed Description */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <BoltIcon className="w-5 h-5 text-purple-400" />
                          <h4 className="text-sm font-semibold text-white">Detailed Description</h4>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{technique.detailedDescription}</p>
                      </div>

                      {/* Mitigations */}
                      {technique.mitigations.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                            <h4 className="text-sm font-semibold text-white">Mitigations</h4>
                          </div>
                          <ul className="space-y-2">
                            {technique.mitigations.map((mitigation, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-green-500/30 rounded-full flex-shrink-0"></span>
                                <span>{mitigation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Context-Specific Impact */}
                      {technique.contextSpecificImpact.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />
                            <h4 className="text-sm font-semibold text-white">Context-Specific Impact</h4>
                          </div>
                          <ul className="space-y-2">
                            {technique.contextSpecificImpact.map((impact, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-orange-500/30 rounded-full flex-shrink-0"></span>
                                <span>{impact}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* References */}
                      {technique.references.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <LinkIcon className="w-5 h-5 text-blue-400" />
                            <h4 className="text-sm font-semibold text-white">References</h4>
                          </div>
                          <ul className="space-y-2">
                            {technique.references.map((ref, idx) => (
                              <li key={idx}>
                                <a
                                  href={ref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline break-all"
                                >
                                  {ref}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delete confirmation */}
                  {deleteConfirmId === technique.id && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-300 text-sm mb-3">
                        Are you sure you want to delete <strong>{technique.name}</strong>?
                      </p>
                      <p className="text-yellow-300 text-xs mb-3">
                        ⚠️ This will also remove any escalation paths using this technique.
                      </p>
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
              );
            })}
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
        } : undefined}
        mode={dialogMode}
      />
    </div>
  );
}
