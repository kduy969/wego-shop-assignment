import { fireEvent, screen } from "@testing-library/react";

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

export function expectToBeInDocument(testId: string) {
  const e = screen.queryByTestId(testId);
  expect(e).toBeInTheDocument();
  return e as HTMLElement;
}

export function mockScrollToBottom(scrollView: HTMLElement) {
  const original = Object.getOwnPropertyDescriptor(scrollView, "scrollHeight");

  // mock scroll height to make scroll view scrollable since by default jsdom render every thing with zero size
  Object.defineProperty(scrollView, "scrollHeight", {
    configurable: true,
    value: 200,
  });

  fireEvent.scroll(scrollView, {
    target: { scrollTop: 0 },
  });

  fireEvent.scroll(scrollView, {
    target: { scrollTop: scrollView.scrollHeight },
  });

  // revert the mock
  if (!!original) Object.defineProperty(scrollView, "scrollHeight", original);
}
