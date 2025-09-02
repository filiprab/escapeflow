import Image from 'next/image';

interface OSIconDisplayProps {
  operatingSystems: string[];
  className?: string;
}

export default function OSIconDisplay({ operatingSystems, className = '' }: OSIconDisplayProps) {
  const getOSIcon = (osName: string) => {
    let iconPath = '';
    
    // Windows variants
    if (osName === "Windows") {
      iconPath = '/windows_logo.svg';
    }
    // Android
    else if (osName === "Android") {
      iconPath = '/android_logo.svg';
    }
    // Linux variants  
    else if (osName === "Linux") {
      iconPath = '/linux_logo.svg';
    }
    // macOS variants
    else if (osName === "macOS") {
      iconPath = '/macos_logo.svg';
    }
    // iOS (use Apple logo)
    else if (osName === "iOS") {
      iconPath = '/apple_logo.svg';
    }
    
    if (!iconPath) return null;
    
    return (
      <Image 
        src={iconPath} 
        alt={osName}
        width={24} 
        height={24} 
        className="h-5 w-auto"
      />
    );
  };

  if (!operatingSystems || operatingSystems.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {operatingSystems.map((os, index) => (
        <div key={`${os}-${index}`}>
          {getOSIcon(os)}
        </div>
      ))}
    </div>
  );
}