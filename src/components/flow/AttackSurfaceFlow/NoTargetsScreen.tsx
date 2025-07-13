interface NoTargetsScreenProps {
  currentPrivilege: string;
}

export function NoTargetsScreen({ currentPrivilege }: NoTargetsScreenProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          No attack targets available
        </h2>
        <p className="text-gray-400">
          {`No attack targets available for privilege level: ${currentPrivilege}`}
        </p>
      </div>
    </div>
  );
}