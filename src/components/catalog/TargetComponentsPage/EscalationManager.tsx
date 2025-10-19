import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, BoltIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [techniques, setTechniques] = useState<ExploitationTechnique[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [sourcePrivilegeId, setSourcePrivilegeId] = useState('');
  const [targetPrivilegeId, setTargetPrivilegeId] = useState('');
  const [techniqueId, setTechniqueId] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      // Reset form
      setSourcePrivilegeId('');
      setTargetPrivilegeId('');
      setTechniqueId('');
      setShowAddForm(false);

      // Refresh escalations
      await fetchEscalations();
      onUpdate();
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
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete escalation');
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
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle visibility');
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
              className="w-full bg-gray-600 text-white text-sm rounded px-3 py-2 border border-gray-500 focus:border-blue-500 focus:outline-none"
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
              className="w-full bg-gray-600 text-white text-sm rounded px-3 py-2 border border-gray-500 focus:border-blue-500 focus:outline-none"
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
              className="w-full bg-gray-600 text-white text-sm rounded px-3 py-2 border border-gray-500 focus:border-blue-500 focus:outline-none"
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
          escalations.map((escalation) => (
            <div
              key={escalation.id}
              className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
            >
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
                </p>
              </div>
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
          ))
        )}
      </div>
    </div>
  );
}
