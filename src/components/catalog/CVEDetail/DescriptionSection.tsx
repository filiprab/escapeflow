import { CVERecord } from '@/types/cve';

interface DescriptionSectionProps {
  cve: CVERecord;
}

export default function DescriptionSection({ cve }: DescriptionSectionProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Description</h2>
      <p className="text-gray-700 leading-relaxed">
        {cve.descriptions?.[0]?.description || 'No description available'}
      </p>
    </div>
  );
}