'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCVEById, CVEApiError } from '@/lib/api/cve';
import { CVERecord } from '@/types/cve';

import CVEHeader from './CVEHeader';
import DescriptionSection from './DescriptionSection';
import ClassificationSection from './ClassificationSection';
import CVSSMetricsSection from './CVSSMetricsSection';
import ProblemTypesSection from './ProblemTypesSection';
import AffectedProductsSection from './AffectedProductsSection';
import ReferencesSection from './ReferencesSection';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

export default function CVEDetail() {
  const params = useParams();
  const cveId = params.cveId as string;
  const [cve, setCve] = useState<CVERecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCVE = async () => {
      try {
        setLoading(true);
        setError(null);
        const cveData = await getCVEById(cveId);
        setCve(cveData);
      } catch (err) {
        console.error('Failed to fetch CVE:', err);
        setError(err instanceof CVEApiError ? err.message : 'Failed to load CVE data');
      } finally {
        setLoading(false);
      }
    };

    if (cveId) {
      fetchCVE();
    }
  }, [cveId]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!cve) {
    return <ErrorState error={`CVE ${cveId} not found`} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <CVEHeader cve={cve} />
        <DescriptionSection cve={cve} />
        <ClassificationSection cve={cve} />
        <CVSSMetricsSection cve={cve} />
        <ProblemTypesSection cve={cve} />
        <AffectedProductsSection cve={cve} />
        <ReferencesSection cve={cve} />
      </div>
    </div>
  );
}