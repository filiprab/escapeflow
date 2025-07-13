import type { AttackVector } from '@/data/attackData';

interface AttackHeaderProps {
  attack: AttackVector;
}

export function AttackHeader({ attack }: AttackHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-white mb-2">{attack.name}</h2>
      <p className="text-gray-300 text-sm leading-relaxed">{attack.detailedDescription}</p>
    </div>
  );
}