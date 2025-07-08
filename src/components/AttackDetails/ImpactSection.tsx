interface ImpactSectionProps {
  impacts: string[];
}

export function ImpactSection({ impacts }: ImpactSectionProps) {
  if (!impacts || impacts.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-orange-400 mb-3">What This Means For The Attacker</h3>
      <p className="text-gray-400 text-sm mb-3">
        Impact when exploiting this technique in the target component:
      </p>
      <ul className="space-y-2">
        {impacts.map((impact, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="text-orange-400 mt-1">⚡</span>
            <span className="text-gray-300 text-sm">{impact}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}