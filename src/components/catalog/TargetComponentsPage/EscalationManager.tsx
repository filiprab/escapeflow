import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, BoltIcon, EyeIcon, EyeSlashIcon, BugAntIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/context/ToastContext';

interface PrivilegeContext {
  id: string;
  level: string;
  color: string;
  order: number;
}

interface ExploitationTechnique {
  id: string;
  name: string;
  description: string;
}

interface Escalation {
  id: string;
  sourcePrivilege: PrivilegeContext;
  targetPrivilege: PrivilegeContext;
  technique: ExploitationTechnique;
  visibleInVisualization: boolean;
}

interface CVE {
  cveId: string;
  datePublished: string;
  dateLastModified: string;
  descriptions: Array<{
    lang: string;
    description: string;
  }>;
  metrics: Array<{
    cvssV3?: {
      baseScore: number;
      baseSeverity: string;
    };
  }>;
}

interface EscalationManagerProps {
  componentId: string;
  componentName: string;
  privileges: PrivilegeContext[];
  onUpdate: () => void;
}

export default function EscalationManager({
  componentId,
  componentName,
  privileges,
  onUpdate,
}: EscalationManagerProps) {
  const { showToast } = useToast();
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [techniques, setTechniques] = useState<ExploitationTechnique[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [sourcePrivilegeId, setSourcePrivilegeId] = useState('');
  const [targetPrivilegeId, setTargetPrivilegeId] = useState('');
  const [techniqueId, setTechniqueId] = useState('');
  const [createFormCveIds, setCreateFormCveIds] = useState<string[]>([]);
  const [createFormCveInput, setCreateFormCveInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedEscalations, setExpandedEscalations] = useState<Record<string, boolean>>({});
  const [editingEscalation, setEditingEscalation] = useState<string | null>(null);
  const [escalationCves, setEscalationCves] = useState<Record<string, CVE[]>>({});
  const [loadingCves, setLoadingCves] = useState<Record<string, boolean>>({});
  const [cveInput, setCveInput] = useState<Record<string, string>>({});
  const [linkingCve, setLinkingCve] = useState<string | null>(null);
  const [unlinkingCve, setUnlinkingCve] = useState<string | null>(null);

  // Edit form state
  const [editSourcePrivilegeId, setEditSourcePrivilegeId] = useState('');
  const [editTargetPrivilegeId, setEditTargetPrivilegeId] = useState('');
  const [editTechniqueId, setEditTechniqueId] = useState('');

  useEffect(() => {
    fetchEscalations();
    fetchTechniques();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentId]);

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/escalations?componentId=${componentId}`);
      if (!response.ok) throw new Error('Failed to fetch escalations');
      const data = await response.json();
      setEscalations(data.escalations);
    } catch (err) {
      console.error('Error fetching escalations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechniques = async () => {
    try {
      const response = await fetch('/api/techniques');
      if (!response.ok) throw new Error('Failed to fetch techniques');
      const data = await response.json();
      // Techniques are now generic and reusable across all components
      setTechniques(data);
    } catch (err) {
      console.error('Error fetching techniques:', err);
      setTechniques([]);
    }
  };

  const handleAddCveToCreateForm = () => {
    const cveId = createFormCveInput.trim().toUpperCase();

    if (!cveId) {
      showToast('Please enter a CVE ID', 'warning');
      return;
    }

    if (!/^CVE-\d{4}-\d{4,}$/i.test(cveId)) {
      showToast('Invalid CVE ID format. Expected format: CVE-YYYY-NNNN (e.g., CVE-2024-1234)', 'warning');
      return;
    }

    if (createFormCveIds.includes(cveId)) {
      showToast('This CVE is already in the list', 'warning');
      return;
    }

    setCreateFormCveIds(prev => [...prev, cveId]);
    setCreateFormCveInput('');
    showToast(`Added ${cveId} to escalation`, 'success', 2000);
  };

  const handleRemoveCveFromCreateForm = (cveId: string) => {
    setCreateFormCveIds(prev => prev.filter(id => id !== cveId));
  };

  const handleAddEscalation = async () => {
    if (!sourcePrivilegeId || !targetPrivilegeId || !techniqueId) {
      setError('All fields are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePrivilegeId,
          targetPrivilegeId,
          techniqueId,
          targetComponentId: componentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create escalation');
      }

      const newEscalation = await response.json();

      // Link CVEs if any were added
      if (createFormCveIds.length > 0) {
        await Promise.all(
          createFormCveIds.map(cveId =>
            fetch(`/api/escalations/${newEscalation.id}/cves`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cveId }),
            })
          )
        );
      }

      // Reset form
      setSourcePrivilegeId('');
      setTargetPrivilegeId('');
      setTechniqueId('');
      setCreateFormCveIds([]);
      setCreateFormCveInput('');
      setShowAddForm(false);

      // Refresh escalations
      await fetchEscalations();
      onUpdate();

      // Auto-expand and enter edit mode for the newly created escalation
      setExpandedEscalations(prev => ({ ...prev, [newEscalation.id]: true }));
      setEditingEscalation(newEscalation.id);
      setEditSourcePrivilegeId(newEscalation.sourcePrivilegeId);
      setEditTargetPrivilegeId(newEscalation.targetPrivilegeId);
      setEditTechniqueId(newEscalation.techniqueId);
      fetchCvesForEscalation(newEscalation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create escalation');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEscalation = async (escalationId: string) => {
    try {
      setDeleting(escalationId);
      const response = await fetch(`/api/escalations/${escalationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete escalation');
      }

      await fetchEscalations();
      onUpdate();
      showToast('Escalation deleted successfully', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete escalation', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleVisibility = async (escalationId: string, currentVisibility: boolean) => {
    try {
      setToggling(escalationId);
      const response = await fetch(`/api/escalations/${escalationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibleInVisualization: !currentVisibility }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle visibility');
      }

      await fetchEscalations();
      onUpdate();
      showToast(`Escalation ${!currentVisibility ? 'shown' : 'hidden'} in visualization`, 'success', 2000);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to toggle visibility', 'error');
    } finally {
      setToggling(null);
    }
  };

  const getPrivilegeColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      gray: 'bg-gray-500',
    };
    return colorMap[color] || 'bg-gray-500';
  };

  const getCvssColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'LOW': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const fetchCvesForEscalation = async (escalationId: string) => {
    if (escalationCves[escalationId]) {
      return; // Already fetched
    }

    try {
      setLoadingCves(prev => ({ ...prev, [escalationId]: true }));
      const response = await fetch(`/api/escalations/${escalationId}/cves`);
      if (!response.ok) throw new Error('Failed to fetch CVEs');
      const data = await response.json();
      setEscalationCves(prev => ({ ...prev, [escalationId]: data.cves || [] }));
    } catch (err) {
      console.error('Error fetching CVEs:', err);
      setEscalationCves(prev => ({ ...prev, [escalationId]: [] }));
    } finally {
      setLoadingCves(prev => ({ ...prev, [escalationId]: false }));
    }
  };

  const handleLinkCve = async (escalationId: string) => {
    const cveId = cveInput[escalationId]?.trim().toUpperCase();

    if (!cveId) {
      showToast('Please enter a CVE ID', 'warning');
      return;
    }

    if (!/^CVE-\d{4}-\d{4,}$/i.test(cveId)) {
      showToast('Invalid CVE ID format. Expected format: CVE-YYYY-NNNN (e.g., CVE-2024-1234)', 'warning');
      return;
    }

    if (escalationCves[escalationId]?.some(cve => cve.cveId === cveId)) {
      showToast('This CVE is already linked to this escalation', 'warning');
      return;
    }

    try {
      setLinkingCve(escalationId);

      const response = await fetch(`/api/escalations/${escalationId}/cves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cveId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to link CVE');
      }

      setCveInput(prev => ({ ...prev, [escalationId]: '' }));
      // Refresh CVEs by removing from cache
      setEscalationCves(prev => {
        const newState = { ...prev };
        delete newState[escalationId];
        return newState;
      });
      await fetchCvesForEscalation(escalationId);
      await fetchEscalations(); // Refresh counts
      onUpdate();
      showToast(`Successfully linked ${cveId}`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to link CVE', 'error');
    } finally {
      setLinkingCve(null);
    }
  };

  const handleUnlinkCve = async (escalationId: string, cveId: string) => {
    try {
      setUnlinkingCve(cveId);
      const response = await fetch(
        `/api/escalations/${escalationId}/cves?cveId=${encodeURIComponent(cveId)}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unlink CVE');
      }

      // Refresh CVEs by removing from cache
      setEscalationCves(prev => {
        const newState = { ...prev };
        delete newState[escalationId];
        return newState;
      });
      await fetchCvesForEscalation(escalationId);
      await fetchEscalations(); // Refresh counts
      onUpdate();
      showToast(`Successfully unlinked ${cveId}`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to unlink CVE', 'error');
    } finally {
      setUnlinkingCve(null);
    }
  };

  const toggleExpanded = (escalation: Escalation) => {
    const isCurrentlyExpanded = expandedEscalations[escalation.id];
    const newExpanded = !isCurrentlyExpanded;

    setExpandedEscalations(prev => ({ ...prev, [escalation.id]: newExpanded }));

    if (newExpanded) {
      // Auto-enter edit mode when expanding
      setEditingEscalation(escalation.id);
      setEditSourcePrivilegeId(escalation.sourcePrivilege.id);
      setEditTargetPrivilegeId(escalation.targetPrivilege.id);
      setEditTechniqueId(escalation.technique.id);
      fetchCvesForEscalation(escalation.id);
    } else {
      // Exit edit mode when collapsing
      setEditingEscalation(null);
      setEditSourcePrivilegeId('');
      setEditTargetPrivilegeId('');
      setEditTechniqueId('');
    }
  };

  const handleSaveEdit = async (escalationId: string) => {
    if (!editSourcePrivilegeId || !editTargetPrivilegeId || !editTechniqueId) {
      showToast('All fields are required', 'warning');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/escalations/${escalationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePrivilegeId: editSourcePrivilegeId,
          targetPrivilegeId: editTargetPrivilegeId,
          techniqueId: editTechniqueId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update escalation');
      }

      setEditingEscalation(null);
      await fetchEscalations();
      onUpdate();
      showToast('Escalation updated successfully', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update escalation', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingEscalation(null);
    setEditSourcePrivilegeId('');
    setEditTargetPrivilegeId('');
    setEditTechniqueId('');
  };

  const sortedPrivileges = [...privileges].sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="text-gray-400 text-sm">Loading escalations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Privilege Escalations</h3>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Escalation
        </button>
      </div>

      <p className="text-sm text-gray-400">
        Define specific privilege escalation paths using exploitation techniques for {componentName}.
      </p>

      {/* Add Escalation Form */}
      {showAddForm && (
        <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 space-y-3">
          <h4 className="text-sm font-medium text-white">New Escalation Path</h4>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Source Privilege (FROM)
            </label>
            <select
              value={sourcePrivilegeId}
              onChange={(e) => setSourcePrivilegeId(e.target.value)}
              className="w-full select-input"
            >
              <option value="">Select source...</option>
              {sortedPrivileges.map((priv) => (
                <option key={priv.id} value={priv.id}>
                  {priv.level} (Order: {priv.order})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Target Privilege (TO)
            </label>
            <select
              value={targetPrivilegeId}
              onChange={(e) => setTargetPrivilegeId(e.target.value)}
              className="w-full select-input"
            >
              <option value="">Select target...</option>
              {sortedPrivileges.map((priv) => (
                <option key={priv.id} value={priv.id}>
                  {priv.level} (Order: {priv.order})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Exploitation Technique
            </label>
            <select
              value={techniqueId}
              onChange={(e) => setTechniqueId(e.target.value)}
              className="w-full select-input"
            >
              <option value="">Select technique...</option>
              {techniques.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
            {techniques.length === 0 && (
              <p className="text-xs text-yellow-400 mt-1">
                ⚠️ No exploitation techniques available. Create techniques in the Attack Vectors catalog first.
              </p>
            )}
          </div>

          {/* CVE Management Section */}
          <div className="pt-3 border-t border-gray-600">
            <div className="flex items-center gap-2 mb-3">
              <BugAntIcon className="w-4 h-4 text-blue-400" />
              <h5 className="text-sm font-semibold text-white">
                CVEs ({createFormCveIds.length})
              </h5>
            </div>

            {/* CVE List */}
            {createFormCveIds.length > 0 && (
              <div className="space-y-2 mb-3">
                {createFormCveIds.map((cveId) => (
                  <div
                    key={cveId}
                    className="flex items-center justify-between p-2 bg-gray-700/50 rounded border border-gray-600/30"
                  >
                    <span className="text-xs font-semibold text-white">{cveId}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCveFromCreateForm(cveId)}
                      className="p-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors"
                      title="Remove CVE"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add CVE Form */}
            <div className="flex gap-2">
              <input
                type="text"
                value={createFormCveInput}
                onChange={(e) => setCreateFormCveInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCveToCreateForm()}
                placeholder="Enter CVE ID (e.g., CVE-2024-1234)"
                className="flex-1 bg-gray-700/50 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none text-xs"
              />
              <button
                type="button"
                onClick={handleAddCveToCreateForm}
                disabled={!createFormCveInput.trim()}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                <PlusIcon className="w-4 h-4" />
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Add CVE IDs to link with this escalation. CVEs must exist in your database first.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddEscalation}
              disabled={saving || !sourcePrivilegeId || !targetPrivilegeId || !techniqueId}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create Escalation'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setError(null);
                setSourcePrivilegeId('');
                setTargetPrivilegeId('');
                setTechniqueId('');
                setCreateFormCveIds([]);
                setCreateFormCveInput('');
              }}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Escalations List */}
      <div className="space-y-2">
        {escalations.length === 0 ? (
          <div className="text-center py-6 bg-gray-700/30 rounded-lg border border-gray-600">
            <BoltIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No escalation paths defined yet</p>
            <p className="text-gray-500 text-xs mt-1">
              Click &ldquo;Add Escalation&rdquo; to create a privilege escalation path
            </p>
          </div>
        ) : (
          escalations.map((escalation) => {
            const isExpanded = expandedEscalations[escalation.id];
            const isEditing = editingEscalation === escalation.id;
            const cves = escalationCves[escalation.id] || [];
            const cveCount = cves.length;

            return (
              <div
                key={escalation.id}
                className="bg-gray-700/30 rounded-lg border border-gray-600 overflow-hidden"
              >
                {/* Escalation Header */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-700/50 transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(escalation)}
                    className="flex-1 flex items-center gap-2 text-left"
                  >
                    {isExpanded ? (
                      <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded ${getPrivilegeColor(escalation.sourcePrivilege.color)}`}></div>
                          <span className="text-sm text-white">{escalation.sourcePrivilege.level}</span>
                        </div>
                        <span className="text-gray-500">→</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded ${getPrivilegeColor(escalation.targetPrivilege.color)}`}></div>
                          <span className="text-sm text-white">{escalation.targetPrivilege.level}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">
                        via <span className="text-blue-400">{escalation.technique.name}</span>
                        {cveCount > 0 && <span className="ml-2 text-blue-400">• {cveCount} CVE{cveCount !== 1 ? 's' : ''}</span>}
                        {!isExpanded && <span className="ml-2 text-gray-500">• Click to edit</span>}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(escalation.id, escalation.visibleInVisualization)}
                      disabled={toggling === escalation.id}
                      className={`p-2 rounded transition-colors disabled:opacity-50 ${
                        escalation.visibleInVisualization
                          ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                      }`}
                      title={escalation.visibleInVisualization ? 'Visible in visualization (click to hide)' : 'Hidden from visualization (click to show)'}
                    >
                      {escalation.visibleInVisualization ? (
                        <EyeIcon className="w-4 h-4" />
                      ) : (
                        <EyeSlashIcon className="w-4 h-4" />
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteEscalation(escalation.id)}
                      disabled={deleting === escalation.id}
                      className="p-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      title="Delete escalation"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-600 p-4 space-y-4 bg-gray-800/30">
                    {/* Edit Form */}
                    {isEditing && (
                      <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 space-y-3">
                        <h5 className="text-sm font-medium text-white">Edit Escalation Path</h5>

                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Source Privilege
                          </label>
                          <select
                            value={editSourcePrivilegeId}
                            onChange={(e) => setEditSourcePrivilegeId(e.target.value)}
                            className="w-full select-input"
                          >
                            {sortedPrivileges.map((priv) => (
                              <option key={priv.id} value={priv.id}>
                                {priv.level}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Target Privilege
                          </label>
                          <select
                            value={editTargetPrivilegeId}
                            onChange={(e) => setEditTargetPrivilegeId(e.target.value)}
                            className="w-full select-input"
                          >
                            {sortedPrivileges.map((priv) => (
                              <option key={priv.id} value={priv.id}>
                                {priv.level}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Exploitation Technique
                          </label>
                          <select
                            value={editTechniqueId}
                            onChange={(e) => setEditTechniqueId(e.target.value)}
                            className="w-full select-input"
                          >
                            {techniques.map((tech) => (
                              <option key={tech.id} value={tech.id}>
                                {tech.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(escalation.id)}
                            disabled={saving}
                            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CVE Management Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <BugAntIcon className="w-4 h-4 text-blue-400" />
                        <h5 className="text-sm font-semibold text-white">
                          CVEs ({cveCount})
                        </h5>
                      </div>

                      {/* CVE List */}
                      {loadingCves[escalation.id] ? (
                        <div className="text-center py-3">
                          <span className="text-xs text-gray-500">Loading CVEs...</span>
                        </div>
                      ) : cves.length > 0 ? (
                        <div className="space-y-2 mb-3">
                          {cves.map((cve) => {
                            const description = cve.descriptions.find(d => d.lang === 'en')?.description || 'No description';
                            const metric = cve.metrics[0];
                            const cvssScore = metric?.cvssV3?.baseScore;
                            const severity = metric?.cvssV3?.baseSeverity;

                            return (
                              <div
                                key={cve.cveId}
                                className="flex items-start justify-between p-3 bg-gray-700/50 rounded border border-gray-600/30"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-white">{cve.cveId}</span>
                                    {cvssScore && severity && (
                                      <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getCvssColor(severity)}`}>
                                        {severity} {cvssScore}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 line-clamp-2">{description}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Published: {new Date(cve.datePublished).toLocaleDateString()}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleUnlinkCve(escalation.id, cve.cveId)}
                                  disabled={unlinkingCve === cve.cveId}
                                  className="ml-3 p-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                  title="Unlink CVE"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-3 bg-gray-700/30 rounded border border-gray-600/30 mb-3">
                          <p className="text-xs text-gray-500">No CVEs linked yet</p>
                        </div>
                      )}

                      {/* Add CVE Form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cveInput[escalation.id] || ''}
                          onChange={(e) => setCveInput(prev => ({ ...prev, [escalation.id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && handleLinkCve(escalation.id)}
                          placeholder="Enter CVE ID (e.g., CVE-2024-1234)"
                          className="flex-1 bg-gray-700/50 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleLinkCve(escalation.id)}
                          disabled={linkingCve === escalation.id || !cveInput[escalation.id]?.trim()}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        >
                          <PlusIcon className="w-4 h-4" />
                          {linkingCve === escalation.id ? 'Linking...' : 'Link'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Enter CVE ID from your database. CVEs must be added via the CVE Database page first.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
