interface PrivilegeLevelBadgeProps {
  sourcePrivilege: string;
  targetPrivilege: string;
}

export function PrivilegeLevelBadge({ sourcePrivilege, targetPrivilege }: PrivilegeLevelBadgeProps) {
  return (
    <div className="flex items-center gap-2 mb-4 text-sm">
      <span className="bg-gray-700 px-3 py-2 rounded-lg font-medium">{sourcePrivilege}</span>
      <span className="text-red-400 font-bold text-xl">→</span>
      <span className="bg-gray-700 px-3 py-2 rounded-lg font-medium">{targetPrivilege}</span>
    </div>
  );
}