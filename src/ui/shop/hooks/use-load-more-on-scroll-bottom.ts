import { useCallback } from "react";
import { useScrollToBottom } from "../../../hooks/useScrollToBottom";

export function useLoadMoreOnScrollBottom(
  showMore: boolean,
  onLoadMore: () => void
) {
  const onHitBottom = useCallback(() => {
    if (showMore) onLoadMore();
  }, [showMore]);
  return useScrollToBottom(onHitBottom);
}
