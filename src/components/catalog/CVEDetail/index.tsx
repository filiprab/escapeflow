'use client';

import { useParams, useRouter } from 'next/navigation';
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
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

export default function CVEDetail() {
  const params = useParams();
  const router = useRouter();
  const cveId = params.cveId as string;
  const [cve, setCve] = useState<CVERecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const updateCVEField = async (field: string, data: unknown) => {
    if (!cve) return;
    
    setUpdating(field);
    try {
      const response = await fetch(`/api/cves/${cveId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field, data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update CVE');
      }

      const result = await response.json();
      setCve(result.cve);
      return result;
    } catch (error) {
      console.error('Failed to update CVE:', error);
      throw error;
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteCVE = async () => {
    if (!cve) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/cves/${cveId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete CVE');
      }

      // Redirect to catalog after successful deletion
      router.push('/catalog');
    } catch (error) {
      console.error('Failed to delete CVE:', error);
      // You might want to show an error message here
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900">
      {/* Header Section with Blue Background */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 px-6 mb-6">
        <div className="max-w-4xl mx-auto">
          <CVEHeader 
            cve={cve} 
            onDelete={() => setShowDeleteDialog(true)}
          />
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6">
        <DescriptionSection 
          cve={cve} 
          onUpdate={updateCVEField}
          isUpdating={updating === 'description'}
        />
        <ClassificationSection 
          cve={cve} 
          onUpdate={updateCVEField}
          isUpdating={updating === 'labels'}
        />
        <CVSSMetricsSection cve={cve} />
        <ProblemTypesSection cve={cve} />
        <AffectedProductsSection cve={cve} />
        <ReferencesSection 
          cve={cve} 
          onUpdate={updateCVEField}
          isUpdating={updating === 'references'}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        cveId={cveId}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteCVE}
        isDeleting={deleting}
      />
    </div>
  );
}