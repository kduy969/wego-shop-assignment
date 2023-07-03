import React from "react";
import { ViewStyle } from "../../../../base-types/view-style";
import css from "./rating.module.scss";
import classNames from "classnames";

type Props = ViewStyle & {
  rate: number;
};

const Rating = ({ rate, className }: Props) => {
  return (
    <div className={classNames(css.container, className)}>
      <span className={classNames("material-icons", css.icon)}>star</span>
      <div className={css.rate}>{rate.toFixed(1)}</div>
    </div>
  );
};

export default React.memo(Rating);
