import { LinkCard } from './LinkCard';

interface ReferencesSectionProps {
  references: string[];
}

export function ReferencesSection({ references }: ReferencesSectionProps) {
  if (!references || references.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-3">Additional References</h3>
      <div className="space-y-2">
        {references.map((ref, index) => (
          <LinkCard
            key={index}
            href={ref}
            title={`Reference #${index + 1}`}
            description={new URL(ref).hostname}
            hoverColor="blue"
          />
        ))}
      </div>
    </div>
  );
}