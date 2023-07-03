import { useEffect, useRef, useState } from "react";
import { TCategory, TProduct } from "../../../api/types";
import { Service } from "../../../service";
import { usePrevious } from "../../../hooks/usePrevious";

type TLoadingBy = "takeMore" | "category" | "filter" | "initial";

export const useProductsByRange = (
  skip: number,
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

  // save the latest running job id -> ignore job result if jobId !== latestJobId
  const latestJobId = useRef<number>(0);

  useEffect(() => {
    (async () => {
      const myJobId = latestJobId.current + 1;
      latestJobId.current = myJobId;
      try {
        const loadingByTemp =
          !previousTake && !previousCategoryId && !previousFilter // no previous data -> initial loading
            ? "initial"
            : (previousTake || 0) < take // when user what to take more item
            ? "takeMore"
            : previousCategoryId !== categoryId // when user change category
            ? "category"
            : previousFilter !== filter // when user change filter
            ? "filter"
            : "initial";
        setLoadingBy(loadingByTemp);
        setLoading(true);
        if (loadingBy === "takeMore") {
          // only load new items from last position
          const { products: additionalItems, total: newTotal } =
            await Service.API.getProductsByRange(
              previousTake || 0,
              take - (previousTake || 0),
              filter,
              categoryId
            );
          if (myJobId === latestJobId.current) {
            setProducts(products.concat(additionalItems));
            setTotal(newTotal);
          }
        } else {
          // load from beginning
          const { products: newItems, total: newTotal } =
            await Service.API.getProductsByRange(
              skip,
              take,
              filter,
              categoryId
            );
          if (myJobId === latestJobId.current) {
            setProducts(newItems);
            setTotal(newTotal);
          }
        }
      } catch (e) {
        if (myJobId === latestJobId.current) setError("Cannot load products");
      } finally {
        if (myJobId === latestJobId.current) setLoading(false);
      }
    })();
  }, [skip, take, filter, categoryId]);
  return [products, total, error, loading, loadingBy];
};
