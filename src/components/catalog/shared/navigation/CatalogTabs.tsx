'use client';

import { CircleStackIcon, ShieldCheckIcon, CubeIcon, BoltIcon } from '@heroicons/react/24/outline';

export type CatalogTab = 'cves' | 'privileges' | 'components' | 'vectors';

interface CatalogTabsProps {
  activeTab: CatalogTab;
  onTabChange: (tab: CatalogTab) => void;
}

const tabs: Array<{ id: CatalogTab; label: string; icon: typeof CircleStackIcon }> = [
  { id: 'cves', label: 'CVE Database', icon: CircleStackIcon },
  { id: 'privileges', label: 'Privilege Contexts', icon: ShieldCheckIcon },
  { id: 'components', label: 'Target Components', icon: CubeIcon },
  { id: 'vectors', label: 'Attack Vectors', icon: BoltIcon },
];

export default function CatalogTabs({ activeTab, onTabChange }: CatalogTabsProps) {
  return (
    <div className="border-b border-gray-700/50 mb-8">
      <nav className="flex gap-1" aria-label="Catalog sections">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-200 border-b-2
                ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
