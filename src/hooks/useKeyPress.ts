import { useEffect, useMemo, useRef } from "react";
import shimKeyboardEvent from "./shim-keyboard-event";

type Handler = (e: any) => void;

export const useKeyPress = (key: string, onPressed: Handler) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      shimKeyboardEvent(event);
      if (key === event.key) {
        onPressed?.(event);
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [key, onPressed]);
};
