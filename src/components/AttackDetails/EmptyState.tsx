export function EmptyState() {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 h-full">
      <h2 className="text-xl font-bold text-white mb-4">Attack Details</h2>
      <p className="text-gray-400">
        Select an attack vector to view detailed information, CVE references, and proof-of-concept exploits.
      </p>
    </div>
  );
}