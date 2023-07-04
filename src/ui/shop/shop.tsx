import React, { useEffect, useState } from "react";
import css from "./shop.module.scss";
import { ShopConfig } from "./config";
import { Service } from "../../service";
import { useCategories } from "./hooks/useCategories";
import { useProductsByRange } from "./hooks/useProductsByRange";
import SearchBar from "./search-bar/search-bar";
import CategoryList from "./category-list/category-list";
import ProductList from "./product-list/product-list";

type Props = {};

const test = [];
const Shop = ({}: Props) => {
  // region take new items on scroll
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

  // region handle filter data
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

  // region products
  const [products, totalProduct, productError, loadingProduct, loadingBy] =
    useProductsByRange(pageNumber, takeCount, filterText, selectedCategoryId);
  // endregion

  const haveMore = products.length < totalProduct;
  const pageFulled = products.length >= ShopConfig.PageSize;
  const showMore = haveMore && !pageFulled;
  const showNextPage = haveMore && pageFulled;
  return (
    <div className={css.container}>
      <SearchBar
        key={"search-bar"}
        loading={loadingProduct && loadingBy === "filter"}
        className={css.searchBarBox}
        onSubmit={onFilterSubmit}
      />
      <CategoryList
        key={"category-list"}
        className={css.categoryBox}
        items={categories}
        loading={loadingCategory}
        loadingSelected={loadingProduct && loadingBy === "category"}
        selectedId={selectedCategoryId}
        onSelect={onCategoryChanged}
      />
      <ProductList
        key={"product-list"}
        className={css.productsBox}
        loading={!!loadingProduct}
        items={products}
      />

      {!!loadingProduct && <div data-testid={"status-product-loading"} />}
      {!loadingCategory && <div data-testid={"category-loaded"} />}

      {loadingProduct && loadingBy === "takeMore" ? (
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
      ) : (
        <div data-testid={"no-more"} className={css.noMore}>
          {totalProduct > 0 ? `You've watched all item.` : ""}
        </div>
      )}
    </div>
  );
};

export default React.memo(Shop);
