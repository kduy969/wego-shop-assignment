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
import {
  expectNotToBeVisible,
  expectTextToBeVisible,
  expectToBeVisible,
} from "../utils";
import { Service } from "../../src/service";
import fetchMock from "jest-fetch-mock";
import { Config } from "../../src/config";
import { TestCategoryList, TestProductList } from "../test-data";
import { ShopConfig } from "../../src/ui/shop/config";

// setup service
Service.init();

// mock fetch response
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

function expectAllProductsMatchInitialLoad() {
  const count = Math.min(TestProductList.length, ShopConfig.InitialTake);
  const productNames = screen.queryAllByTestId("product-name");
  const categories = screen.queryAllByTestId("product-category");
  for (let i = 0; i < count; i++) {
    const p = TestProductList[i];
    expect(productNames[i].textContent).toMatch(p.name);
    expect(categories[i]).toHaveAttribute("aria-description", p.category);
  }
}
function expectAllProductsMatch(
  filter: string | undefined,
  categoryId: string | undefined
) {
  if (!!filter) {
    const productNames = screen.queryAllByTestId("product-name");
    productNames.every((name) => {
      expect(name.textContent).toMatch(new RegExp(filter, "i"));
    });
  }
  if (!!categoryId && categoryId !== "all") {
    const categories = screen.queryAllByTestId("product-category");
    categories.every((c) => {
      expect(c).toHaveAttribute("aria-description", categoryId);
    });
  }
}

async function waitForLoadMore() {
  const loadMore = expectToBeVisible("load-more");
  fireEvent.click(loadMore);
  await waitForFinishNextLoading();
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
  expectAllProductsMatchInitialLoad();
});

test("Check filter by product name", async () => {
  // Render the shop page component
  render(<Shop />);

  // wait for finishing initial loading
  await waitForElementToBeRemoved(() =>
    screen.queryByTestId("status-product-loading")
  );

  // update search filter to Drinks and submit
  await updateSearchAndSubmit("Drinks");
  expectToSeeProductsWithQuantity(ShopConfig.InitialTake);
  expectAllProductsMatch("Drinks", undefined);

  // update search filter to Maineland and submit
  await updateSearchAndSubmit("maineland");
  expectToSeeProductsWithQuantity(1);
  expectAllProductsMatch("maineland", undefined);

  // clear filter -> Shop return to initial load
  await updateSearchAndSubmit("");
  expectAllProductsMatchInitialLoad();
});

test("Check filter by category", async () => {
  // Render the shop page component
  render(<Shop />);

  // wait for finishing initial loading
  await waitForElementToBeRemoved(() =>
    screen.queryByTestId("status-product-loading")
  );

  // change category to Sushi and check product list
  await updateCategoryAndSubmit("6288a89f1f0152b8c2cd512b");
  expectAllProductsMatch("", "6288a89f1f0152b8c2cd512b");

  // change category to Dessert and check product list
  await updateCategoryAndSubmit("6288a89fe6c2fe0b758360fe");
  expectAllProductsMatch("", "6288a89fe6c2fe0b758360fe");

  // change to all
  await updateCategoryAndSubmit("all");
  expectAllProductsMatchInitialLoad();

  // change category to drinks and check product list
  await updateCategoryAndSubmit("6288a89fac9e970731bfaa7b");
  expectAllProductsMatch("", "6288a89fac9e970731bfaa7b");
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

  // search -> cate -> reset search -> reset cate -> to initial load

  search = "maineland";
  await updateSearchAndSubmit("maineland");
  expectAllProductsMatch(search, categoryId);

  // pizza category
  categoryId = "6288a89f7338764f2071a8a8";
  await updateCategoryAndSubmit(categoryId);
  expectAllProductsMatch(search, categoryId);

  // reset search
  search = "";
  await updateSearchAndSubmit(search);
  expectAllProductsMatch(search, categoryId);

  // reset category
  categoryId = "all";
  await updateCategoryAndSubmit(categoryId);
  expectAllProductsMatch(search, categoryId);

  // cate -> search -> search -> cate

  // desserts category
  categoryId = "6288a89fe6c2fe0b758360fe";
  await updateCategoryAndSubmit(categoryId);
  expectAllProductsMatch(search, categoryId);

  search = "niquent";
  await updateSearchAndSubmit(search);
  expectAllProductsMatch(search, categoryId);

  search = "zentia";
  await updateSearchAndSubmit(search);
  expectAllProductsMatch(search, categoryId);

  // hot meals category
  categoryId = "6288a89f70dc8cf93b71609b";
  await updateCategoryAndSubmit(categoryId);
  expectAllProductsMatch(search, categoryId);
});

test("Check load more logic", async () => {
  // load
  render(<Shop />);
  let search = "";
  let categoryId = "all";
  let expectedCount = 0;

  // wait for initial loading
  await waitForElementToBeRemoved(() =>
    screen.queryByTestId("status-product-loading")
  );
  expectedCount = ShopConfig.InitialTake;

  // should show load more
  expectToBeVisible("load-more");

  // load more
  await waitForLoadMore();
  expectedCount += ShopConfig.TakeOnLoadMore;
  expectToSeeProductsWithQuantity(expectedCount);

  // load more
  await waitForLoadMore();
  expectedCount += ShopConfig.TakeOnLoadMore;
  expectToSeeProductsWithQuantity(expectedCount);

  // change category -> should reset load more
  categoryId = "6288a89f1f0152b8c2cd512b";
  expectedCount = ShopConfig.InitialTake;
  await updateCategoryAndSubmit(categoryId);
  expectToSeeProductsWithQuantity(expectedCount);

  // load more
  await waitForLoadMore();
  expectedCount += ShopConfig.TakeOnLoadMore;
  expectToSeeProductsWithQuantity(expectedCount);

  // load more
  await waitForLoadMore();
  expectedCount += ShopConfig.TakeOnLoadMore;
  expectToSeeProductsWithQuantity(expectedCount);

  // change search to match 1 product -> hide load more button
  search = "Boilicon";
  expectedCount = 1; // because only 1 product match Boilicon
  await updateSearchAndSubmit(search);
  expectToSeeProductsWithQuantity(expectedCount);

  expectNotToBeVisible("load-more");
  expectToBeVisible("no-more");
});
