import * as React from "react";

export const useScrollToBottom = <T extends Element>(
  onHitBottom: () => void
): [React.RefCallback<T>] => {
  const [node, setRef] = React.useState<any>(null);

  React.useEffect(() => {
    let observer: IntersectionObserver;
    let isBottom = false;

    if (node && node.parentElement) {
      observer = new IntersectionObserver(
        ([entry]) => {
          const newIsBottom = entry.isIntersecting;
          if (newIsBottom !== isBottom) {
            isBottom = newIsBottom;
            if (isBottom) {
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
