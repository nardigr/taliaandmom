"use client";

import { useEffect, useState } from "react";
import { getCartItemCount } from "@/lib/cart/types";
import { useCartStore } from "@/lib/cart/store";

export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const finishHydration = () => setHydrated(true);

    if (useCartStore.persist.hasHydrated()) {
      finishHydration();
      return;
    }

    const unsubscribe = useCartStore.persist.onFinishHydration(finishHydration);
    return unsubscribe;
  }, []);

  return hydrated;
}

export function useCartItemCount() {
  const hydrated = useCartHydrated();
  const count = useCartStore((state) => getCartItemCount(state.items));

  return hydrated ? count : 0;
}
