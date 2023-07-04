import { useEffect, useRef, useState } from "react";
import { TCategory, TProduct } from "../../../api/types";
import { Service } from "../../../service";
import { usePrevious } from "../../../hooks/usePrevious";
import { ShopConfig } from "../config";

export type TLoadingBy =
  | "nextPage"
  | "takeMore"
  | "category"
  | "filter"
  | "initial";

export const useProductsByRange = (
  pageIndex: number,
  take: number,
  filter: string | undefined,
  categoryId: string | undefined
): [TProduct[], number, string, boolean, TLoadingBy] => {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingBy, setLoadingBy] = useState<TLoadingBy>("takeMore");
  const previousTake = usePrevious(take);
  const previousCategoryId = usePrevious(categoryId);
  const previousFilter = usePrevious(filter);
  const previousPage = usePrevious(pageIndex);

  // save the latest running job id -> ignore job result if jobId !== latestJobId
  const latestJobId = useRef<number>(0);

  useEffect(() => {
    (async () => {
      const myJobId = latestJobId.current + 1;
      latestJobId.current = myJobId;
      try {
        // console.log("query for", {
        //   take,
        //   filter,
        //   categoryId,
        //   previousTake,
        //   previousCategoryId,
        //   previousFilter,
        // });
        const loadingByTemp =
          !previousTake &&
          !previousCategoryId &&
          !previousFilter &&
          !previousPage // no previous data -> initial loading
            ? "initial"
            : (previousTake || 0) < take // when user what to take more item
            ? "takeMore"
            : (previousPage || 0) < pageIndex // when user press load next page
            ? "nextPage"
            : previousCategoryId !== categoryId // when user change category
            ? "category"
            : previousFilter !== filter // when user change filter
            ? "filter"
            : "initial";
        setLoadingBy(loadingByTemp);
        setLoading(true);
        if (loadingByTemp === "takeMore") {
          // only load new items from last position
          const { products: additionalItems, total: newTotal } =
            await Service.API.getProductsByRange(
              pageIndex * ShopConfig.PageSize + (previousTake || 0),
              take - (previousTake || 0),
              filter,
              categoryId
            );
          if (myJobId === latestJobId.current) {
            setProducts(products.concat(additionalItems));
            setTotal(newTotal);
          }
        } else {
          // for every other case, load from beginning of current page
          const { products: newItems, total: newTotal } =
            await Service.API.getProductsByRange(
              pageIndex * ShopConfig.PageSize,
              take,
              filter,
              categoryId
            );
          if (myJobId === latestJobId.current) {
            setProducts(newItems);
            setTotal(newTotal);
          }
        }
      } catch (e: any) {
        console.log("error", e?.message);
        if (myJobId === latestJobId.current) setError("Cannot load products");
      } finally {
        if (myJobId === latestJobId.current) setLoading(false);
      }
    })();
  }, [take, pageIndex, filter, categoryId]);
  return [products, total, error, loading, loadingBy];
};
