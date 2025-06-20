import { useState, useCallback, useMemo } from 'react';
import type { Product } from '@/types/product';
import type { CartItem } from '@/types/cart';

export const useCart = () => {
    const [items, setItems] = useState<CartItem[]>([]);

    /* add or bump quantity */
    const add = useCallback((product: Product) => {
        setItems(curr => {
            const idx = curr.findIndex(i => i.id === product.id);
            if (idx > -1) {
                const next = [...curr];
                next[idx].quantity += 1;
                next[idx].subtotal = next[idx].quantity * next[idx].product_price;
                return next;
            }
            return [
                ...curr,
                { ...product, quantity: 1, subtotal: product.product_price },
            ];
        });
    }, []);

    const setQuantity = useCallback((id: number, qty: number) => {
        setItems(curr =>
            curr.map(i =>
                i.id === id
                    ? { ...i, quantity: qty, subtotal: qty * i.product_price }
                    : i
            )
        );
    }, []);

    const remove = useCallback((id: number) =>
        setItems(curr => curr.filter(i => i.id !== id)), []);

    const clear = useCallback(() => setItems([]), []);

    const total = useMemo(
        () => items.reduce((acc, i) => acc + i.subtotal, 0),
        [items]
    );

    return { items, add, setQuantity, remove, clear, total };
};
