import React, { useEffect, useState } from "react";
import css from "./shop.module.css";
import { ShopConfig } from "./config";
import { Service } from "../../service";
import { useCategories } from "./hooks/useCategories";
import { useProductsByRange } from "./hooks/useProductsByRange";

type Props = {};

const Shop = ({}: Props) => {
  // region take new items on scroll
  const [productTake, setProductTake] = useState(ShopConfig.InitialTake);
  const onScrollEnd = () => {
    setProductTake((take) => take + ShopConfig.TakeOnScrollEnd);
  };
  // endregion

  // region handle filter data
  const [filterText, setFilterText] = useState<string>("");
  const [filterSubmitted, setFilterSubmitted] = useState<string>("");
  const onFilterSubmit = () => {
    setFilterSubmitted(filterText);
  };
  // endregion

  // region handle category
  const [categories, categoryError] = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >();
  const clearSelectedCategoryId = () => {
    setSelectedCategoryId(undefined);
  };
  // endregion

  // region products
  const [products, totalProduct, productError] = useProductsByRange(
    0,
    productTake,
    filterText,
    selectedCategoryId
  );
  // endregion

  return <div className={css.container}></div>;
};

export default React.memo(Shop);
