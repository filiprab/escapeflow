import { toPng } from 'html-to-image';
import type { AttackVector } from '@/data/attackData';

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
export const downloadJSON = (attackChain: AttackVector[]) => {
  const data = {
    attackChain: attackChain.map((attack, index) => ({
      step: index + 1,
      name: attack.name,
      source: attack.sourcePrivilege,
      target: attack.targetPrivilege,
      technique: attack.name.split(': ')[1] || attack.name,
    })),
    metadata: {
      totalSteps: attackChain.length,
      exportDate: new Date().toISOString(),
    },
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
export const downloadLaTeX = (attackChain: AttackVector[]) => {
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
    `This document describes a ${attackChain.length}-step attack chain demonstrating browser sandbox escape techniques.`,
    '',
  ];

  // Add attack chain summary
  if (attackChain.length > 0) {
    const startPrivilege = attackChain[0].sourcePrivilege.replace(/[&%$#_{}~^\\]/g, (match) => `\\${match}`);
    const endPrivilege = attackChain[attackChain.length - 1].targetPrivilege.replace(/[&%$#_{}~^\\]/g, (match) => `\\${match}`);
    lines.push(`\\textbf{Source:} ${startPrivilege} \\\\`);
    lines.push(`\\textbf{Target:} ${endPrivilege} \\\\`);
    lines.push(`\\textbf{Steps:} ${attackChain.length}`);
    lines.push('');
  }

  // Add detailed steps
  lines.push('\\section{Attack Steps}');
  lines.push('\\begin{enumerate}');
  
  attackChain.forEach((attack) => {
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
  if (attackChain[0]) {
    allPrivileges.push(attackChain[0].sourcePrivilege);
  }
  attackChain.forEach(attack => {
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
  attackChain.forEach((attack, index) => {
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