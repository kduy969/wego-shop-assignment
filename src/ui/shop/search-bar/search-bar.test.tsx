import * as React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchBar from "./search-bar";

test("SearchBar input should update text on keyboard input event", async () => {
  render(<SearchBar loading={false} onSubmit={() => {}} />);
  const input: HTMLInputElement = screen.getByTestId("input"); // Assuming the text input has an accessible role attribute
  fireEvent.input(input, { target: { value: "test product" } });
  expect(input.value).toBe("test product");
});
