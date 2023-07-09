import * as React from "react";
import { RefObject, useRef } from "react";

// export const useScrollToBottom = <T extends Element>(
//   onHitBottom: () => void
// ): [React.RefCallback<T>] => {
//   const [node, setRef] = React.useState<any>(null);
//   const isBottomRef = useRef(false);
//
//   React.useEffect(() => {
//     let observer: IntersectionObserver;
//
//     if (node && node.parentElement) {
//       observer = new IntersectionObserver(
//         ([entry]) => {
//           const newIsBottom = entry.isIntersecting;
//           if (newIsBottom !== isBottomRef.current) {
//             isBottomRef.current = newIsBottom;
//             if (isBottomRef.current) {
//               onHitBottom();
//             }
//           }
//         },
//         { root: node.parentElement }
//       );
//       observer.observe(node);
//     }
//
//     return () => {
//       if (observer) {
//         observer.disconnect();
//       }
//     };
//   }, [node, onHitBottom]);
//
//   return [setRef];
// };

export function useScrollToBottom(
  scrollContainerRef: RefObject<HTMLElement>,
  onHitBottom: () => void,
  threshold: number = 50
) {
  const isBottomRef = useRef(false);

  React.useEffect(() => {
    // useEffect run after dom mutation so element ref should be already assigned at this point
    // if ref not assigned -> the element is not rendered yet (consumer should add dep to re-run this effect when the element get mounted)
    if (!scrollContainerRef.current) return;
    const element = scrollContainerRef.current;

    const onScroll = () => {
      const maxScroll = element.scrollHeight - element.clientHeight;
      const distanceToBottom = Math.abs(element.scrollTop - maxScroll);

      const beingBottom = distanceToBottom < threshold;
      if (beingBottom !== isBottomRef.current) {
        if (beingBottom) onHitBottom();
        isBottomRef.current = beingBottom;
      }
    };

    element.addEventListener("scroll", onScroll);
    return () => element.removeEventListener("scroll", onScroll);
  }, [onHitBottom, threshold]);
}
