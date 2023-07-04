import { Config } from "../config";
import { ApiInterface } from "./api-interface";
import { TCategory, TProduct } from "./types";

export class FakeApi implements ApiInterface {
  async getCategories() {
    return fetch(Config.CategoryListURL).then((res) => res.json());
  }

  async getProductsByRange(
    skip: number,
    take: number,
    filter: string | undefined,
    categoryId: string | undefined
  ) {
    let allProducts: TProduct[] = await fetch(Config.ProductListURL).then(
      (res) => {
        return res.json();
      }
    );
    allProducts = allProducts || [];

    // get filtered list
    let filteredProducts = allProducts;
    if (!!categoryId) {
      filteredProducts = filteredProducts.filter(
        (p) => p.categoryId === categoryId
      );
    }
    if (!!filter) {
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(filter.toLowerCase()) ||
          p.restaurant.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // return result base on filtered list
    return {
      products: filteredProducts.slice(skip, skip + take),
      total: filteredProducts.length,
    };
  }
}
