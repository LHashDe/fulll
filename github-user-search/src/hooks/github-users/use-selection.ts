import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

type UseSelectionOptions = {
  onSelectionChange?: (selectedIds: Set<string>) => void;
};

type UseSelectionReturn = {
  selectedIds: Set<string>;
  selectedCount: number;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  isNoneSelected: boolean;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleSelectAll: () => void;
  isSelected: (id: string) => boolean;
  reset: () => void;
};

//custom hook to manage the selection of items
export function useSelection<T extends { internalId: string }>(
  items: T[],
  options?: UseSelectionOptions
): UseSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const itemsRef = useRef(items);
  const onChangeRef = useRef(options?.onSelectionChange);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    onChangeRef.current = options?.onSelectionChange;
  }, [options?.onSelectionChange]);

  const updateSelection = useCallback((updater: (prev: Set<string>) => Set<string>) => {
    setSelectedIds(prev => {
      const next = updater(prev);
      onChangeRef.current?.(next);
      return next;
    });
  }, []);

  const toggleSelection = useCallback((id: string) => {
    updateSelection(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, [updateSelection]);

  const selectAll = useCallback(() => {
    updateSelection(() => new Set(itemsRef.current.map(item => item.internalId)));
  }, [updateSelection]);

  const deselectAll = useCallback(() => {
    updateSelection(() => new Set());
  }, [updateSelection]);

  const toggleSelectAll = useCallback(() => {
    updateSelection(prev => {
      if (prev.size === itemsRef.current.length) {
        return new Set();
      }
      return new Set(itemsRef.current.map(item => item.internalId));
    });
  }, [updateSelection]);

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const reset = useCallback(() => {
    updateSelection(() => new Set());
  }, [updateSelection]);

  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedIds.size === items.length;
  }, [items.length, selectedIds.size]);

  const isPartiallySelected = useMemo(() => {
    return selectedIds.size > 0 && selectedIds.size < items.length;
  }, [selectedIds.size, items.length]);

  const isNoneSelected = useMemo(() => {
    return selectedIds.size === 0;
  }, [selectedIds.size]);

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    isAllSelected,
    isPartiallySelected,
    isNoneSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleSelectAll,
    isSelected,
    reset,
  };
}
