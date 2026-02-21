/**
 * Color Contrast Validator Component
 * 
 * Tool for validating WCAG 2.1 Level AA color contrast requirements
 * for dashboard components.
 */

import React, { useState } from 'react';
import { Card } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { checkColorContrast } from '@/utils/colorContrast';

/**
 * Dashboard color combinations to validate
 */
const DASHBOARD_COLORS = [
  // Text colors
  { name: 'Primary Text', foreground: '#171717', background: '#FFFFFF', type: 'text' },
  { name: 'Secondary Text', foreground: '#525252', background: '#FFFFFF', type: 'text' },
  { name: 'Muted Text', foreground: '#737373', background: '#FFFFFF', type: 'text' },
  
  // Button colors
  { name: 'Primary Button', foreground: '#FFFFFF', background: '#4F46E5', type: 'ui' },
  { name: 'Secondary Button', foreground: '#171717', background: '#F5F5F5', type: 'ui' },
  { name: 'Outline Button', foreground: '#4F46E5', background: '#FFFFFF', type: 'ui' },
  
  // Widget colors
  { name: 'Widget Title', foreground: '#171717', background: '#FFFFFF', type: 'text' },
  { name: 'Widget Subtitle', foreground: '#525252', background: '#FFFFFF', type: 'text' },
  { name: 'Widget Border', foreground: '#E5E5E5', background: '#FFFFFF', type: 'ui' },
  
  // Status colors
  { name: 'Success Text', foreground: '#16A34A', background: '#FFFFFF', type: 'text' },
  { name: 'Warning Text', foreground: '#CA8A04', background: '#FFFFFF', type: 'text' },
  { name: 'Error Text', foreground: '#DC2626', background: '#FFFFFF', type: 'text' },
  { name: 'Info Text', foreground: '#2563EB', background: '#FFFFFF', type: 'text' },
  
  // Background variations
  { name: 'Text on Light Gray', foreground: '#171717', background: '#F5F5F5', type: 'text' },
  { name: 'Text on Primary', foreground: '#FFFFFF', background: '#4F46E5', type: 'text' },
  { name: 'Text on Success', foreground: '#FFFFFF', background: '#16A34A', type: 'text' },
  { name: 'Text on Warning', foreground: '#FFFFFF', background: '#CA8A04', type: 'text' },
  { name: 'Text on Error', foreground: '#FFFFFF', background: '#DC2626', type: 'text' },
  
  // Chart colors
  { name: 'Chart Primary', foreground: '#4F46E5', background: '#FFFFFF', type: 'ui' },
  { name: 'Chart Secondary', foreground: '#10B981', background: '#FFFFFF', type: 'ui' },
  { name: 'Chart Tertiary', foreground: '#F59E0B', background: '#FFFFFF', type: 'ui' },
  
  // Links
  { name: 'Link Default', foreground: '#4F46E5', background: '#FFFFFF', type: 'text' },
  { name: 'Link Hover', foreground: '#4338CA', background: '#FFFFFF', type: 'text' },
];

const ColorContrastValidator = () => {
  const [results, setResults] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Run validation on all color combinations
   */
  const runValidation = () => {
    setIsValidating(true);
    
    const validationResults = DASHBOARD_COLORS.map(color => {
      const result = checkColorContrast(
        color.foreground,
        color.background,
        color.type === 'text' ? 'AA' : 'AAA'
      );
      
      return {
        ...color,
        ...result,
      };
    });
    
    setResults(validationResults);
    setIsValidating(false);
  };

  /**
   * Get status badge for contrast result
   */
  const getStatusBadge = (passes, ratio) => {
    if (passes) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ Pass ({ratio.toFixed(2)}:1)
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ✗ Fail ({ratio.toFixed(2)}:1)
      </span>
    );
  };

  /**
   * Calculate summary statistics
   */
  const getSummary = () => {
    if (results.length === 0) return null;
    
    const passed = results.filter(r => r.passes).length;
    const failed = results.filter(r => !r.passes).length;
    const passRate = ((passed / results.length) * 100).toFixed(1);
    
    return { passed, failed, passRate };
  };

  const summary = getSummary();

  return (
    <div className="p-6 space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Color Contrast Validator
          </h2>
          <p className="text-neutral-600 mb-6">
            Validates dashboard color combinations against WCAG 2.1 Level AA standards.
            Text requires 4.5:1 contrast ratio, UI components require 3:1.
          </p>

          <Button
            variant="primary"
            onClick={runValidation}
            loading={isValidating}
            disabled={isValidating}
          >
            Run Validation
          </Button>

          {summary && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-900 mb-1">
                  Passed
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {summary.passed}
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-sm font-medium text-red-900 mb-1">
                  Failed
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {summary.failed}
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900 mb-1">
                  Pass Rate
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {summary.passRate}%
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {results.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Validation Results
            </h3>
            
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Color Preview */}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-16 h-16 rounded border border-neutral-300 flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: result.background,
                          color: result.foreground,
                        }}
                      >
                        Aa
                      </div>
                    </div>

                    {/* Color Info */}
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900 mb-1">
                        {result.name}
                      </div>
                      <div className="text-sm text-neutral-600">
                        <span className="font-mono">{result.foreground}</span>
                        {' on '}
                        <span className="font-mono">{result.background}</span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        Type: {result.type === 'text' ? 'Text (4.5:1 required)' : 'UI Component (3:1 required)'}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      {getStatusBadge(result.passes, result.ratio)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Guidelines */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            WCAG 2.1 Level AA Guidelines
          </h3>
          <div className="space-y-3 text-sm text-neutral-600">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-neutral-900 min-w-[100px]">Text:</span>
              <span>Minimum contrast ratio of 4.5:1 for normal text (14pt+)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-neutral-900 min-w-[100px]">Large Text:</span>
              <span>Minimum contrast ratio of 3:1 for large text (18pt+ or 14pt+ bold)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-neutral-900 min-w-[100px]">UI Components:</span>
              <span>Minimum contrast ratio of 3:1 for interactive elements and graphics</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-neutral-900 min-w-[100px]">Level AAA:</span>
              <span>Enhanced contrast of 7:1 for normal text, 4.5:1 for large text (optional)</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ColorContrastValidator;
