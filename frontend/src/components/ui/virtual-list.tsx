import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscanCount?: number;
  itemKey?: (item: T, index: number) => string | number;
}

function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  className,
  overscanCount = 5,
  itemKey = (_, index) => index,
}: VirtualListProps<T>) {
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => (
      <div style={style}>
        {renderItem(items[index], index)}
      </div>
    ),
    [items, renderItem]
  );

  const getItemKey = useCallback(
    (index: number) => itemKey(items[index], index),
    [items, itemKey]
  );

  return (
    <div className={cn('overflow-hidden', className)}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        overscanCount={overscanCount}
        itemKey={getItemKey}
      >
        {Row}
      </List>
    </div>
  );
}

// Memoized version for better performance
export const MemoizedVirtualList = React.memo(VirtualList) as typeof VirtualList;

export default VirtualList;
