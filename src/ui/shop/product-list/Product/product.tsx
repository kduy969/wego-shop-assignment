import React from "react";
import { TProduct } from "../../../../api/types";
import css from "./product.module.scss";

type Props = {
  item: TProduct;
};

const Product = ({ item }: Props) => {
  return <div className={css.container}></div>;
};

export default React.memo(Product);
