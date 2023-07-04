import React from "react";
import { TProduct } from "../../../api/types";
import css from "./product-list.module.scss";
import Product from "./Product/product";
import { ViewStyle } from "../../base-types/view-style";
import classNames from "classnames";

type Props = ViewStyle & {
  items: TProduct[];
  loading: boolean;
};

const ProductList = ({ items, loading, style, className }: Props) => {
  const showPlaceHolder = loading && items.length === 0;
  const noItems = items.length === 0;

  if (showPlaceHolder)
    return (
      <div
        data-testid={"product-loading"}
        className={classNames(css.loadingPlaceHolder, className)}
      >
        <span className={classNames(css.icon, "material-icons")}>
          inventory_2
        </span>
        <div className={css.text}>Items are being loading....</div>
      </div>
    );

  if (noItems)
    return (
      <div
        data-testid={"product-empty"}
        className={classNames(css.loadingPlaceHolder, className)}
      >
        <span className={classNames(css.icon, "material-icons")}>
          inventory_2
        </span>
        <div className={css.text}>No item found.</div>
      </div>
    );

  return (
    <div
      data-testid={"product-list"}
      style={style}
      className={classNames(css.container, className)}
    >
      {items.map((i) => (
        <Product item={i} key={i.id} />
      ))}
    </div>
  );
};

export default React.memo(ProductList);
