interface FilterSectionProps {
  title: string;
  options: string[];
  selectedOptions: string[];
  onToggleOption: (option: string) => void;
  className?: string;
}

export default function FilterSection({
  title,
  options,
  selectedOptions,
  onToggleOption,
  className = ''
}: FilterSectionProps) {
  const selectedCount = selectedOptions.length;
  const totalCount = options.length;

  const handleSelectAll = () => {
    options.forEach(option => {
      if (!selectedOptions.includes(option)) {
        onToggleOption(option);
      }
    });
  };

  const handleSelectNone = () => {
    selectedOptions.forEach(option => {
      onToggleOption(option);
    });
  };

  return (
    <div className={`pb-6 border-b border-gray-700/30 last:border-b-0 ${className}`}>
      {/* Section Header with Count and Quick Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {selectedCount > 0 && (
            <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
              {selectedCount} selected
            </span>
          )}
        </div>

        {/* Quick Actions */}
        {totalCount > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleSelectAll}
              disabled={selectedCount === totalCount}
              className="text-blue-400 hover:text-blue-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              All
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={handleSelectNone}
              disabled={selectedCount === 0}
              className="text-blue-400 hover:text-blue-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              None
            </button>
          </div>
        )}
      </div>

      {/* Options List */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {options.length === 0 ? (
          <div className="text-sm text-gray-500 italic py-2">No options available</div>
        ) : (
          options.map((option) => {
            const isSelected = selectedOptions.includes(option);
            return (
              <button
                key={option}
                onClick={() => onToggleOption(option)}
                className={`flex items-center justify-between w-full gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                  isSelected
                    ? 'bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/15'
                    : 'bg-gray-700/20 border border-transparent hover:bg-gray-700/40 hover:border-gray-600/30'
                }`}
              >
                <span className={`text-sm select-none text-left flex-1 transition-colors ${
                  isSelected ? 'text-blue-200 font-medium' : 'text-gray-300 group-hover:text-gray-200'
                }`}>
                  {option}
                </span>
                {isSelected && (
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}