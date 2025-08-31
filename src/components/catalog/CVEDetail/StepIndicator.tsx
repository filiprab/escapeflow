'use client';

type CreationStep = 'fetch' | 'edit';

interface StepIndicatorProps {
  currentStep: CreationStep;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center space-x-2 ${currentStep === 'fetch' ? 'text-blue-600' : 'text-green-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'fetch' ? 'border-blue-600 bg-blue-50' : 'border-green-600 bg-green-50'
          }`}>
            {currentStep === 'edit' ? '✓' : '1'}
          </div>
          <span className="font-medium">Fetch CVE Data</span>
        </div>
        
        <div className={`w-8 h-0.5 ${currentStep === 'edit' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        
        <div className={`flex items-center space-x-2 ${
          currentStep === 'edit' ? 'text-blue-600' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'edit' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-gray-50'
          }`}>
            2
          </div>
          <span className="font-medium">Review & Submit</span>
        </div>
      </div>
    </div>
  );
}