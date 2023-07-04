import { render, screen } from "@testing-library/react";
import * as React from "react";
import { TProduct } from "../../../../api/types";
import "@testing-library/jest-dom";

import Product from "./product";
import {
  expectTextNotToBeVisible,
  expectTextToBeVisible,
  expectToBeVisible,
} from "../../../../../tests/utils";

const SuperLongNameProduct: TProduct = {
  id: "628b5decc94a27754f30e6f1",
  index: 0,
  rating: 3.9508,
  promotion: null,
  isNew: true,
  categoryId: "6288a89fac9e970731bfaa7b",
  minCookTime: 80,
  maxCookTime: 100,
  restaurant: "Niquent",
  name: "Niquent Drinks Niquent Drinks Niquent Drinks Niquent Drinks Niquent Drinks",
  imageUrl: "https://source.unsplash.com/random/400x400?Drinks",
};

const NoPromotionProduct: TProduct = {
  id: "628b5decc94a27754f30e6f1",
  index: 0,
  rating: 3.9508,
  promotion: null,
  isNew: true,
  categoryId: "6288a89fac9e970731bfaa7b",
  minCookTime: 80,
  maxCookTime: 100,
  restaurant: "Niquent",
  name: "Niquent Drinks",
  imageUrl: "https://source.unsplash.com/random/400x400?Drinks",
};

const GiftProduct: TProduct = {
  id: "628b5decc94a27754f30e6f1",
  index: 0,
  rating: 3.9508,
  promotion: "gift",
  isNew: true,
  categoryId: "6288a89fac9e970731bfaa7b",
  minCookTime: 80,
  maxCookTime: 100,
  restaurant: "Niquent",
  name: "Niquent Drinks",
  imageUrl: "https://source.unsplash.com/random/400x400?Drinks",
};

const BuyOneGetOneProduct: TProduct = {
  id: "628b5decc94a27754f30e6f1",
  index: 0,
  rating: 3.9508,
  promotion: "1+1",
  isNew: true,
  categoryId: "6288a89fac9e970731bfaa7b",
  minCookTime: 80,
  maxCookTime: 100,
  restaurant: "Niquent",
  name: "Niquent Drinks",
  imageUrl: "https://source.unsplash.com/random/400x400?Drinks",
};

const DiscountProduct: TProduct = {
  id: "628b5decc94a27754f30e6f1",
  index: 0,
  rating: 3.9508,
  promotion: "discount",
  isNew: true,
  categoryId: "6288a89fac9e970731bfaa7b",
  minCookTime: 80,
  maxCookTime: 100,
  restaurant: "Niquent",
  name: "Niquent Drinks",
  imageUrl: "https://source.unsplash.com/random/400x400?Drinks",
};

function checkNameMatched(p: TProduct) {
  test("Check name is matched", async () => {
    expectTextToBeVisible(p.name);
  });
}

function checkRatingMatched(p: TProduct) {
  test("Check rating is matched", async () => {
    expectTextToBeVisible(p.rating.toFixed(1).toString());
  });
}

function checkCookTimeMatched(p: TProduct) {
  test("Check cooking time is matched", async () => {
    if (!!p.minCookTime && !!p.maxCookTime) {
      expectTextToBeVisible(p.minCookTime.toString(), false);
      expectTextToBeVisible(p.maxCookTime.toString(), false);
    }
  });
}

function checkIsNewMatched(p: TProduct) {
  test("Check new status is matched", async () => {
    if (!!p.isNew) {
      expectTextToBeVisible("New");
    } else {
      expectTextNotToBeVisible("New");
    }
  });
}

function checkPromotionIsMatched(p: TProduct) {
  test("Check promotion is matched", async () => {
    if (!!p.promotion) expectToBeVisible(`${p.id}-promotion-${p.promotion}`);
  });
}

function checkProduct(p: TProduct) {
  beforeEach(() => {
    render(<Product item={p} />);
  });
  checkNameMatched(p);
  checkIsNewMatched(p);
  checkRatingMatched(p);
  checkCookTimeMatched(p);
  checkPromotionIsMatched(p);
}

describe("Check product with full information, no discount is displayed correctly", () => {
  checkProduct(NoPromotionProduct);
});

describe("Check product with discount coupon is displayed correctly", () => {
  checkProduct(DiscountProduct);
});

describe("Check product with 1+1 coupon is displayed correctly", () => {
  checkProduct(BuyOneGetOneProduct);
});

describe("Check product with gift coupon is displayed correctly", () => {
  checkProduct(GiftProduct);
});

describe("Check product with super long name is displayed correctly", () => {
  checkProduct(SuperLongNameProduct);
});
