'use client';

import { useEffect, useState } from 'react';
import {
  calculateCVSS,
  METRIC_OPTIONS,
  type CVSSMetrics,
  type CVSSResult
} from '@/lib/utils/cvss-calculator';

interface CVSSInputProps {
  value: CVSSMetrics | null;
  onChange: (metrics: CVSSMetrics, result: CVSSResult) => void;
  disabled?: boolean;
}

export default function CVSSInput({ value, onChange, disabled = false }: CVSSInputProps) {
  // Initialize with default "not selected" state
  const [metrics, setMetrics] = useState<CVSSMetrics>({
    attackVector: '',
    attackComplexity: '',
    privilegesRequired: '',
    userInteraction: '',
    scope: '',
    confidentialityImpact: '',
    integrityImpact: '',
    availabilityImpact: '',
  });

  const [result, setResult] = useState<CVSSResult | null>(null);

  // Update local state when value prop changes
  useEffect(() => {
    if (value) {
      setMetrics(value);
      // Recalculate score when value changes
      const allSelected = Object.values(value).every(v => v !== '');
      if (allSelected) {
        const calculatedResult = calculateCVSS(value);
        setResult(calculatedResult);
      }
    }
  }, [value]);

  const calculateScore = (newMetrics: CVSSMetrics) => {
    // Check if all metrics are selected
    const allSelected = Object.values(newMetrics).every(v => v !== '');

    if (allSelected) {
      const calculatedResult = calculateCVSS(newMetrics);
      setResult(calculatedResult);
      onChange(newMetrics, calculatedResult);
    } else {
      setResult(null);
    }
  };

  const handleMetricChange = (metricKey: keyof CVSSMetrics, value: string) => {
    const newMetrics = { ...metrics, [metricKey]: value };
    setMetrics(newMetrics);
    calculateScore(newMetrics);
  };

  const handleClear = () => {
    const emptyMetrics: CVSSMetrics = {
      attackVector: '',
      attackComplexity: '',
      privilegesRequired: '',
      userInteraction: '',
      scope: '',
      confidentialityImpact: '',
      integrityImpact: '',
      availabilityImpact: '',
    };
    setMetrics(emptyMetrics);
    setResult(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-purple-400 bg-purple-500/20 border-purple-500/40';
      case 'High': return 'text-red-400 bg-red-500/20 border-red-500/40';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
      case 'Low': return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
      case 'None': return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
    }
  };

  // Metric button component
  const MetricButton = ({
    label,
    value,
    isSelected,
    onClick
  }: {
    label: string;
    value: string;
    isSelected: boolean;
    onClick: () => void;
  }) => {
    // Determine color based on metric value
    const getButtonColor = () => {
      // High severity metrics (red/danger)
      if (value === 'NETWORK' || value === 'HIGH' || value === 'NONE' || value === 'REQUIRED' || value === 'CHANGED') {
        return isSelected
          ? 'bg-red-600 border-red-500 text-white'
          : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-red-600/20 hover:border-red-500/50';
      }
      // Medium severity metrics (yellow/warning)
      if (value === 'ADJACENT_NETWORK' || value === 'LOW') {
        return isSelected
          ? 'bg-yellow-600 border-yellow-500 text-white'
          : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-yellow-600/20 hover:border-yellow-500/50';
      }
      // Low severity metrics (gray/neutral)
      return isSelected
        ? 'bg-gray-500 border-gray-400 text-white'
        : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-500/20 hover:border-gray-400/50';
    };

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">CVSS v3.1 Metrics</h3>
          <p className="text-sm text-gray-400 mt-1">
            Select all metrics to calculate the base score
          </p>
        </div>
        {result && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="text-sm text-red-400 hover:text-red-300 px-4 py-2 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Score Display - Only show when all metrics are selected */}
      {result && (
        <div className="bg-gradient-to-br from-gray-700/40 to-gray-800/40 backdrop-blur-sm p-6 rounded-xl border border-gray-600/50 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Base Score */}
            <div className="text-center">
              <div className="text-sm text-gray-400 uppercase tracking-wide mb-2">Base Score</div>
              <div className="text-5xl font-bold text-white mb-2">
                {result.baseScore.toFixed(1)}
              </div>
              <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold border ${getSeverityColor(result.baseSeverity)}`}>
                {result.baseSeverity}
              </div>
            </div>

            {/* Subscores */}
            <div className="text-center border-l border-gray-600/50 pl-6">
              <div className="text-sm text-gray-400 uppercase tracking-wide mb-2">Impact</div>
              <div className="text-3xl font-semibold text-blue-400">
                {result.impactSubScore.toFixed(1)}
              </div>
            </div>

            <div className="text-center border-l border-gray-600/50 pl-6">
              <div className="text-sm text-gray-400 uppercase tracking-wide mb-2">Exploitability</div>
              <div className="text-3xl font-semibold text-purple-400">
                {result.exploitabilitySubScore.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Vector String */}
          <div className="mt-6 pt-6 border-t border-gray-600/50">
            <div className="text-sm text-gray-400 mb-2">Vector String</div>
            <div className="font-mono text-sm text-gray-300 bg-gray-900/50 px-4 py-3 rounded-lg border border-gray-700/50 break-all">
              {result.vectorString}
            </div>
          </div>
        </div>
      )}

      {/* Metric Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attack Vector */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Attack Vector (AV)
          </label>
          <div className="flex flex-wrap gap-2">
            {METRIC_OPTIONS.attackVector.map(opt => (
              <MetricButton
                key={opt.value}
                label={opt.label}
                value={opt.value}
                isSelected={metrics.attackVector === opt.value}
                onClick={() => handleMetricChange('attackVector', opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Attack Complexity */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Attack Complexity (AC)
          </label>
          <div className="flex flex-wrap gap-2">
            {METRIC_OPTIONS.attackComplexity.map(opt => (
              <MetricButton
                key={opt.value}
                label={opt.label}
                value={opt.value}
                isSelected={metrics.attackComplexity === opt.value}
                onClick={() => handleMetricChange('attackComplexity', opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Privileges Required */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Privileges Required (PR)
          </label>
          <div className="flex flex-wrap gap-2">
            {METRIC_OPTIONS.privilegesRequired.map(opt => (
              <MetricButton
                key={opt.value}
                label={opt.label}
                value={opt.value}
                isSelected={metrics.privilegesRequired === opt.value}
                onClick={() => handleMetricChange('privilegesRequired', opt.value)}
              />
            ))}
          </div>
        </div>

        {/* User Interaction */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            User Interaction (UI)
          </label>
          <div className="flex flex-wrap gap-2">
            {METRIC_OPTIONS.userInteraction.map(opt => (
              <MetricButton
                key={opt.value}
                label={opt.label}
                value={opt.value}
                isSelected={metrics.userInteraction === opt.value}
                onClick={() => handleMetricChange('userInteraction', opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Scope */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Scope (S)
          </label>
          <div className="flex flex-wrap gap-2">
            {METRIC_OPTIONS.scope.map(opt => (
              <MetricButton
                key={opt.value}
                label={opt.label}
                value={opt.value}
                isSelected={metrics.scope === opt.value}
                onClick={() => handleMetricChange('scope', opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Confidentiality Impact */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Confidentiality (C)
          </label>
          <div className="flex flex-wrap gap-2">
            {METRIC_OPTIONS.confidentialityImpact.map(opt => (
              <MetricButton
                key={opt.value}
                label={opt.label}
                value={opt.value}
                isSelected={metrics.confidentialityImpact === opt.value}
                onClick={() => handleMetricChange('confidentialityImpact', opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Integrity Impact */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Integrity (I)
          </label>
          <div className="flex flex-wrap gap-2">
            {METRIC_OPTIONS.integrityImpact.map(opt => (
              <MetricButton
                key={opt.value}
                label={opt.label}
                value={opt.value}
                isSelected={metrics.integrityImpact === opt.value}
                onClick={() => handleMetricChange('integrityImpact', opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Availability Impact */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Availability (A)
          </label>
          <div className="flex flex-wrap gap-2">
            {METRIC_OPTIONS.availabilityImpact.map(opt => (
              <MetricButton
                key={opt.value}
                label={opt.label}
                value={opt.value}
                isSelected={metrics.availabilityImpact === opt.value}
                onClick={() => handleMetricChange('availabilityImpact', opt.value)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
