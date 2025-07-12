import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface PrivilegeLevelBadgeProps {
  sourcePrivilege: string;
  targetPrivilege: string;
}

export function PrivilegeLevelBadge({ sourcePrivilege, targetPrivilege }: PrivilegeLevelBadgeProps) {
  return (
    <div className="flex items-center gap-2 mb-4 text-sm">
      <span className="bg-gray-700 px-3 py-2 rounded-lg font-medium">{sourcePrivilege}</span>
      <ArrowRightIcon className="w-5 h-5 text-red-400" />
      <span className="bg-gray-700 px-3 py-2 rounded-lg font-medium">{targetPrivilege}</span>
    </div>
  );
}