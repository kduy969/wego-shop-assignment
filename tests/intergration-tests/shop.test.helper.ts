import {
  expectToBeInDocument,
  expectToBeVisible,
  mockScrollToBottom,
} from "../utils";
import {
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { TestCategoryList, TestProductList } from "../test-data";
import { TProduct } from "../../src/api/types";
import { FetchMock } from "jest-fetch-mock";
import { Config } from "../../src/config";
import { ShopSimulate, ShopState } from "./shop-simulate";
import { ShopConfig } from "../../src/ui/shop/config";

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

export function expectAllProductsMatch(shopSimulate: ShopSimulate) {
  const expectedItems = shopSimulate.getExpectedItems();
  const productNames = screen.queryAllByTestId("product-name");
  const categories = screen.queryAllByTestId("product-category");

  expectedItems.forEach((p, i) => {
    expect(productNames[i].textContent).toMatch(p.name);
    expect(categories[i]).toHaveAttribute("aria-description", p.categoryId);
  });
}

export async function waitForLoadMore() {
  const scrollView = expectToBeVisible("scroll-view");
  mockScrollToBottom(scrollView);
  await waitForFinishNextLoading();
}

export async function waitForLoadNextPage(shopSimulate: ShopSimulate) {
  // find next page button
  const paginations = screen.queryAllByTestId("pagination-item");
  const nextPageButton = paginations.find(
    (n) =>
      n.getAttribute("aria-description") === shopSimulate.getNextPage() + ""
  );
  expect(nextPageButton).toBeTruthy();

  fireEvent.click(nextPageButton as HTMLElement);
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

export function checkEverything(shopSimulate: ShopSimulate) {
  expectToSeeProductsWithQuantity(shopSimulate.state.count);
  expectAllProductsMatch(shopSimulate);
  checkNavigationBar(shopSimulate);
}

export function getProductCount(filter: string, categoryId: string) {
  return TestProductList.filter((p) => isProductMatch(p, categoryId, filter))
    .length;
}

export async function tryLoadMoreFailThenCheck(shopSimulate: ShopSimulate) {
  if (!shopSimulate.canLoadMore()) {
    console.log("Cannot load more");
    return false;
  }

  await waitForLoadMore();
  // load more failed -> retry button should being showed now
  expectToBeVisible("retry-now");
}

export async function tryLoadMoreThenCheck(shopSimulate: ShopSimulate) {
  if (!shopSimulate.canLoadMore()) {
    return false;
  }

  // load more and check
  await waitForLoadMore();
  shopSimulate.loadMore();
  checkEverything(shopSimulate);
}

export async function tryLoadNextPageThenCheck(shopSimulate: ShopSimulate) {
  if (!shopSimulate.canGoNextPage()) {
    return false;
  }

  // load and check
  await waitForLoadNextPage(shopSimulate);
  shopSimulate.changePageTo(shopSimulate.state.pageIndex + 1);
  checkEverything(shopSimulate);
}

export async function tryRetryLoadMoreThenCheck(shopSimulate: ShopSimulate) {
  const retry = expectToBeVisible("retry-now");
  fireEvent.click(retry);
  await waitForFinishNextLoading();

  shopSimulate.loadMore();
  checkEverything(shopSimulate);
}

export async function tryRetryFailThenCheck(shopSimulate: ShopSimulate) {
  const retry = expectToBeVisible("retry-now");
  fireEvent.click(retry);
  await waitForFinishNextLoading();

  // retry fail -> still show the retry button
  expectToBeVisible("retry-now");
}

export async function changeCategoryThenCheck(
  shopSimulate: ShopSimulate,
  categoryId: string
) {
  await updateCategoryAndSubmit(categoryId);
  shopSimulate.changeCategory(categoryId);
  checkEverything(shopSimulate);
}

export async function changeSearchAndCheck(
  shopSimulate: ShopSimulate,
  search: string
) {
  await updateSearchAndSubmit(search);
  shopSimulate.changeFilter(search);
  checkEverything(shopSimulate);
}

export function checkNavigationBar(shopSimulate: ShopSimulate) {
  if (!shopSimulate.shouldPaginationBarVisible()) {
    return;
  }

  // should visible
  expectToBeInDocument("pagination-bar");

  const navigations = screen.queryAllByTestId("pagination-item");

  // should highlight current page
  const selected = navigations.find(
    (e) =>
      e.getAttribute("aria-selected") === "true" &&
      e.getAttribute("aria-description") === shopSimulate.state.pageIndex + ""
  );
  expect(selected).toBeTruthy();

  // should show first and last page
  const first = navigations.find(
    (e) => e.getAttribute("aria-description") === "0"
  );
  expect(first).toBeTruthy();

  const last = navigations.find(
    (e) =>
      e.getAttribute("aria-description") ===
      shopSimulate.getPageCount() - 1 + ""
  );
  expect(last).toBeTruthy();
}
