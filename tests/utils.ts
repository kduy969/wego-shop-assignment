import { screen } from "@testing-library/react";

export function expectTextToBeVisible(text: string, exact = true) {
  const textElement = screen.getByText(text, { exact });
  expect(textElement).toBeVisible();
  return textElement;
}

export function expectTextNotToBeVisible(text: string) {
  const textElement = screen.queryByText(text);
  if (!!textElement) {
    expect(textElement).not.toBeVisible();
  }
}

export function expectToBeVisible(testId: string) {
  const e = screen.queryByTestId(testId);
  expect(e).toBeVisible();
  return e as HTMLElement;
}

export function expectNotToBeVisible(testId: string) {
  const e = screen.queryByTestId(testId);
  if (!!e) {
    expect(e).not.toBeVisible();
  }
}
