import * as React from "react";
import {
  render,
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import Shop from "../../src/ui/shop/shop";
import { expectToBeVisible } from "../utils";
import { Service } from "../../src/service";
import fetchMock from "jest-fetch-mock";
import { Config } from "../../src/config";
import { TestCategoryList, TestProductList } from "../test-data";
import { ShopConfig } from "../../src/ui/shop/config";
import { TProduct } from "../../src/api/types";

// setup service for calling API
Service.init();

// enable mocking API
fetchMock.enableMocks();
// @ts-ignore
fetch.mockResponse((req) =>
  req.url === Config.ProductListURL
    ? Promise.resolve(JSON.stringify(TestProductList))
    : req.url === Config.CategoryListURL
    ? Promise.resolve(JSON.stringify(TestCategoryList))
    : []
);

async function updateSearchAndSubmit(query: string) {
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

async function waitForFinishNextLoading() {
  await waitFor(() => screen.getByTestId("status-product-loading"));
  await waitForElementToBeRemoved(() =>
    screen.queryByTestId("status-product-loading")
  );
}

async function updateCategoryAndSubmit(categoryId: string | null) {
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

function expectToSeeProductsWithQuantity(num: number) {
  const products = screen.queryAllByTestId("product");
  expect(products.length).toBe(num);
}

function getExpectedItems(config: Config) {
  return TestProductList.filter((p) =>
    isProductMatch(p, config.categoryId, config.search)
  ).slice(config.pageIndex * ShopConfig.PageSize, config.count);
}
function expectAllProductsMatch(config: Config) {
  const expectedItems = getExpectedItems(config);
  const productNames = screen.queryAllByTestId("product-name");
  const categories = screen.queryAllByTestId("product-category");

  expectedItems.forEach((p, i) => {
    expect(productNames[i].textContent).toMatch(p.name);
    expect(categories[i]).toHaveAttribute("aria-description", p.categoryId);
  });
}

async function waitForLoadMore() {
  const loadMore = expectToBeVisible("load-more");
  fireEvent.click(loadMore);
  await waitForFinishNextLoading();
}

async function waitForLoadNextPage() {
  const loadNextPage = expectToBeVisible("load-next-page");
  fireEvent.click(loadNextPage);
  await waitForFinishNextLoading();
}

type Config = {
  search: string;
  categoryId: string;
  count: number;
  pageIndex: number;
};

function isProductMatch(p: TProduct, categoryId: string, search: string = "") {
  const matchedCategory = categoryId === "all" || p.categoryId === categoryId;
  const matchedFilter =
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.restaurant.toLowerCase().includes(search.toLowerCase());
  return matchedCategory && matchedFilter;
}

function checkEverything(config: Config) {
  expectToSeeProductsWithQuantity(config.count);
  expectAllProductsMatch(config);
}

function getProductCount(filter: string, categoryId: string) {
  return TestProductList.filter((p) => isProductMatch(p, categoryId, filter))
    .length;
}

async function tryLoadMore(config: Config) {
  const total = getProductCount(config.search, config.categoryId);
  const taken = config.pageIndex * ShopConfig.PageSize + config.count;
  const pageFulled = config.count >= ShopConfig.PageSize;
  if (taken >= total || pageFulled) {
    console.log("Cannot load more");
    return false;
  }

  const remaining = total - taken;
  const loadCount = Math.min(ShopConfig.TakeOnLoadMore, remaining);

  // load more and check
  await waitForLoadMore();
  config.count += loadCount;
  checkEverything(config);
}

async function tryLoadNextPage(config: Config) {
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

async function tryChangeCategory(config: Config, categoryId: string) {
  await updateCategoryAndSubmit(categoryId);

  // get next expected config
  const total = getProductCount(config.search, categoryId);
  config.pageIndex = 0;
  config.count = Math.min(total, ShopConfig.InitialTake);
  config.categoryId = categoryId;

  checkEverything(config);
}

async function tryChangeSearch(config: Config, search: string) {
  await updateSearchAndSubmit(search);

  // get next expected config
  const total = getProductCount(search, config.categoryId);
  config.pageIndex = 0;
  config.count = Math.min(total, ShopConfig.InitialTake);
  config.search = search;

  checkEverything(config);
}

test("Check initial load", async () => {
  // Render the shop page component
  render(<Shop />);

  // in loading status
  await waitFor(() => screen.getByTestId("status-product-loading"));

  expectToBeVisible("search-bar");

  expectToBeVisible("category-list");

  // loading placeholder should be visible
  expectToBeVisible("product-loading");

  // wait for product list finished loading
  await waitForElementToBeRemoved(() =>
    screen.queryByTestId("status-product-loading")
  );

  expectToBeVisible("product-list");

  let config: Config = {
    search: "",
    categoryId: "all",
    pageIndex: 0,
    count: ShopConfig.InitialTake,
  };

  checkEverything(config);
});

test("Check filter by product name", async () => {
  // Render the shop page component
  render(<Shop />);

  // wait for finishing initial loading
  await waitForElementToBeRemoved(() =>
    screen.queryByTestId("status-product-loading")
  );

  let config: Config = {
    search: "",
    categoryId: "all",
    pageIndex: 0,
    count: ShopConfig.InitialTake,
  };

  await tryChangeSearch(config, "Drinks");

  await tryChangeSearch(config, "maineland");

  await tryChangeSearch(config, "");
});

test("Check filter by category", async () => {
  // Render the shop page component
  render(<Shop />);

  // wait for finishing initial loading
  await waitForElementToBeRemoved(() =>
    screen.queryByTestId("status-product-loading")
  );

  let config: Config = {
    search: "",
    categoryId: "all",
    pageIndex: 0,
    count: ShopConfig.InitialTake,
  };

  // change category to Sushi
  await tryChangeCategory(config, "6288a89f1f0152b8c2cd512b");

  // desert
  await tryChangeCategory(config, "6288a89fe6c2fe0b758360fe");

  // change to all
  await tryChangeCategory(config, "all");

  // change category to drinks and check product list
  await tryChangeCategory(config, "6288a89fac9e970731bfaa7b");
});

test("Check filter by category and search", async () => {
  // Render the shop page component
  render(<Shop />);

  let search = "";
  let categoryId = "all";

  // wait for finishing initial loading
  await waitForElementToBeRemoved(() =>
    screen.queryByTestId("status-product-loading")
  );

  let config: Config = {
    search: "",
    categoryId: "all",
    pageIndex: 0,
    count: ShopConfig.InitialTake,
  };

  // search -> cate -> reset search -> reset cate -> to initial load

  await tryChangeSearch(config, "maineland");

  // pizza category
  await tryChangeCategory(config, "6288a89f7338764f2071a8a8");

  // reset search
  await tryChangeSearch(config, "");

  // reset category
  await tryChangeCategory(config, "all");

  // cate -> search -> search -> cate

  // desserts category
  await tryChangeCategory(config, "6288a89fe6c2fe0b758360fe");

  await tryChangeSearch(config, "niquent");

  await tryChangeSearch(config, "zentia");

  // hot meals category
  await tryChangeCategory(config, "6288a89f70dc8cf93b71609b");
});

test("Check load more logic", async () => {
  // load
  render(<Shop />);

  // wait for initial loading
  await waitForElementToBeRemoved(() =>
    screen.queryByTestId("status-product-loading")
  );

  // should show load more
  expectToBeVisible("load-more");

  let config: Config = {
    search: "",
    categoryId: "all",
    pageIndex: 0,
    count: ShopConfig.InitialTake,
  };

  await tryLoadMore(config);

  await tryLoadMore(config);

  await tryLoadMore(config);

  await tryLoadMore(config);

  await tryLoadNextPage(config);

  await tryChangeCategory(config, "6288a89f1f0152b8c2cd512b");

  await tryLoadMore(config);

  await tryLoadMore(config);

  await tryLoadMore(config);

  await tryLoadMore(config);

  await tryLoadNextPage(config);

  await tryChangeSearch(config, "Boilicon");

  await tryLoadMore(config);
});
