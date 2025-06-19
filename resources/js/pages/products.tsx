import { useEffect, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import AppLayout from '@/layouts/app-layout';
import type { Product } from '@/types/product';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Info, Pencil, Trash2 } from 'lucide-react';
import { DialogDescription } from '@radix-ui/react-dialog';
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    ColumnDef,
    flexRender,
    Row,
} from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: route('products.index') },
];

dayjs.locale('id');
const formatDate = (dateString: string) =>
    dayjs(dateString).format('DD MMMM YYYY | HH:mm:ss');

export default function Index({ products, search = '' }: { products: any; search?: string }) {
    const [searchValue, setSearchValue] = useState(search);
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailTarget, setDetailTarget] = useState<Product | null>(null);

    // Efek untuk melakukan debounce pada pencarian
    useEffect(() => {
        const debounced = debounce(() => {
            router.get(route('products.index'), { search: searchValue }, { preserveState: true, replace: true });
        }, 200);
        debounced();
        return () => debounced.cancel();
    }, [searchValue]);

    // Definisi kolom tabel produk
    const rowOffset = (products.from ?? 1) - 1;

    const columns = useMemo<ColumnDef<Product>[]>(() => [
        {
            accessorKey: 'no',
            header: 'No',
            cell: ({ row }) => rowOffset + row.index + 1,
        },
        { accessorKey: 'product_code', header: 'Code' },
        { accessorKey: 'product_name', header: 'Name' },
        { accessorKey: 'product_price', header: 'Price' },
        { accessorKey: 'product_stock', header: 'Stock' },
        {
            id: 'actions',
            //header: () => <div className="text-right">Actions</div>,
            header: 'Options',
            cell: ({ row }: { row: Row<Product> }) => {
                const product = row.original;
                return (
                    <div className="space-x-2 flex justify-end">
                        <Button variant="secondary" size="icon" onClick={() => setDetailTarget(product)}><Info /></Button>
                        <Button variant="secondary" size="icon" onClick={() => { setEditing(product); setIsEditing(true); setOpen(true); }}><Pencil /></Button>
                        <Button variant="secondary" size="icon" onClick={() => { setDeleteTarget(product); setDeleteDialogOpen(true); }}><Trash2 /></Button>
                    </div>
                );
            },
        },
    ], [rowOffset]);

    // configuration TanStack Table
    const table = useReactTable({
        data: products.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    // Handle crud product
    const handleCreate = (data: Partial<Product>) =>
        router.post(route('products.store'), data, { onSuccess: () => setOpen(false) });

    const handleUpdate = (data: Partial<Product>) =>
        editing && router.put(route('products.update', editing.id), data, {
            onSuccess: () => { setEditing(null); setOpen(false); }
        });

    const handleDelete = () =>
        deleteTarget && router.delete(route('products.destroy', deleteTarget.id), {
            onSuccess: () => { setDeleteTarget(null); setDeleteDialogOpen(false); }
        });

    const handlePageChange = (page: number) =>
        router.get(route('products.index'), { search: searchValue, page }, { preserveState: true });

    // product form
    function ProductForm({ onSubmit, defaultValues = {}, isEditing = false }: {
        onSubmit: (data: Partial<Product>) => void;
        defaultValues?: Partial<Product>;
        isEditing?: boolean;
    }) {
        const { register, handleSubmit, formState: { errors } } = useForm<Partial<Product>>({
            defaultValues,
        });

        return (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input {...register('product_code', { required: true })} placeholder="Product Code" />
                <Input {...register('product_name', { required: true })} placeholder="Product Name" />
                <Input type="number" {...register('product_price', { required: true })} placeholder="Price" />
                <Input type="number" {...register('product_stock', { required: true })} placeholder="Stock" />
                <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
            </form>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="p-4 space-y-4">

                {/*search & add product*/}
                <div className="flex justify-between items-center gap-2">
                    <Input
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search Product Name or Code ..."
                    />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { setIsEditing(false); setEditing(null); }}>+ Add Product</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader><DialogTitle>{isEditing ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
                            <ProductForm onSubmit={isEditing ? handleUpdate : handleCreate} defaultValues={editing || {}} isEditing={isEditing} />
                        </DialogContent>
                    </Dialog>
                </div>

                {/*product table*/}
                <div className="overflow-auto rounded-xl">
                    <table className="min-w-full text-left divide-x divide-gray-200 dark:divide-neutral-700">
                        <thead className="bg-gray-200 text-gray-800 dark:bg-neutral-800 dark:text-neutral-100">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-3 py-2 text-sm font-medium">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white text-gray-900 dark:bg-neutral-950 dark:text-neutral-100 divide-y divide-gray-200 dark:divide-neutral-800">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-100 dark:hover:bg-neutral-900 transition">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-3 py-2 text-sm">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {table.getRowModel().rows.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-10 text-gray-500 dark:text-neutral-500">
                                        No products found!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>



                {/*pagination navigation*/}
                <div className="flex items-center gap-x-4">
                    <Button variant="secondary" disabled={products.current_page === 1} onClick={() => handlePageChange(products.current_page - 1)}>Previous</Button>
                    <span>Page {products.current_page} of {products.last_page}</span>
                    <Button variant="secondary" disabled={products.current_page === products.last_page} onClick={() => handlePageChange(products.current_page + 1)}>Next</Button>
                </div>

                {/*dialog product delete*/}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>Are you sure you want to delete <strong>{deleteTarget?.product_name}</strong> ?</DialogDescription>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/*dialog product detail*/}
                <Dialog open={!!detailTarget} onOpenChange={() => setDetailTarget(null)}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Product Details</DialogTitle></DialogHeader>
                        {detailTarget && (
                            <div className="grid grid-cols-4 gap-y-2">
                                <p>Code</p><div className="col-span-3">: {detailTarget.product_code}</div>
                                <p>Name</p><div className="col-span-3">: {detailTarget.product_name}</div>
                                <p>Price</p><div className="col-span-3">: {detailTarget.product_price}</div>
                                <p>Stock</p><div className="col-span-3">: {detailTarget.product_stock}</div>
                                <p>Created at</p><div className="col-span-3">: {formatDate(detailTarget.created_at)}</div>
                                <p>Updated at</p><div className="col-span-3">: {formatDate(detailTarget.updated_at)}</div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setDetailTarget(null)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}