import React from "react";
import { TProduct } from "../../../../api/types";
import css from "./product.module.scss";
import Rating from "./Rating/rating";
import classNames from "classnames";
import TimeRange from "./TimeRange/time-range";
import Status from "./Status/status";

type Props = {
  item: TProduct;
};

const Product = ({ item }: Props) => {
  let icon;
  let iconBG = "white";
  switch (item.promotion) {
    case "gift":
      icon = "redeem";
      iconBG = "#00b1ff";
      break;
    case "discount":
      icon = "percent";
      iconBG = "#ff696f";
      break;
    case "1+1":
      icon = "1x_mobiledata";
      iconBG = "#8f64ff";
      break;
    default:
      icon = null;
      iconBG = "transparent";
  }

  return (
    <div data-testid={"product"} key={item.id} className={css.container}>
      <div className={css.topBox}>
        <img src={item.imageUrl} className={css.image} />
        {!!icon && (
          <span
            data-testid={`${item.id}-promotion-${item.promotion}`}
            aria-description={item.promotion || undefined}
            style={{
              background: iconBG,
            }}
            className={classNames(
              icon !== "1+1" && "material-icons",
              css.statusIcon
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <div className={css.bottomBox}>
        <div
          className={"test-element"}
          data-testid={"product-category"}
          aria-description={item.categoryId}
        />
        <div data-testid={"product-name"} className={css.title}>
          {item.name}
        </div>
        <div className={css.infoRow}>
          <Rating className={css.infoItem} rate={item.rating} />
          {!!item.minCookTime && !!item.maxCookTime && (
            <TimeRange
              className={css.infoItem}
              start={item.minCookTime}
              end={item.maxCookTime}
              unit={"min"}
            />
          )}
          {item.isNew && <Status className={css.infoItem} />}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Product);
