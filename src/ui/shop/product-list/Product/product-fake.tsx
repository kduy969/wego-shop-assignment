import React from "react";

type Props = {};
import css from "./product.module.scss";
import classNames from "classnames";

// fake item can be used as a placeholder to fill in the available space in the parent
// -> prevent the other items in the same row to grow
// -> keep every item have the same size on screen
const ProductFake = ({}: Props) => {
  return <div className={classNames(css.container, css.fake)} />;
};

export default React.memo(ProductFake);
