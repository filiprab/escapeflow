import type { AttackVector } from '@/data/attackData';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface PrivilegeEscalationSectionProps {
  attack: AttackVector;
}

export function PrivilegeEscalationSection({ attack }: PrivilegeEscalationSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-3">Privilege Escalation</h3>
      <div className="flex items-center gap-3 text-sm">
        <span className="bg-gray-700 px-3 py-2 rounded-lg font-medium text-gray-200">
          {attack.sourcePrivilege}
        </span>
        <ArrowRightIcon className="w-5 h-5 text-red-400" />
        <span className="bg-red-600 px-3 py-2 rounded-lg font-medium text-white">
          {attack.targetPrivilege}
        </span>
      </div>
    </div>
  );
}