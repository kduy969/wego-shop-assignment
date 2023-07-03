import { useEffect, useState } from "react";
import { TCategory, TProduct } from "../../../api/types";
import { Service } from "../../../service";
import { usePrevious } from "../../../hooks/usePrevious";

type TLoadingBy = "takeMore" | "category" | "filter" | "initial";

export const useProductsByRange = (
  start: number,
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
  useEffect(() => {
    (async () => {
      try {
        setLoadingBy(
          !previousTake && !previousCategoryId && !previousFilter // no previous data -> initial loading
            ? "initial"
            : (previousTake || 0) < take // when user what to take more item
            ? "takeMore"
            : previousCategoryId !== categoryId // when user change category
            ? "category"
            : previousFilter !== filter // when user change filter
            ? "filter"
            : "initial"
        );
        setLoading(true);
        const { products, total } = await Service.API.getProductsByRange(
          start,
          take,
          filter,
          categoryId
        );
        setProducts(products);
        setTotal(total);
        console.log("load product by range", {
          start,
          take,
          filter,
          categoryId,
          total,
          length: products.length,
        });
      } catch (e) {
        setError("Cannot load products");
      } finally {
        setLoading(false);
      }
    })();
  }, [start, take, filter, categoryId]);
  return [products, total, error, loading, loadingBy];
};
