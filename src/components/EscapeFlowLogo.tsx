interface EscapeFlowLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function EscapeFlowLogo({ width = 32, height = 32, className = "" }: EscapeFlowLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      
      {/* Outer ring representing sandbox boundary */}
      <circle
        cx="16"
        cy="16"
        r="14"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeDasharray="4 2"
        opacity="0.8"
      />
      
      {/* Inner security layers */}
      <circle
        cx="16"
        cy="16"
        r="10"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="1"
        opacity="0.6"
      />
      
      <circle
        cx="16"
        cy="16"
        r="6"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="1"
        opacity="0.4"
      />
      
      {/* Central escape arrow */}
      <path
        d="M8 16 L20 16 M16 12 L20 16 L16 20"
        stroke="url(#arrowGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Flow particles/dots representing data flow */}
      <circle cx="6" cy="10" r="1" fill="#ef4444" opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.8;0.2;0.8"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      
      <circle cx="26" cy="22" r="1" fill="#06b6d4" opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.2;0.8;0.2"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      
      <circle cx="6" cy="22" r="1" fill="#10b981" opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.8;0.2;0.8"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
      
      <circle cx="26" cy="10" r="1" fill="#fbbf24" opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.2;0.8;0.2"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}