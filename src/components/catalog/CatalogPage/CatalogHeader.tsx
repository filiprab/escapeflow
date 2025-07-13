interface CatalogHeaderProps {
  totalCVEs: number;
}

export default function CatalogHeader({ totalCVEs }: CatalogHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        CVE Catalog
      </h1>
      <p className="text-gray-400">
        Browse and filter {totalCVEs.toLocaleString()} Chromium CVEs
      </p>
    </div>
  );
}