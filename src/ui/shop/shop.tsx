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
import { useProductsByRange } from "./hooks/use-products-by-range";
import SearchBar from "./search-bar/search-bar";
import CategoryList from "./category-list/category-list";
import ProductList from "./product-list/product-list";

import { useScrollTopOnNextPageLoaded } from "./hooks/use-scroll-top-on-next-page-loaded";
import { useLoadMoreOnScrollBottom } from "./hooks/use-load-more-on-scroll-bottom";

type Props = {};

const Shop = ({}: Props) => {
  // region handle pagination
  const [takeCount, setTakeCount] = useState(ShopConfig.InitialTake);
  const [pageNumber, setPageNumber] = useState(0);
  const onLoadMore = () => {
    setTakeCount((take) => take + ShopConfig.TakeOnLoadMore);
  };
  const onLoadNextPage = () => {
    setPageNumber((page) => page + 1);
    setTakeCount(ShopConfig.InitialTake);
  };

  // endregion

  // region handle search
  const [filterText, setFilterText] = useState<string>("");
  const onFilterSubmit = useCallback((text: string) => {
    setFilterText(text);
    setPageNumber(0);
    setTakeCount(ShopConfig.InitialTake);
  }, []);
  // endregion

  // region handle category
  const [categories, categoryError, loadingCategory] = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >();
  const onCategoryChanged = useCallback((id: string | undefined) => {
    setSelectedCategoryId(id);
    // reset to initial take on category changed
    setTakeCount(ShopConfig.InitialTake);
    setPageNumber(0);
  }, []);
  // endregion

  // region load products
  const [
    products,
    totalProduct,
    productError,
    loadingProduct,
    loadingBy,
    reTryLoadProduct,
  ] = useProductsByRange(pageNumber, takeCount, filterText, selectedCategoryId);
  // endregion

  // user make takeMore/nextPage action lead to load product error -> show refresh button to allow user to retry
  const showRetry = !!(
    (loadingBy === "takeMore" || loadingBy === "nextPage") &&
    productError
  );

  const taken = products.length + pageNumber * ShopConfig.PageSize;
  const haveMore = taken < totalProduct;
  const pageFulled = products.length >= ShopConfig.PageSize;
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
          onClick={reTryLoadProduct}
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
