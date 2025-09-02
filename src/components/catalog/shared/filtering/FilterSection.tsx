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
    <div className={`border-b border-gray-200 pb-6 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {options.map((option) => (
          <label 
            key={option}
            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => onToggleOption(option)}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-700 select-none">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}