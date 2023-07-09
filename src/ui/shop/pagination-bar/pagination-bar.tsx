import React from "react";
import css from "./pagination-bar.module.scss";
import { pagination } from "./helper";
import classNames from "classnames";
import { ViewStyle } from "../../base-types/view-style";
import LoadingAnimation from "../loading-animation/loading-animation";

type Props = ViewStyle & {
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  onPageSelected: (page: number) => void;
  preferLength: number;
  loadingCurrentPage?: boolean;
};

const PaginationBar = ({
  pageIndex,
  pageSize,
  totalItems,
  className,
  onPageSelected,
  preferLength,
  loadingCurrentPage,
}: Props) => {
  const totalPage = Math.ceil(totalItems / pageSize);
  const pages = pagination(pageIndex, totalPage, preferLength);
  return (
    <div
      data-testid={"pagination-bar"}
      className={classNames(css.wrapper, className)}
    >
      <div className={css.container}>
        {pages.map((page, i) => {
          const selectable = page !== "...";
          const selected = page === pageIndex;
          const loading = loadingCurrentPage && selected;
          const text = page === "..." ? "..." : page + 1;
          return (
            <div
              data-testid={"pagination-item"}
              aria-description={page + ""}
              aria-selected={selected}
              onClick={() => {
                selectable && !selected && onPageSelected(page);
              }}
              key={i}
              className={classNames(
                css.item,
                selected && css.selected,
                selectable && css.selectable
              )}
            >
              {loading ? <LoadingAnimation /> : text}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(PaginationBar);
