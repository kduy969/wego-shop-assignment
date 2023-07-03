import { useEffect, useState } from "react";
import { TCategory, TProduct } from "../../../api/types";
import { Service } from "../../../service";

export const useProductsByRange = (
  start: number,
  take: number,
  filter: string | undefined,
  categoryId: string | undefined
): [TProduct[], number, string, boolean] => {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    (async () => {
      try {
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
  return [products, total, error, loading];
};
