interface MitigationsSectionProps {
  mitigations: string[];
}

export function MitigationsSection({ mitigations }: MitigationsSectionProps) {
  if (!mitigations || mitigations.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-3">Mitigations</h3>
      <ul className="space-y-2">
        {mitigations.map((mitigation, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span className="text-gray-300 text-sm">{mitigation}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}