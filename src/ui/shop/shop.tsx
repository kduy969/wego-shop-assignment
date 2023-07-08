import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import css from "./shop.module.scss";
import { ShopConfig } from "./config";

import { useCategories } from "./hooks/use-categories";
import { useProducts } from "./hooks/use-products";
import SearchBar from "./search-bar/search-bar";
import CategoryList from "./category-list/category-list";
import ProductList from "./product-list/product-list";

import { useScrollTopOnNextPageLoaded } from "./hooks/use-scroll-top-on-next-page-loaded";
import { useLoadMoreOnScrollBottom } from "./hooks/use-load-more-on-scroll-bottom";

type Props = {};

export type TLoadingBy =
  | "nextPage"
  | "takeMore"
  | "category"
  | "filter"
  | "initial";

const Shop = ({}: Props) => {
  const [loadingBy, setLoadingBy] = useState<TLoadingBy>("initial");
  // region handle pagination
  const [pageTake, setPageTake] = useState(ShopConfig.InitialTake);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(ShopConfig.PageSize);
  const onLoadMore = useCallback(() => {
    setLoadingBy("takeMore");
    setPageTake((take) => Math.min(take + ShopConfig.TakeOnLoadMore, pageSize));
  }, [pageSize]);
  const onLoadNextPage = () => {
    setLoadingBy("nextPage");
    setPageIndex((page) => page + 1);
    setPageTake(ShopConfig.InitialTake);
  };

  // endregion

  // region handle search
  const [filterText, setFilterText] = useState<string>("");
  const onFilterSubmit = useCallback((text: string) => {
    setLoadingBy("filter");
    setFilterText(text);
    setPageIndex(0);
    setPageTake(ShopConfig.InitialTake);
  }, []);
  // endregion

  // region handle category
  const [categories, categoryError, loadingCategory] = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >();
  const onCategoryChanged = useCallback((id: string | undefined) => {
    setLoadingBy("category");
    setSelectedCategoryId(id);
    // reset to initial take on category changed
    setPageTake(ShopConfig.InitialTake);
    setPageIndex(0);
  }, []);
  // endregion

  // region sync products
  const [
    products,
    totalProduct,
    productError,
    loadingProduct,
    retrySyncProducts,
  ] = useProducts(
    pageIndex,
    pageSize,
    pageTake,
    filterText,
    selectedCategoryId
  );
  // endregion

  // user make takeMore/nextPage action lead to load product error -> show refresh button to allow user to retry
  const showRetry = !!(
    (loadingBy === "takeMore" || loadingBy === "nextPage") &&
    productError
  );

  const taken = products.length + pageIndex * pageSize;
  const haveMore = taken < totalProduct;
  const pageFulled = products.length >= pageSize;
  const showMore = haveMore && !pageFulled && !showRetry && !loadingProduct;
  const showNextPage = haveMore && pageFulled && !showRetry && !loadingProduct;
  const showNoMore = !haveMore && !productError;

  // auto load more
  const [setBottomRef] = useLoadMoreOnScrollBottom(showMore, onLoadMore);

  // auto scroll top when next page loaded
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollTopOnNextPageLoaded(
    loadingProduct,
    loadingBy,
    productError,
    scrollRef
  );

  return (
    <div ref={scrollRef} className={css.container}>
      <SearchBar
        loading={loadingProduct && loadingBy === "filter"}
        className={css.searchBarBox}
        onSubmit={onFilterSubmit}
      />
      <CategoryList
        error={categoryError}
        className={css.categoryBox}
        items={categories}
        loading={loadingCategory}
        loadingSelected={loadingProduct && loadingBy === "category"}
        selectedId={selectedCategoryId}
        onSelect={onCategoryChanged}
      />
      <ProductList
        error={productError}
        className={css.productsBox}
        loading={!!loadingProduct}
        items={products}
      />

      <div ref={setBottomRef} className={css.bottomScroll} />

      {!!loadingProduct && <div data-testid={"status-product-loading"} />}
      {!!loadingCategory && <div data-testid={"status-category-loading"} />}

      {loadingProduct &&
      (loadingBy === "takeMore" || loadingBy === "nextPage") ? (
        <div
          data-testid={"loading-more"}
          className={css.loadMore}
          onClick={onLoadMore}
        >
          Loading...
        </div>
      ) : showRetry ? (
        <div
          data-testid={"retry-now"}
          className={css.loadMore}
          onClick={retrySyncProducts}
        >
          Retry now
        </div>
      ) : showMore ? (
        <div
          data-testid={"load-more"}
          className={css.loadMore}
          onClick={onLoadMore}
        >
          +Show More
        </div>
      ) : showNextPage ? (
        <div
          data-testid={"load-next-page"}
          className={css.loadMore}
          onClick={onLoadNextPage}
        >
          +Next page
        </div>
      ) : showNoMore ? (
        <div data-testid={"no-more"} className={css.noMore}>
          {totalProduct > 0 ? `You've watched all items.` : ""}
        </div>
      ) : null}
    </div>
  );
};

export default React.memo(Shop);
