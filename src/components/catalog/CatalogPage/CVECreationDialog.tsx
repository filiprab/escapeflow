'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Dialog, { DialogFooter } from '@/components/ui/Dialog';
import { fetchFromNVD } from '@/lib/api/external-cve';
import type { ExternalCVEData } from '@/types/cve';
import { detectTargetComponent } from '@/lib/utils/component-mapping';

// Import our new components
import FetchStep from '@/components/catalog/CVEDetail/FetchStep';
import EditStep from '@/components/catalog/CVEDetail/EditStep';
import StepIndicator from '@/components/catalog/CVEDetail/StepIndicator';
import ErrorSuccessMessages from '@/components/catalog/CVEDetail/ErrorSuccessMessages';
import type { ProofOfConcept } from '@/components/catalog/CVEDetail/PoCInput';

interface CVECreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type CreationStep = 'fetch' | 'edit';

interface CVEFormData {
  descriptions: Array<{ lang: string; description: string }>;
  references?: string[];
  labels?: {
    operatingSystems: string[];
    targetComponent: string | null;
  };
  proofOfConcepts?: ProofOfConcept[];
}

export default function CVECreationDialog({ isOpen, onClose, onSuccess }: CVECreationDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<CreationStep>('fetch');
  const [cveId, setCveId] = useState('');
  const [formData, setFormData] = useState<CVEFormData>({
    descriptions: [{ lang: 'en', description: '' }],
    references: [],
    labels: { operatingSystems: [], targetComponent: null },
    proofOfConcepts: [],
  });
  
  const [prefetchLoading, setPrefetchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [prefetched, setPrefetched] = useState(false);

  const allowedOS = ['Android', 'iOS', 'Windows', 'Linux', 'macOS'];

  const handleClose = () => {
    setStep('fetch');
    setCveId('');
    setFormData({
      descriptions: [{ lang: 'en', description: '' }],
      references: [],
      labels: { operatingSystems: [], targetComponent: null },
      proofOfConcepts: [],
    });
    setPrefetchLoading(false);
    setLoading(false);
    setError(null);
    setSuccess(null);
    setPrefetched(false);
    onClose();
  };

  const validateCVEId = (id: string): boolean => {
    const cveRegex = /^CVE-(\d{4})-(\d{4,})$/;
    const match = id.match(cveRegex);
    if (!match) return false;
    
    const year = parseInt(match[1], 10);
    const number = parseInt(match[2], 10);
    return year >= 1999 && number >= 1;
  };

  const handlePrefetch = async () => {
    if (!cveId.trim()) {
      setError('CVE ID is required');
      return;
    }

    if (!validateCVEId(cveId.trim())) {
      setError('Invalid CVE ID format. Expected: CVE-YYYY-NNNN');
      return;
    }

    setPrefetchLoading(true);
    setError(null);

    try {
      // Fetch data from NVD
      const externalData = await fetchFromNVD(cveId.trim().toUpperCase());

      // Populate form with fetched data
      populateFormFromExternalData(externalData);

      // Move to edit step
      setStep('edit');
      setPrefetched(true);

    } catch (error: unknown) {
      console.error('Failed to fetch CVE data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch CVE data from NVD');
    } finally {
      setPrefetchLoading(false);
    }
  };

  const populateFormFromExternalData = (externalData: ExternalCVEData) => {
    // Helper function to analyze description for OS detection
    const detectOperatingSystems = (description: string): string[] => {
      const lowerDesc = description.toLowerCase();
      const detectedOS: string[] = [];
      
      if (lowerDesc.includes('android')) detectedOS.push('Android');
      if (lowerDesc.includes('ios') || lowerDesc.includes('iphone') || lowerDesc.includes('ipad')) {
        detectedOS.push('iOS');
      }
      if (lowerDesc.includes('windows')) detectedOS.push('Windows');
      if (lowerDesc.includes('linux')) detectedOS.push('Linux');
      if (lowerDesc.includes('macos') || lowerDesc.includes('mac os')) detectedOS.push('macOS');
      
      return [...new Set(detectedOS)];
    };

    // Populate form data
    const description = externalData.description || '';
    const references = externalData.references || [];
    const detectedOS = detectOperatingSystems(description);

    // Use the centralized component detection logic
    const detectionResult = detectTargetComponent(description);
    const targetComponent = detectionResult.component;

    setFormData({
      descriptions: [{ lang: 'en', description }],
      references: references,
      labels: {
        operatingSystems: detectedOS,
        targetComponent: targetComponent
      }
    });
  };

  const handleStartOver = () => {
    setStep('fetch');
    setCveId('');
    setFormData({
      descriptions: [{ lang: 'en', description: '' }],
      references: [],
      labels: { operatingSystems: [], targetComponent: null },
      proofOfConcepts: [],
    });
    setPrefetched(false);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!cveId.trim()) {
      setError('CVE ID is required');
      return;
    }

    if (!validateCVEId(cveId.trim())) {
      setError('Invalid CVE ID format. Expected: CVE-YYYY-NNNN');
      return;
    }

    if (!formData.descriptions[0]?.description.trim()) {
      setError('Description is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const requestBody: Record<string, unknown> = {
        source: 'NVD', // Always use NVD as the source
        cveId: cveId.trim().toUpperCase(),
        cveData: {
          ...formData,
          descriptions: formData.descriptions.filter(d => d.description.trim()),
          references: formData.references?.filter(r => r.trim()) || [],
        }
      };

      const response = await fetch('/api/cves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create CVE');
      }

      setSuccess(`CVE ${cveId.trim().toUpperCase()} created successfully!`);
      onSuccess();
      
      // Redirect to the new CVE after a short delay
      setTimeout(() => {
        handleClose();
        router.push(`/catalog/${cveId.trim().toUpperCase()}`);
      }, 2000);

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to create CVE');
    } finally {
      setLoading(false);
    }
  };

  const addReference = () => {
    const refs = formData.references || [];
    setFormData({
      ...formData,
      references: [...refs, '']
    });
  };

  const removeReference = (index: number) => {
    const refs = formData.references || [];
    setFormData({
      ...formData,
      references: refs.filter((_, i) => i !== index)
    });
  };

  const updateReference = (index: number, value: string) => {
    const refs = formData.references || [];
    refs[index] = value;
    setFormData({
      ...formData,
      references: [...refs]
    });
  };

  const toggleOS = (os: string) => {
    const current = formData.labels?.operatingSystems || [];
    const updated = current.includes(os)
      ? current.filter(item => item !== os)
      : [...current, os];

    setFormData({
      ...formData,
      labels: {
        ...formData.labels,
        operatingSystems: updated,
        targetComponent: formData.labels?.targetComponent || null
      }
    });
  };

  const setTargetComponent = (component: string | null) => {
    setFormData({
      ...formData,
      labels: {
        operatingSystems: formData.labels?.operatingSystems || [],
        targetComponent: component
      }
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New CVE"
      maxHeight="90vh"
      footer={
        <DialogFooter>
          {step === 'fetch' ? (
            <>
              <button
                onClick={handleClose}
                className="px-6 py-3 text-sm font-medium text-gray-300 bg-gray-700/50 border border-gray-600/50 rounded-lg hover:bg-gray-600/50 hover:border-gray-500/50 transition-all duration-200"
                disabled={prefetchLoading}
              >
                Cancel
              </button>
              <button
                onClick={handlePrefetch}
                disabled={prefetchLoading || !cveId.trim()}
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 border border-transparent rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
              >
                {prefetchLoading ? (
                  <>
                    <div className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Fetching...
                  </>
                ) : (
                  'Fetch CVE Data'
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleStartOver}
                className="px-6 py-3 text-sm font-medium text-gray-300 bg-gray-700/50 border border-gray-600/50 rounded-lg hover:bg-gray-600/50 hover:border-gray-500/50 transition-all duration-200"
                disabled={loading}
              >
                Start Over
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !cveId.trim() || !formData.descriptions[0]?.description.trim()}
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 border border-transparent rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
              >
                {loading ? (
                  <>
                    <div className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create CVE'
                )}
              </button>
            </>
          )}
        </DialogFooter>
      }
    >
      <div className="p-6 space-y-6">
        <StepIndicator currentStep={step} />

        {/* Step 1: Fetch Phase */}
        {step === 'fetch' && (
          <FetchStep
            cveId={cveId}
            setCveId={setCveId}
            onFetch={handlePrefetch}
            loading={prefetchLoading}
          />
        )}

        {/* Step 2: Edit Phase */}
        {step === 'edit' && (
          <EditStep
            cveId={cveId}
            setCveId={setCveId}
            formData={formData}
            setFormData={setFormData}
            prefetched={prefetched}
            onStartOver={handleStartOver}
            loading={loading}
            allowedOS={allowedOS}
            toggleOS={toggleOS}
            setTargetComponent={setTargetComponent}
            addReference={addReference}
            removeReference={removeReference}
            updateReference={updateReference}
          />
        )}

        <ErrorSuccessMessages error={error} success={success} />
      </div>
    </Dialog>
  );
}