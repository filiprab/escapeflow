interface SeverityBadgeProps {
  score?: number | string;
  severity?: string;
  variant?: 'score' | 'level' | 'both';
  className?: string;
}

export default function SeverityBadge({ 
  score, 
  severity, 
  variant = 'score',
  className = '' 
}: SeverityBadgeProps) {
  const getSeverityColor = (scoreValue: number | string) => {
    const numScore = typeof scoreValue === 'string' ? parseFloat(scoreValue) : scoreValue;
    if (isNaN(numScore)) return 'bg-gray-500 text-white';
    
    if (numScore >= 9.0) return 'bg-red-600 text-white';
    if (numScore >= 7.0) return 'bg-orange-500 text-white';
    if (numScore >= 4.0) return 'bg-yellow-500 text-white';
    return 'bg-green-600 text-white';
  };

  const getSeverityLevel = (scoreValue: number | string) => {
    const numScore = typeof scoreValue === 'string' ? parseFloat(scoreValue) : scoreValue;
    if (isNaN(numScore)) return 'Unknown';
    
    if (numScore >= 9.0) return 'Critical';
    if (numScore >= 7.0) return 'High';
    if (numScore >= 4.0) return 'Medium';
    return 'Low';
  };

  const formatScore = (scoreValue: number | string) => {
    if (scoreValue === null || scoreValue === undefined) return 'N/A';
    return scoreValue.toString();
  };

  const displayScore = score !== undefined ? formatScore(score) : 'N/A';
  const displaySeverity = severity || (score !== undefined ? getSeverityLevel(score) : 'Unknown');
  const colorClass = score !== undefined ? getSeverityColor(score) : 'bg-gray-500 text-white';

  const renderContent = () => {
    switch (variant) {
      case 'level':
        return displaySeverity;
      case 'both':
        return `${displayScore} (${displaySeverity})`;
      case 'score':
      default:
        return displayScore;
    }
  };

  return (
    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {renderContent()}
    </div>
  );
}