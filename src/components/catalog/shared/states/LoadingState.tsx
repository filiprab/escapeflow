interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({ 
  message = 'Loading...',
  className = ''
}: LoadingStateProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-300">{message}</p>
      </div>
    </div>
  );
}