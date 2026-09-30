'use client';

import React, { useState } from 'react';
import { useDocking } from '@/context/DockingContext';

export const SmilesInputModal: React.FC = () => {
  const { ui, toggleModal, importSmiles } = useDocking();
  const [smiles, setSmiles] = useState('');
  const [name, setName] = useState('');

  if (!ui.modals.smilesInput) return null;

  const presets = [
    {
      label: 'SARS-CoV-2 Nirmatrelvir Mimetic',
      name: 'Nirmatrelvir Analog-09',
      smiles: 'CC1(C2C1C(N(C2)C(=O)C(C(C)(C)C)NC(=O)C(F)(F)F)C(=O)NC(CC3CCNC3=O)C#N)C',
    },
    {
      label: 'GC376 Dipeptide Precursor',
      name: 'GC376 Derivative-X',
      smiles: 'CC(C)CC(NC(=O)OCC1=CC=CC=C1)C(=O)NC(CC2CCNC2=O)C(O)S(=O)(=O)O',
    },
    {
      label: 'Remdesivir Nucleoside Core',
      name: 'GS-441524 Adenosine Mimic',
      smiles: 'C1=C(C(=O)N2C(=C1)C=NC2=O)N3C(C(C(C3CO)O)O)C#N',
    },
    {
      label: 'Flavonoid Polyphenol Scaffold',
      name: 'Baicalein 3-OH Variant',
      smiles: 'O=C1C=C(OC2=C1C(=C(C=C2)O)O)C3=CC=CC=C3',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smiles.trim()) return;
    importSmiles(smiles, name.trim() || 'User Candidate');
    toggleModal('smilesInput', false);
    setSmiles('');
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs select-none">
      <div className="w-[560px] max-w-[95vw] bg-[#0E131A] border border-[#233144] rounded shadow-2xl flex flex-col overflow-hidden text-[#CBD5E0]">
        {/* Header */}
        <div className="p-3.5 bg-[#121922] border-b border-[#202C3C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#E9C46A]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#EDF2F7]">
              STAGE LIGAND VIA SMILES STRING
            </h3>
          </div>
          <button
            onClick={() => toggleModal('smilesInput', false)}
            className="text-xs font-mono text-[#8C9BAE] hover:text-[#EDF2F7] px-2 py-0.5 rounded hover:bg-[#1A2533]"
          >
            ✕ ESC
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#7395B8]">COMPOUND IDENTIFIER / NAME:</label>
            <input
              type="text"
              placeholder="e.g. Lead Candidate Alpha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#0B0F14] border border-[#1E2734] rounded px-2.5 py-1.5 text-xs font-mono text-[#EDF2F7] focus:outline-none focus:border-[#48CAE4]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#7395B8]">CANONICAL SMILES SPECIFICATION:</label>
            <textarea
              rows={3}
              placeholder="e.g. CC1(C2C1C(N(C2)C(=O)C(C(C)(C)C)NC(=O)C(F)(F)F)..."
              value={smiles}
              onChange={(e) => setSmiles(e.target.value)}
              required
              className="bg-[#0B0F14] border border-[#1E2734] rounded p-2 text-xs font-mono text-[#EDF2F7] focus:outline-none focus:border-[#48CAE4] resize-none"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[9px] font-mono text-[#63758A]">OR LOAD PHARMACOPHORE PRESET:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => {
                    setName(p.name);
                    setSmiles(p.smiles);
                  }}
                  className="p-1.5 rounded bg-[#121822] hover:bg-[#18212D] border border-[#1E2734] text-left text-[10px] font-mono text-[#8C9BAE] hover:text-[#EDF2F7] transition-colors"
                >
                  <div className="font-semibold text-[#CBD5E0] truncate">{p.name}</div>
                  <div className="text-[9px] text-[#63758A] truncate">{p.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1C2532]">
            <button
              type="button"
              onClick={() => toggleModal('smilesInput', false)}
              className="px-3 py-1.5 rounded text-xs font-mono text-[#8C9BAE] hover:text-[#EDF2F7] hover:bg-[#151D28]"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded text-xs font-mono font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm"
            >
              ADD TO SCREENING LIBRARY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
