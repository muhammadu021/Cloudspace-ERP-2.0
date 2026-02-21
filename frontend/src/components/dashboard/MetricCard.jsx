/**
 * MetricCard Component
 * 
 * Displays a single KPI metric with trend indicator.
 * Supports different metric types (currency, number, percentage).
 * 
 * @example
 * <MetricCard
 *   value={12345}
 *   label="Total Revenue"
 *   type="currency"
 *   trend={{ value: 12.5, direction: 'up' }}
 *   icon={<DollarIcon />}
 * />
 */

import React from 'react';
import PropTypes from 'prop-types';
import Badge from '@/design-system/components/Badge';
import { cn } from '@/design-system/utils';

const MetricCard = ({
  value,
  label,
  type = 'number',
  trend = null,
  icon = null,
  description = null,
  className,
  ...props
}) => {
  // Format value based on type
  const formatValue = (val, metricType) => {
    if (val === null || val === undefined) return '-';

    switch (metricType) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      
      case 'percentage':
        return `${val.toFixed(1)}%`;
      
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  // Trend indicator component
  const TrendIndicator = ({ trendData }) => {
    if (!trendData || trendData.value === null || trendData.value === undefined) {
      return null;
    }

    const isPositive = trendData.direction === 'up';
    const isNegative = trendData.direction === 'down';
    const isNeutral = trendData.direction === 'neutral';

    // Determine color based on direction and whether increase is good
    const isGoodTrend = trendData.isIncreaseBad ? isNegative : isPositive;
    
    const trendColor = isNeutral
      ? 'text-neutral-600'
      : isGoodTrend
      ? 'text-success-600'
      : 'text-error-600';

    const bgColor = isNeutral
      ? 'bg-neutral-50'
      : isGoodTrend
      ? 'bg-success-50'
      : 'bg-error-50';

    return (
      <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', bgColor, trendColor)}>
        {!isNeutral && (
          <svg
            className={cn('w-3 h-3', isNegative && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        )}
        <span>{Math.abs(trendData.value).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      {/* Header with icon and trend */}
      <div className="flex items-start justify-between mb-2">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
            {icon}
          </div>
        )}
        {trend && <TrendIndicator trendData={trend} />}
      </div>

      {/* Metric value */}
      <div className="mb-1">
        <div className="text-3xl font-bold text-neutral-900">
          {formatValue(value, type)}
        </div>
      </div>

      {/* Label */}
      <div className="text-sm text-neutral-600 font-medium">
        {label}
      </div>

      {/* Optional description */}
      {description && (
        <div className="text-xs text-neutral-500 mt-1">
          {description}
        </div>
      )}
    </div>
  );
};

MetricCard.propTypes = {
  /** Metric value */
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  /** Metric label */
  label: PropTypes.string.isRequired,
  /** Metric type for formatting */
  type: PropTypes.oneOf(['number', 'currency', 'percentage']),
  /** Trend data */
  trend: PropTypes.shape({
    /** Trend value (percentage) */
    value: PropTypes.number,
    /** Trend direction */
    direction: PropTypes.oneOf(['up', 'down', 'neutral']),
    /** Whether increase is bad (e.g., for costs) */
    isIncreaseBad: PropTypes.bool,
  }),
  /** Icon element */
  icon: PropTypes.node,
  /** Additional description */
  description: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default MetricCard;
