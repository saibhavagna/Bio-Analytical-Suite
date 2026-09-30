'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { EnergyProfile } from '@/types/docking';

interface Props {
  profile: EnergyProfile;
}

export const EnergyDecompositionChart: React.FC<Props> = ({ profile }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 310;
    const height = 150;
    const margin = { top: 18, right: 12, bottom: 26, left: 68 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const data = [
      { name: 'vdW', value: profile.vdw, color: '#38A169', type: 'favorable' },
      { name: 'Electrostatic', value: profile.electrostatic, color: '#48CAE4', type: 'favorable' },
      { name: 'H-Bonding', value: profile.hBonding, color: '#00B4D8', type: 'favorable' },
      { name: 'Desolvation', value: profile.desolvation, color: '#E76F51', type: 'unfavorable' },
      { name: 'Torsional', value: profile.ligandStrain, color: '#F4A261', type: 'unfavorable' },
      { name: 'Net ΔG', value: profile.deltaG, color: '#E9C46A', type: 'net' },
    ];

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Y scale (categories)
    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, innerHeight])
      .padding(0.24);

    // X scale (kcal/mol values, ranging from negative to positive)
    const minVal = Math.min(-10, d3.min(data, (d) => d.value) || -10);
    const maxVal = Math.max(4, d3.max(data, (d) => d.value) || 4);

    const x = d3.scaleLinear().domain([minVal, maxVal]).nice().range([0, innerWidth]);

    // Zero reference line
    g.append('line')
      .attr('x1', x(0))
      .attr('x2', x(0))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#334155')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '2,2');

    // Horizontal bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => y(d.name) || 0)
      .attr('height', y.bandwidth())
      .attr('x', (d) => (d.value < 0 ? x(d.value) : x(0)))
      .attr('width', (d) => Math.abs(x(d.value) - x(0)))
      .attr('fill', (d) => d.color)
      .attr('rx', 2);

    // Value text badges next to bars
    g.selectAll('.val-text')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'val-text')
      .attr('y', (d) => (y(d.name) || 0) + y.bandwidth() / 2 + 3.5)
      .attr('x', (d) => (d.value < 0 ? x(d.value) - 4 : x(d.value) + 4))
      .attr('text-anchor', (d) => (d.value < 0 ? 'end' : 'start'))
      .attr('fill', '#CBD5E0')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .text((d) => `${d.value > 0 ? '+' : ''}${d.value.toFixed(1)}`);

    // Y Axis labels
    g.append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .call((axis) => axis.select('.domain').remove())
      .selectAll('text')
      .attr('fill', '#94A3B8')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace');

    // Bottom X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickFormat((d) => `${d}`)
      )
      .call((axis) => axis.select('.domain').attr('stroke', '#334155'))
      .selectAll('text')
      .attr('fill', '#64748B')
      .attr('font-size', '8px')
      .attr('font-family', 'monospace');

    // Title / Unit
    svg
      .append('text')
      .attr('x', width - 12)
      .attr('y', 11)
      .attr('text-anchor', 'end')
      .attr('fill', '#64748B')
      .attr('font-size', '8px')
      .attr('font-family', 'monospace')
      .text('kcal/mol');
  }, [profile]);

  return (
    <div className="w-full flex justify-center bg-[#0B0F14] rounded p-1 border border-[#18212C]">
      <svg ref={svgRef} width={310} height={150} className="overflow-visible" />
    </div>
  );
};
