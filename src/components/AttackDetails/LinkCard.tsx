import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface LinkCardProps {
  href: string;
  title: string;
  description: string;
  hoverColor: 'red' | 'green' | 'blue';
}

export function LinkCard({ href, title, description, hoverColor }: LinkCardProps) {
  const hoverColorClasses = {
    red: 'hover:border-red-500',
    green: 'hover:border-green-500',
    blue: 'hover:border-blue-500',
  };

  const titleColorClasses = {
    red: 'text-red-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
  };

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`block bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg transition-colors border border-gray-600 ${hoverColorClasses[hoverColor]}`}
    >
      <span className={`font-semibold ${titleColorClasses[hoverColor]}`}>{title}</span>
      <span className="flex items-center text-gray-400 text-sm ml-2">
        <ArrowRightIcon className="w-3 h-3 mr-1" />
        {description}
      </span>
    </Link>
  );
}