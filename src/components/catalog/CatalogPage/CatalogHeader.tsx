interface CatalogHeaderProps {
  totalCVEs: number;
}

export default function CatalogHeader({ totalCVEs }: CatalogHeaderProps) {
  return (
    <div className="mb-0">
      <h1 className="text-4xl font-bold mb-4 text-white">
        CVE Catalog
      </h1>
      <p className="text-blue-100">
        Browse and filter {totalCVEs.toLocaleString()} Chromium CVEs
      </p>
    </div>
  );
}