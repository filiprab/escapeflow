interface TagListProps {
  tags: string[];
  maxVisible?: number;
  variant?: 'blue' | 'purple' | 'green' | 'gray';
  className?: string;
}

export default function TagList({ 
  tags, 
  maxVisible = 2, 
  variant = 'blue',
  className = '' 
}: TagListProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'purple':
        return 'bg-purple-100 text-purple-700';
      case 'green':
        return 'bg-green-100 text-green-700';
      case 'gray':
        return 'bg-gray-100 text-gray-700';
      case 'blue':
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const variantStyles = getVariantStyles(variant);
  const visibleTags = tags.slice(0, maxVisible);
  const remainingCount = tags.length - maxVisible;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visibleTags.map((tag) => (
        <span 
          key={tag} 
          className={`px-2 py-1 rounded text-xs ${variantStyles}`}
        >
          {tag}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}