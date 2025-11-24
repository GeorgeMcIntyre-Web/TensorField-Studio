import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Download, Upload, ClipboardCopy, X } from 'lucide-react';

export const SnapshotControls: React.FC = () => {
  const { snapshots, saveSnapshot, loadSnapshot, exportSnapshotJSON, importSnapshotJSON } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [saveLabel, setSaveLabel] = useState("");

  const handleExport = (id: string) => {
      const json = exportSnapshotJSON(id);
      if (json) {
          navigator.clipboard.writeText(json);
          alert("Snapshot JSON copied to clipboard!");
      }
  };

  const handleImport = () => {
      if (!importText.trim()) return;
      const success = importSnapshotJSON(importText);
      if (success) {
          setImportText("");
          alert("Snapshot imported successfully.");
      } else {
          alert("Failed to import. Check JSON format.");
      }
  };

  const handleSave = () => {
      saveSnapshot(saveLabel || `Snapshot ${snapshots.length + 1}`);
      setSaveLabel("");
  };

  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)}
            className="absolute top-20 right-4 bg-slate-800 text-slate-300 p-2 rounded-md hover:bg-slate-700 shadow-lg text-xs flex items-center gap-2 pointer-events-auto"
          >
              <Download size={14} /> Snapshots
          </button>
      );
  }

  return (
    <div className="absolute top-20 right-4 w-64 bg-slate-900/95 border border-slate-700 p-4 rounded-lg shadow-2xl text-xs backdrop-blur-sm z-50 pointer-events-auto">
       <div className="flex justify-between items-center mb-3">
           <h3 className="font-bold text-indigo-300">Snapshots</h3>
           <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white"><X size={14} /></button>
       </div>

       {/* Save Input */}
       <div className="flex gap-2 mb-4 border-b border-slate-700 pb-2">
           <input 
             type="text" 
             placeholder="Label..." 
             className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-300"
             value={saveLabel}
             onChange={(e) => setSaveLabel(e.target.value)}
           />
           <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 rounded">Save</button>
       </div>

       {/* List */}
       <div className="max-h-32 overflow-y-auto mb-4 space-y-2 border-b border-slate-700 pb-2">
           {snapshots.length === 0 && <p className="text-slate-500 italic">No snapshots saved.</p>}
           {snapshots.map(snap => (
               <div key={snap.id} className="bg-slate-800 p-2 rounded flex justify-between items-center group">
                   <div className="flex flex-col overflow-hidden mr-2">
                        <span className="font-bold text-slate-200 truncate">{snap.label}</span>
                        <span className="text-[9px] text-slate-500">{new Date(snap.date).toLocaleTimeString()}</span>
                   </div>
                   <div className="flex gap-1 shrink-0">
                       <button onClick={() => loadSnapshot(snap.id)} className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px]">Load</button>
                       <button onClick={() => handleExport(snap.id)} className="p-1 text-slate-400 hover:text-white" title="Copy JSON"><ClipboardCopy size={12} /></button>
                   </div>
               </div>
           ))}
       </div>

       {/* Import */}
       <div>
           <label className="block text-slate-400 mb-1">Import JSON</label>
           <textarea 
             className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-[10px] h-16 mb-2 font-mono text-slate-300"
             value={importText}
             onChange={(e) => setImportText(e.target.value)}
             placeholder='Paste JSON here...'
           />
           <button 
             onClick={handleImport}
             className="w-full bg-slate-700 hover:bg-slate-600 text-white py-1 rounded flex items-center justify-center gap-2"
           >
               <Upload size={12} /> Import
           </button>
       </div>
    </div>
  );
};
