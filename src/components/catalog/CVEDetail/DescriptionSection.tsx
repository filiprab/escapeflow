import { CVERecord } from '@/types/cve';

interface DescriptionSectionProps {
  cve: CVERecord;
}

export default function DescriptionSection({ cve }: DescriptionSectionProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
      <h2 className="text-xl font-semibold mb-4">Description</h2>
      <p className="text-gray-300 leading-relaxed">
        {cve.descriptions?.[0]?.description || 'No description available'}
      </p>
    </div>
  );
}