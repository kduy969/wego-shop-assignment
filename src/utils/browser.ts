import MobileDetect from "mobile-detect";

const md = new MobileDetect(navigator.userAgent);

export const WebUtils = {
  md,
};
