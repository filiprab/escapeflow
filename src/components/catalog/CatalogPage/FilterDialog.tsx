'use client';

import { CVEFilter } from '@/types/cve';
import { FilterOptions } from '@/lib/api/cve';
import { FilterDialog as SharedFilterDialog, FilterConfig } from '@/components/catalog/shared';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filter: CVEFilter;
  filterOptions: FilterOptions;
  onApplyFilters: (newFilter: CVEFilter) => void;
}

export default function FilterDialog({
  isOpen,
  onClose,
  filter,
  filterOptions,
  onApplyFilters
}: FilterDialogProps) {
  const filterConfigs: FilterConfig[] = [
    {
      key: 'severityLevels',
      title: 'Severity Levels',
      options: filterOptions.severityLevels
    },
    {
      key: 'operatingSystems',
      title: 'Operating Systems',
      options: filterOptions.operatingSystems
    },
    {
      key: 'components',
      title: 'Components',
      options: filterOptions.components
    }
  ];

  const handleApplyFilters = (newFilter: Record<string, unknown>) => {
    onApplyFilters(newFilter as unknown as CVEFilter);
  };

  return (
    <SharedFilterDialog
      isOpen={isOpen}
      onClose={onClose}
      filter={filter as unknown as Record<string, unknown>}
      filterConfigs={filterConfigs}
      onApplyFilters={handleApplyFilters}
      title="Filter CVEs"
    />
  );
}