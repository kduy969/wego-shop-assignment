import { RefObject, useCallback } from "react";
import { useScrollToBottom } from "../../../hooks/use-scroll-to-bottom";

export function useLoadMoreOnScrollBottom(
  scrollRef: RefObject<HTMLElement>,
  showMore: boolean,
  onLoadMore: () => void
) {
  const onHitBottom = useCallback(() => {
    if (showMore) onLoadMore();
  }, [showMore]);
  return useScrollToBottom(scrollRef, onHitBottom, 50);
}
