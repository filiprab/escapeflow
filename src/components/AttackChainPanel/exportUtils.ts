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