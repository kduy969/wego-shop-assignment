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
  return (
    <div style={style} className={classNames(css.container, className)}>
      {items.map((i) => (
        <Product item={i} key={i.id} />
      ))}
    </div>
  );
};

export default React.memo(ProductList);
