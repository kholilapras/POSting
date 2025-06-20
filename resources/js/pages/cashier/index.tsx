import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { useHotkeys } from 'react-hotkeys-hook';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { formatIDR } from '@/lib/currency';
import type { BreadcrumbItem } from '@/types';
import type { Product } from '@/types/product';
import type { CartItem } from '@/types/cart';
import { X, Trash2 } from 'lucide-react';

dayjs.locale('id');

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Cashier', href: route('cashier.index') }];

export default function Cashier({ recentProducts = [] }: { recentProducts?: Product[] }) {
    const { items, add, setQuantity, remove, clear, total } = useCart();
    const [paid, setPaid] = useState<number | ''>('');
    const change = typeof paid === 'number' ? paid - total : 0;
    const canPay = typeof paid === 'number' && paid >= total && items.length > 0;

    useHotkeys('p', () => {
        const tag = document.activeElement?.tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
            document.getElementById('amount-paid')?.focus();
        }
    });

    const handlePay = () => {
        router.post(
            route('transactions.store'),
            {
                items: items.map(({ id, quantity }) => ({ id, qty: quantity })),
                paid,
            },
            {
                onSuccess: () => {
                    setPaid('');
                    clear();
                },
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cashier" />
            <div className="p-4 space-y-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Kiri - 75% untuk pencarian dan cart */}
                    <div className="w-full lg:w-3/4 space-y-4">
                        <ProductSearch onPick={add} />
                        <CartTable items={items} setQty={setQuantity} remove={remove} />
                    </div>

                    {/* Kanan - 25% untuk pembayaran */}
                    <div className="w-full lg:w-1/4 space-y-4 border rounded-xl p-4 shadow-sm">
                        <h2 className="text-lg font-semibold mb-2">Payment</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Total:</span>
                                <span className="font-bold text-xl text-primary">{formatIDR(total)}</span>
                            </div>
                            <Input
                                id="amount-paid"
                                type="number"
                                placeholder="Enter amount paid (P)"
                                value={paid}
                                onChange={(e) => setPaid(e.target.value ? Number(e.target.value) : '')}
                            />
                            {change >= 0 && (
                                <div className="flex justify-between">
                                    <span>Change:</span>
                                    <span className="font-semibold">{formatIDR(change)}</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-4">
                            <div>
                                <Button className="w-full" variant="destructive" onClick={clear}>
                                    Reset
                                </Button>
                            </div>
                            <div className="text-right">
                                <Button className="w-full" disabled={!canPay} onClick={handlePay}>
                                    Pay
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// Komponen untuk pencarian produk
function ProductSearch({ onPick }: { onPick: (p: Product) => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!query.trim()) return setResults([]);
            router.get(
                route('products.search'),
                { q: query },
                {
                    preserveState: true,
                    only: ['products'],
                    onSuccess: ({ props }: any) => setResults(props.products ?? []),
                }
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <div className="relative w-full">
            <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Scan or type product name/code…"
                className="rounded-xl shadow-sm w-full"
            />

            {results.length > 0 && (
                <div className="absolute mt-1 bg-white dark:bg-background w-full max-h-60 overflow-auto rounded-xl shadow-md z-50 border">
                    {results.map((p) => (
                        <div
                            key={p.id}
                            className="px-4 py-2 hover:bg-muted cursor-pointer flex justify-between"
                            onClick={() => {
                                onPick(p);
                                setQuery('');
                                setResults([]);
                            }}
                        >
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{p.product_name}</span>
                                <span className="text-xs text-muted-foreground">{p.product_code}</span>
                            </div>
                            <span className="text-sm">{formatIDR(p.product_price)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Komponen tabel keranjang
function CartTable({ items, setQty, remove }: {
    items: CartItem[];
    setQty: (id: number, qty: number) => void;
    remove: (id: number) => void;
}) {
    return (
        <div className="overflow-auto rounded-xl border shadow-sm">
            <table className="min-w-full divide-y">
                <thead className="bg-muted">
                    <tr>
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2 text-left">Price</th>
                        <th className="px-4 py-2 text-left">Qty</th>
                        <th className="px-4 py-2 text-left">Subtotal</th>
                        <th className="px-4 py-2 text-left"><Trash2></Trash2></th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {items.map((it) => (
                        <tr key={it.id} className="hover:bg-muted/40">
                            <td className="px-4 py-2">{it.product_name}</td>
                            <td className="px-4 py-2">{formatIDR(it.product_price)}</td>
                            <td className="px-4 py-2">
                                <Input
                                    type="number"
                                    value={it.quantity}
                                    min={1}
                                    className="w-20 text-center"
                                    onChange={(e) => setQty(it.id, Number(e.target.value))}
                                />
                            </td>
                            <td className="px-4 py-2">{formatIDR(it.subtotal)}</td>
                            <td className="px-4 py-2">
                                <button
                                    onClick={() => remove(it.id)}
                                    className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
                                >
                                    <X size={16} className="text-red-500" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {!items.length && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-muted-foreground">Cart is empty</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
