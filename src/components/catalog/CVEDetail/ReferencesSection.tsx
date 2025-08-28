import { LinkIcon } from '@heroicons/react/24/outline';
import { CVERecord } from '@/types/cve';

interface ReferencesSectionProps {
  cve: CVERecord;
}

export default function ReferencesSection({ cve }: ReferencesSectionProps) {
  if (!cve.references || cve.references.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">References</h2>
      <div className="space-y-3">
        {cve.references.map((ref, index) => (
          <a
            key={index}
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            <span className="break-all">{ref.url}</span>
          </a>
        ))}
      </div>
    </div>
  );
}