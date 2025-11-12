import { formatNGN, formatUSD } from '@/lib/format';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import { RiPencilLine } from '@remixicon/react';
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableFoot, TableHead, TableHeaderCell, TableRow } from '@tremor/react';
import React from 'react';

function IndeterminateCheckbox({ indeterminate, className, ...rest }: any) {
    const ref = React.useRef<HTMLInputElement>(null);
    React.useEffect(() => {
        if (typeof indeterminate === 'boolean' && ref.current) {
            ref.current.indeterminate = !rest.checked && indeterminate;
        }
    }, [ref, indeterminate, rest.checked]);
    return (
        <input
            type="checkbox"
            ref={ref}
            className={cn(
                'size-4 rounded border-tremor-border text-tremor-brand shadow-tremor-input focus:ring-tremor-brand-muted dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:text-dark-tremor-brand dark:shadow-dark-tremor-input dark:focus:ring-dark-tremor-brand-muted',
                className,
            )}
            {...rest}
        />
    );
}

interface Props {
    accounts: Account[];
    rowSelection: any;
    setRowSelection: (val: any) => void;
    onEdit: (account?: Account) => void;
}

const AccountsTable: React.FC<Props> = ({ accounts, rowSelection, setRowSelection, onEdit }) => {
    const columns = React.useMemo(
        () => [
            {
                id: 'select',
                header: ({ table }: any) => (
                    <IndeterminateCheckbox
                        checked={table.getIsAllPageRowsSelected()}
                        indeterminate={table.getIsSomePageRowsSelected()}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                        className="-translate-y-[1px]"
                    />
                ),
                cell: ({ row }: any) => (
                    <IndeterminateCheckbox
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        indeterminate={row.getIsSomeSelected?.()}
                        onChange={row.getToggleSelectedHandler()}
                        onClick={(e: any) => e.stopPropagation()}
                    />
                ),
                enableSorting: false,
                meta: { align: 'text-left' },
            },
            {
                header: 'Account Name',
                accessorKey: 'name',
                meta: { align: 'text-left' },
            },
            {
                header: 'Currency',
                accessorKey: 'currency',
                meta: { align: 'text-left' },
            },
            {
                header: '% Fee',
                accessorKey: 'fee',
                meta: { align: 'text-right' },
            },
            {
                header: 'Balance',
                accessorKey: 'balance',
                meta: { align: 'text-right' },
                cell: ({ row }: any) => {
                    const format = row.original.currency === 'NGN' ? formatNGN : formatUSD;
                    return <span>{format(row.original.balance)}</span>;
                },
            },

            {
                header: 'Last Updated',
                accessorKey: 'updatedAt',
                meta: { align: 'text-right' },
                cell: ({ row }: any) => {
                    const short = timeAgo(row.original.updatedAt);
                    const full = formatDate(row.original.updatedAt);

                    return (
                        <span className="group relative cursor-default select-none text-[0.8rem] font-semibold">
                            <span className="transition-opacity duration-300 group-hover:opacity-0">{short}</span>
                            <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">{full}</span>
                        </span>
                    );
                },
            },

            {
                header: 'Actions',
                accessorKey: 'actions',
                cell: ({ row }: any) => (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(row.original);
                            }}
                            className="inline-flex items-center rounded bg-tremor-background px-3 py-2 text-tremor-content-emphasis ring-1 ring-inset ring-tremor-ring hover:text-tremor-content-strong dark:bg-dark-tremor-background-subtle dark:text-dark-tremor-content-emphasis"
                        >
                            <RiPencilLine className="size-4" aria-hidden />
                        </button>
                    </div>
                ),
                meta: { align: 'text-right' },
            },
        ],
        [onEdit],
    );

    const table = useReactTable({
        data: accounts,
        columns,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { rowSelection },
    });

    return (
        <Table>
            <TableHead>
                {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                        {hg.headers.map((header: any) => (
                            <TableHeaderCell key={header.id} className={cn(header.column.columnDef.meta?.align)}>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHeaderCell>
                        ))}
                    </TableRow>
                ))}
            </TableHead>

            <TableBody>
                {table.getRowModel().rows.map((row) => (
                    <TableRow
                        key={row.id}
                        onClick={() => row.toggleSelected(!row.getIsSelected())}
                        className="group select-none hover:bg-tremor-background-muted hover:dark:bg-dark-tremor-background-muted"
                    >
                        {row.getVisibleCells().map((cell: any, index: number) => (
                            <TableCell
                                key={cell.id}
                                className={cn(
                                    row.getIsSelected() ? 'bg-tremor-background-muted dark:bg-dark-tremor-background-muted' : '',
                                    cell.column.columnDef.meta?.align,
                                    'relative',
                                )}
                            >
                                {index === 0 && row.getIsSelected() && (
                                    <div className="absolute inset-y-0 left-0 w-0.5 bg-tremor-brand dark:bg-dark-tremor-brand" />
                                )}
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>

            <TableFoot>
                <TableRow>
                    <TableHeaderCell colSpan={7} className="font-normal tabular-nums">
                        {Object.keys(rowSelection).length} of {table.getRowModel().rows.length} selected
                    </TableHeaderCell>
                </TableRow>
            </TableFoot>
        </Table>
    );
};

export default AccountsTable;
