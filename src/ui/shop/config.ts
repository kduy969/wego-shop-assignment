import MobileDetect from "mobile-detect";
import { WebUtils } from "../../utils/browser";

export const ShopConfig = {
  InitialTake: WebUtils.md.mobile() ? 10 : 20,
  TakeOnLoadMore: WebUtils.md.mobile() ? 10 : 20,
  PageSize: WebUtils.md.mobile() ? 40 : 40,
};
