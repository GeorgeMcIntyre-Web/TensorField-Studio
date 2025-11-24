import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppMode } from '../types';
import clsx from 'clsx';

export const Navigation: React.FC = () => {
  const { mode, setMode } = useAppStore();

  const navItems = [
    { label: 'Tensor Sandbox', value: AppMode.SANDBOX },
    { label: 'Mechanics Mode', value: AppMode.MECHANICS },
    { label: 'Relativity Mode', value: AppMode.RELATIVITY },
  ];

  return (
    <nav className="h-14 border-b border-slate-800 bg-slate-900 flex items-center px-6 gap-6 shadow-sm z-50 relative">
      <div className="font-bold text-lg text-indigo-400 tracking-tight mr-4">
        TensorField<span className="text-white">Studio</span>
      </div>
      {navItems.map((item) => (
        <button
          key={item.value}
          onClick={() => setMode(item.value)}
          className={clsx(
            "text-sm font-medium transition-colors hover:text-white px-3 py-1 rounded-md",
            mode === item.value 
              ? "bg-slate-800 text-white" 
              : "text-slate-400"
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};