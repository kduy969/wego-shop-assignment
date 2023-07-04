import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import css from "./shop.module.scss";
import { ShopConfig } from "./config";
import { Service } from "../../service";
import { useCategories } from "./hooks/use-categories";
import { useProductsByRange } from "./hooks/use-products-by-range";
import SearchBar from "./search-bar/search-bar";
import CategoryList from "./category-list/category-list";
import ProductList from "./product-list/product-list";
import { useScrollToBottom } from "../../hooks/useScrollToBottom";
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
  const onFilterSubmit = (text: string) => {
    console.log("onFilter", text);
    setFilterText(text);
    // reset take
    setPageNumber(0);
    setTakeCount(ShopConfig.InitialTake);
  };
  // endregion

  // region handle category
  const [categories, categoryError, loadingCategory] = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >();
  const onCategoryChanged = (id: string | undefined) => {
    setSelectedCategoryId(id);
    // reset to initial take on category changed
    setTakeCount(ShopConfig.InitialTake);
    setPageNumber(0);
  };
  // endregion

  // region load products
  const [products, totalProduct, productError, loadingProduct, loadingBy] =
    useProductsByRange(pageNumber, takeCount, filterText, selectedCategoryId);
  // endregion

  const taken = products.length + pageNumber * ShopConfig.PageSize;
  const haveMore = taken < totalProduct;
  const pageFulled = products.length >= ShopConfig.PageSize;
  const showMore = haveMore && !pageFulled;
  const showNextPage = haveMore && pageFulled;

  // auto load more
  const [setBottomRef] = useLoadMoreOnScrollBottom(
    loadingProduct,
    showMore,
    onLoadMore
  );

  // auto scroll top when next page loaded
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollTopOnNextPageLoaded(loadingProduct, loadingBy, scrollRef);

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

      {!!loadingProduct && <div data-testid={"status-product-loading"} />}
      {!loadingCategory && <div data-testid={"category-loaded"} />}

      {loadingProduct &&
      (loadingBy === "takeMore" || loadingBy === "nextPage") ? (
        <div
          data-testid={"loading-more"}
          className={css.loadMore}
          onClick={onLoadMore}
        >
          Loading...
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
      ) : !productError ? (
        <div data-testid={"no-more"} className={css.noMore}>
          {totalProduct > 0 ? `You've watched all item.` : ""}
        </div>
      ) : null}
      <div ref={setBottomRef} className={css.bottomScroll} />
    </div>
  );
};

export default React.memo(Shop);
