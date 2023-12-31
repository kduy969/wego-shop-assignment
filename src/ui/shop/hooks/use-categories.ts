import { useEffect, useState } from "react";
import { TCategory } from "../../../api/types";
import { Service } from "../../../service";

export const useCategories = (): [TCategory[], string, boolean] => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<TCategory[]>([]);
  const [error, setError] = useState<string>("");
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const cates = await Service.API.getCategories();
        setCategories(cates);
        setError("");
      } catch (e) {
        setError("Cannot load categories");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return [categories, error, loading];
};
