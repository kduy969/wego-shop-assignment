import { useCallback } from "react";
import { useScrollToBottom } from "../../../hooks/useScrollToBottom";

export function useLoadMoreOnScrollBottom(
  loadingProduct: boolean,
  showMore: boolean,
  onLoadMore: () => void
) {
  const onHitBottom = useCallback(() => {
    // isLoading -> ignore
    if (loadingProduct) return;
    // can't loadmore -> ignore
    if (!showMore) return;
    onLoadMore();
  }, [showMore, loadingProduct]);
  return useScrollToBottom(onHitBottom);
}
