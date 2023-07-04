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

const Shop = ({}: Props) => {
  // region take new items on scroll
  const [takeCount, setTakeCount] = useState(ShopConfig.InitialTake);
  const onLoadMore = () => {
    setTakeCount((take) => take + ShopConfig.TakeOnLoadMore);
  };
  // endregion

  // region handle filter data
  const [filterText, setFilterText] = useState<string>("");
  const onFilterSubmit = (text: string) => {
    console.log("onFilter", text);
    setFilterText(text);
    // reset take
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
  };
  // endregion

  // region products
  const [products, totalProduct, productError, loadingProduct, loadingBy] =
    useProductsByRange(takeCount, filterText, selectedCategoryId);
  // endregion

  const haveMore = products.length < totalProduct;
  return (
    <div className={css.container}>
      <SearchBar
        loading={loadingProduct && loadingBy === "filter"}
        className={css.searchBarBox}
        onSubmit={onFilterSubmit}
      />
      <CategoryList
        className={css.categoryBox}
        items={categories}
        loading={loadingCategory}
        loadingSelected={loadingProduct && loadingBy === "category"}
        selectedId={selectedCategoryId}
        onSelect={onCategoryChanged}
      />
      <ProductList
        className={css.productsBox}
        loading={loadingProduct}
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
      ) : haveMore ? (
        <div
          data-testid={"load-more"}
          className={css.loadMore}
          onClick={onLoadMore}
        >
          +Show More
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
