import { useState, useEffect } from 'react';
import type { TargetComponent, PrivilegeInfo } from '@/types/attack';

interface PrivilegeContext {
  id: string;
  level: string;
  color: string;
  order: number;
  capabilities: string[];
  restrictions: string[];
  examples: string[];
}

interface EscalationTechnique {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  mitigations: string[];
  references: string[];
  contextSpecificImpact: string[];
}

interface PrivilegeEscalation {
  id: string;
  sourcePrivilege: PrivilegeContext;
  targetPrivilege: PrivilegeContext;
  technique: EscalationTechnique;
  targetComponent: {
    id: string;
    name: string;
    description: string;
  };
  visibleInVisualization: boolean;
}

interface VisualizationData {
  components: TargetComponent[];
  privileges: PrivilegeContext[];
  escalations: PrivilegeEscalation[];
}

interface UseVisualizationDataResult {
  components: TargetComponent[];
  privileges: PrivilegeContext[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch visualization data from the database
 * Filters escalations by current privilege level and visibility (optional)
 */
export function useVisualizationData(
  currentPrivilege?: string,
  fetchAll: boolean = false
): UseVisualizationDataResult {
  const [data, setData] = useState<VisualizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch privileges and escalations in parallel
      const [privilegesRes, escalationsRes] = await Promise.all([
        fetch('/api/privileges'),
        fetch(`/api/escalations?visibleOnly=true`)
      ]);

      if (!privilegesRes.ok || !escalationsRes.ok) {
        throw new Error('Failed to fetch visualization data');
      }

      const { privileges } = await privilegesRes.json();
      const { escalations } = await escalationsRes.json();

      // Filter escalations by current privilege level (unless fetchAll is true)
      const filteredEscalations = fetchAll || !currentPrivilege
        ? escalations
        : escalations.filter(
            (esc: PrivilegeEscalation) => esc.sourcePrivilege.level === currentPrivilege
          );

      // Transform escalations into TargetComponent structure
      const components = transformEscalationsToComponents(filteredEscalations);

      setData({
        components,
        privileges,
        escalations: filteredEscalations,
      });
    } catch (err) {
      console.error('Error fetching visualization data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData({ components: [], privileges: [], escalations: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrivilege, fetchAll]);

  return {
    components: data?.components || [],
    privileges: data?.privileges || [],
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Transform database escalations into TargetComponent structure
 * Groups escalations by component and nests techniques
 */
function transformEscalationsToComponents(
  escalations: PrivilegeEscalation[]
): TargetComponent[] {
  // Group escalations by target component
  const componentMap = new Map<string, {
    component: PrivilegeEscalation['targetComponent'];
    sourcePrivilege: PrivilegeContext;
    targetPrivilege: PrivilegeContext;
    techniques: Set<string>; // Use Set to avoid duplicate techniques
    escalations: PrivilegeEscalation[];
  }>();

  for (const escalation of escalations) {
    const componentId = escalation.targetComponent.id;

    if (!componentMap.has(componentId)) {
      componentMap.set(componentId, {
        component: escalation.targetComponent,
        sourcePrivilege: escalation.sourcePrivilege,
        targetPrivilege: escalation.targetPrivilege,
        techniques: new Set(),
        escalations: [],
      });
    }

    const entry = componentMap.get(componentId)!;
    entry.techniques.add(escalation.technique.id);
    entry.escalations.push(escalation);
  }

  // Convert map to TargetComponent array
  const components: TargetComponent[] = [];

  for (const [componentId, entry] of componentMap.entries()) {
    // Get unique techniques for this component
    const techniques = entry.escalations
      .map(esc => ({
        id: esc.technique.id,
        name: esc.technique.name,
        description: esc.technique.description,
        detailedDescription: esc.technique.detailedDescription,
        cves: [], // Will be populated from CVE links when needed
        pocs: [], // Will be populated from CVE links when needed
        mitigations: esc.technique.mitigations,
        references: esc.technique.references,
        contextSpecificImpact: esc.technique.contextSpecificImpact,
      }))
      .filter((tech, index, self) =>
        // Remove duplicates by technique ID
        index === self.findIndex(t => t.id === tech.id)
      );

    // Create privilege info from PrivilegeContext
    const sourcePrivilegeInfo: PrivilegeInfo = {
      level: entry.sourcePrivilege.level,
      capabilities: entry.sourcePrivilege.capabilities,
      restrictions: entry.sourcePrivilege.restrictions,
      examples: entry.sourcePrivilege.examples,
    };

    const targetPrivilegeInfo: PrivilegeInfo = {
      level: entry.targetPrivilege.level,
      capabilities: entry.targetPrivilege.capabilities,
      restrictions: entry.targetPrivilege.restrictions,
      examples: entry.targetPrivilege.examples,
    };

    components.push({
      id: componentId,
      name: entry.component.name,
      description: entry.component.description,
      sourcePrivilege: entry.sourcePrivilege.level,
      targetPrivilege: entry.targetPrivilege.level,
      sourcePrivilegeInfo,
      targetPrivilegeInfo,
      techniques,
      escalations: entry.escalations.map(esc => ({
        id: esc.id,
        sourcePrivilege: esc.sourcePrivilege.level,
        targetPrivilege: esc.targetPrivilege.level,
        sourcePrivilegeInfo: {
          level: esc.sourcePrivilege.level,
          capabilities: esc.sourcePrivilege.capabilities,
          restrictions: esc.sourcePrivilege.restrictions,
          examples: esc.sourcePrivilege.examples,
        },
        targetPrivilegeInfo: {
          level: esc.targetPrivilege.level,
          capabilities: esc.targetPrivilege.capabilities,
          restrictions: esc.targetPrivilege.restrictions,
          examples: esc.targetPrivilege.examples,
        },
        technique: {
          id: esc.technique.id,
          name: esc.technique.name,
          description: esc.technique.description,
          detailedDescription: esc.technique.detailedDescription,
          cves: [],
          pocs: [],
          mitigations: esc.technique.mitigations,
          references: esc.technique.references,
          contextSpecificImpact: esc.technique.contextSpecificImpact,
        },
        componentId: esc.targetComponent.id,
        componentName: esc.targetComponent.name,
      })),
    });
  }

  return components;
}
