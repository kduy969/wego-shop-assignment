import React, { RefObject } from "react";

type Direction = "up" | "down";
export function useScrollDirection(
  scrollRef: RefObject<HTMLElement>,
  distanceThreshold = 100
) {
  const [direction, setDirection] = React.useState<Direction>();

  React.useEffect(() => {
    if (!scrollRef.current) return;

    const node = scrollRef.current;
    let lastY = node.scrollTop;
    let startChangingDirectionY: number | undefined;
    const onScroll = () => {
      const currentY = node.scrollTop;
      if (currentY === lastY) return;

      const goingDirection = currentY < lastY ? "up" : "down";
      const needToDetectDirection = direction !== "down" ? "down" : "up";
      if (goingDirection === needToDetectDirection) {
        if (!!startChangingDirectionY) {
          const delta = Math.abs(startChangingDirectionY - currentY);
          if (delta > distanceThreshold) {
            setDirection(goingDirection);
            startChangingDirectionY = undefined;
          } else {
          }
        } else {
          startChangingDirectionY = currentY;
        }
      } else {
        startChangingDirectionY = undefined;
      }
      lastY = currentY;
    };

    node.addEventListener("scroll", onScroll);

    return () => node.removeEventListener("scroll", onScroll);
  }, [direction]);

  return direction;
}
