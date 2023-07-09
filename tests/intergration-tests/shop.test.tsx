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
import { expectNotToBeVisible, expectToBeVisible } from "../utils";
import fetchMock, { FetchMock } from "jest-fetch-mock";

import { TestCategoryList, TestProductList } from "../test-data";

import {
  checkEverything,
  mockAllAPIFail,
  mockAllAPISuccess,
  mockOnlyProductAPIFail,
  changeCategoryThenCheck,
  changeSearchAndCheck,
  tryLoadMoreFailThenCheck,
  tryLoadMoreThenCheck,
  tryLoadNextPageThenCheck,
  tryRetryLoadMoreThenCheck,
  tryRetryFailThenCheck,
} from "./shop.test.helper";

// setup environment for test
import setupTest from "../../src/setup-test/index";
import { ShopSimulate, ShopState } from "./shop-simulate";
import { ShopConfig } from "../../src/ui/shop/config";

setupTest();
// enable mocking API
fetchMock.enableMocks();

// the state of the shop after successful initial load
export const InitialShopState: ShopState = {
  search: "",
  categoryId: "all",
  pageIndex: 0,
  count: ShopConfig.InitialTake,
  pageSize: ShopConfig.PageSize,
};

const originalOffsetHeight = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "offsetHeight"
);
const originalOffsetWidth = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "offsetWidth"
);

describe("Test common cases for shop", () => {
  beforeAll(() => {
    mockAllAPISuccess();
  });
  afterAll(() => {
    fetchMock.resetMocks();
  });
  beforeEach(() => {
    render(<Shop />);
  });

  test("Check initial load", async () => {
    // should be in loading state at initial
    expectToBeVisible("status-product-loading");
    expectToBeVisible("product-loading");

    // expect search bar and category is being showed
    expectToBeVisible("search-bar");
    expectToBeVisible("category-list");

    // wait for product list finished loading
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("status-product-loading")
    );

    expectToBeVisible("product-list");

    let config = new ShopSimulate(
      {
        ...InitialShopState,
      },
      TestProductList,
      TestCategoryList
    );

    checkEverything(config);
  });

  test("Check filter by product name", async () => {
    // wait for finishing initial loading
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("status-product-loading")
    );

    let shopSimulate = new ShopSimulate(
      {
        ...InitialShopState,
      },
      TestProductList,
      TestCategoryList
    );

    await changeSearchAndCheck(shopSimulate, "Drinks");

    await changeSearchAndCheck(shopSimulate, "maineland");

    await changeSearchAndCheck(shopSimulate, "");
  });

  test("Check filter by category", async () => {
    // wait for finishing initial loading
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("status-product-loading")
    );

    let shopSimulate = new ShopSimulate(
      {
        ...InitialShopState,
      },
      TestProductList,
      TestCategoryList
    );

    // change category to Sushi
    await changeCategoryThenCheck(shopSimulate, "6288a89f1f0152b8c2cd512b");

    // desert
    await changeCategoryThenCheck(shopSimulate, "6288a89fe6c2fe0b758360fe");

    // change to all
    await changeCategoryThenCheck(shopSimulate, "all");

    // change category to drinks and check product list
    await changeCategoryThenCheck(shopSimulate, "6288a89fac9e970731bfaa7b");
  });

  test("Check filter by category and search", async () => {
    // wait for finishing initial loading
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("status-product-loading")
    );

    let shopSimulate = new ShopSimulate(
      {
        ...InitialShopState,
      },
      TestProductList,
      TestCategoryList
    );

    // search -> cate -> reset search -> reset cate -> to initial load

    await changeSearchAndCheck(shopSimulate, "maineland");

    // pizza category
    await changeCategoryThenCheck(shopSimulate, "6288a89f7338764f2071a8a8");

    // reset search
    await changeSearchAndCheck(shopSimulate, "");

    // reset category
    await changeCategoryThenCheck(shopSimulate, "all");

    // cate -> search -> search -> cate

    // desserts category
    await changeCategoryThenCheck(shopSimulate, "6288a89fe6c2fe0b758360fe");

    await changeSearchAndCheck(shopSimulate, "niquent");

    await changeSearchAndCheck(shopSimulate, "zentia");

    // hot meals category
    await changeCategoryThenCheck(shopSimulate, "6288a89f70dc8cf93b71609b");
  });

  test("Check load more logic", async () => {
    // wait for initial loading
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("status-product-loading")
    );

    let shopSimulate = new ShopSimulate(
      {
        ...InitialShopState,
      },
      TestProductList,
      TestCategoryList
    );

    await tryLoadMoreThenCheck(shopSimulate);

    await tryLoadMoreThenCheck(shopSimulate);

    await tryLoadMoreThenCheck(shopSimulate);

    await tryLoadNextPageThenCheck(shopSimulate);

    // sushi category
    await changeCategoryThenCheck(shopSimulate, "6288a89f1f0152b8c2cd512b");

    await tryLoadMoreThenCheck(shopSimulate);

    await tryLoadMoreThenCheck(shopSimulate);

    await tryLoadMoreThenCheck(shopSimulate);

    await tryLoadNextPageThenCheck(shopSimulate);

    await changeSearchAndCheck(shopSimulate, "Boilicon");

    await tryLoadMoreThenCheck(shopSimulate);
  });
});

describe("Test edge cases for shop", () => {
  afterEach(() => {
    fetchMock.resetMocks();
  });
  test("Test load product and category fail", async () => {
    // mock fetch to fail all API
    mockAllAPIFail();

    render(<Shop />);

    // wait for initial loading to finish
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("status-product-loading")
    );

    // should not show any content at footer
    expectToBeVisible("bottom-empty-placeholder");

    // an error should be showed on the screen
    expectToBeVisible("product-error");

    // category list should be empty
    const categories = screen.queryAllByTestId("category-item");
    expect(categories.length).toBe(0);
  });

  test("Test load more fail and retry fail/success", async () => {
    mockAllAPISuccess();
    render(<Shop />);

    let shopSimulate = new ShopSimulate(
      {
        ...InitialShopState,
      },
      TestProductList,
      TestCategoryList
    );

    // wait for initial loading to finish
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("status-product-loading")
    );
    // make the next load more calls to fail and check the result
    mockOnlyProductAPIFail();
    await tryLoadMoreFailThenCheck(shopSimulate);
    await tryRetryFailThenCheck(shopSimulate);

    // make the next retry call to succeed and check the result
    mockAllAPISuccess();
    await tryRetryLoadMoreThenCheck(shopSimulate);
  });
});
