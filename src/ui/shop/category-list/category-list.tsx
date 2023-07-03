import React from "react";
import { TCategory } from "../../../api/types";
import css from "./category-list.module.scss";
import { ViewStyle } from "../../base-types/view-style";
import classNames from "classnames";

type Props = ViewStyle & {
  items: TCategory[];
  selectedId: string | undefined;
  onSelect: (id: string | undefined) => void;
  loading: boolean;
};

const CategoryList = ({
  items,
  selectedId,
  onSelect,
  style,
  className,
}: Props) => {
  return (
    <div style={style} className={classNames(css.container, className)}>
      <div className={css.itemsBox}>
        <div
          style={{
            width: 60,
          }}
          className={classNames(
            css.item,
            selectedId === undefined && css.selected
          )}
          onClick={() => onSelect(undefined)}
          key={"All"}
        >
          All
        </div>
        {items.map((item) => {
          return (
            <div
              style={{
                width: item.name.length * 10 + 20, //estimate and set text to fixed width to prevent size change on fontWeight change, 20 for padding, 8 for character size
              }}
              className={classNames(
                css.item,
                selectedId === item.id && css.selected
              )}
              onClick={() => onSelect(item.id)}
              key={item.id}
            >
              {item.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(CategoryList);
