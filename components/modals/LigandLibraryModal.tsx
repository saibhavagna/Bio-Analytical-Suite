'use client';

import React, { useState } from 'react';
import { useDocking } from '@/context/DockingContext';

export const LigandLibraryModal: React.FC = () => {
  const { ligands, selectedLigandId, selectLigand, toggleModal, ui } = useDocking();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'QUEUED'>('ALL');

  if (!ui.modals.ligandLibrary) return null;

  const filtered = ligands.filter((lig) => {
    const matchesSearch =
      lig.id.toLowerCase().includes(search.toLowerCase()) ||
      lig.name.toLowerCase().includes(search.toLowerCase()) ||
      lig.formula.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'ACTIVE' && lig.status === 'Active') ||
      (filter === 'QUEUED' && lig.status === 'Queued');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs select-none">
      <div className="w-[820px] max-w-[95vw] max-h-[85vh] bg-[#0E131A] border border-[#233144] rounded shadow-2xl flex flex-col overflow-hidden text-[#CBD5E0]">
        {/* Header */}
        <div className="p-3.5 bg-[#121922] border-b border-[#202C3C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#48CAE4]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#EDF2F7]">
              LIGAND SCREENING LIBRARY ({ligands.length} COMPOUNDS)
            </h3>
          </div>
          <button
            id="btn-close-library"
            onClick={() => toggleModal('ligandLibrary', false)}
            className="text-xs font-mono text-[#8C9BAE] hover:text-[#EDF2F7] px-2 py-0.5 rounded hover:bg-[#1A2533]"
          >
            ✕ ESC
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-[#0B0F14] border-b border-[#1C2532] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-[#63758A]">SEARCH:</span>
            <input
              type="text"
              placeholder="Search by ID, name, or formula..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-[#131A24] border border-[#1F2B3B] rounded px-2.5 py-1 text-xs text-[#EDF2F7] focus:outline-none focus:border-[#48CAE4]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#63758A]">FILTER:</span>
            {(['ALL', 'ACTIVE', 'QUEUED'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-2 py-0.5 rounded text-[10px] ${
                  filter === mode
                    ? 'bg-[#1C2C3F] text-[#48CAE4] font-semibold border border-[#2C496A]'
                    : 'text-[#8C9BAE] hover:text-[#EDF2F7]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          <table className="w-full text-left text-[11px] font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#1C2532] text-[#63758A] text-[10px]">
                <th className="pb-2 font-medium">ID</th>
                <th className="pb-2 font-medium">COMPOUND NAME</th>
                <th className="pb-2 font-medium">FORMULA</th>
                <th className="pb-2 font-medium text-right">MW (g/mol)</th>
                <th className="pb-2 font-medium text-right">LOGP</th>
                <th className="pb-2 font-medium text-right">TPSA (Å²)</th>
                <th className="pb-2 font-medium text-center">ROTB</th>
                <th className="pb-2 font-medium text-center">STATUS</th>
                <th className="pb-2 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151C26]">
              {filtered.map((lig) => {
                const isActive = lig.id === selectedLigandId;
                return (
                  <tr
                    key={lig.id}
                    className={`hover:bg-[#141C27] transition-colors ${
                      isActive ? 'bg-[#172230]' : ''
                    }`}
                  >
                    <td className="py-2.5 font-semibold text-[#E9C46A]">{lig.id}</td>
                    <td className="py-2.5 text-[#EDF2F7] max-w-[200px] truncate">{lig.name}</td>
                    <td className="py-2.5 text-[#8C9BAE]">{lig.formula}</td>
                    <td className="py-2.5 text-right text-[#CBD5E0]">{lig.molecularWeight}</td>
                    <td className="py-2.5 text-right text-[#48CAE4]">{lig.logP}</td>
                    <td className="py-2.5 text-right text-[#7395B8]">{lig.tpsa}</td>
                    <td className="py-2.5 text-center text-[#A0AEC0]">{lig.rotatableBonds}</td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                          isActive
                            ? 'bg-[#153428] text-[#4FAE7B] border border-[#216147]'
                            : 'bg-[#161F2B] text-[#7395B8]'
                        }`}
                      >
                        {isActive ? 'ACTIVE' : 'QUEUED'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      {isActive ? (
                        <span className="text-[10px] text-[#4FAE7B] font-semibold">SELECTED</span>
                      ) : (
                        <button
                          id={`btn-select-ligand-${lig.id}`}
                          onClick={() => {
                            selectLigand(lig.id);
                            toggleModal('ligandLibrary', false);
                          }}
                          className="px-2 py-0.5 rounded bg-[#1C2C3F] border border-[#2B4B6F] text-[#48CAE4] hover:bg-[#253D57] transition-colors text-[10px]"
                        >
                          SELECT
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0B0F14] border-t border-[#1C2532] flex items-center justify-between text-[11px] font-mono text-[#63758A]">
          <span>Showing {filtered.length} of {ligands.length} chemical structures</span>
          <button
            onClick={() => toggleModal('ligandLibrary', false)}
            className="px-3 py-1 rounded bg-[#1A232E] hover:bg-[#223040] text-[#EDF2F7] text-xs transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
