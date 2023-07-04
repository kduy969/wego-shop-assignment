import { RefObject, useEffect } from "react";
import { TLoadingBy } from "./use-products-by-range";

export function useScrollTopOnNextPageLoaded(
  loadingProduct: boolean,
  loadingBy: TLoadingBy,
  productError: string,
  scrollRef: RefObject<HTMLElement>
) {
  useEffect(() => {
    // scroll to top if load new products successfully from "nextPage" action
    if (!loadingProduct && loadingBy === "nextPage" && !productError) {
      setTimeout(() => {
        scrollRef.current?.scrollTo?.({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }, 500);
    }
  }, [loadingProduct]);
}
