export type TCategory = {
  id: string;
  name: string;
};

export type TProduct = {
  id: string;
  index: number;
  rating: number;
  promotion: "gift" | "1+1" | "discount" | null;
  isNew: boolean;
  categoryId: string;
  minCookTime: number | null;
  maxCookTime: number | null;
  restaurant: string;
  name: string;
  imageUrl: string;
};
