import { CVERecord } from '@/types/cve';

interface AffectedProductsSectionProps {
  cve: CVERecord;
}

export default function AffectedProductsSection({ cve }: AffectedProductsSectionProps) {
  if (!cve.affectedProducts || cve.affectedProducts.length === 0) {
    return null;
  }

  return (
    <div className="group bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 hover:border-yellow-500/30 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 mb-8">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-6">Affected Products</h2>
      <div className="space-y-6">
        {cve.affectedProducts.map((affected, index) => (
          <div key={index} className="bg-gray-700/20 rounded-xl p-6 border border-gray-600/30">
            <div className="flex items-center mb-4">
              <span className="font-bold text-gray-200 text-lg">{affected.vendor} {affected.product}</span>
            </div>
            <div className="space-y-3">
              {affected.versions?.map((version, vIndex) => (
                <div key={vIndex} className="flex items-center gap-6 text-sm bg-gray-600/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-medium">Version:</span>
                    <span className="font-mono text-gray-200 font-semibold">{version.version}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-medium">Status:</span>
                    <span className="text-red-300 font-semibold">{version.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}