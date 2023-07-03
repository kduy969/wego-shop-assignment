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
  const [productTake, setProductTake] = useState(ShopConfig.InitialTake);
  const onLoadMore = () => {
    setProductTake((take) => take + ShopConfig.TakeOnLoadMore);
  };
  // endregion

  // region handle filter data
  const [filterText, setFilterText] = useState<string>("");
  const onFilterSubmit = (text: string) => {
    console.log("onFilter", text);
    setFilterText(text);
    // reset take
    setProductTake(ShopConfig.InitialTake);
  };
  // endregion

  // region handle category
  const [categories, categoryError, loadingCategory] = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >();
  const onCategoryChanged = (id: string | undefined) => {
    setSelectedCategoryId(id);
    // reset take on category changed
    setProductTake(ShopConfig.InitialTake);
  };
  // endregion

  // region products
  const [products, totalProduct, productError, loadingProduct] =
    useProductsByRange(0, productTake, filterText, selectedCategoryId);
  // endregion

  const haveMore = products.length < totalProduct;
  return (
    <div className={css.container}>
      <SearchBar className={css.searchBarBox} onSubmit={onFilterSubmit} />
      <CategoryList
        className={css.categoryBox}
        items={categories}
        loading={loadingCategory}
        selectedId={selectedCategoryId}
        onSelect={onCategoryChanged}
      />
      <ProductList
        className={css.productsBox}
        loading={loadingProduct}
        items={products}
      />

      {haveMore ? (
        <div className={css.loadMore} onClick={onLoadMore}>
          +Show More
        </div>
      ) : (
        <div className={css.noMore}>
          {totalProduct > 0 ? `You've watched all item.` : "No item."}
        </div>
      )}
    </div>
  );
};

export default React.memo(Shop);
