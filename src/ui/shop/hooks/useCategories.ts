import { useEffect, useState } from "react";
import { TCategory } from "../../../api/types";
import { Service } from "../../../service";

export const useCategories = () => {
  const [categories, setCategories] = useState<TCategory[]>([]);
  const [error, setError] = useState<string>("");
  useEffect(() => {
    (async () => {
      try {
        const cates = await Service.API.getCategories();
        setCategories(cates);
      } catch (e) {
        setError("Cannot load categories");
      }
    })();
  }, []);
  return [categories, error];
};
