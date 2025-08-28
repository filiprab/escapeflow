import { CVERecord } from '@/types/cve';

interface AffectedProductsSectionProps {
  cve: CVERecord;
}

export default function AffectedProductsSection({ cve }: AffectedProductsSectionProps) {
  if (!cve.affectedProducts || cve.affectedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Affected Products</h2>
      <div className="space-y-4">
        {cve.affectedProducts.map((affected, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center space-x-4 mb-3">
              <span className="font-medium text-gray-900">{affected.vendor} {affected.product}</span>
            </div>
            <div className="space-y-2">
              {affected.versions?.map((version, vIndex) => (
                <div key={vIndex} className="text-sm">
                  <span className="text-gray-600">Version:</span>
                  <span className="ml-2 font-mono text-gray-900">{version.version}</span>
                  <span className="ml-4 text-gray-600">Status:</span>
                  <span className="ml-2 text-red-600">{version.status}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}