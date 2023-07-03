import React from "react";
import { ViewStyle } from "../../../../base-types/view-style";
import css from "./status.module.scss";
import classNames from "classnames";

type Props = ViewStyle & {};

const Status = ({ className }: Props) => {
  return (
    <div className={classNames(css.container, className)}>
      <div className={css.text}>New</div>
    </div>
  );
};

export default React.memo(Status);
