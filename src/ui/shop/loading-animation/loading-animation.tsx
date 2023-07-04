import React from "react";
import css from "./loading-animation.module.scss";
import { ViewStyle } from "../../base-types/view-style";
import classNames from "classnames";

type Props = ViewStyle & {};

const LoadingAnimation = ({ className }: Props) => {
  return (
    <div
      data-testid={"loading-icon"}
      className={classNames(css.container, className)}
    >
      <div className={classNames(css.dotFlashing, className)} />
    </div>
  );
};

export default React.memo(LoadingAnimation);
