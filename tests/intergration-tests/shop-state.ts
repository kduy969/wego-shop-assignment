import { getProductCount, isProductMatch } from "./shop.test.helper";
import { ShopConfig } from "../../src/ui/shop/config";
import { TCategory, TProduct } from "../../src/api/types";

export type ShopState = {
  search: string; // all products should match this search
  categoryId: string; // all products should belong to this category
  count: number; // expected number of products on screen

  // all products should fall within the range determined by the combination of pageIndex and pageSize
  pageIndex: number;
  pageSize: number;
};

// ShopSimulate object is used to simulate events happen during the shopping time.
// After each simulate event the expected state will be recalculated
// --> we can test the current UI by validating whether the current DOM tree match the expected state

// Example: for expected state = {
//   search: "Pepsi",
//   categoryId: "Drink",
//   pageIndex: 0,
//   count: 10,
//   pageSize: 20,
// }
// the current UI should show 10 products on screen that have "pepsi" in their name
// and all products should belong to "Drink" category
export class ShopSimulate {
  private readonly _state: ShopState;
  private _allProducts: TProduct[];
  private _allCategories: TCategory[];

  constructor(
    initialState: ShopState,
    allProducts: TProduct[],
    allCategories: TCategory[]
  ) {
    this._state = initialState;
    this._allProducts = allProducts;
    this._allCategories = allCategories;
  }

  get state() {
    return this._state;
  }

  private getTotal() {
    return this._allProducts.filter((p) =>
      isProductMatch(p, this._state.categoryId, this._state.search)
    ).length;
  }

  private getTaken() {
    return this._state.pageIndex * this._state.pageSize + this._state.count;
  }

  private getRemaining() {
    return Math.max(0, this.getTotal() - this.getTaken());
  }

  canLoadMore() {
    const pageFulled = this._state.count >= this._state.pageSize;
    if (this.getRemaining() === 0 || pageFulled) {
      return false;
    }
    return true;
  }

  canChangePageTo(pageIndex: number) {
    // always allow change to page 0
    if (pageIndex === 0) return true;

    const total = getProductCount(this._state.search, this._state.categoryId);

    // need at least [minTotal] product for the page [pageIndex] can be displayed
    const minTotal = pageIndex * this._state.pageSize + 1;
    if (total < minTotal) {
      return false;
    }
    return true;
  }

  shouldShowNextPageButton() {
    const pageFulled = this._state.count >= this._state.pageSize;
    return pageFulled && this.canChangePageTo(this._state.pageIndex + 1);
  }

  loadMore() {
    this._state.count += Math.min(
      ShopConfig.TakeOnLoadMore,
      this.getRemaining()
    );
  }

  changePageTo(pageIndex: number) {
    this._state.count = Math.min(ShopConfig.InitialTake, this.getRemaining());
    this._state.pageIndex = pageIndex;
  }

  changeCategory(categoryId: string) {
    this._state.categoryId = categoryId;
    this._state.pageIndex = 0;
    this._state.count = Math.min(this.getTotal(), ShopConfig.InitialTake);
  }

  changeFilter(filter: string) {
    this._state.search = filter;
    this._state.pageIndex = 0;
    this._state.count = Math.min(this.getTotal(), ShopConfig.InitialTake);
  }

  getExpectedItems() {
    return this._allProducts
      .filter((p) =>
        isProductMatch(p, this._state.categoryId, this._state.search)
      )
      .slice(this._state.pageIndex * this._state.pageSize, this._state.count);
  }
}
