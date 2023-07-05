import { expectToBeVisible } from "../utils";
import {
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { TestCategoryList, TestProductList } from "../test-data";
import { ShopConfig } from "../../src/ui/shop/config";
import { TProduct } from "../../src/api/types";
import { FetchMock } from "jest-fetch-mock";
import { Config } from "../../src/config";

// object of this type used to hold the current expected UI state of the shop component.
// After performing an action we can update the expected state
// then validate if the expected UI state matches with the test UI

// example: for expected state = {
//   search: "Pepsi",
//   categoryId: "Drink",
//   pageIndex: 0,
//   count: 10,
// }
// the current UI should show 10 products on screen that have "pepsi" in their name
// and belong to "Drink" category
export type ShopMockState = {
  search: string;
  categoryId: string;
  count: number;
  pageIndex: number;
};

export const InitialMockState = {
  search: "",
  categoryId: "all",
  pageIndex: 0,
  count: ShopConfig.InitialTake,
};

// mock utils
export function mockAllAPISuccess() {
  (fetch as FetchMock).mockResponse((req) => {
    return new Promise((rs, rj) => {
      setTimeout(() => {
        req.url === Config.ProductListURL
          ? rs(JSON.stringify(TestProductList))
          : req.url === Config.CategoryListURL
          ? rs(JSON.stringify(TestCategoryList))
          : rs("");
      }, 50);
    });
  });
}

export function mockAllAPIFail() {
  (fetch as FetchMock).mockResponse((req) => {
    return new Promise((rs, rj) => {
      setTimeout(() => {
        rj("");
      }, 50);
    });
  });
}

export function mockOnlyProductAPIFail() {
  (fetch as FetchMock).mockResponse((req) => {
    return new Promise((rs, rj) => {
      setTimeout(() => {
        req.url === Config.ProductListURL
          ? rj("")
          : req.url === Config.CategoryListURL
          ? rs(JSON.stringify(TestCategoryList))
          : rs("");
      }, 50);
    });
  });
}

export async function updateSearchAndSubmit(query: string) {
  const searchInput = expectToBeVisible("search-input");
  fireEvent.input(searchInput, { target: { value: query } });
  const submitBox = expectToBeVisible("submit-box");
  fireEvent.click(submitBox);

  // wait for loading new search results
  await waitFor(() => screen.getByTestId("status-product-loading"));
  await waitForElementToBeRemoved(() =>
    screen.queryByTestId("status-product-loading")
  );
}

export async function waitForFinishNextLoading() {
  await waitFor(() => screen.getByTestId("status-product-loading"));
  await waitForElementToBeRemoved(() =>
    screen.queryByTestId("status-product-loading")
  );
}

export async function updateCategoryAndSubmit(categoryId: string | null) {
  //find categoryId button and click
  const categoryButtons = screen.queryAllByTestId("category-item");
  const button = categoryButtons.find(
    (e) => e.getAttribute("aria-description") === categoryId
  );
  expect(button).toBeTruthy();
  fireEvent.click(button as HTMLElement);

  // wait for loading new search results
  await waitForFinishNextLoading();
}

export function expectToSeeProductsWithQuantity(num: number) {
  const products = screen.queryAllByTestId("product");
  expect(products.length).toBe(num);
}

export function getExpectedItems(config: ShopMockState) {
  return TestProductList.filter((p) =>
    isProductMatch(p, config.categoryId, config.search)
  ).slice(config.pageIndex * ShopConfig.PageSize, config.count);
}
export function expectAllProductsMatch(config: ShopMockState) {
  const expectedItems = getExpectedItems(config);
  const productNames = screen.queryAllByTestId("product-name");
  const categories = screen.queryAllByTestId("product-category");

  expectedItems.forEach((p, i) => {
    expect(productNames[i].textContent).toMatch(p.name);
    expect(categories[i]).toHaveAttribute("aria-description", p.categoryId);
  });
}

export async function waitForLoadMore() {
  const loadMore = expectToBeVisible("load-more");
  fireEvent.click(loadMore);
  await waitForFinishNextLoading();
}

export async function waitForLoadNextPage() {
  const loadNextPage = expectToBeVisible("load-next-page");
  fireEvent.click(loadNextPage);
  await waitForFinishNextLoading();
}

export function isProductMatch(
  p: TProduct,
  categoryId: string,
  search: string = ""
) {
  const matchedCategory = categoryId === "all" || p.categoryId === categoryId;
  const matchedFilter =
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.restaurant.toLowerCase().includes(search.toLowerCase());
  return matchedCategory && matchedFilter;
}

export function checkEverything(config: ShopMockState) {
  expectToSeeProductsWithQuantity(config.count);
  expectAllProductsMatch(config);
}

export function getProductCount(filter: string, categoryId: string) {
  return TestProductList.filter((p) => isProductMatch(p, categoryId, filter))
    .length;
}

export async function tryLoadMoreFailThenCheck(config: ShopMockState) {
  const total = getProductCount(config.search, config.categoryId);
  const taken = config.pageIndex * ShopConfig.PageSize + config.count;
  const pageFulled = config.count >= ShopConfig.PageSize;
  if (taken >= total || pageFulled) {
    console.log("Cannot load more");
    return false;
  }

  await waitForLoadMore();
  // load more failed -> retry button should being showed now
  expectToBeVisible("retry-now");
}

export async function tryLoadMoreThenCheck(config: ShopMockState) {
  const total = getProductCount(config.search, config.categoryId);
  const taken = config.pageIndex * ShopConfig.PageSize + config.count;
  const pageFulled = config.count >= ShopConfig.PageSize;
  if (taken >= total || pageFulled) {
    console.log("Prevent impossible load more action");
    return false;
  }

  const remaining = total - taken;
  const loadCount = Math.min(ShopConfig.TakeOnLoadMore, remaining);

  // load more and check
  await waitForLoadMore();
  config.count += loadCount;
  checkEverything(config);
}

export async function tryLoadNextPageThenCheck(config: ShopMockState) {
  const total = getProductCount(config.search, config.categoryId);
  const taken = config.pageIndex * ShopConfig.PageSize + config.count;
  const pageFulled = config.count >= ShopConfig.PageSize;
  if (taken >= total || !pageFulled) {
    console.log("Cannot go next page");
    return false;
  }

  const remaining = total - taken;
  const loadCount = Math.min(ShopConfig.InitialTake, remaining);

  // load and check
  await waitForLoadNextPage();
  config.count = loadCount;
  config.pageIndex += 1;
  checkEverything(config);
}

export async function tryRetryThenCheck(config: ShopMockState) {
  const retry = expectToBeVisible("retry-now");
  fireEvent.click(retry);
  await waitForFinishNextLoading();
  checkEverything(config);
}

export async function tryRetryFailThenCheck(config: ShopMockState) {
  const retry = expectToBeVisible("retry-now");
  fireEvent.click(retry);
  await waitForFinishNextLoading();

  // retry fail -> still show the retry button
  expectToBeVisible("retry-now");
}

export async function tryChangeCategoryThenCheck(
  config: ShopMockState,
  categoryId: string
) {
  await updateCategoryAndSubmit(categoryId);

  // get next expected config
  const total = getProductCount(config.search, categoryId);
  config.pageIndex = 0;
  config.count = Math.min(total, ShopConfig.InitialTake);
  config.categoryId = categoryId;

  checkEverything(config);
}

export async function tryChangeSearchAndCheck(
  config: ShopMockState,
  search: string
) {
  await updateSearchAndSubmit(search);

  // get next expected config
  const total = getProductCount(search, config.categoryId);
  config.pageIndex = 0;
  config.count = Math.min(total, ShopConfig.InitialTake);
  config.search = search;

  checkEverything(config);
}
