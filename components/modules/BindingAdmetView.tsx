'use client';

import React, { useState } from 'react';
import { useDocking } from '@/context/DockingContext';
import { getAdmetForLigand } from '@/data/initialData';

export const BindingAdmetView: React.FC = () => {
  const { ligands, selectedLigandId, selectLigand, setUI } = useDocking();
  const [filterMode, setFilterMode] = useState<'ALL' | 'LIPINSKI_PASS' | 'HIGH_AFFINITY'>('ALL');

  const ligandsWithAdmet = ligands.map((l) => ({
    ...l,
    admet: getAdmetForLigand(l),
  }));

  const filtered = ligandsWithAdmet.filter((item) => {
    if (filterMode === 'LIPINSKI_PASS') return item.admet.lipinskiPass;
    if (filterMode === 'HIGH_AFFINITY') return item.molecularWeight < 450 && item.logP < 3.5;
    return true;
  });

  return (
    <div className="flex-1 h-full bg-[#0B0F14] p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5 text-[#CBD5E0]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1C2532]">
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#EDF2F7]">
            BINDING CANDIDATE LIBRARY & IN SILICO ADMET COMPARISON
          </h2>
          <p className="text-xs text-[#7395B8] mt-0.5">
            Physicochemical profiles, Lipinski Rule of 5 bioavailability, and toxicity classification
            across {ligands.length} screening molecules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1 rounded text-xs font-mono ${
              filterMode === 'ALL'
                ? 'bg-[#1C2C3F] text-[#48CAE4] border border-[#2B4B6F]'
                : 'text-[#8C9BAE] hover:text-[#EDF2F7]'
            }`}
          >
            ALL ({ligands.length})
          </button>
          <button
            onClick={() => setFilterMode('LIPINSKI_PASS')}
            className={`px-3 py-1 rounded text-xs font-mono ${
              filterMode === 'LIPINSKI_PASS'
                ? 'bg-[#1C2C3F] text-[#48CAE4] border border-[#2B4B6F]'
                : 'text-[#8C9BAE] hover:text-[#EDF2F7]'
            }`}
          >
            LIPINSKI COMPLIANT
          </button>
          <button
            onClick={() => setFilterMode('HIGH_AFFINITY')}
            className={`px-3 py-1 rounded text-xs font-mono ${
              filterMode === 'HIGH_AFFINITY'
                ? 'bg-[#1C2C3F] text-[#48CAE4] border border-[#2B4B6F]'
                : 'text-[#8C9BAE] hover:text-[#EDF2F7]'
            }`}
          >
            LEAD-LIKE SCAFFOLDS
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="bg-[#0E131A] rounded border border-[#1C2532] overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-[#121922] border-b border-[#1C2532] text-[#7395B8] text-[10px]">
              <th className="p-3">ID</th>
              <th className="p-3">COMPOUND</th>
              <th className="p-3 text-right">MW (g/mol)</th>
              <th className="p-3 text-right">LOGP</th>
              <th className="p-3 text-right">TPSA (Å²)</th>
              <th className="p-3 text-center">HBD / HBA</th>
              <th className="p-3 text-center">ABSORPTION</th>
              <th className="p-3 text-center">METABOLISM</th>
              <th className="p-3 text-center">TOXICITY</th>
              <th className="p-3 text-center">LIPINSKI</th>
              <th className="p-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151C26]">
            {filtered.map((item) => {
              const isSelected = item.id === selectedLigandId;
              return (
                <tr
                  key={item.id}
                  className={`hover:bg-[#141C27] transition-colors ${
                    isSelected ? 'bg-[#182332]' : ''
                  }`}
                >
                  <td className="p-3 font-semibold text-[#E9C46A]">{item.id}</td>
                  <td className="p-3 text-[#EDF2F7] max-w-[220px]">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-[10px] text-[#7395B8] truncate">{item.formula}</div>
                  </td>
                  <td className="p-3 text-right text-[#CBD5E0]">{item.molecularWeight}</td>
                  <td className="p-3 text-right text-[#48CAE4]">{item.logP}</td>
                  <td className="p-3 text-right text-[#7395B8]">{item.tpsa}</td>
                  <td className="p-3 text-center text-[#A0AEC0]">
                    {item.hbd} / {item.hba}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        item.admet.absorption === 'High'
                          ? 'bg-[#132A1F] text-[#4FAE7B]'
                          : 'bg-[#2A2312] text-[#E9C46A]'
                      }`}
                    >
                      {item.admet.absorption}
                    </span>
                  </td>
                  <td className="p-3 text-center text-[#A0AEC0]">{item.admet.metabolism}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        item.admet.toxicity === 'Low'
                          ? 'text-[#4FAE7B]'
                          : item.admet.toxicity === 'Moderate'
                          ? 'text-[#E9C46A]'
                          : 'text-[#E76F51]'
                      }`}
                    >
                      {item.admet.toxicity}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.admet.lipinskiPass
                          ? 'bg-[#142E21] text-[#4FAE7B] border border-[#23583E]'
                          : 'bg-[#331C1A] text-[#E76F51] border border-[#632924]'
                      }`}
                    >
                      {item.admet.lipinskiPass ? 'PASS' : `${item.admet.lipinskiViolations} VIOL`}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        selectLigand(item.id);
                        setUI((prev) => ({ ...prev, activeModule: 'workspace' }));
                      }}
                      className="px-2.5 py-1 rounded bg-[#1C2C3F] border border-[#2B4B6F] text-[#48CAE4] hover:bg-[#253D57] transition-colors text-[10px] font-semibold"
                    >
                      LOAD IN 3D
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
