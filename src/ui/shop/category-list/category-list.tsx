import React from "react";
import { TCategory } from "../../../api/types";
import css from "./category-list.module.scss";
import { ViewStyle } from "../../base-types/view-style";
import classNames from "classnames";
import { Simulate } from "react-dom/test-utils";
import load = Simulate.load;
import LoadingAnimation from "../loading-animation/loading-animation";

type Props = ViewStyle & {
  items: TCategory[];
  selectedId?: string;
  onSelect?: (id: string | undefined) => void;
  loading: boolean; // category list is being loading
  loadingSelected?: boolean; // selected category's product is being loading
};

const CategoryList = ({
  items,
  selectedId,
  onSelect,
  style,
  className,
  loading,
  loadingSelected,
}: Props) => {
  return (
    <div
      data-testid={"category-list"}
      style={style}
      className={classNames(
        css.container,
        className,
        loadingSelected && css.disabled
      )}
    >
      <div className={css.itemsBox}>
        {loading ? (
          <div
            style={{
              width: 100,
            }}
            className={classNames(css.item, css.loading)}
            onClick={() => onSelect?.(undefined)}
            key={"Loading"}
          >
            Text
            <LoadingAnimation className={css.loadingIcon} />
          </div>
        ) : (
          <>
            <div
              style={{
                width: 60,
              }}
              className={classNames(
                css.item,
                selectedId === undefined && css.selected,
                selectedId === undefined && loadingSelected && css.loading
              )}
              onClick={() => onSelect?.(undefined)}
              aria-checked={selectedId === undefined}
              key={"All"}
              data-testid={"category-item"}
              aria-description={"all"} // mark this item as All category for testing
            >
              All
              {selectedId === undefined && loadingSelected && (
                <LoadingAnimation className={css.loadingIcon} />
              )}
            </div>
            {items.map((item) => {
              const selected = selectedId === item.id;
              const loading = selected && loadingSelected;
              return (
                <div
                  style={{
                    width: item.name.length * 10 + 20, //estimate and set text to fixed width to prevent size change on fontWeight change, 20 for padding, 10 for character size
                  }}
                  aria-checked={!!selected}
                  className={classNames(
                    css.item,
                    selected && css.selected,
                    loading && css.loading
                  )}
                  data-testid={"category-item"}
                  aria-description={item.id}
                  onClick={() => onSelect?.(item.id)}
                  key={item.id}
                >
                  {item.name}
                  {loading && <LoadingAnimation className={css.loadingIcon} />}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(CategoryList);
