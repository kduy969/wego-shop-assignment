import React, { useEffect } from "react";
import { TProduct } from "../../../api/types";
import css from "./product-list.module.scss";
import Product from "./Product/product";
import { ViewStyle } from "../../base-types/view-style";
import classNames from "classnames";
import { Simulate } from "react-dom/test-utils";
import error = Simulate.error;
import ProductFake from "./Product/product-fake";

type Props = ViewStyle & {
  error?: string;
  items: TProduct[];
  loading: boolean; // this list is being refreshed
};

const ProductList = ({ items, loading, style, className, error }: Props) => {
  const showPlaceHolder = loading && items.length === 0;
  const noItems = items.length === 0;

  // do not show error if some products are being showed to the user
  if (!!error && items.length === 0)
    return (
      <div
        data-testid={"product-error"}
        className={classNames(css.loadingPlaceHolder, className)}
      >
        <span className={classNames(css.icon, "material-icons")}>error</span>
        <div className={css.text}>{error}</div>
      </div>
    );

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

      {[1, 2, 3, 4, 5].map(() => (
        <ProductFake />
      ))}
    </div>
  );
};

export default React.memo(ProductList);
