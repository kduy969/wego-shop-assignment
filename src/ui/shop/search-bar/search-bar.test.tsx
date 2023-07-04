import * as React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchBar from "./search-bar";
import {
  expectNotToBeVisible,
  expectTextToBeVisible,
  expectToBeVisible,
} from "../../../../tests/utils";

function testConfirmBoxToBeVisible() {
  test("Expect confirm box is visible", async () => {
    expectToBeVisible("submit-box");
    expectTextToBeVisible("Apply search");
    expectTextToBeVisible("Press Enter");
  });
}

function testConfirmBoxNotToBeVisible() {
  test("Expect confirm box is not visible", async () => {
    expectNotToBeVisible("submit-box");
  });
}

function testLoadingIconNotToBeVisible() {
  test("Expect loading icon is not visible", async () => {
    expectNotToBeVisible("loading-icon");
  });
}

function testLoadingIconToBeVisible() {
  test("Expect loading icon is visible", async () => {
    expectToBeVisible("loading-icon");
  });
}

function testClearIconNotToBeVisible() {
  test("Expect clear icon is not visible", async () => {
    expectNotToBeVisible("clear-icon");
  });
}

function testClearIconToBeVisible() {
  test("Expect clear icon is visible", async () => {
    expectToBeVisible("clear-icon");
  });
}

function testInputChangeOnKeyboardEvent() {
  test("Expect input change on keyboard event", async () => {
    const input: HTMLInputElement = screen.getByTestId("search-input");
    fireEvent.input(input, { target: { value: "123" } });
    expect(input.value).toBe("123");
  });
}

function testInputToBeDisabled() {
  test("Expect input is disabled", async () => {
    const input = screen.getByTestId("search-input");
    expect(input).toBeDisabled();
  });
}

describe("Check if rendered correctly in initial state", () => {
  beforeEach(() => {
    render(<SearchBar loading={false} onSubmit={() => {}} />);
  });

  testConfirmBoxNotToBeVisible();

  testLoadingIconNotToBeVisible();

  testClearIconNotToBeVisible();

  testInputChangeOnKeyboardEvent();
});

test("Check basic user interaction", async () => {
  render(<SearchBar loading={false} onSubmit={() => {}} />);

  const input: HTMLInputElement = screen.getByTestId("search-input");

  // check input update on keyboard event
  fireEvent.input(input, { target: { value: "123" } });
  expect(input.value).toBe("123");

  // check confirm box is showed after user input
  await waitFor(() => {
    const confirmBox: HTMLDivElement | null =
      screen.queryByTestId("submit-box");
    expect(confirmBox).toBeInTheDocument();
  });

  // check clear icon is showed after user input
  const clearIcon = expectToBeVisible("clear-icon");

  // test clear icon click event
  fireEvent.click(clearIcon);
  await waitFor(() => {
    expect(input.value).toBe("");
  });
});

describe("Check if rendered correctly in loading state", () => {
  beforeEach(() => {
    render(<SearchBar loading={true} onSubmit={() => {}} />);
  });

  testInputToBeDisabled();

  testClearIconNotToBeVisible();

  testLoadingIconToBeVisible();
});
