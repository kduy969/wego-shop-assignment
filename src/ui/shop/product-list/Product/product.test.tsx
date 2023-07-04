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
  test("Expect name is matched", async () => {
    expectTextToBeVisible(p.name);
  });
}

function checkRatingMatched(p: TProduct) {
  test("Expect rating is matched", async () => {
    expectTextToBeVisible(p.rating.toFixed(1).toString());
  });
}

function checkCookTimeMatched(p: TProduct) {
  test("Expect cooking time is matched", async () => {
    if (!!p.minCookTime && !!p.maxCookTime) {
      expectTextToBeVisible(p.minCookTime.toString(), false);
      expectTextToBeVisible(p.maxCookTime.toString(), false);
    }
  });
}

function checkIsNewMatched(p: TProduct) {
  test("Expect new status is matched", async () => {
    if (!!p.isNew) {
      expectTextToBeVisible("New");
    } else {
      expectTextNotToBeVisible("New");
    }
  });
}

function checkPromotionIsMatched(p: TProduct) {
  test("Expect promotion is matched", async () => {
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

describe("Check if rendered correctly with full information, no discount", () => {
  checkProduct(NoPromotionProduct);
});

describe("Check if rendered correctly with discount coupon", () => {
  checkProduct(DiscountProduct);
});

describe("Check if rendered correctly with 1+1 coupon", () => {
  checkProduct(BuyOneGetOneProduct);
});

describe("Check if rendered correctly with gift coupon", () => {
  checkProduct(GiftProduct);
});

describe("Check if rendered product with super long name", () => {
  checkProduct(SuperLongNameProduct);
});
