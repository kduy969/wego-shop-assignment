import { RefObject, useEffect } from "react";
import { TLoadingBy } from "./use-products-by-range";

export function useScrollTopOnNextPageLoaded(
  loadingProduct: boolean,
  loadingBy: TLoadingBy,
  scrollRef: RefObject<HTMLElement>
) {
  useEffect(() => {
    if (!loadingProduct && loadingBy === "nextPage") {
      scrollRef.current?.scrollTo?.({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [loadingProduct]);
}
