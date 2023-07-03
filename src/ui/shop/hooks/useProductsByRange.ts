import { useEffect, useState } from "react";
import { TCategory, TProduct } from "../../../api/types";
import { Service } from "../../../service";

export const useProductsByRange = (
  start: number,
  take: number,
  filter: string | undefined,
  categoryId: string | undefined
): [TProduct[], number, string] => {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string>("");
  useEffect(() => {
    (async () => {
      try {
        const { products, total } = await Service.API.getProductsByRange(
          start,
          take,
          filter,
          categoryId
        );
        setProducts(products);
        setTotal(total);
      } catch (e) {
        setError("Cannot load products");
      }
    })();
  }, [start, take, filter, categoryId]);
  return [products, total, error];
};
