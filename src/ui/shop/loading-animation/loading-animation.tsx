import React from "react";
import css from "./loading-animation.module.scss";
import { ViewStyle } from "../../base-types/view-style";
import classNames from "classnames";

type Props = ViewStyle & {
  size?: "normal" | "large";
};

const LoadingAnimation = ({ className, size = "normal" }: Props) => {
  return (
    <div
      data-testid={"loading-icon"}
      className={classNames(
        css.container,
        className,
        size === "large" && css.large
      )}
    >
      <div
        className={classNames(
          css.dotFlashing,
          className,
          size === "large" && css.large
        )}
      />
    </div>
  );
};

export default React.memo(LoadingAnimation);
