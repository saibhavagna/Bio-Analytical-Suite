'use client';

import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import {
  SCIENTIFIC_METRICS,
  ScientificMetricInfo,
} from '@/lib/scientificMetrics';
import { HelpCircle, Info, ExternalLink, Zap } from 'lucide-react';

interface ScientificTooltipProps {
  metricId?: keyof typeof SCIENTIFIC_METRICS | string;
  customInfo?: Partial<ScientificMetricInfo>;
  children?: ReactNode;
  showIcon?: boolean;
  iconOnly?: boolean;
  underline?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  className?: string;
}

export const ScientificTooltip: React.FC<ScientificTooltipProps> = ({
  metricId,
  customInfo,
  children,
  showIcon = false,
  iconOnly = false,
  underline = false,
  position = 'auto',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'top' | 'bottom' | 'left' | 'right' }>({
    top: 0,
    left: 0,
    placement: 'top',
  });

  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const metric: ScientificMetricInfo | undefined =
    metricId && SCIENTIFIC_METRICS[metricId]
      ? { ...SCIENTIFIC_METRICS[metricId], ...customInfo }
      : (customInfo as ScientificMetricInfo) || undefined;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 340;
    const tooltipHeight = 260; // Estimated height for clamping
    const margin = 8;

    let computedPlacement: 'top' | 'bottom' | 'left' | 'right' = 'top';

    if (position === 'auto') {
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      if (spaceAbove < tooltipHeight + margin && spaceBelow > spaceAbove) {
        computedPlacement = 'bottom';
      } else if (spaceRight > tooltipWidth + margin && rect.top > 100) {
        computedPlacement = 'right';
      } else if (spaceLeft > tooltipWidth + margin) {
        computedPlacement = 'left';
      } else {
        computedPlacement = 'top';
      }
    } else {
      computedPlacement = position;
    }

    let top = 0;
    let left = 0;

    if (computedPlacement === 'top') {
      top = rect.top - margin;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (computedPlacement === 'bottom') {
      top = rect.bottom + margin;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (computedPlacement === 'left') {
      top = rect.top + rect.height / 2 - 80;
      left = rect.left - tooltipWidth - margin;
    } else if (computedPlacement === 'right') {
      top = rect.top + rect.height / 2 - 80;
      left = rect.right + margin;
    }

    // Clamp horizontally within viewport
    if (left < 12) left = 12;
    if (left + tooltipWidth > window.innerWidth - 12) {
      left = window.innerWidth - tooltipWidth - 12;
    }

    // Clamp vertically within viewport
    if (top < 12) top = 12;

    setCoords({ top, left, placement: computedPlacement });
  }, [position]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsOpen(true);
    }, 140);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const handleFocus = () => {
    updatePosition();
    setIsOpen(true);
  };

  const handleBlur = () => {
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleScrollOrResize = () => {
      if (isOpen) {
        updatePosition();
      }
    };
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen, updatePosition]);

  if (!metric) {
    return <span className={className}>{children}</span>;
  }

  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    Energetics: { bg: 'bg-[#182B24]', text: 'text-[#4FAE7B]', border: 'border-[#245442]' },
    Conformation: { bg: 'bg-[#18263A]', text: 'text-[#48CAE4]', border: 'border-[#233F63]' },
    Interactions: { bg: 'bg-[#2E2818]', text: 'text-[#E9C46A]', border: 'border-[#4D4122]' },
    Efficiency: { bg: 'bg-[#291B2F]', text: 'text-[#D084F5]', border: 'border-[#4D2D59]' },
    ADMET: { bg: 'bg-[#1E252F]', text: 'text-[#94A3B8]', border: 'border-[#334155]' },
  };

  const catStyle = categoryColors[metric.category] || categoryColors.Energetics;

  return (
    <span
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={`Scientific explanation for ${metric.name}`}
      className={`inline-flex items-center gap-1 cursor-help outline-none transition-colors ${
        underline ? 'border-b border-dashed border-[#48CAE4]/60 hover:border-[#48CAE4]' : ''
      } ${className}`}
    >
      {!iconOnly && children}
      {(showIcon || iconOnly) && (
        <HelpCircle className="w-3 h-3 text-[#64748B] hover:text-[#48CAE4] transition-colors inline-block flex-shrink-0" />
      )}

      {/* Floating Tooltip Portal */}
      {isOpen && (
        <div
          ref={tooltipRef}
          role="tooltip"
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setIsOpen(true);
          }}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            zIndex: 99999,
          }}
          className="w-[340px] max-w-[90vw] bg-[#0A0E15] text-[#EDF2F7] border border-[#233246] rounded-md shadow-2xl p-3.5 flex flex-col gap-2.5 text-left font-sans select-text pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Bar */}
          <div className="flex items-start justify-between border-b border-[#1A2636] pb-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold text-[#F1F5F9] tracking-tight">
                  {metric.name}
                </span>
                {metric.symbol && (
                  <span className="font-mono text-[11px] font-bold text-[#48CAE4] bg-[#0E1E2E] px-1.5 py-0.2 rounded border border-[#1E3A5F]">
                    {metric.symbol}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-[#64748B] flex items-center gap-1 mt-0.5">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                  {metric.category}
                </span>
                <span>• Units:</span>
                <span className="text-[#E9C46A] font-semibold">{metric.unit}</span>
              </span>
            </div>

            <Info className="w-3.5 h-3.5 text-[#7395B8] flex-shrink-0 mt-0.5" />
          </div>

          {/* Unit Conversion / Scientific Scale if present */}
          {metric.unitConversion && (
            <div className="bg-[#0D1520] border border-[#182638] px-2 py-1 rounded text-[10px] font-mono text-[#48CAE4] flex items-center justify-between">
              <span className="text-[#64748B]">CONVERSION:</span>
              <span className="font-semibold">{metric.unitConversion}</span>
            </div>
          )}

          {/* Core Definition */}
          <div className="text-[11px] text-[#CBD5E1] leading-relaxed">
            {metric.definition}
          </div>

          {/* Physical Meaning & Thermodynamic Intuition */}
          <div className="bg-[#0B1017] p-2 rounded border border-[#15212F] flex flex-col gap-1 text-[10px]">
            <div className="flex items-center gap-1 text-[#48CAE4] font-mono font-semibold text-[10px]">
              <Zap className="w-3 h-3 text-[#E9C46A]" />
              PHYSICAL SIGNIFICANCE & INTERPRETATION:
            </div>
            <p className="text-[#94A3B8] leading-normal font-sans">
              {metric.physicalMeaning}
            </p>
            <p className="text-[#A0AEC0] leading-normal font-sans mt-0.5">
              {metric.interpretation}
            </p>
          </div>

          {/* Mathematical Formula */}
          {metric.formula && (
            <div className="bg-[#070A0F] px-2 py-1.5 rounded border border-[#172230] font-mono text-[10px] text-[#4FAE7B] flex flex-col gap-0.5">
              <span className="text-[9px] text-[#64748B] uppercase font-sans">FORMULATION:</span>
              <span className="font-semibold tracking-wide overflow-x-auto">{metric.formula}</span>
            </div>
          )}

          {/* Target Benchmark Scale */}
          {metric.targetBenchmark && (
            <div className="flex items-start gap-1.5 pt-0.5 text-[10px] font-mono">
              <span className="text-[#64748B] flex-shrink-0">BENCHMARK:</span>
              <span className="text-[#E9C46A] font-medium leading-tight">
                {metric.targetBenchmark}
              </span>
            </div>
          )}

          {/* Clinical & Pharmacological Relevance */}
          {metric.clinicalRelevance && (
            <div className="text-[10px] text-[#7395B8] italic border-t border-[#16202C] pt-1.5 leading-tight">
              {metric.clinicalRelevance}
            </div>
          )}

          {/* Tooltip Footer Info */}
          <div className="text-[9px] font-mono text-[#475569] flex items-center justify-between border-t border-[#131A24] pt-1 mt-0.5">
            <span>OrthoBond In Silico Core</span>
            <span>ESC to dismiss</span>
          </div>
        </div>
      )}
    </span>
  );
};

export const MetricHelpIcon: React.FC<{
  metricId: keyof typeof SCIENTIFIC_METRICS | string;
  customInfo?: Partial<ScientificMetricInfo>;
  className?: string;
}> = ({ metricId, customInfo, className = 'ml-1 inline-flex' }) => {
  return (
    <ScientificTooltip
      metricId={metricId}
      customInfo={customInfo}
      iconOnly
      className={className}
    />
  );
};
