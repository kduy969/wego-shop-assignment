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
): [TProduct[], number, string, boolean, TLoadingBy, () => void] => {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingBy, setLoadingBy] = useState<TLoadingBy>("takeMore");

  // update this variable to reSync the product list due to last sync failed
  const [reSyncId, setReSyncId] = useState(0);
  const reSync = () => {
    setReSyncId((r) => r + 1);
  };

  const previousTake = usePrevious(take);
  const previousCategoryId = usePrevious(categoryId);
  const previousFilter = usePrevious(filter);
  const previousPage = usePrevious(pageIndex);
  const previousSyncId = usePrevious(reSyncId);

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
        const isReSync =
          previousSyncId !== undefined && reSyncId !== previousSyncId;

        const tmpLoadingBy =
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

        // reserve loadingBy on Resync
        const nextLoadingBy = isReSync ? loadingBy : tmpLoadingBy;

        setLoadingBy(nextLoadingBy);
        setLoading(true);
        if (nextLoadingBy === "takeMore") {
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
            setError("");
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
            setError("");
          }
        }
      } catch (e: any) {
        console.log("error", e?.message);
        if (myJobId === latestJobId.current)
          setError("Please check your connection and try again later.");
      } finally {
        if (myJobId === latestJobId.current) setLoading(false);
      }
    })();
  }, [take, pageIndex, filter, categoryId, reSyncId]);
  return [products, total, error, loading, loadingBy, reSync];
};
