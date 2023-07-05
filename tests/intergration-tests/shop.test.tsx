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
import { Config } from "../../src/config";
import { TestCategoryList, TestProductList } from "../test-data";
import { ShopConfig } from "../../src/ui/shop/config";
import {
  checkEverything,
  InitialMockState,
  mockAllAPIFail,
  mockAllAPISuccess,
  mockOnlyProductAPIFail,
  ShopMockState,
  tryChangeCategoryThenCheck,
  tryChangeSearchAndCheck,
  tryLoadMoreFailThenCheck,
  tryLoadMoreThenCheck,
  tryLoadNextPageThenCheck,
  tryRetryThenCheck,
  tryRetryFailThenCheck,
} from "./shop.test.helper";

// setup environment for test
import setupTest from "../../src/setup-test/index";

setupTest();
// enable mocking API
fetchMock.enableMocks();

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

    let mockState: ShopMockState = {
      ...InitialMockState,
    };

    checkEverything(mockState);
  });

  test("Check filter by product name", async () => {
    // wait for finishing initial loading
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("status-product-loading")
    );

    let config: ShopMockState = {
      ...InitialMockState,
    };

    await tryChangeSearchAndCheck(config, "Drinks");

    await tryChangeSearchAndCheck(config, "maineland");

    await tryChangeSearchAndCheck(config, "");
  });

  test("Check filter by category", async () => {
    // wait for finishing initial loading
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("status-product-loading")
    );

    let config: ShopMockState = {
      search: "",
      categoryId: "all",
      pageIndex: 0,
      count: ShopConfig.InitialTake,
    };

    // change category to Sushi
    await tryChangeCategoryThenCheck(config, "6288a89f1f0152b8c2cd512b");

    // desert
    await tryChangeCategoryThenCheck(config, "6288a89fe6c2fe0b758360fe");

    // change to all
    await tryChangeCategoryThenCheck(config, "all");

    // change category to drinks and check product list
    await tryChangeCategoryThenCheck(config, "6288a89fac9e970731bfaa7b");
  });

  test("Check filter by category and search", async () => {
    // wait for finishing initial loading
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("status-product-loading")
    );

    let config: ShopMockState = {
      search: "",
      categoryId: "all",
      pageIndex: 0,
      count: ShopConfig.InitialTake,
    };

    // search -> cate -> reset search -> reset cate -> to initial load

    await tryChangeSearchAndCheck(config, "maineland");

    // pizza category
    await tryChangeCategoryThenCheck(config, "6288a89f7338764f2071a8a8");

    // reset search
    await tryChangeSearchAndCheck(config, "");

    // reset category
    await tryChangeCategoryThenCheck(config, "all");

    // cate -> search -> search -> cate

    // desserts category
    await tryChangeCategoryThenCheck(config, "6288a89fe6c2fe0b758360fe");

    await tryChangeSearchAndCheck(config, "niquent");

    await tryChangeSearchAndCheck(config, "zentia");

    // hot meals category
    await tryChangeCategoryThenCheck(config, "6288a89f70dc8cf93b71609b");
  });

  test("Check load more logic", async () => {
    // wait for initial loading
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("status-product-loading")
    );

    // should show load more
    expectToBeVisible("load-more");

    let config: ShopMockState = {
      search: "",
      categoryId: "all",
      pageIndex: 0,
      count: ShopConfig.InitialTake,
    };

    await tryLoadMoreThenCheck(config);

    await tryLoadMoreThenCheck(config);

    await tryLoadMoreThenCheck(config);

    await tryLoadNextPageThenCheck(config);

    await tryChangeCategoryThenCheck(config, "6288a89f1f0152b8c2cd512b");

    await tryLoadMoreThenCheck(config);

    await tryLoadMoreThenCheck(config);

    await tryLoadMoreThenCheck(config);

    await tryLoadNextPageThenCheck(config);

    await tryChangeSearchAndCheck(config, "Boilicon");

    await tryLoadMoreThenCheck(config);
  });
});

describe("Test edge cases for shop", () => {
  afterEach(() => {
    fetchMock.resetMocks();
  });
  test("Test loading category and category fail", async () => {
    // mock fetch to fail all API
    mockAllAPIFail();

    render(<Shop />);

    // wait for initial loading to finish
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("status-product-loading")
    );

    // should not show any footer content
    expectNotToBeVisible("load-more");
    expectNotToBeVisible("no-more");
    expectNotToBeVisible("next-page");

    // an error should be showed on the screen
    expectToBeVisible("product-error");

    // category list should be empty
    const categories = screen.queryAllByTestId("category-item");
    expect(categories.length).toBe(0);
  });

  test("Test load more and retry fail", async () => {
    mockAllAPISuccess();
    render(<Shop />);

    const config: ShopMockState = {
      ...InitialMockState,
    };

    // wait for initial loading to finish
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId("status-product-loading")
    );

    // make product API fail for load more and check the result
    mockOnlyProductAPIFail();
    await tryLoadMoreFailThenCheck(config);
    await tryRetryFailThenCheck(config);

    // make next retry call to succeed and check the result
    mockAllAPISuccess();
    await tryRetryThenCheck(config);
  });
});
