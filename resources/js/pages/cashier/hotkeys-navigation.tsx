// File: hotkeys-navigation.ts

import { useHotkeys } from 'react-hotkeys-hook';

export function useCashierHotkeys({ clearCart, focusPaidInput, focusProductSearch, handlePay, canPay }: {
    clearCart: () => void;
    focusPaidInput: () => void;
    focusProductSearch: () => void;
    handlePay: () => void;
    canPay: boolean;
}) {
    useHotkeys('p', () => {
        const tag = document.activeElement?.tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
            focusPaidInput();
        }
    });

    useHotkeys('space', () => {
        const tag = document.activeElement?.tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
            focusProductSearch();
        }
    });

    useHotkeys('r', () => {
        const tag = document.activeElement?.tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
            clearCart();
        }
    });

    useHotkeys('enter', () => {
        const tag = document.activeElement?.tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && canPay) {
            handlePay();
        }
    });
}