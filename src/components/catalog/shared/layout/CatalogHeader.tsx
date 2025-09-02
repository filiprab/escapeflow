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
    <div className={`mb-0 ${className}`}>
      <h1 className="text-4xl font-bold mb-4 text-white">
        {title}
      </h1>
      {getDescription() && (
        <p className="text-blue-100">
          {getDescription()}
        </p>
      )}
    </div>
  );
}