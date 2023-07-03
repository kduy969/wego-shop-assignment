import {TCategory, TProduct} from "./types";

export interface ApiInterface {
  getCategories: () => Promise<TCategory[]>;
  getProductsByRange: (start: number, take: number, filter: string | undefined, categoryId: string | undefined ) => Promise<{
    products: TProduct[];
    total: number
  }>;

}
