import * as React from "react";
import { useRef } from "react";

export const useScrollToBottom = <T extends Element>(
  onHitBottom: () => void
): [React.RefCallback<T>] => {
  const [node, setRef] = React.useState<any>(null);
  const isBottomRef = useRef(false);

  React.useEffect(() => {
    let observer: IntersectionObserver;

    if (node && node.parentElement) {
      observer = new IntersectionObserver(
        ([entry]) => {
          const newIsBottom = entry.isIntersecting;
          if (newIsBottom !== isBottomRef.current) {
            isBottomRef.current = newIsBottom;
            if (isBottomRef.current) {
              onHitBottom();
            }
          }
        },
        { root: node.parentElement }
      );
      observer.observe(node);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [node, onHitBottom]);

  return [setRef];
};
