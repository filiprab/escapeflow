import type { AttackVector } from '@/data/attackData';
import { downloadImage, downloadJSON, downloadPlantUML, downloadMermaid, downloadLaTeX } from './exportUtils';
import { PhotoIcon, DocumentTextIcon, ChartBarIcon, PresentationChartLineIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface ExportButtonsProps {
  attackChain: AttackVector[];
}

export function ExportButtons({ attackChain }: ExportButtonsProps) {
  if (attackChain.length === 0) return null;

  return (
    <div className="p-4 border-t border-gray-700">
      <div className="text-xs text-gray-400 mb-3 text-center">Export Options</div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={downloadImage}
          className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
          title="Export as PNG image"
        >
          <PhotoIcon className="w-3 h-3" />
          <span>PNG</span>
        </button>
        <button
          onClick={() => downloadJSON(attackChain)}
          className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
          title="Export as JSON data"
        >
          <DocumentTextIcon className="w-3 h-3" />
          <span>JSON</span>
        </button>
        <button
          onClick={() => downloadPlantUML(attackChain)}
          className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors"
          title="Export as PlantUML diagram"
        >
          <ChartBarIcon className="w-3 h-3" />
          <span>PlantUML</span>
        </button>
        <button
          onClick={() => downloadMermaid(attackChain)}
          className="flex items-center justify-center space-x-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-xs font-medium transition-colors"
          title="Export as Mermaid diagram"
        >
          <PresentationChartLineIcon className="w-3 h-3" />
          <span>Mermaid</span>
        </button>
        <button
          onClick={() => downloadLaTeX(attackChain)}
          className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
          title="Export as LaTeX document"
        >
          <DocumentIcon className="w-3 h-3" />
          <span>LaTeX</span>
        </button>
      </div>
    </div>
  );
}