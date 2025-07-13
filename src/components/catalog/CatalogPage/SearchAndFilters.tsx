import { CVEFilter } from '@/data/cveTypes';
import { FilterOptions } from '@/lib/api/cve';

interface SearchAndFiltersProps {
  filter: CVEFilter;
  filterOptions: FilterOptions;
  onSearchChange: (search: string) => void;
  onToggleOS: (os: string) => void;
  onToggleComponent: (component: string) => void;
}

export default function SearchAndFilters({
  filter,
  filterOptions,
  onSearchChange,
  onToggleOS,
  onToggleComponent
}: SearchAndFiltersProps) {
  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Search */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Search</h3>
        <input
          type="text"
          placeholder="Search CVE ID or description..."
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          value={filter.search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Operating Systems Filter */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Operating Systems</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {filterOptions.operatingSystems.map(os => (
            <label key={os} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.operatingSystems.includes(os)}
                onChange={() => onToggleOS(os)}
                className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">{os}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Components Filter */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Components</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {filterOptions.components.map(component => (
            <label key={component} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.components.includes(component)}
                onChange={() => onToggleComponent(component)}
                className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">{component}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}