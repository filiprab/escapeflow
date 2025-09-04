interface CatalogHeaderProps {
  title: string;
  description?: string;
  totalItems?: number;
  itemName?: string;
  className?: string;
}

export default function CatalogHeader({ 
  title,
  description,
  totalItems,
  itemName = 'items',
  className = ''
}: CatalogHeaderProps) {
  const getDescription = () => {
    if (description) return description;
    if (totalItems !== undefined) {
      return `Browse and filter ${totalItems.toLocaleString()} ${itemName}`;
    }
    return '';
  };

  return (
    <div className={`mb-12 ${className}`}>
      <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-500 bg-clip-text text-transparent text-left">
        {title}
      </h1>
      {getDescription() && (
        <p className="text-xl text-gray-300 max-w-4xl leading-relaxed text-left">
          {getDescription()}
        </p>
      )}
    </div>
  );
}