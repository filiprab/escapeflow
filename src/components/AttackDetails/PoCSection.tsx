import { LinkCard } from './LinkCard';

interface PoCSecionProps {
  pocs: string[];
}

export function PoCSection({ pocs }: PoCSecionProps) {
  if (!pocs || pocs.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-3">Proof of Concept ({pocs.length})</h3>
      <div className="space-y-2">
        {pocs.map((poc, index) => (
          <LinkCard
            key={index}
            href={poc}
            title={`PoC #${index + 1}`}
            description={new URL(poc).hostname}
            hoverColor="green"
          />
        ))}
      </div>
    </div>
  );
}