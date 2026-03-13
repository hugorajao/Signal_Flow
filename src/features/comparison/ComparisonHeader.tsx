'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useBacktestStore } from '@/stores/backtestStore';

export default function ComparisonHeader() {
  const comparisonSlots = useBacktestStore((s) => s.comparisonSlots);
  const activeComparisonIds = useBacktestStore((s) => s.activeComparisonIds);
  const result = useBacktestStore((s) => s.result);
  const saveToComparison = useBacktestStore((s) => s.saveToComparison);
  const removeComparison = useBacktestStore((s) => s.removeComparison);
  const clearComparisons = useBacktestStore((s) => s.clearComparisons);
  const toggleComparisonActive = useBacktestStore((s) => s.toggleComparisonActive);
  const renameComparison = useBacktestStore((s) => s.renameComparison);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  const canSave = result !== null && comparisonSlots.length < 4;

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleStartEdit = useCallback((id: string, currentLabel: string) => {
    setEditingId(id);
    setEditValue(currentLabel);
  }, []);

  const handleFinishEdit = useCallback(() => {
    if (editingId && editValue.trim()) {
      renameComparison(editingId, editValue.trim());
    }
    setEditingId(null);
  }, [editingId, editValue, renameComparison]);

  const handleClearAll = useCallback(() => {
    if (!confirmClear) {
      setConfirmClear(true);
      clearTimeoutRef.current = setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearComparisons();
    setConfirmClear(false);
    if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
  }, [confirmClear, clearComparisons]);

  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 p-3 border-b border-zinc-800">
      <div className="flex items-center gap-2 flex-1 flex-wrap">
        {comparisonSlots.map((slot) => {
          const isActive = activeComparisonIds.includes(slot.id);
          const isEditing = editingId === slot.id;

          return (
            <div
              key={slot.id}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium
                border transition-all duration-150 cursor-pointer select-none
                ${isActive
                  ? 'border-zinc-700 bg-zinc-800/80 text-zinc-200'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-500'
                }
                hover:brightness-110 hover:scale-[1.02]
              `}
              onClick={() => {
                if (!isEditing) toggleComparisonActive(slot.id);
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: slot.color,
                  boxShadow: isActive ? `0 0 6px ${slot.color}66` : 'none',
                }}
              />

              {isEditing ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleFinishEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFinishEdit();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent border-none outline-none text-xs w-24 text-zinc-200"
                />
              ) : (
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(slot.id, slot.label);
                  }}
                  className="truncate max-w-[120px]"
                >
                  {slot.label}
                </span>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeComparison(slot.id);
                }}
                className="ml-0.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        <button
          onClick={() => saveToComparison()}
          disabled={!canSave}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium
                     border border-dashed border-zinc-700 text-zinc-400
                     hover:border-zinc-600 hover:text-zinc-300 transition-all duration-150
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-zinc-700"
          title={
            !result
              ? 'Run a backtest first'
              : comparisonSlots.length >= 4
                ? 'Remove a saved result to make room'
                : 'Save current result to comparison'
          }
        >
          <Plus className="w-3 h-3" />
          Save Current Run
        </button>
      </div>

      {comparisonSlots.length > 0 && (
        <button
          onClick={handleClearAll}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium
                      border transition-all duration-150
                      ${confirmClear
              ? 'border-red-500/50 bg-red-500/10 text-red-400'
              : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
            }`}
        >
          <Trash2 className="w-3 h-3" />
          {confirmClear ? 'Confirm?' : 'Clear All'}
        </button>
      )}
    </div>
  );
}
