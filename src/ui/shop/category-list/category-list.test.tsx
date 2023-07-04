import * as React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CategoryList from "./category-list";
import {
  expectNotToBeVisible,
  expectTextToBeVisible,
  expectToBeVisible,
} from "../../../../tests/utils";

const TestData = [
  {
    id: "6288a89f1f0152b8c2cd512b",
    name: "Sushi",
  },
  {
    id: "6288a89f7338764f2071a8a8",
    name: "Pizza",
  },
  {
    id: "6288a89f70dc8cf93b71609b",
    name: "Hot Meals",
  },
  {
    id: "6288a89fe6c2fe0b758360fe",
    name: "Desserts",
  },
  {
    id: "6288a89fac9e970731bfaa7b",
    name: "Drinks",
  },
];

function expectCategoryToBeHighlighted(text: string) {
  const textElement = screen.getByText(text);
  expect(textElement).toBeVisible();
  expect(textElement).toHaveAttribute("aria-checked", "true");
}

function expectAllCategoriesToBeVisible() {
  expectTextToBeVisible("All");
  TestData.map((category) => expectTextToBeVisible(category.name));
}

function expectLoadingNotToBeVisible() {
  expectNotToBeVisible("loading-icon");
}

function expectLoadingIconToBeVisible() {
  expectToBeVisible("loading-icon");
}

test("Check if rendered correctly in state: loading data", async () => {
  render(<CategoryList loading={true} items={[]} />);
  expectLoadingIconToBeVisible();
});

test("Check if rendered correctly in state: loaded data, have some data to displayed, no category is selected", async () => {
  render(
    <CategoryList loading={false} items={TestData} selectedId={undefined} />
  );
  expectLoadingNotToBeVisible();

  expectAllCategoriesToBeVisible();

  expectCategoryToBeHighlighted("All");
});

test("Check if rendered correctly in state: loaded data, have no data to displayed", async () => {
  render(<CategoryList loading={false} items={[]} selectedId={undefined} />);

  expectCategoryToBeHighlighted("All");
});

test("Check if rendered correctly in state: loaded data, have some data, one category is selected", async () => {
  render(
    <CategoryList
      loading={false}
      items={TestData}
      selectedId={"6288a89fac9e970731bfaa7b"}
    />
  );
  // not show loading
  expectLoadingNotToBeVisible();

  expectAllCategoriesToBeVisible();

  expectCategoryToBeHighlighted("Drinks");
});

test("Check if rendered correctly in state: loaded data, have some data, one category is selected and is being loaded", async () => {
  render(
    <CategoryList
      loading={false}
      loadingSelected={true}
      items={TestData}
      selectedId={"6288a89fac9e970731bfaa7b"}
    />
  );

  expectAllCategoriesToBeVisible();

  expectCategoryToBeHighlighted("Drinks");

  expectLoadingIconToBeVisible();
});
