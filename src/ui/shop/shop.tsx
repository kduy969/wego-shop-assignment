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
import PaginationBar from "./pagination-bar/pagination-bar";
import classNames from "classnames";
import { useScrollDirection } from "../../hooks/use-scroll-direction";
import { WebUtils } from "../../utils/browser";
import LoadingAnimation from "./loading-animation/loading-animation";

type Props = {};

export type TLoadingBy =
  | "changePage"
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

  const onPageSelected = useCallback((page: number) => {
    setLoadingBy("changePage");
    setPageIndex(page);
    setPageTake(ShopConfig.InitialTake);
  }, []);

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
  const showRetry = !!(loadingBy === "takeMore" && productError);

  const taken = products.length + pageIndex * pageSize;
  const haveMore = taken < totalProduct;
  const pageFulled = products.length >= pageSize;
  const autoLoadMore = haveMore && !pageFulled && !showRetry && !loadingProduct;
  const showNoMore = !haveMore && !productError;

  const scrollRef = useRef<HTMLDivElement>(null);
  useLoadMoreOnScrollBottom(scrollRef, autoLoadMore, onLoadMore);

  // auto scroll top when next page loaded
  useScrollTopOnNextPageLoaded(
    loadingProduct,
    loadingBy,
    productError,
    scrollRef
  );

  const scrollDirection = useScrollDirection(scrollRef, 75);

  return (
    <div data-testid={"scroll-view"} ref={scrollRef} className={css.container}>
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

      {loadingProduct && <div data-testid={"status-product-loading"} />}
      {loadingCategory && <div data-testid={"status-category-loading"} />}

      {loadingProduct && loadingBy === "takeMore" ? (
        <div
          data-testid={"loading-more"}
          className={classNames(css.bottom, css.loading)}
          onClick={onLoadMore}
        >
          <LoadingAnimation size={"large"} />
        </div>
      ) : showRetry ? (
        <div
          data-testid={"retry-now"}
          className={classNames(css.bottom, css.text)}
          onClick={retrySyncProducts}
        >
          Retry now
        </div>
      ) : pageFulled ? (
        <div
          data-testid={"end-of-page"}
          className={classNames(css.bottom, css.text)}
        >
          End of page.
        </div>
      ) : showNoMore ? (
        <div
          data-testid={"no-more"}
          className={classNames(css.bottom, css.text)}
        >
          {totalProduct > 0 ? `You've watched all items.` : ""}
        </div>
      ) : (
        <div
          data-testid={"bottom-empty-placeholder"}
          className={classNames(css.bottom, css.placeholder)}
        />
      )}

      <div className={css.bottomScroll} />
      <div className={css.paginationSpace} />
      {products.length > 0 && (
        <PaginationBar
          preferLength={7}
          onPageSelected={onPageSelected}
          className={classNames(
            css.paginationBar,
            scrollDirection !== "down" && css.hide
          )}
          loadingCurrentPage={loadingProduct && loadingBy === "changePage"}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalItems={totalProduct}
        />
      )}
    </div>
  );
};

export default React.memo(Shop);
