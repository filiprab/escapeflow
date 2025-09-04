'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background grid matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Header Section with Dark Theme */}
      <div className="relative z-10 py-16 px-8">
        <div className="max-w-[1400px] mx-auto">
          <CVEHeader cve={cve} />
        </div>
      </div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 pb-16">
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
        
        {/* Delete Button Section */}
        <div className="mt-16 pt-8 border-t border-gray-700/30">
          <div className="flex justify-end">
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/25 hover:scale-[1.02]"
              title="Delete CVE"
            >
              <TrashIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>Delete CVE</span>
            </button>
          </div>
        </div>
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