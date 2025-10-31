import { toPng } from 'html-to-image';
import type { AttackVector } from '@/types/attack';

// Types for CVE API response
interface CVEProofOfConcept {
  url: string;
}

interface CVEData {
  cveId: string;
  proofOfConcepts?: CVEProofOfConcept[];
}

interface CVEAPIResponse {
  cves?: CVEData[];
}

// Helper function to fetch CVEs for an escalation (same pattern as attack detail panel)
async function fetchCVEsForEscalation(escalationId: string): Promise<{cveIds: string[], pocUrls: string[]}> {
  try {
    const response = await fetch(`/api/escalations/${escalationId}/cves`);
    if (!response.ok) {
      console.error(`Failed to fetch CVEs for escalation ${escalationId}`);
      return { cveIds: [], pocUrls: [] };
    }
    const data = await response.json() as CVEAPIResponse;
    const cveIds = data.cves?.map((cve) => cve.cveId) || [];
    const pocUrls = data.cves?.flatMap((cve) =>
      cve.proofOfConcepts?.map((poc) => poc.url).filter(Boolean) || []
    ) || [];
    return { cveIds, pocUrls };
  } catch (error) {
    console.error(`Error fetching CVEs for escalation ${escalationId}:`, error);
    return { cveIds: [], pocUrls: [] };
  }
}

// Export to PNG
export const downloadImage = () => {
  const element = document.getElementById('attack-chain-panel-content');
  if (element) {
    toPng(element, {
      backgroundColor: '#111827',
      width: 320,
      height: element.scrollHeight,
    }).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = 'attack-chain.png';
      link.href = dataUrl;
      link.click();
    });
  }
};

// Export to JSON
export const downloadJSON = async (attackChain: AttackVector[]) => {
  // Fetch CVEs for all attacks using the same pattern as attack detail panel
  const attacksWithCVEs = await Promise.all(
    attackChain.map(async (attack) => {
      if (attack.escalationId) {
        const { cveIds, pocUrls } = await fetchCVEsForEscalation(attack.escalationId);
        return { ...attack, cves: cveIds, pocs: pocUrls };
      }
      return attack;
    })
  );

  const data = {
    exportMetadata: {
      version: '2.0',
      exportDate: new Date().toISOString(),
      application: 'EscapeFlow',
      format: 'Attack Chain Analysis',
    },
    attackChainSummary: {
      totalSteps: attacksWithCVEs.length,
      sourcePrivilege: attacksWithCVEs.length > 0 ? attacksWithCVEs[0].sourcePrivilege : null,
      targetPrivilege: attacksWithCVEs.length > 0 ? attacksWithCVEs[attacksWithCVEs.length - 1].targetPrivilege : null,
    },
    attackChain: attacksWithCVEs.map((attack, index) => ({
      step: index + 1,
      id: attack.id,
      name: attack.name,
      description: attack.description,
      detailedDescription: attack.detailedDescription,
      sourcePrivilege: attack.sourcePrivilege,
      targetPrivilege: attack.targetPrivilege,
      componentId: attack.componentId,
      techniqueId: attack.techniqueId,
      escalationId: attack.escalationId || null,
      cves: attack.cves,
      pocs: attack.pocs,
      mitigations: attack.mitigations,
      references: attack.references,
      contextSpecificImpact: attack.contextSpecificImpact || [],
    })),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'attack-chain.json';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

// Export to PlantUML
export const downloadPlantUML = (attackChain: AttackVector[]) => {
  const lines = ['@startuml', 'title Attack Chain Visualization', ''];

  // Add nodes as activities
  const allPrivileges: string[] = [];
  if (attackChain[0]) {
    allPrivileges.push(attackChain[0].sourcePrivilege);
  }
  attackChain.forEach(attack => {
    if (!allPrivileges.includes(attack.targetPrivilege)) {
      allPrivileges.push(attack.targetPrivilege);
    }
  });

  lines.push('start');
  allPrivileges.forEach((privilege, index) => {
    if (index === 0) {
      lines.push(`:${privilege};`);
    } else {
      const attack = attackChain[index - 1];
      const technique = attack ? (attack.name.split(': ')[1] || attack.name) : 'Unknown';
      lines.push(`note right : ${technique}`);
      lines.push(`:${privilege};`);
    }
  });
  lines.push('stop');

  lines.push('', '@enduml');

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'attack-chain.puml';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

// Export to Mermaid
export const downloadMermaid = (attackChain: AttackVector[]) => {
  const lines = ['graph TD'];

  // Generate node IDs and labels
  const allPrivileges: string[] = [];
  if (attackChain[0]) {
    allPrivileges.push(attackChain[0].sourcePrivilege);
  }
  attackChain.forEach(attack => {
    if (!allPrivileges.includes(attack.targetPrivilege)) {
      allPrivileges.push(attack.targetPrivilege);
    }
  });

  // Add nodes
  allPrivileges.forEach((privilege, index) => {
    const nodeId = `node${index}`;
    lines.push(`    ${nodeId}["${privilege}"]`);
  });

  // Add edges with attack techniques as labels
  attackChain.forEach((attack, index) => {
    const sourceId = `node${index}`;
    const targetId = `node${index + 1}`;
    const technique = attack.name.split(': ')[1] || attack.name;
    lines.push(`    ${sourceId} -->|"${technique}"| ${targetId}`);
  });

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'attack-chain.mmd';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

// Export to LaTeX
export const downloadLaTeX = async (attackChain: AttackVector[]) => {
  // Fetch CVEs for all attacks using the same pattern as attack detail panel
  const attacksWithCVEs = await Promise.all(
    attackChain.map(async (attack) => {
      if (attack.escalationId) {
        const { cveIds, pocUrls } = await fetchCVEsForEscalation(attack.escalationId);
        return { ...attack, cves: cveIds, pocs: pocUrls };
      }
      return attack;
    })
  );


  const lines = [
    '\\documentclass{article}',
    '\\usepackage[utf8]{inputenc}',
    '\\usepackage{xcolor}',
    '\\usepackage{tikz}',
    '\\usepackage{geometry}',
    '\\geometry{a4paper, margin=1in}',
    '\\usetikzlibrary{positioning, arrows.meta, shapes.geometric}',
    '\\definecolor{lightblue}{RGB}{173, 216, 230}',
    '',
    '\\title{Browser Sandbox Escape Attack Chain}',
    '\\author{EscapeFlow Analysis}',
    '\\date{\\today}',
    '',
    '\\begin{document}',
    '\\maketitle',
    '',
    '\\section{Attack Chain Overview}',
    `This document describes a ${attacksWithCVEs.length}-step attack chain demonstrating browser sandbox escape techniques.`,
    '',
  ];

  // Add attack chain summary
  if (attacksWithCVEs.length > 0) {
    const startPrivilege = attacksWithCVEs[0].sourcePrivilege.replace(/[&%$#_{}~^\\]/g, (match) => `\\${match}`);
    const endPrivilege = attacksWithCVEs[attacksWithCVEs.length - 1].targetPrivilege.replace(/[&%$#_{}~^\\]/g, (match) => `\\${match}`);
    lines.push(`\\\\\\\\\\textbf{Source:} ${startPrivilege} \\\\`);
    lines.push(`\\textbf{Target:} ${endPrivilege} \\\\`);
    lines.push(`\\textbf{Steps:} ${attacksWithCVEs.length}`);
    lines.push('');
  }

  // Add detailed steps
  lines.push('\\section{Attack Steps}');
  lines.push('\\begin{enumerate}');

  attacksWithCVEs.forEach((attack) => {
    const technique = (attack.name.split(': ')[1] || attack.name).replace(/[&%$#_{}~^\\]/g, (match) => `\\${match}`);
    const sourcePrivilege = attack.sourcePrivilege.replace(/[&%$#_{}~^\\]/g, (match) => `\\${match}`);
    const targetPrivilege = attack.targetPrivilege.replace(/[&%$#_{}~^\\]/g, (match) => `\\${match}`);
    const description = attack.description.replace(/[&%$#_{}~^\\]/g, (match) => `\\${match}`);
    
    lines.push(`  \\item \\textbf{${sourcePrivilege} → ${targetPrivilege}}`);
    lines.push(`    \\begin{itemize}`);
    lines.push(`      \\item \\textbf{Technique:} ${technique}`);
    lines.push(`      \\item \\textbf{Description:} ${description}`);
    if (attack.cves.length > 0) {
      const escapedCves = attack.cves.map(cve => cve.replace(/[&%$#_{}~^\\]/g, (match) => `\\${match}`));
      lines.push(`      \\item \\textbf{CVEs:} ${escapedCves.join(', ')}`);
    }
    if (attack.pocs.length > 0) {
      const escapedPocs = attack.pocs.map(poc => poc.replace(/[&%$#_{}~^\\]/g, (match) => `\\${match}`));
      lines.push(`      \\item \\textbf{PoC URLs:} ${escapedPocs.join(', ')}`);
    }
    lines.push(`    \\end{itemize}`);
  });
  
  lines.push('\\end{enumerate}');
  lines.push('');

  // Add TikZ diagram
  lines.push('\\section{Attack Flow Diagram}');
  lines.push('\\begin{figure}[h]');
  lines.push('\\centering');
  lines.push('\\begin{tikzpicture}[');
  lines.push('  node distance=3cm,');
  lines.push('  every node/.style={rectangle, draw, rounded corners, minimum width=2.5cm, minimum height=1cm, text centered},');
  lines.push('  arrow/.style={-{Stealth[length=3mm]}, thick}');
  lines.push(']');

  // Generate TikZ nodes
  const allPrivileges: string[] = [];
  if (attacksWithCVEs[0]) {
    allPrivileges.push(attacksWithCVEs[0].sourcePrivilege);
  }
  attacksWithCVEs.forEach(attack => {
    if (!allPrivileges.includes(attack.targetPrivilege)) {
      allPrivileges.push(attack.targetPrivilege);
    }
  });

  allPrivileges.forEach((privilege, index) => {
    const nodeId = `node${index}`;
    const position = index === 0 ? '' : `, below of=node${index - 1}`;
    const escapedPrivilege = privilege.replace(/[&%$#_{}~^\\]/g, (match) => `\\${match}`);
    lines.push(`\\node (${nodeId}) [fill=lightblue${position}] {${escapedPrivilege}};`);
  });

  // Generate TikZ arrows with labels
  attacksWithCVEs.forEach((attack, index) => {
    const sourceId = `node${index}`;
    const targetId = `node${index + 1}`;
    const technique = (attack.name.split(': ')[1] || attack.name).replace(/[&%$#_{}~^\\]/g, (match) => `\\${match}`);
    lines.push(`\\draw [arrow] (${sourceId}) -- node[right, text width=3cm] {\\small ${technique}} (${targetId});`);
  });

  lines.push('\\end{tikzpicture}');
  lines.push('\\caption{Browser Sandbox Escape Attack Chain}');
  lines.push('\\end{figure}');
  lines.push('');
  lines.push('\\end{document}');

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'attack-chain.tex';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};