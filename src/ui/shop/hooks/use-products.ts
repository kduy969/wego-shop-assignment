import { useCallback, useEffect, useRef, useState } from "react";
import { TProduct } from "../../../api/types";
import { Service } from "../../../service";

type Config = {
  pageIndex: number;
  pageSize: number;
  pageTake: number;
  filter: string | undefined;
  categoryId: string | undefined;
};

function getLoadConfig(currentConfig: Config | undefined, nextConfig: Config) {
  if (
    !currentConfig ||
    currentConfig.pageIndex !== nextConfig.pageIndex ||
    currentConfig.filter !== nextConfig.filter ||
    currentConfig.categoryId !== nextConfig.categoryId ||
    currentConfig.pageSize !== nextConfig.pageSize ||
    currentConfig.pageTake >= nextConfig.pageTake
  ) {
    // load from the beginning
    return {
      loadMore: false,
      loadConfig: {
        skip: nextConfig.pageIndex * nextConfig.pageSize,
        take: nextConfig.pageTake,
        filter: nextConfig.filter,
        categoryId: nextConfig.categoryId,
      },
    };
  } else {
    // take more
    return {
      loadMore: true,
      loadConfig: {
        skip:
          currentConfig.pageIndex * currentConfig.pageSize +
          currentConfig.pageTake,
        take: nextConfig.pageTake - currentConfig.pageTake,
        filter: nextConfig.filter,
        categoryId: nextConfig.categoryId,
      },
    };
  }
}

export const useProducts = (
  pageIndex: number,
  pageSize: number,
  pageTake: number,
  filter: string | undefined,
  categoryId: string | undefined
): [TProduct[], number, string, boolean, () => void] => {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentConfig, setCurrentConfig] = useState<Config>();

  // update this variable to reSync the product list due to last sync failed
  const [reSyncId, setReSyncId] = useState(0);
  const reSync = useCallback(() => {
    setReSyncId((r) => r + 1);
  }, []);

  // save the latest running job id -> ignore job result if jobId !== latestJobId
  const latestJobId = useRef<number>(0);

  useEffect(() => {
    (async () => {
      const myJobId = latestJobId.current + 1;
      latestJobId.current = myJobId;
      try {
        setLoading(true);

        // calculate list of products to be loaded
        const nextConfig: Config = {
          pageTake,
          pageIndex,
          pageSize,
          categoryId,
          filter,
        };
        const { loadConfig, loadMore } = getLoadConfig(
          currentConfig,
          nextConfig
        );

        // call api
        const { products: newProducts, total: newTotal } =
          await Service.API.getProductsByRange(
            loadConfig.skip,
            loadConfig.take,
            loadConfig.filter,
            loadConfig.categoryId
          );

        // handle result
        setCurrentConfig(nextConfig);
        setProducts(loadMore ? products.concat(newProducts) : newProducts);
        setTotal(newTotal);
        setError("");
      } catch (e: any) {
        if (myJobId === latestJobId.current)
          setError("Please check your connection and try again later.");
      } finally {
        if (myJobId === latestJobId.current) setLoading(false);
      }
    })();
  }, [pageTake, pageIndex, pageSize, filter, categoryId, reSyncId]);
  return [products, total, error, loading, reSync];
};
