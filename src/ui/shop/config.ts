import MobileDetect from "mobile-detect";
const md = new MobileDetect(navigator.userAgent);

export const ShopConfig = {
  InitialTake: md.mobile() ? 10 : 20,
  TakeOnLoadMore: md.mobile() ? 10 : 20,
  PageSize: md.mobile() ? 40 : 80,
};
