import React from "react";
import { ViewStyle } from "../../../../base-types/view-style";
import css from "./time-range.module.scss";
import classNames from "classnames";

type Props = ViewStyle & {
  start: number;
  end: number;
  unit: string;
};

const TimeRange = ({ start, end, className, unit }: Props) => {
  return (
    <div className={classNames(css.container, className)}>
      <div className={css.text}>{`${start}-${end} ${unit}`}</div>
    </div>
  );
};

export default React.memo(TimeRange);
