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
  return (
    <div className={`border-b border-gray-700/50 pb-6 ${className}`}>
      <h3 className="text-sm font-medium text-white mb-4">{title}</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {options.map((option) => (
          <label 
            key={option}
            className="flex items-center gap-3 p-3 hover:bg-gray-700/30 rounded-lg cursor-pointer transition-colors duration-200"
          >
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => onToggleOption(option)}
              className="w-4 h-4 text-blue-500 bg-gray-700/50 border-gray-600/50 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-300 select-none">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}