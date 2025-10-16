'use client';

import { useState } from 'react';
import { CatalogHeader } from '@/components/catalog/shared';
import CatalogTabs, { CatalogTab } from '../shared/navigation/CatalogTabs';
import CVEDatabasePage from '../CVEDatabasePage';
import PrivilegeContextsPage from '../PrivilegeContextsPage';
import TargetComponentsPage from '../TargetComponentsPage';
import AttackVectorsPage from '../AttackVectorsPage';

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<CatalogTab>('cves');

  const getTabTitle = () => {
    switch (activeTab) {
      case 'cves':
        return 'CVE Database';
      case 'privileges':
        return 'Privilege Contexts';
      case 'components':
        return 'Target Components';
      case 'vectors':
        return 'Attack Vectors';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'cves':
        return 'Browse and manage Chromium CVE vulnerabilities';
      case 'privileges':
        return 'Manage privilege escalation contexts and security boundaries';
      case 'components':
        return 'Configure browser components targeted in attacks';
      case 'vectors':
        return 'Define exploitation techniques and attack methodologies';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background grid matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Header Section with Dark Theme */}
      <div className="relative z-10 py-16 px-8">
        <div className="max-w-[1400px] mx-auto">
          <CatalogHeader
            title={getTabTitle()}
            description={getTabDescription()}
          />
        </div>
      </div>

      <div className="relative z-10 mx-32 pb-16">
        <div className="w-full">
          {/* Tab Navigation */}
          <CatalogTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'cves' && <CVEDatabasePage />}
            {activeTab === 'privileges' && <PrivilegeContextsPage />}
            {activeTab === 'components' && <TargetComponentsPage />}
            {activeTab === 'vectors' && <AttackVectorsPage />}
          </div>
        </div>
      </div>
    </div>
  );
}
