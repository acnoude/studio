
"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { AuctionItem } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { toggleItemStatus } from "@/app/actions";
import { ArrowUpDown, Users, QrCode, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { QrCodeModal } from "./qr-code-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import { BidHistoryModal } from "./bid-history-modal";

export function AdminItemsTable() {
  const [items, setItems] = React.useState<AuctionItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedItemForQr, setSelectedItemForQr] =
    React.useState<AuctionItem | null>(null);
  const [selectedItemForHistory, setSelectedItemForHistory] =
    React.useState<AuctionItem | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleStatusToggle = async (id: string, newStatus: boolean) => {
    const result = await toggleItemStatus(id, newStatus);
    if (result.status === "success") {
      toast({ title: "Success", description: result.message });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<AuctionItem>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Item
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <Image
            src={row.original.imageUrl}
            alt={row.original.name}
            width={64}
            height={48}
            className="rounded-md object-cover"
          />
          <div className="flex flex-col">
            <span className="font-medium">{row.getValue("name")}</span>
            <span className="text-xs text-muted-foreground line-clamp-1">
              {row.original.description}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "currentBid",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="justify-end w-full"
        >
          Current Bid
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium">
          ${(row.getValue("currentBid") as number).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "highestBidderName",
      header: "Highest Bidder",
      cell: ({ row }) => (
        <div>
          {row.original.highestBidderName ? (
            <div>
              <p>{row.original.highestBidderName}</p>
              <p className="text-xs text-muted-foreground">
                {row.original.highestBidderEmail}
              </p>
            </div>
          ) : (
            <span className="text-muted-foreground">No bids yet</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.getValue("active")}
            onCheckedChange={(newStatus) =>
              handleStatusToggle(row.original.id, newStatus)
            }
            aria-label="Toggle item status"
          />
          <Badge variant={row.getValue("active") ? "default" : "secondary"}>
            {row.getValue("active") ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedItemForHistory(item)}
            >
              <Users className="h-4 w-4" />
              <span className="sr-only">Show Bid History</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedItemForQr(item)}
            >
              <QrCode className="h-4 w-4" />
              <span className="sr-only">Show QR Code</span>
            </Button>
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as AuctionItem)
      );
      setItems(itemsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    columnVisibility: (isClient && isMobile) ? {
      currentBid: false,
      highestBidderName: false,
    } : {},
  });

  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isMobile) {
    return (
        <div className="grid gap-4">
            {table.getRowModel().rows.map(row => (
                <Card key={row.id} className="[&>*:last-child]:border-t">
                    <CardHeader className="p-4">
                        {flexRender(row.getVisibleCells().find(cell => cell.column.id === 'name')?.column.columnDef.cell, row.getVisibleCells().find(cell => cell.column.id === 'name')?.getContext())}
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm p-4">
                        <div>
                            <p className="font-medium text-muted-foreground">Current Bid</p>
                            <p className="font-mono text-lg">${row.original.currentBid.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground">Highest Bidder</p>
                            {row.original.highestBidderName ? (
                              <div>
                                <p>{row.original.highestBidderName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {row.original.highestBidderEmail}
                                </p>

                              </div>
                            ) : (
                              <span className="text-muted-foreground">No bids yet</span>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center p-4">
                       {flexRender(row.getVisibleCells().find(c => c.column.id === 'active')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'active')?.getContext())}
                       {flexRender(row.getVisibleCells().find(c => c.column.id === 'actions')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'actions')?.getContext())}
                    </CardFooter>
                </Card>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No items found.
                </CardContent>
              </Card>
            )}
             <QrCodeModal
              item={selectedItemForQr}
              isOpen={!!selectedItemForQr}
              onOpenChange={() => setSelectedItemForQr(null)}
            />
            <BidHistoryModal
              item={selectedItemForHistory}
              isOpen={!!selectedItemForHistory}
              onOpenChange={() => setSelectedItemForHistory(null)}
            />
        </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={header.id === "currentBid" ? "text-right" : ""}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "currentBid" ? "text-right" : ""
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <QrCodeModal
        item={selectedItemForQr}
        isOpen={!!selectedItemForQr}
        onOpenChange={() => setSelectedItemForQr(null)}
      />
      <BidHistoryModal
        item={selectedItemForHistory}
        isOpen={!!selectedItemForHistory}
        onOpenChange={() => setSelectedItemForHistory(null)}
      />
    </>
  );
}

    